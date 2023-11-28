import { Activities } from '../models/Activities';
import { logger } from '../config/logger'
import { Op, Transaction, WhereOptions } from 'sequelize';
import { Customers } from '../models/Customers';
import { parseSearchQuery } from '../helpers/searchHelper';
import { DiagnosticTests } from '../models/DiagnosticTests';
import { CustomerDiagnostics } from '../models/CustomerDiagnostics';
import { Refills } from '../models/Refills';
import { sequelize } from '../config/sequelize-config';
const module_name = "customers"

/**
 * get a list of customers
 * @param _data query params
 * @returns List of Customer objects
 */
export async function _getList  (_data: { [key: string]: any}):Promise<{data: Customers[], total: number}>  {
    try {

        let limit = _data.limit ? parseInt(_data.limit) : 100;
        let offset = _data.offset ? parseInt(_data.offset) : 0;
        //if user specifies a search query
        let where = {};
        if (_data.param) {
            let searchQuery = JSON.parse(_data.param)
             where = parseSearchQuery(searchQuery)
        }
        let objects = await Customers.findAll({
            limit,
            offset,
            order: [["name", "asc"]],
            where
        });

            //TODO: learn how to calculate fields
        // for (var i = 0; i < objects.length; i++) {
        //     let object = objects[i];
        //     let total_credit = await saleHelper.getTotalCreditSales('', '', object.id);
        //     object.total_credit = total_credit.toLocaleString()

        //     let paid = await incomingHelper.getTotalPaid(object.id);
        //     object.total_paid = paid.toLocaleString();

        //     let balance = total_credit - paid;
        //     object.balance = balance.toLocaleString()
        // }
let total = await Customers.count({
          where: where
        })
        return {data: objects, total: total};
    } catch (error: any) {

        logger.error({message: error})
        throw error;
    }

};

export async function _getCount(_data: { [key: string]: any }): Promise<Number> {
    try {
        //if user specifies a search query
        let where = {};
        if (_data.param) {
            let searchQuery = JSON.parse(_data.param)
            where = parseSearchQuery(searchQuery)
        }
        let count = await Customers.count({

            where
        });

        return count;
    } catch (error: any) {

        logger.error({ message: error })
        throw error;
    }

};

/**
 * get a list of customers based on a search param
 * @param _data query params
 * @returns list of Customers
 */
// export async function _search  (_data: { [key: string]: any}):Promise<Customers[]>  {
//     let searchQuery = JSON.parse(_data.param)
//     try {
//         let where = parseSearchQuery(searchQuery)

//         let limit = _data.limit ? parseInt(_data.limit) : 100;
//         let offset = _data.offset ? parseInt(_data.offset) : 0

//         let objects = await Customers.findAll({
//             limit,
//             offset,
//             order: [["name", "asc"]],
//             where
//         })
//         //TODO: calculate the amount paid, etc here

//         return objects
//     } catch (error: any) {
//        logger.error({message: error})
//         throw error;
//     }

// };

/**
 * create or update a customer
 * @param _data request body
 * @returns new/updated customer
 */
export async function _save (_data: { [key: string]: any}):Promise<Customers>  {

    try {
      let id = _data.id;
       const result = await sequelize.transaction(async (t: Transaction) => {
            let object: Customers;
            if (!id) {
                //create
                object = await Customers.create(_data, {
                    transaction: t
                });

            }
            else {
                let customer = await Customers.findByPk(id);
                if (!customer) {
                    throw `Customer not found id while trying to update ${id}`
                }
                object = customer;
                await Customers.update(_data, {
                    where: {
                        id: id
                    },
                    transaction: t
                });

            }

            t.afterCommit(async () => {
                await Activities.create({
                    activity: `updated/created a customer ${object.name} `,
                    user_id: `${_data.user_id}`,
                    module: module_name,
                    object_id: object.id
                })
            })
            return object;
        })

        return result
    } catch (error: any) {
        logger.error({ message: error })
        throw error;
    }

};

export async function _delete  (_data: { [key: string]: any}):Promise<boolean>  {
    try {
        let object = await Customers.findByPk(_data.id);
        await object?.destroy();
        Activities.create({
            activity: `deleted customer ${object?.name} `,
            user_id: `${_data.user_id}`,
            module: 'customers'
        })
        return true

    } catch (error: any) {
        logger.error({ message: error })
        throw error;
    }

};



export async function _findById(_data: { id: string }):Promise<Customers>  {
    try {
        let id = _data.id;

        let object = await Customers.findByPk(id);
        //TODO get the total sales on credit
        //get the total paid
        // let total_credit = await saleHelper.getTotalCreditSales('', '', id);
        // object.total_credit = total_credit.toLocaleString()
        // const IncomingPaymentClass = require('../helpers/incomingPaymentHelper');
        // const incomingHelper = new IncomingPaymentClass();
        // let paid = await incomingHelper.getTotalPaid(id);
        // object.total_paid = paid.toLocaleString();
        // let balance = total_credit - paid;
        // object.balance = balance.toLocaleString()
        if(!object) throw new Error(`Customer ${id} not found`)
        return object;
    } catch (error: any) {
        logger.error({ message: error })
        throw error;
    }

};

export async function _saveDiagnostics (_data: { [key: string]: any})  {
    try {
        let object = CustomerDiagnostics.build(_data)
        await object.save();
        Activities.create({
            activity: `added diagnostic test ${_data.test} for ${_data.customer_name}`,
            user_id: `${_data.user_id}`,
            module: 'customers'
        })
        return object;
    } catch (error: any) {
        logger.error({ message: error })
        throw error;
    }

};

// exports._findDiagnosticsById = async (_data) => {
//     try {
//         let id = _data.id;

//         let object = await helper.getItem(`id = '${id}' `, helper.diagnostics_table_name);



//         return {
//             status: '1',
//             data: object
//         }
//     } catch (error: any) {
//         if (constants.isSqliteError(error)) await helper.closeConnection();
//         log.error(error)
//         throw error;
//     }

// };

// exports._deleteDiagnostics = async (_data) => {
//     try {
//         await helper.getConnection();
//         await helper.connection.exec("BEGIN TRANSACTION");
//         let id = _data.id;
//         await helper.delete(` id in (${id})`, helper.diagnostics_table_name);
//         await activities.log(_data.userid, `'deleted customer diagnostic result'`, "'Customers'")


//         await helper.connection.exec("COMMIT");

//         return { status: '1', data: null }
//     } catch (error: any) {
//         await helper.closeConnection();
//         if (constants.isSqliteError(error)) await helper.closeConnection();
//         if (process.env.NODE_ENV != "production") console.log(error)

//         log.error(error)
//         throw error;
//     }

// };

export async function _getCustomerDiagnosticsList  (_data: { [key: string]: any}):Promise<CustomerDiagnostics[]>{

    try {
        let limit = _data.limit ? parseInt(_data.limit) : 100;
        let offset = _data.offset ? parseInt(_data.offset) : 0

        let start = _data.start_date ;
        let end = _data.end_date;
        let customer = _data.customer;

        let where: WhereOptions<any> = {};
        if (_data.customer) {
            where['customer'] = customer;
        }
        if (start) {
            where['end_date'] = { [Op.gte]: `${start} 00:00:01` }
        }
        if (end) {
            where['end_date'] = { [Op.lte]: `${end} 23:59:59` }
        }


        let objects = await CustomerDiagnostics.findAll({
            limit,
            offset,
            where
        })
        //TODO include customer in here


        return objects
    } catch (error: any) {
        logger.error({ message: error })
        throw error;
    }

};

export async function _getDiagnosticsList  (_data: { [key: string]: any}):Promise<DiagnosticTests[]>  {
    try {
        let limit = _data.limit ? parseInt(_data.limit) : 100;
        let offset = _data.offset ? parseInt(_data.offset) : 0
        let objects = await DiagnosticTests.findAll({
            limit,
            offset
        })


        return objects
    } catch (error: any) {
        logger.error({ message: error })
        throw error;
    }

};


export async function _addRefill (_data: { [key: string]: any}):Promise<Refills>  {

    try {
        let object = Refills.create(_data)
        Activities.create({
            activity: `added new refill ${_data.product_name} for ${_data.customer_name}`,
            user_id: `${_data.user_id}`,
            module: 'customers'
        })
        return object;
    } catch (error: any) {
        logger.error({ message: error })
        throw error;
    }

};

export async function _addMultipleRefill(_data: { [key: string]: any}):Promise<boolean>  {

    try {

        let objects = JSON.parse(_data.data);
        await Refills.bulkCreate(objects)
        // objects.forEach(async (obj) => {
        //     let data = refill_helper.prep_data(obj);
        //     await helper.insert(data, refill_helper.table_name);
        //     await activities.log(_data.userid, `"added a new customer refill: ${_data.customer_name}"`, "'Customers'")

        // });
        Activities.create({
            activity: `added multiple refills: ${JSON.stringify(objects)}`,
            user_id: `${_data.user_id}`,
            module: 'customers'
        })
        return true;
    } catch (error: any) {
        logger.error({ message: error })
        throw error;
    }

};



export async function _deleteRefill (_data: { [key: string]: any}):Promise<boolean> {
    try {

        let ids = _data.id.split(",").map((id: string) => id.trim())

        let objects = await Refills.findAll({
            where: {
                id: { [Op.in]: ids }
            }
        })
        await Refills.destroy({
            where: {
                id: { [Op.in]: ids }
            }
        });
        Activities.create({
            activity: `deleted multiple refills: ${JSON.stringify(objects)}`,
            user_id: `${_data.user_id}`,
            module: 'customers'
        })



        return true
    } catch (error: any) {
        logger.error({ message: error })
        throw error;
    }

};

/**
 * get the list of refills
 * @param _data Object of key:value
 * @returns list of refills
 */
export async function _getRefillList(_data: { [key: string]: any }):Promise<Refills[]> {


    try {
        let limit = _data.limit ? parseInt(_data.limit) : 100;
        let offset = _data.offset ? parseInt(_data.offset) : 0

        let start = _data.start_date ;
        let end = _data.end_date;
        let customer = _data.customer;

        let where: WhereOptions<any> = {};
        if (_data.customer) {
            where['customer'] = customer;
        }
        if (start) {
            where['end_date'] = { [Op.gte]: start }
        }
        if (end) {
            where['end_date'] = { [Op.lte]: end }
        }
        if (_data.product_id) {
            where['product_id'] = _data.product_id;
        }

        let objects = await Refills.findAll({
            limit,
            offset,
            where
        });
        //TODO get the customer name and product names



        return objects
    } catch (error: any) {
        logger.error({ message: error })
        throw error;
    }

};



export async function _countRefills(_data: { [key: string]: any }):Promise<number>{
    try {
        let start = _data.start_date;
        let end = _data.end_date;
        let customer = _data.customer;

        let where: WhereOptions<any> = {};
        if (_data.customer) {
            where['customer'] = customer;
        }
        if (start) {
            where['end_date'] = { [Op.gte]: start }
        }
        if (end) {
            where['end_date'] = { [Op.lte]: end }
        }
        if (_data.product_id) {
            where['product_id'] = _data.product_id;
        }

        let count = await Refills.count({
            where
        });
        return count;
    } catch (error: any) {
        logger.error({ message: error })
        throw error;
    }

};
