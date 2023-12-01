
import { Activities } from '../models/Activities';
import { OutgoingPayments } from '../models/OutgoingPayments';
import { logger } from '../config/logger';
import {  Op } from 'sequelize';
import { getToday } from '../helpers/dateHelper';

export async function save_outgoing_payment_function  (_data: { [key: string]: any}):Promise<OutgoingPayments>  {
    try {

        let object = await OutgoingPayments.create(_data);
        Activities.create({
            activity: `added a new payment`,
            user_id: _data.user_id,
            module: 'System'
        })


        return object
    } catch (error: any) {

        logger.error({ message: error })
        throw error;
    }
};

export async function find_outgoing_payments_between_dates_function(_data: { [key: string]: any}):Promise<OutgoingPayments[]>  {
    try {
        let objects = await OutgoingPayments.findAll({
            limit: parseInt(_data.limit),
            offset: parseInt(_data.offset),
            where: {
                created_on: {
                    [Op.between]: [`${_data.start} 00:00:00`, `${_data.end} 23:59:59`]
                },
            }
        });
        return objects;
    } catch (error: any) {
        logger.error({ message: error })
        throw error;
    }

};

export async function delete_payment_function(_data: { [key: string]: any}):Promise<boolean>  {

    try {
        let id = _data.id;
        let object = await OutgoingPayments.findOne({
            where: {
                id: id
            }
        })
        if (!object) throw (`delete_payment_function object not found by id ${id}`);

        await object.destroy();
        Activities.create({
            activity: `deleted payment record to ${object.recipient} made on ${object.date}`,
            user_id: `${_data.user_id}`,
            module: 'users'
        })
        return true

    } catch (error: any) {
        logger.error({message: error})
        throw error;
    }

};

/**
 * get a list of outgoing paymets for a vendor
 * @param _data params
 * @returns list of outgoing payments
 */
export async function find_vendor_outgoing_payments_between_dates_function (_data: { [key: string]: any}):Promise<OutgoingPayments[]> {
    try {
        let start = _data.start_date || getToday() ;
        let end = _data.end_date || getToday();
        let limit = _data.limit ? parseInt(_data.limit) : 100;
        let offset = _data.offset ? parseInt(_data.offset) : 0
        let vendor = _data.vendor;

        let objects = await OutgoingPayments.findAll({
            limit: limit,
            offset: offset,
            where: {
                recipient: vendor,
                date: {
                    [Op.between]:[start, end]}
            }
        });

        return objects
    } catch (error: any) {
        logger.error({message: error})
        throw error;
    }

};



/**
 * Get the profit, expenses, loss for a given start and end date
 * @param {Object} _data
 * @returns {Object}
 */
// exports.get_accounting_report_function = async (_data) => {
//     try {
//         let defs = helper.setDates('this_month')
//         let start = _data.start_date == undefined ? defs.start_date : _data.start_date;
//         let end = _data.end_date == undefined ? defs.end_date : _data.end_date;


//         const SalesDetailsHelper = require('../helpers/salesDetailsHelper.js');
//         const salesDetailsHelper = new SalesDetailsHelper();

//         const purchaseDetailsHelper = require("../helpers/purchaseDetailsHelper")
//         const pDetailsHelper = new purchaseDetailsHelper()

//         // const tDetailsClass = require('../helpers/transferDetailsHelper.js');
//         // const tdetailsHelper = new tDetailsClass();

//         // const rDetailsClass = require('../helpers/receivedTransferDetailsHelper.js');
//         // const rdetailsHelper = new rDetailsClass();

//         let stockValueClass = require('../helpers/stockValueHelper')
//         let stockValueHelper = new stockValueClass();

//         let paymentClass = require('../helpers/outgoingPaymentHelper')
//         let paymentHelper = new paymentClass();


//         let outgoingHelperClass = require('../helpers/outgoingPaymentHelper')
//         let h = new outgoingHelperClass();
//         //get totalsold, total cost, total expenses

//         let sales = await salesDetailsHelper.getTotalSales(start, end);
//         let sales_cost = await salesDetailsHelper.getTotalSalesCost(start, end);

//         let total_profit = sales - sales_cost;

//         let purchases = await pDetailsHelper.getTotalPurchase(start, end)

//         let starting_stock = await stockValueHelper.getStockCostValueByDate(start);
//         let closing_stock = await stockValueHelper.getStockCostValueByDate(end);
//         let expenses = await h.getAllTotalPaid('', start, end);
//         let expenses_list = await h.getPaymentsGrouped(start, end);

//         let difference = total_profit - expenses
//         let formula = `Total sales profit - expenses`


//         return {
//             status: '1',
//             total_purchase: purchases.toLocaleString(),

//             total_sales_cost: sales_cost.toLocaleString(),
//             total_sales_price: sales.toLocaleString(),

//             starting_stock: starting_stock.toLocaleString(),
//             closing_stock: closing_stock.toLocaleString(),

//             expenses: expenses.toLocaleString(),
//             total_profit: total_profit.toLocaleString(),
//             net_profit: difference.toLocaleString(),
//             expenses_list: expenses_list,
//             formula

//         }
//     } catch (error: any) {
//         await helper.closeConnection();
//         // if(process.env.NODE_ENV != "production") console.log(error)

//         log.error(error)
//         throw error;
//     }

// };
