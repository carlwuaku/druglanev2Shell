import { Activities } from '../models/Activities';
import { logger } from '../config/logger'
import { Op, Transaction, WhereOptions } from 'sequelize';
import { Products } from '../models/Products';
import { parseSearchQuery } from '../helpers/searchHelper';
import { sequelize } from '../config/sequelize-config';
import { StockAdjustment } from '../models/StockAdjustment';
import { getToday } from '../helpers/dateHelper';
import { calculateCurrentStock, createStockAdjustmentSession, getStockValues, refreshCurrentStock, updateStockValue } from '../helpers/productsHelper';
import { StockAdjustmentSessions } from '../models/StockAdjustmentSessions';
import { StockAdjustmentPending } from '../models/StockAdjustmentPending';
import { SalesDetails } from '../models/SalesDetails';
import { PurchaseDetails } from '../models/PurchaseDetails';
import { ReceivedTransferDetails } from '../models/ReceivedTransferDetails';
import { TransferDetails } from '../models/TransferDetails';
import { sortObjects } from '../helpers/generalHelper';
import * as crypto from 'crypto'
import { StockValues } from '../models/StockValues';
import { STOCK_VALUE } from '../utils/strings';
import { Customers } from '../models/Customers';
const module_name = "products"

/**
 * get a list of products
 * @param _data query params
 * @returns List of Customer objects
 */
export async function _getList(_data: { [key: string]: any }): Promise<{ data: Products[], total: number }> {
  try {

    let limit = _data.limit ? parseInt(_data.limit) : 100;
    let offset = _data.offset ? parseInt(_data.offset) : 0;
    //a mode will determine if we want to get stock out, near min, near max or whatever
    let mode = _data.mode || "";
    let param = _data.param;
    //if user specifies a search query
    let where: WhereOptions = getWhereWithMode(mode, param);

    let objects = await Products.findAll({
      attributes: {
        include: [
          [sequelize.literal(`price * current_stock`), STOCK_VALUE],
        ]
      },
      limit,
      offset,
      order: [["name", "asc"]],
      where,
      include:
        [
          {
            model: Customers,

            attributes: ['name', 'id']
          }
        ],
      raw: true
    });

    let total = await Products.count({
      where: where
    })



    return { data: objects, total: total };
  } catch (error: any) {

    logger.error({ message: error })
    throw error;
  }

};

/**
 * use the provided mode to prepare the options for a search
 * @param mode a string like stock_out, near_min, etc
 * @returns the options param
 */
function getWhereWithMode(mode: string, param: string): WhereOptions {
  switch (mode) {
    case "stock_near_min":
      return {
        current_stock: {
          [Op.and]: {
            [Op.lte]: sequelize.col('min_stock'),
            [Op.gt]: 0
          }
        }
      }
    case "stock_near_max":
      return {
        current_stock: {
          [Op.gte]: sequelize.col('max_stock')
        }
      }
    case "stock_out":
      return {
        current_stock: {
          [Op.lte]: 0
        }
      }
    case "stock_out":
      return {
        current_stock: {
          [Op.lte]: 0
        }
      }


    default:
      //if param was provided or is not a valid json string,
      //return nothing
      try {
        return parseSearchQuery(JSON.parse(param))

      } catch (error: any) {
        return {}
      }

  }
}

/**
 * get the number of items matching some search paramaters
 * @param _data some parameters to search the table by
 * @returns a number
 */
export async function _getCount(_data: { [key: string]: any }): Promise<Number> {
  try {
    //if user specifies a search query
    let where = {};
    if (_data.param) {
      let searchQuery = JSON.parse(_data.param)
      where = parseSearchQuery(searchQuery)
    }
    let count = await Products.count({

      where
    });

    return count;
  } catch (error: any) {

    logger.error({ message: error })
    throw error;
  }

};

/**
 * create or update a product
 * @param _data the details of the product
 * @returns true
 */
export async function save(_data: { [key: string]: any }): Promise<Products> {
  try {
    let id = _data.id;
    let change_stock = _data.change_stock;
    let change_unit = _data.change_unit;
    if (!_data.barcode) {
      _data.barcode = crypto.randomUUID()
    }
    const result = await sequelize.transaction(async (t: Transaction) => {
      let object: Products;
      if (!id) {
        //create
        //if the barcode is not provided, generate one
        object = await Products.create(_data, {
          transaction: t
        });
        //create the stock adjustment object
        let stock_object = {
          created_by: `${_data.user_id}`, date: `${getToday()}`, product: object.id,
          quantity_counted: object.current_stock, quantity_expected: 0,
          current_price: object.price, cost_price: object.cost_price,
          created_on: `${getToday("timestamp")}`, quantity_expired: 0, quantity_damaged: 0
        };


        await StockAdjustment.create(stock_object, {
          transaction: t
        });

      }
      else {
        let product = await Products.findByPk(id);
        if (!product) {
          throw `Product not found id while trying to update ${id}`
        }
        object = product;
        if (change_unit === 'yes') {
          _data.unit = _data.new_unit;
        }
        if (change_stock === 'yes') {
          await StockAdjustment.create({
            created_by: `${_data.user_id}`,
            date: `${getToday()}`,
            product: id,
            quantity_counted: _data.new_stock,
            quantity_expected: _data.current_stock,
            current_price: _data.price,
            cost_price: _data.cost_price,
            created_on: `${getToday("timestamp")}`
          }, {
            transaction: t
          })
          //update the current stock
          _data.current_stock = _data.new_stock
        }
        await Products.update(_data, {
          where: {
            id: id
          },
          transaction: t
        });

      }

      t.afterCommit(async () => {
        console.log('transaction complete')
        //update stock value
        await updateStockValue();
        await Activities.create({
          activity: `updated/created a product ${object.name} `,
          user_id: `${_data.user_id}`,
          module: module_name,
          object_id: object.id
        })
      })
      return object;
    })

    return result

  } catch (error: any) {
    console.log(error)
    logger.error({ message: error })
    throw error;
  }
}

/**
 * get a single product by id
 * @param _data must contain the id
 * @returns Product object
 */
export async function find(_data: { [key: string]: any }): Promise<Products> {
  try {
    let id = _data.id;

    let product = await Products.findByPk(id)
    if (!product) {
      throw `Product not found id ${id}`
    }
    return product;
  } catch (error: any) {
    logger.error({ message: error })
    throw error;
  }
}

/**
 * get the current stock of a product by id
 * @param _data must contain the id
 * @returns number
 */
export async function get_stock(_data: { [key: string]: any }): Promise<Number> {
  try {
    let id = _data.id;
    return calculateCurrentStock(id)

  } catch (error: any) {
    logger.error({ message: error })
    throw error;
  }
}

export async function delete_product(_data: { [key: string]: any }): Promise<boolean> {
  try {
    const result = await sequelize.transaction(async (t: Transaction) => {
      let product = await Products.findByPk(_data.id, { transaction: t });
      await product?.destroy({ transaction: t });
      t.afterCommit(() => {
        //update stock value
        updateStockValue();
        Activities.create({
          activity: `deleted a product ${product?.name} `,
          user_id: `${_data.user_id}`,
          module: module_name
        });
      })
      return true;

    })


    return result;
  } catch (error: any) {
    logger.error({ message: error })
    throw error;
  }
}

export async function restore_deleted_product(_data: { [key: string]: any }): Promise<boolean> {
  try {
    const result = await sequelize.transaction(async (t: Transaction) => {
      let product = await Products.findByPk(_data.id, { transaction: t });
      await product?.restore({ transaction: t });
      t.afterCommit(() => {
        //update stock value
        updateStockValue();
        Activities.create({
          activity: `restored a product ${product?.name} `,
          user_id: `${_data.user_id}`,
          module: module_name
        });
      })
      return true;

    })


    return result;
  } catch (error: any) {
    logger.error({ message: error })
    throw error;
  }
}

export async function mass_edit(_data: { [key: string]: any }): Promise<boolean> {
  try {
    let id = _data.id;
    let field = _data.field;
    let value = _data.value;
    let product_names = _data.product_names


    const result = await sequelize.transaction(async (t: Transaction) => {
      let updateData: { [key: string]: any } = {}
      updateData[field] = value;
      Products.update(updateData, {
        where: {
          id: {
            [Op.in]: [id]
          }
        },
        transaction: t
      })

      t.afterCommit(() => {
        //update stock value
        updateStockValue();
        Activities.create({
          activity: `mass-edited the ${field} for ${product_names}`,
          user_id: `${_data.user_id}`,
          module: module_name
        })
      })
      return true;
    })

    return result

  } catch (error: any) {
    logger.error({ message: error })
    throw error;
  }
}

export async function create_stock_adjustment_session(_data: { date: string; created_on: string; user_id: any; }): Promise<string> {
  try {
    let date: string = _data.date || getToday();
    let created_on: string = _data.created_on || getToday("timestamp");


    const result = await sequelize.transaction(async (t: Transaction) => {
      //close all the other sessions and delete all pending
      let code = await createStockAdjustmentSession(t, { created_on, date, user_id: _data.user_id })


      return code;
    })

    return result

  } catch (error: any) {
    logger.error({ message: error })
    throw error;
  }
}

export async function close_stock_adjustment_session(_data: { code: string; user_id: any; }): Promise<boolean> {
  try {


    const result = await sequelize.transaction(async (t: Transaction) => {
      //close all the other sessions and delete all pending
      let code: string = _data.code;

      await StockAdjustmentSessions.update({ 'status': 'closed' }, {
        where: { 'code': code },
        transaction: t
      });
      await StockAdjustmentPending.destroy({ force: true, transaction: t });



      t.afterCommit(() => {
        //update stock value
        updateStockValue();
        Activities.create({
          activity: `closed stock adjustment session ${code}`,
          user_id: `${_data.user_id}`,
          module: module_name
        })
      })
      return true;
    })

    return result

  } catch (error: any) {
    logger.error({ message: error })
    throw error;
  }
}

/**
 * get the latest session in progress, or create one if needed
 * @param _data
 * @returns
 */
export async function get_latest_session(_data: { date: string; created_on: string; user_id: any; }): Promise<string> {
  try {

    let date: string = _data.date || getToday();
    let created_on: string = _data.created_on || getToday("timestamp");

    //try to get one
    let object = await StockAdjustmentSessions.findOne({
      where: {
        status: 'in_progress'
      },
      order: [['id', 'desc']]
    })
    let code: string;
    if (!object) {
      code = await sequelize.transaction(async (t: Transaction) => {
        //close all the other sessions and delete all pending
        let code = await createStockAdjustmentSession(t, { created_on, date, user_id: _data.user_id })

        return code;
      })
    }
    else {
      code = object.code;
    }
    return code;


  } catch (error: any) {
    logger.error({ message: error })
    throw error;
  }
}

export async function save_stock_adjustment(_data: { code: string; items: string; user_id: any; }): Promise<boolean> {
  try {


    const result = await sequelize.transaction(async (t: Transaction) => {
      //delete what was in there already
      await StockAdjustmentPending.destroy({
        where: {
          code: _data.code
        },
        transaction: t
      });
      await StockAdjustment.destroy({
        where: {
          code: _data.code
        },
        transaction: t
      });
      let items: any[] = JSON.parse(_data.items);
      await StockAdjustment.bulkCreate(items, {
        transaction: t
      })


      await StockAdjustmentSessions.update({ 'status': 'closed' }, {
        where: { 'code': _data.code },
        transaction: t
      });

      //update the product stocks
      let productUpdate: any[] = items.reduce(function (acc: any[], val: any) {
        acc.push({
          id: val.product,
          cost_price: val.cost_price,
          price: val.current_price,
          expiry: val.expiry,
          category: val.category,
          current_stock: val.quantity_counted,
          size: val.size,
          unit: val.unit,
          shelf: val.shelf
        })
      }, []);
      Products.bulkCreate(productUpdate, {
        transaction: t,
        updateOnDuplicate: ['cost_price', 'price',
          'expiry', 'category', 'current_stock',
          'size', 'unit', 'shelf']
      })



      t.afterCommit(() => {
        //update stock value
        updateStockValue();
        Activities.create({
          activity: `saved and closed stock adjustment session ${_data.code}`,
          user_id: `${_data.user_id}`,
          module: module_name
        })
      })
      return true;
    })

    return result

  } catch (error: any) {
    logger.error({ message: error })
    throw error;
  }
}

export async function save_stock_adjustment_to_pending(_data: { code: string; items: string; user_id: any; partial_update?: string }): Promise<boolean> {
  try {


    const result = await sequelize.transaction(async (t: Transaction) => {
      //delete what was in there already if its a complete
      //refresh. else, only update what's coming
      let partialUpdate = _data.partial_update === "yes"
      if (!partialUpdate) {
        await StockAdjustmentPending.destroy({
          where: {
            code: _data.code
          },
          transaction: t
        });
      }


      let items: any[] = JSON.parse(_data.items);
      await StockAdjustmentPending.bulkCreate(items, {
        transaction: t,
        updateOnDuplicate: ['quantity_counted', 'quantity_expected',
          'current_price', 'cost_price', 'category',
          'size', 'expiry', 'quantity_expired', 'quantity_damaged',
          'unit', 'shelf', 'comments']
      });

      t.afterCommit(() => {
        //update stock value
        updateStockValue();
        Activities.create({
          activity: `saved and continued stock adjustment session ${_data.code}`,
          user_id: `${_data.user_id}`,
          module: module_name
        })
      })
      return true;
    })

    return result

  } catch (error: any) {
    logger.error({ message: error })
    throw error;
  }
}

export async function save_single_stock_adjustment(_data: { [key: string]: any }): Promise<boolean> {
  try {

    let object = await Products.findByPk(_data.product);

    const result = await sequelize.transaction(async (t: Transaction) => {
      if (!object) {
        throw `Product not found id ${_data.product}`
      }

      await StockAdjustment.create(_data, {
        transaction: t
      });


      let old_stock = object.current_stock
      await object.update({
        current_stock: _data.quantity_counted
      }, {
        transaction: t

      })


      t.afterCommit(() => {
        //update stock value
        updateStockValue();
        Activities.create({
          activity: `added new stock adjustment for ${object?.name} from ${old_stock} to ${object?.current_stock}`,
          user_id: `${_data.user_id}`,
          module: module_name
        })
      })
      return true;
    })

    return result

  } catch (error: any) {
    logger.error({ message: error })
    throw error;
  }
}

export async function save_pending_single_stock_adjustment(_data: { [key: string]: any }): Promise<boolean> {
  try {


    const result = await sequelize.transaction(async (t: Transaction) => {

      await StockAdjustmentPending.destroy({
        force: true,
        where: {
          product: _data.product
        },
        transaction: t
      })
      await StockAdjustmentPending.create(_data, {
        transaction: t
      });

      let object = await Products.findByPk(_data.product);



      t.afterCommit(() => {
        //update stock value
        updateStockValue();
        Activities.create({
          activity: `added new stock adjustment pending authorization for ${object?.name} to be changed from ${object?.current_stock} to ${_data.quantity_counted}`,
          user_id: `${_data.user_id}`,
          module: module_name
        })
      })
      return true;
    })

    return result

  } catch (error: any) {
    logger.error({ message: error })
    throw error;
  }
}

/**
 * get the latest session in progress, or create one if needed
 * @param _data
 * @returns
 */
export async function get_pending_stock_quantity(_data: { code: string; product: string }): Promise<number> {
  try {

    let code: string = _data.code;

    //try to get one
    let object = await StockAdjustmentPending.findOne({
      where: {
        product: _data.product,
        code: code
      }
    })
    if (!object) {
      throw `StockAdjustmentPending not found id ${_data.code}`
    }

    else {
      return object.quantity_counted
    }


  } catch (error: any) {
    logger.error({ message: error })
    throw error;
  }
}

/**
 *
 * @param _data query params
 * @returns List of stockAdjustmentSessions
 */
export async function get_stock_adjustment_sessions(_data: { [key: string]: any }): Promise<StockAdjustmentSessions[]> {
  try {

    let limit = _data.limit ? parseInt(_data.limit) : 100;
    let offset = _data.offset ? parseInt(_data.offset) : 0;
    //if user specifies a search query
    let where = {};
    if (_data.param) {
      let searchQuery = JSON.parse(_data.param)
      where = parseSearchQuery(searchQuery)
    }
    let objects = await StockAdjustmentSessions.findAll({

      limit,
      offset,
      order: [["created_on", "desc"]],
      where,

    });


    return objects;
  } catch (error: any) {

    logger.error({ message: error })
    throw error;
  }

};

/**
 *
 * @param _data query params
 * @returns List of stockAdjustments
 */
export async function get_stock_adjustments(_data: { [key: string]: any }): Promise<StockAdjustmentSessions[]> {
  try {

    let limit = _data.limit ? parseInt(_data.limit) : 100;
    let offset = _data.offset ? parseInt(_data.offset) : 0;
    //if user specifies a search query
    let where = {};
    if (_data.param) {
      let searchQuery = JSON.parse(_data.param)
      where = parseSearchQuery(searchQuery)
    }
    let objects = await StockAdjustment.findAll({

      limit,
      offset,
      order: [["created_on", "desc"]],
      where,
      include: Products

    });
    //TODO: get these
    /**
     * number_excess: num_excess,
        number_loss: num_loss,
        number_neutral: num_neutral,
        total_excess: total_excess,
        total_loss: total_loss,
        total_difference: total_difference,
     */

    return objects;
  } catch (error: any) {

    logger.error({ message: error })
    throw error;
  }

};

/**
 *
 * @param _data query params
 * @returns List of stockAdjustmentSessions
 */
export async function get_pending_stock_adjustments_by_code(_data: { [key: string]: any }): Promise<StockAdjustmentSessions[]> {
  try {

    let limit = _data.limit ? parseInt(_data.limit) : 1000;
    let offset = _data.offset ? parseInt(_data.offset) : 0;
    //if user specifies a search query
    let where = {};
    if (_data.param) {
      let searchQuery = JSON.parse(_data.param)
      where = parseSearchQuery(searchQuery)
    }
    let objects = await StockAdjustmentPending.findAll({

      limit,
      offset,
      where,
      include: [{
        model: Products,
        attributes: ['name']
      }]

    });
    //TODO: get these
    /**
     * obj.total_damaged = (price * obj.quantity_damaged).toLocaleString()
        obj.total_expired = (price * obj.quantity_expired).toLocaleString()
        obj.name = product.name;
        obj.difference = difference;
        obj.total_cost = difference * cost_price;
        obj.total = (difference * price).toLocaleString();

     * number_excess: num_excess,
        number_loss: num_loss,
        number_neutral: num_neutral,
        total_excess: total_excess,
        total_loss: total_loss,
        total_difference: total_difference,
     */

    return objects;
  } catch (error: any) {

    logger.error({ message: error })
    throw error;
  }

};

/**
 * * get all the stock_adjustments, sales, purchases, transfers in and out
 * @param _data contains the product id
 * @returns StockHistory[]
 */
export async function get_stock_changes(_data: { product: number }): Promise<StockHistory[]> {
  try {
    const product = _data.product
    const sales = await SalesDetails.findAll({
      where: { product }
    })
    const adjustments = await StockAdjustment.findAll({
      where: { product }
    })
    const purchases = await PurchaseDetails.findAll({
      where: { product }
    })
    const received = await ReceivedTransferDetails.findAll({
      where: { product }
    })
    const transfers = await TransferDetails.findAll({
      where: { product }
    });
    let results: StockHistory[] = [];
    adjustments.forEach(obj => {
      results.push({
        date: obj.created_on,
        timestamp: Date.parse(obj.created_on),
        quantity: obj.quantity_counted,
        type: "stock_adjustment",
        previous_stock: 0,
        new_stock: 0,
        invoice: obj.code,
        display_name: ""
      })
    })

    sales.forEach(obj => {
      results.push({
        date: obj.created_on,
        timestamp: Date.parse(obj.created_on),
        quantity: obj.quantity,
        type: "sale",
        previous_stock: 0,
        new_stock: 0,
        invoice: obj.code,
        display_name: ""
      })
    })

    purchases.forEach(obj => {
      results.push({
        date: obj.created_on,
        timestamp: Date.parse(obj.created_on),
        quantity: obj.quantity,
        type: "purchase",
        previous_stock: 0,
        new_stock: 0,
        invoice: obj.code,
        display_name: ""
      })
    })

    received.forEach(obj => {
      results.push({
        date: obj.created_on,
        timestamp: Date.parse(obj.created_on),
        quantity: obj.quantity,
        type: "transfer",
        previous_stock: 0,
        new_stock: 0,
        invoice: obj.code,
        display_name: ""
      })
    })

    transfers.forEach(obj => {
      results.push({
        date: obj.created_on,
        timestamp: Date.parse(obj.created_on),
        quantity: obj.quantity,
        type: "transfer_out",
        previous_stock: 0,
        new_stock: 0,
        invoice: obj.code,
        display_name: ""
      })
    });

    sortObjects(results, 'timestamp', 1);
    let stock = 0;
    results.map(st => {
      switch (st.type) {
        case 'sale':
          st.previous_stock = stock;
          st.new_stock = stock = stock - st.quantity;
          break;
        case 'stock_adjustment':
          st.previous_stock = stock;
          st.new_stock = stock = st.quantity;
          break;
        case 'purchase':
          st.previous_stock = stock;
          st.new_stock = stock = stock + st.quantity;
          break;
        case 'transfer':
          st.previous_stock = stock;
          st.new_stock = stock = stock + st.quantity;
          break;

        case 'transfer_out':
          st.previous_stock = stock;
          st.new_stock = stock = stock - st.quantity;
          break;
        default:
          break;

      }
    });
    return results;
  } catch (error: any) {
    logger.error({ message: error })
    throw error;
  }
}

export async function get_distinct_field_values(_data: { field: string }): Promise<String[]> {
  try {
    const objects = await Products.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col(_data.field)), _data.field],],
      raw: true
    });
    let distinct: string[] = [];
    objects.forEach((currentValue: { [key: string]: any }) => {
      if (currentValue[_data.field]) {
        distinct.push(currentValue[_data.field]);
      }
    })
    return distinct

  } catch (error: any) {
    logger.error({ message: error })
    throw error;
  }
}

export async function get_changed_stock(_data: { code: string }): Promise<StockAdjustmentPending[]> {
  try {
    let objects = await StockAdjustmentPending.findAll({
      where: {
        code: _data.code,
        '$products.current_stock$': {
          [Op.ne]: 'quantity_expected'
        }
      },
      include: [{
        model: Products,
        attributes: ['name', 'current_stock', 'last_modification']
      }]
    });

    return objects
  } catch (error: any) {
    logger.error({ message: error })
    throw error;
  }


}

export async function refresh_current_stock(_data: { id: string }): Promise<boolean> {
  try {
    let ids = _data.id.split(",");
    for (let i = 0; i < ids.length; i++) {
      let id = ids[i];
      await refreshCurrentStock(parseInt(id))
    }
    return true;
  } catch (error: any) {
    logger.error({ message: error })
    throw error;
  }


}

export async function get_stock_values(type: string) {
  try {
    let results = await getStockValues();
    if (type === "cost_value") {
      return results.cost_value
    }
    return results.selling_value;
  }
  catch (error: any) {
    logger.error({ message: error })
    throw error;
  }
}



interface StockHistory {
  date: string;
  timestamp: number;
  quantity: number;
  type: string;
  previous_stock: number;
  new_stock: number;
  invoice: string;
  display_name: string;
}
