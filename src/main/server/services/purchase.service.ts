import { Purchases } from "../models/Purchases";
import { Activities } from '../models/Activities';
import { logger } from '../config/logger'
import { Includeable, Op, Transaction, WhereOptions } from 'sequelize';
import { parseSearchQuery } from '../helpers/searchHelper';
import { sequelize } from '../config/sequelize-config';
import { setDates } from '../helpers/dateHelper';
import { PurchaseDetails } from '../models/PurchaseDetails';
import { Vendors } from "../models/Vendors";
import { Users } from "../models/Users";
import { refreshCurrentStock, updateStockValue } from "../helpers/productsHelper";
import { Products } from "../models/Products";
import { OutgoingPayments } from "../models/OutgoingPayments";
import * as crypto from 'crypto'
const module_name = "purchases";


//TODO: make sure deleted details do not affect stock values
/**
 * get a list of purchases matching the params provided. the params can be empty or a json string
 * @param _data an object where param is a json string
 * @returns list of matching purchases
 */
export async function getList(_data: { [key: string]: any }): Promise<Purchases[]> {
    try {

        let limit = _data.limit ? parseInt(_data.limit) : 100;
        let offset = _data.offset ? parseInt(_data.offset) : 0;
        //
        //if user specifies a search query
        let where: WhereOptions = {};
        let purchaseDetailsWhere: WhereOptions = {};
        if (_data.param) {
            let searchQuery = JSON.parse(_data.param)
            where = parseSearchQuery(searchQuery)
        }
        //if the user specifies a product, search the products table
        if (_data.product) {
            let poductSearchQuery = [{ field: 'name', operator: 'includes', param: _data.product }];// JSON.parse(_data.product)
            let Products_where = parseSearchQuery(poductSearchQuery)
            let products = await Products.findAll({
                where: Products_where
            });
            let product_ids: number[] = products.reduce(function (accumulator: number[], curr: Products) {
                return accumulator.concat(curr.id);
            }, []);
            purchaseDetailsWhere['product'] = {[Op.in] : product_ids}
        }
        let objects = await Purchases.findAll({
            attributes: {
                include: [
                    [sequelize.literal(`(select count(id) from purchase_details where code = purchases.code)`), 'num_items'],
                    [sequelize.literal(`(select sum(price * quantity) from purchase_details where code = purchases.code)`), 'total_amount'],
                ]
            },
            limit,
            offset,
            where,
            include: [{
                model: Vendors,
                attributes: ['name', 'id']
            },
            {
                model: Users,
                attributes: ['display_name']
                },
                {
                    model: PurchaseDetails,
                    attributes: [],
                    where: purchaseDetailsWhere
            }
            ],
            logging(sql, timing?) {
                console.log(sql, timing)
            },
        });



        return objects;
    } catch (error: any) {

        logger.error({ message: error })
        throw new Error(error);
    }

};

/**
 * save or update a purchase. if a code is provided, an update is performed, else an insert. 
 * @param _data details of the purchase such invoice number, vendor and date, and the details of the items
 * @returns the code of the saved purchase
 */
export async function save(_data: { [key: string]: any }): Promise<string> {
    try {
        //the data should come with the purchase data and
        //the details data
        let items: any[] = JSON.parse(_data.items);
        //if no code was given, generate one and create. else
        //delete that code and re-insert
        let code = _data.code;
        let activity = "";
        let old_details: PurchaseDetails[] = [];

        const result = await sequelize.transaction(async (t: Transaction) => {
            if (code) {
                //get the previously saved items
                old_details = await PurchaseDetails.findAll({
                    where: { code: code }
                });
                PurchaseDetails.destroy({
                    force: true,
                    transaction: t,
                    where: {
                        code: code
                    }
                });

                Purchases.destroy({
                    force: true,
                    transaction: t,
                    where: {
                        code: code
                    }
                });


                activity = `updated purchase item with code ${code}`
            }
            else {
                //generate code
                // let last_id: number = await Purchases.max('id');
                code = crypto.randomUUID();// `${(last_id + 1).toString().padStart(5, '0')}`;
                activity = `created purchase item with code ${code}`

            }
            _data.code = code;
            _data.created_by = _data.user_id
            await Purchases.create(_data, {
                transaction: t
            });
            items.map(item => {
                item.code = code;
                item.date = _data.date;
                item.created_by = _data.user_id;
            })

            await PurchaseDetails.bulkCreate(items,
                {
                    transaction: t
                });



            t.afterCommit(async () => {
                //update the product details. TODO
                //TODO for the old products that might have been removed or changed
                //, revert the price, unit and all that.
                //to avoid repeating ops for duplicate producgts
                let done: any[] = [];
                let combined: any[] = items.concat(old_details)
                await Promise.all(combined.map(async (item) => {
                    if (!done.includes(item.product)) {
                        await Products.update(
                            {
                                price: item.selling_price,
                                cost_price: item.price,
                                unit: item.unit,
                                expiry: item.expiry,
                                markup: item.markup,
                                description: item.description
                            },
                            {
                                where: { id: item.product }
                            }
                        );
                        await refreshCurrentStock(item.product);
                        //add to the done list
                        done.push(item.product);
                    }
                }))

                updateStockValue();
                Activities.create({
                    activity: activity,
                    user_id: `${_data.user_id}`,
                    module: module_name
                })
            });
            return code;
        })

        return result

    } catch (error: any) {
        logger.error({ message: error })
        throw new Error(error);
    }
}

/**
 * get the items in a purchase
 * @param _data must contain some search params
 * @returns a list of purchase details
 */
export async function getDetails(_data: { param?: any; vendor?:any }): Promise<PurchaseDetails[]> {
    try {

        let where: WhereOptions = {};
        let purchaseWhere: WhereOptions = {};
        if (_data.param) {
            let searchQuery = JSON.parse(_data.param)
            where = parseSearchQuery(searchQuery)
        }
        if (_data.vendor) {
            purchaseWhere['vendor'] = _data.vendor
        }
        let objects = await PurchaseDetails.findAll({
            attributes: {
                include: [
                    [sequelize.literal(`'price' * 'quantity'`), 'total']
                ]
            },
            where: where,
            include: [{
                model: Products,
                attributes: [['name', 'product_name'], ['id', 'product_id']]
            },
                {
                    model: Purchases,
                    attributes: [],
                    where: purchaseWhere
                }
            ],
        });
        return objects
    } catch (error: any) {
        logger.error({ message: error })
        throw new Error(error);
    }
}


/**
 * delete purchases using the ids
 * @param _data must contain the ids to be deleted as an array stringified
 */
export async function deletePurchases(_data: { [key: string]: any }): Promise<boolean> {
    try {
        let codes: any[] = JSON.parse(_data.codes);
        //get all the items in the codes
        let items = await PurchaseDetails.findAll({
            where: {
                code: { [Op.in]: codes }
            }
        })
        const result = await sequelize.transaction(async (t: Transaction) => {

            await Purchases.destroy({
                where: {
                    code: { [Op.in]: codes }
                },
                transaction: t
            });

            await PurchaseDetails.destroy({
                where: {
                    code: { [Op.in]: codes }
                },
                transaction: t
            });
            t.afterCommit(async () => {
                //update stock value
                await Promise.all(items.map(async (item) => {
                        await refreshCurrentStock(item.product);
                }));

                updateStockValue();
                Activities.create({
                    activity: `temporarily deleted purchase invoices with codes ${_data.codes}`,
                    user_id: `${_data.user_id}`,
                    module: module_name
                })
            });
            return true;
        });
        return result;
    } catch (error: any) {
        logger.error({ message: error })
        throw new Error(error);
    }
}


/**
 * get a single purchase object using the id or code    
 * @param _data must contain the id or code of the purchase
 * @returns a purchase item
 */
export async function find(_data: { [key: string]: any }): Promise<Purchases> {
    try {
        let object = await Purchases.findOne({
            attributes: {
                include: [
                    [sequelize.literal(`(select count(id) from purchase_details where code = '${_data.id}')`), 'num_items'],
                    [sequelize.literal(`(select sum(price * quantity) from purchase_details where code = '${_data.id}')`), 'total_amount'],
                ]
            },
            where: {
                [Op.or]: [
                    { id: _data.id },
                    { code: _data.id }
                ]
            },
            include: [{
                model: Vendors,
                attributes: ['name', 'id']
            },
            {
                model: Users,
                attributes: ['display_name']
            }]
        });
        if (!object) {
            throw new Error(`Purchase not found: ${_data.id}`);
            
        }
        return object;
    } catch (error: any) {
        logger.error({ message: error })
        throw new Error(error);
    }
}

/**
 * get the total purchase, total credit, total paid and balance amounts for a specified time and 
 * vendor. defaults to no vendor and the current month
 * @param _data may contain the start and end dates, and vendor
 * @returns an object
 */
export async function getPurchaseTotals(_data: { [key: string]: any }): Promise<IPurchaseTotals> {

    let start = _data.start_date || setDates("this_month").startDate;
    let end = _data.end_date || setDates("this_month").endDate;
    let vendor = _data.vendor;

    let total_purchase_where: WhereOptions = {};
    let payment_where: WhereOptions = {};
    total_purchase_where['created_on'] = { [Op.between]: [new Date(start), new Date(end)] };
    if (vendor) {
        total_purchase_where['code'] = {
            [Op.in]: sequelize.literal(`(select code from ${Purchases.tableName} where vendor = ${vendor})`)
        };
        payment_where['recipient'] = vendor;
    }
    const total_purchase = await PurchaseDetails.sum("quantity * price", {
        where: total_purchase_where
    });
    //add the payment method
    total_purchase_where['payment_method'] = {
        [Op.in]: sequelize.literal(`(select code from ${Purchases.tableName} where payment_method = 'Credit')`)

    }
    const total_credit = await PurchaseDetails.sum("quantity * price", {
        where: total_purchase_where
    });


    const total_paid = await OutgoingPayments.sum("amount", {
        where: payment_where
    })

    let balance = total_purchase - total_paid;
    return {
        total_purchase: total_purchase.toLocaleString(),
        total_credit: total_credit.toLocaleString(),
        total_paid: total_paid.toLocaleString(),
        balance: balance.toLocaleString()

    }
}

interface IPurchaseTotals {
    total_purchase: string;
    total_credit: string;
    total_paid: string;
    balance: string;
}