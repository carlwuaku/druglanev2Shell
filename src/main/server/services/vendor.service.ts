import { logger } from '../config/logger'
import { parseSearchQuery } from "../helpers/searchHelper";
import { Vendors } from "../models/Vendors";

/**
 * get a list of customers
 * @param _data query params
 * @returns List of Customer objects
 */
export async function _getList  (_data: { [key: string]: any}):Promise<Vendors[]>  {
    try {

        let limit = _data.limit ? parseInt(_data.limit) : 100;
        let offset = _data.offset ? parseInt(_data.offset) : 0;
        //if user specifies a search query
        let where = {};
        if (_data.param) {
            let searchQuery = JSON.parse(_data.param)
             where = parseSearchQuery(searchQuery)
        }
        let objects = await Vendors.findAll({
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

        return objects;
    } catch (error: any) {

        logger.error({message: error})
        throw new Error(error);
    }

};
