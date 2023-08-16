import { StockAdjustment } from "../models/StockAdjustment";
import { Products } from "../models/Products";
import { sequelize } from "../config/sequelize-config";
import { SalesDetails } from "../models/SalesDetails";
import { PurchaseDetails } from "../models/PurchaseDetails";
import { TransferDetails } from "../models/TransferDetails";
import { ReceivedTransferDetails } from "../models/ReceivedTransferDetails";
import { Op, Transaction, WhereOptions } from "sequelize";
import { logger } from "../config/logger";
import { getToday } from "./dateHelper";
import { StockValues } from "../models/StockValues";
import { StockAdjustmentSessions } from "../models/StockAdjustmentSessions";
import { StockAdjustmentPending } from "../models/StockAdjustmentPending";
import { Activities } from "../models/Activities";
//TODO
/**YET TO BE IMPLEMENTED
 * calculate the value of all items in the inventory
 * @param date a specific date to update
 */
export async function updateStockValue(date?: string): Promise<void> {
    try {


        //use the products table to get the sum of the product of all quantity * price
        let results = await getStockValues();

        await StockValues.upsert({
            date: date || getToday(),
            selling_value: results.selling_value,
            cost_value: results.cost_value
        })
    } catch (error: any) {
        throw new Error(error)
    }
}

export async function getStockValues(): Promise<IStockValues> {
    try {
        let results = await Products.findOne({
            attributes: [
                [sequelize.literal(`(sum (current_stock * price))`), 'selling_value'],
                [sequelize.literal(`(sum (current_stock * cost_price))`), 'cost_value'],

            ]
        });
        if (!results) {
            throw new Error("getStockValues object not found")
        }
        return { cost_value: results.cost_value || 0, selling_value: results.selling_value || 0 }
    } catch (error: any) {
        throw new Error(error)
    }
    
}

export async function refreshCurrentStock(product_id: number): Promise<void> {
    try {
        let product = await Products.findByPk(product_id);
        let now = getToday("timestamp");


        let stock = await calculateCurrentStock(product_id);
        await product?.update({
            'current_stock': stock,
            'last_stock_modification': `'${now}'`
        })



    } catch (error:any) {
        throw new Error(error)
    }
}

/**
     * calculate the current stock of an item amt sold, bought, transferred in and out, and stock adjustment
     * @param {Number} id 
     * @returns {Number} count
     */
export async function calculateCurrentStock(product_id: number): Promise<number> {
    try {


        //get the last stock taking, get the total quantity sold, purchased, transfered in and out since
        //that last stock taking date
        let last_date: string = "";
        let last_stock_count: number = 0;
        let last_stock_taking = await StockAdjustment.findOne({
            attributes: ["quantity_counted", "created_on"],
            where: {
                product: product_id
            },
            order: [["created_on", "DESC"]]
        });
        //if there is no stock taking available, no date or quantity will be returned
        if (last_stock_taking) {
            last_date = last_stock_taking.created_on;
            last_stock_count = last_stock_taking.quantity_counted;
        }
        //set the conditions for all the tables
        let where: WhereOptions<any> = {
            product: product_id
        }
        if (last_date) {
            where["created_on"] = {
                [Op.gte]: last_date
            }
        }

        let sold = await SalesDetails.sum("quantity", {
            where
        });
        let purchased = await PurchaseDetails.sum("quantity", {
            where
        });
        let transfered = await TransferDetails.sum("quantity", {
            where
        });
        let received = await ReceivedTransferDetails.sum("quantity", {
            where
        });
        // console.log("sale "+product_id, sold);
        // console.log("purchased " + product_id, purchased);
        // console.log("received " + product_id, received);
        // console.log("transfered " + product_id, transfered);
        // console.log("last_stock_count " + product_id, last_stock_count);

        return last_stock_count + purchased + received - sold - transfered;
    } catch (error:any) {
        logger.error({ message: error });
        throw new Error(error);

    }
}

/**
 * set the status of all sessions to closed and clear the pending table
 * @param transaction a sequelize transaction object
 */
export async function closeAllStockAdjustmentSessions(transaction: Transaction): Promise<void> {
    //close all the other sessions and delete all pending
    await StockAdjustmentSessions.update({ 'status': 'closed' }, {
        where: {},
        transaction: transaction
    });
    await StockAdjustmentPending.destroy({ force: true, transaction: transaction });

}

/**
 * create a new stock adjustment session and return the code
 * @param t a transaction
 * @param _data 
 * @returns the code of the session
 */
export async function createStockAdjustmentSession(t: Transaction, _data: { date: string, created_on: string, user_id: string }): Promise<string> {
    await closeAllStockAdjustmentSessions(t);
    let newSA = await StockAdjustmentSessions.create({
        'date': _data.date,
        'created_on': _data.created_on,
        'created_by': _data.user_id
    }, {
        transaction: t
    });
    let code = newSA.id.toString().padStart(5, '0');
    await newSA.update(
        { 'code': code }
    );
    t.afterCommit(() => {
        //update stock value
        updateStockValue();
        Activities.create({
            activity: `created stock adjustment session ${code}`,
            user_id: `${_data.user_id}`,
            module: 'products'
        })
    })
    return code;
}

interface IStockValues {
    selling_value: number;
    cost_value: number;
}