import { parseSearchQuery, SearchQuery } from "../helpers/searchHelper";
import { Includeable, Op, Transaction, WhereOptions } from "sequelize";
import { Sales } from "../models/Sales";
import { logger } from "../config/logger";
import { SalesDetails } from "../models/SalesDetails";
import { sequelize } from "../config/sequelize-config";
import { Products } from "../models/Products";
import { refreshCurrentStock, updateStockValue } from "../helpers/productsHelper";
import { Activities } from "../models/Activities";
import { Customers } from "../models/Customers";
import { Users } from "../models/Users";
import { getDatesBetween, getToday, setDates } from "../helpers/dateHelper";
import { IncomingPayments } from '../models/IncomingPayments';
import { getDailySalesWithPaymentMethods, getDiscountReportByPaymentMethodSpecific, getDiscountTaxReportByShift, getDiscountTaxReportByUser, getSalesByPaymentMethod, getSalesReportByShift, getSalesReportByUser, getTotalIncomingPaid, getTotalSales, getTotalSalesList, getTotalSummary, getUserSales } from "../helpers/salesHelper";
import { DailyRecords } from "../models/DailyRecords";
import * as crypto from 'crypto'
import { STRING_DISCOUNT, STRING_NUMBER_OF_ITEMS, STRING_TOTAL, STRING_TOTAL_AMOUNT } from "../utils/strings";
import { Console } from "console";

const module_name = "sales";
const attributes: Includeable[] = [{
    model: Customers,
    attributes: ['name', 'id']
},
{
    model: Users,
    attributes: ['display_name']
},
{
    model: SalesDetails,
    attributes: [
        [sequelize.literal('sum(quantity * price)'), STRING_TOTAL_AMOUNT],
        [sequelize.literal('count(id)'), 'num_items']

    ],
}
]

//TODO: make sure deleted details do not affect stock values
/**
 * get a list of Sales matching the params provided. the params can be empty or a json string
 * @param _data an object where param is a json string
 * @returns list of matching Sales
 */
export async function getList(_data: {
    limit?: string,
    offset?: string,
    param?: string,
    product?: string

}): Promise<Sales[]> {
    try {

        let limit = _data.limit ? parseInt(_data.limit) : 100;
        let offset = _data.offset ? parseInt(_data.offset) : 0;
        //
        //if user specifies a search query
        let where: WhereOptions = {};
        let detailsWhere: WhereOptions = {};
        if (_data.param) {
            let searchQuery = JSON.parse(_data.param)
            where = parseSearchQuery(searchQuery)
        }
        //if the user specifies a product, search the products table
        if (_data.product) {
            let poductSearchQuery:SearchQuery[] = [{ field: 'name', operator: 'includes', param: _data.product }];// JSON.parse(_data.product)
            let Products_where = parseSearchQuery(poductSearchQuery)
            let products = await Products.findAll({
                where: Products_where
            });
            let product_ids: number[] = products.reduce(function (accumulator: number[], curr: Products) {
                return accumulator.concat(curr.id);
            }, []);
            detailsWhere['product'] = { [Op.in]: product_ids }
        }
        let objects = await Sales.findAll({

            limit,
            offset,
            where,
            include: [
                {
                    model: Customers,

                    attributes: ['name', 'id']
                },
                {
                    model: Users,
                    attributes: ['display_name']
                },

                {
                    model: SalesDetails,
                    as: SalesDetails.tableName,

                    attributes: [
                        [sequelize.literal('SUM(quantity * price)'), STRING_TOTAL],
                        [sequelize.literal(`count(${SalesDetails.tableName}.id)`), STRING_NUMBER_OF_ITEMS]
                    ]

                }
            ],

            raw: true,
            group: "code",
            subQuery: false

        });



        return objects;
    } catch (error: any) {

        logger.error({ message: error })
        throw new Error(error);
    }

};

/**
 * save or update a sale. if a code is provided, an update is performed, else an insert.
 * in case of a return sale, be sure to add prop return:yes to the _data
 * @param _data details of the sale such as customer, payment_method, and date, and the details of the items
 * @returns the code of the saved purchase
 */
export async function save(_data: {
    date?: string,
    items?: string,
    code?: string,
    created_on?: string,
    return?: string,
    created_by: string,
    user_id: string,
    customer?: string,
    amount_paid: string,
    payment_method: string,
    momo_reference?: string,
    insurance_provider?: string,
    insurance_member_name?: string,
    insurance_member_id?: string,
    creditor_name?: string,
    credit_paid?: string,
    discount?: string,
    shift?: string,
    tax?: string

}): Promise<string> {
    try {
        //the data should come with the sale data and
        //the details data.

        let items: any[] = _data.items ? JSON.parse(_data.items) : [];
        //if no code was given, generate one and create. else
        //delete that code and re-insert
        let code = _data.code;
        const date = _data.date || getToday();
        const timestamp = _data.created_on || getToday("timestamp")
        //in case of a return sale, append RT to the code for easy identification
        const isReturn: boolean = _data.return === "yes";
        let activity = "";
        const result = await sequelize.transaction(async (t: Transaction) => {

            if (code) {
                //editing must not affect the details
                let object = await Sales.findOne({
                    where: { code: code }
                })
                activity = `updated sales item with code ${code}.`
                if (!object) {
                    throw new Error(`Unable to update sale with code: ${code}. Not found`);
                }
                Sales.update(_data, {
                    transaction: t,
                    where: {
                        code: code
                    }
                });
                // await object.update(_data, {
                //     transaction: t,
                //     logging(sql, timing?) {
                //         console.log(sql, timing)
                //     },
                // });
                //update the created_on for the products as well
                await SalesDetails.update({
                    created_on: timestamp
                }, {
                    transaction: t,
                    where: {
                        code: code
                    }
                })

            }
            else {
                //generate code
                code = crypto.randomUUID();
                if (isReturn) {
                    code = "RT-" + code;
                }
                activity = `created sale item with code ${code}`


                _data.code = code;
                _data.created_by = _data.user_id;
                _data.created_on = timestamp;
                _data.date = date;
                await Sales.create(_data, {
                    transaction: t
                });
                items.map(item => {
                    item.code = code;
                    item.date = _data.date;
                    item.created_by = _data.user_id;
                    item.date = date;
                    item.created_on = timestamp;
                })

                await SalesDetails.bulkCreate(items,
                    {
                        transaction: t
                    });

            }

            t.afterCommit(async () => {
                //update stock value

                await Promise.all(items.map(async (item) => {

                    await refreshCurrentStock(item.product);
                    //add to the done list

                }));
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

export async function saveDailyRecord(_data: {
    date: string,
    shift: string,
    created_on?: string,
    amount: string,
    created_by: string,
    user_id: string,
    cash: string,
    momo: string,
    insurance: string,
    credit: string,
    pos: string,
    cheque: string,
    other: string

}): Promise<void> {
    try {

        //check if something had been submitted for the date and shift. if so update, else insert.
        //we could rely on the unique constraint of the date+shift
        let existing = await DailyRecords.findOne({
            where: {
                date: _data.date,
                shift: _data.shift
            }
        });
        console.log('existing',existing)
        if (!existing) {
            await DailyRecords.create(_data)
        }
        else {
            await DailyRecords.update(_data, {
                where: {
                    id: existing.id
                }
            })
        }


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
export async function getDetails(_data: { customer?: string, param?: string }): Promise<SalesDetails[]> {
    try {

        let where: WhereOptions = {};
        //if customer..
        if (_data.customer) {
            where['code'] = sequelize.literal(`(code in (select code from ${Sales.tableName} where customer = '${_data.customer}'))`)
        }
        if (_data.param) {
            let searchQuery = JSON.parse(_data.param)
            where = parseSearchQuery(searchQuery)
        }
        let objects = await SalesDetails.findAll({
            attributes: {
                include: [
                    [sequelize.literal(`${SalesDetails.name + '.price'} * ${SalesDetails.name + '.quantity'}`), STRING_TOTAL],
                    [sequelize.col('Product.name'), 'product_name'], // Alias the attribute to 'product_name'
                    [sequelize.col('Product.id'), 'product_id']
                ]
            },
            where: where,
            include: [{
                model: Products,
                attributes: []
            }
            ],
            raw: true
        });
        return objects
    } catch (error: any) {
        logger.error({ message: error })
        throw new Error(error);
    }
}


/**
 * delete Sales using the codes
 * @param _data must contain the codes to be deleted as an array stringified
 */
export async function deleteSales(_data: { codes: string, user_id: string }): Promise<boolean> {
    try {
        let codes: any[] = JSON.parse(_data.codes);
        //get all the items in the codes
        let items = await SalesDetails.findAll({
            where: {
                code: { [Op.in]: codes }
            }
        })
        const result = await sequelize.transaction(async (t: Transaction) => {

            await Sales.destroy({
                where: {
                    code: { [Op.in]: codes }
                },
                transaction: t
            });

            await SalesDetails.destroy({
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
                    activity: `temporarily deleted sales invoices with codes ${_data.codes}`,
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
 * get a single sale object using the id or code
 * @param _data must contain the id or code of the sale
 * @returns a purchase item
 */
export async function find(_data: { id: string }): Promise<Sales> {
    try {
        let object = await Sales.findOne({

            where: {
                [Op.or]: [
                    { id: _data.id },
                    { code: _data.id }
                ]
            },
            include: [{
                model: Customers,
                attributes: [
                    ['id', 'customer_id'],
                    ['name', 'customer_name']

                ]
            },
            {
                model: Users,
                attributes: [
                    'display_name'
                ]
            },

            {
                model: SalesDetails,
                as: SalesDetails.tableName,

                attributes: [

                    [sequelize.literal('SUM(quantity * price)'), STRING_TOTAL],
                    [sequelize.literal(`count(${SalesDetails.tableName}.id)`), STRING_NUMBER_OF_ITEMS]

                ]

            }
            ],
            raw: true,

        });
        if (!object) {
            throw new Error(`Unable to find sale with code: ${_data.id}. Not found`);
        }

        return object;
    } catch (error: any) {
        logger.error({ message: error })
        throw new Error(error);
    }
}


/**
 * get the total sale, total credit, total discount, total paid and balance amounts for a specified time and
 * customer. defaults to no customer and the current month
 * @param _data may contain the start and end dates, and vendor
 * @returns an object
 */
export async function getTotals(_data: { start_date?: string, end_date?: string, customer?: string }): Promise<ITotals> {
    try {
        let start = _data.start_date || setDates("this_month").startDate;
        let end = _data.end_date || setDates("this_month").endDate;
        let customer = _data.customer;

        let total_where: WhereOptions = {};
        let payment_where: WhereOptions = {};
        const end_date = new Date(end);
        end_date.setHours(23);
        end_date.setMinutes(59);
        end_date.setSeconds(59)
        total_where['created_on'] = { [Op.between]: [new Date(start), end_date] };
        if (customer) {
            total_where['code'] = {
                [Op.in]: sequelize.literal(`(select code from ${Sales.tableName} where customer = ${customer})`)
            };
            payment_where['payer'] = customer;
        }
        const getTotal = await SalesDetails.findOne({
            attributes: [
                [
                    sequelize.fn('SUM', sequelize.literal('price * quantity')),
                    STRING_TOTAL
                ]
            ],
            where: total_where,
            raw: true
        });
        let total = getTotal?.total || 0

        const getTotalDiscount = await Sales.findOne({
            attributes: [
                [
                    sequelize.fn('SUM', sequelize.literal('discount')),
                    STRING_DISCOUNT
                ]
            ],
            where: total_where,
            raw: true
        });
        const discount = getTotalDiscount?.discount || 0
        total -= discount;

        //add the payment method
        total_where['code'] = {
            [Op.in]: sequelize.literal(`(select code from ${Sales.tableName} where payment_method = 'Credit')`)

        }
        const getTotalCredit = await SalesDetails.findOne({
            attributes: [
                [
                    sequelize.fn('SUM', sequelize.literal('price * quantity')),
                    STRING_TOTAL
                ]
            ],
            where: total_where,
            raw: true
        });


        const total_credit = getTotalCredit?.total || 0

        const getTotalPaid = await IncomingPayments.sum("amount", {
            where: payment_where
        })
        const total_paid = getTotalPaid || 0

        let balance = total - total_paid;

        return {
            total: total.toLocaleString(),
            total_credit: total_credit.toLocaleString(),
            total_paid: total_paid.toLocaleString(),
            balance: balance.toLocaleString(),
            total_discount: discount.toLocaleString()

        }


    } catch (error: any) {
        logger.error({ message: error })
        throw new Error(error);
    }
}

export async function findUserSummaryBetweenDates(_data: { start_date?: string, end_date?: string }): Promise<SaleSummary> {
    try {

        let start = _data.start_date || getToday();
        let end = _data.end_date || getToday();
        let data = await getSalesReportByUser(start, end)

        let discount_tax_data = await getDiscountTaxReportByUser(start, end);

        let overall_total = 0, overall_tax = 0, overall_discount = 0;
        let results = [];

        let hash: { [key: string]: any } = {};
        let last_created_by = undefined;
        let count = 0;

        data.forEach(obj => {

            // {payment_method, total, discount,created_by, tax, cost, display_name}
            //the created_by holds the user's id or null. if seen, update the payment method. else insert
            //it with the current payment method
            if (!hash[obj.created_by]) {
                hash[obj.created_by] = {
                    total_amount: 0,
                    mobile_money: 0,
                    cash: 0,
                    pos: 0,
                    cheque: 0,
                    credit: 0,
                    insurance: 0,
                    other: 0,
                    discount: 0,
                    discounted_total: 0,
                    tax: 0,
                    display_name: ""
                }
            }
            hash[obj.created_by][obj.payment_method.toLowerCase().replace(" ", "_")] =
                obj.total;
            // hash[obj.created_by]['discount'] += obj.discount;
            // hash[obj.created_by]['tax'] += obj.tax;
            hash[obj.created_by][STRING_TOTAL_AMOUNT] += obj.total;
            hash[obj.created_by]['display_name'] = obj.display_name;
            overall_total += obj.total!;

            last_created_by = obj.created_by;
            count++;

        });

        discount_tax_data.forEach(obj => {
            //all the users will have been created in the hash by the previous query
            //after getting all the numbers added, compute the overall discount and discounted totals
            hash[obj.created_by]['discount'] += obj.discount;
            hash[obj.created_by]['tax'] += obj.tax;

            overall_discount += obj.discount;
            overall_tax += obj.tax;

        });
        let payment_method_discount_data = await getDiscountReportByPaymentMethodSpecific(start, end, "created_by")

        payment_method_discount_data.forEach(obj => {

            //all the users will have been created in the hash by the previous query
            //get actual amounts for each payment method by subtractin it's discount
            hash[obj.created_by][obj.payment_method.toLowerCase().replace(" ", "_")] =
                (hash[obj.created_by][obj.payment_method.toLowerCase().replace(" ", "_")]
                    - obj.discount).toLocaleString();

        })

        for (const key in hash) {
            if (Object.hasOwnProperty.call(hash, key)) {
                const element = hash[key];
                element.discounted_total = element.total_amount - element.discount
                element.total_amount = element.total_amount.toLocaleString()
                element.discounted_total = element.discounted_total.toLocaleString()
                element.discount = element.discount.toLocaleString()
                element.tax = element.tax.toLocaleString()
                results.push(element);
            }
        }

        return {

            data: results,
            overall_discount,
            overall_total,
            overall_tax
        }

    } catch (error: any) {
        logger.error({ message: error })
        throw new Error(error);
    }
}

export async function findShiftSummaryBetweenDates(_data: { [key: string]: any }): Promise<SaleSummary> {
    try {

        let start = _data.start_date || getToday();
        let end = _data.end_date || getToday();
        let data = await getSalesReportByShift(start, end)
        let discount_tax_data = await getDiscountTaxReportByShift(start, end)

        let overall_total = 0, overall_tax = 0, overall_discount = 0;
        let results = [];

        let hash: { [key: string]: any } = {};


        data.forEach(obj => {

            // {payment_method, total, discount,created_by, tax, cost, display_name}
            //the created_by holds the user's id or null. if seen, update the payment method. else insert
            //it with the current payment method
            if (hash[obj.shift] == undefined) {
                hash[obj.shift] = {
                    total_amount: 0,
                    mobile_money: 0,
                    cash: 0,
                    pos: 0,
                    cheque: 0,
                    credit: 0,
                    insurance: 0,
                    other: 0,
                    discount: 0,
                    discounted_total: 0,
                    tax: 0,
                    shift: ""
                }
            }
            hash[obj.shift][obj.payment_method.toLowerCase().replace(" ", "_")] =
                obj.total;
            // hash[obj.shift]['discount'] += obj.discount;
            // hash[obj.shift]['tax'] += obj.tax;
            hash[obj.shift][STRING_TOTAL_AMOUNT] += obj.total;
            hash[obj.shift]['shift'] = obj.shift;
            overall_total += obj.total!;


        });

        discount_tax_data.forEach(obj => {
            //all the shifts will have been created in the hash by the previous query
            //after getting all the numbers added, compute the overall discount and discounted totals

            hash[obj.shift]['discount'] += obj.discount;
            hash[obj.shift]['tax'] += obj.tax;

            overall_discount += obj.discount;
            overall_tax += obj.tax;

        });

        let payment_method_discount_data = await getDiscountReportByPaymentMethodSpecific(start, end, "shift")
        payment_method_discount_data.forEach(obj => {
            //all the shifts will have been created in the hash by the previous query
            //get actual amounts for each payment method by subtractin it's discount
            hash[obj.shift][obj.payment_method.toLowerCase().replace(" ", "_")] =
                (hash[obj.shift][obj.payment_method.toLowerCase().replace(" ", "_")]
                    - obj.discount).toLocaleString();

        });

        for (const key in hash) {
            if (Object.hasOwnProperty.call(hash, key)) {
                const element = hash[key];
                element.discounted_total = element.total_amount - element.discount
                element.total_amount = element.total_amount.toLocaleString()
                element.discounted_total = element.discounted_total.toLocaleString()
                element.discount = element.discount.toLocaleString()
                element.tax = element.tax.toLocaleString()
                results.push(element);
            }
        }

        return {

            data: results,
            overall_discount,
            overall_total,
            overall_tax
        }

    } catch (error: any) {
        logger.error({ message: error })
        throw new Error(error);
    }
}

export async function findPaymentMethodSummaryBetweenDates(_data: { start_date: string; end_date: string; }): Promise<PaymentMethodSummary> {
    try {
        let start = _data.start_date || getToday();
        let end = _data.end_date || getToday();

        let objects = await getUserSales(start, end);
        let total_sales = 0;
        let num_sales = 0;

        for (let i = 0; i < objects.length; i++) {
            let obj = objects[i];
            total_sales += obj.total || 0;
            num_sales += obj.num_of_items || 0;
        }

        let all = await getSalesByPaymentMethod(start, end);

        let cash = 0, momo = 0, cheque = 0, pos = 0, credit = 0, insurance = 0, other = 0;
        all.forEach(sale => {
            switch (sale.payment_method) {
                case "Cash":
                    cash = sale.total!
                    break;
                case "Mobile Money":
                    momo = sale.total!;
                    break;
                case "Cheque":
                    cheque = sale.total!;
                    break;
                case "POS":
                    pos = sale.total!;
                    break;
                case "Credit":
                    credit = sale.total!;
                    break;
                case "Insurance":
                    insurance = sale.total!;
                    break;
                case "Other":
                    other = sale.total!;
                    break;
                default:
                    break;
            }
        });

        return {
            num_sales: num_sales,
            total: total_sales.toLocaleString(),
            momo: momo.toLocaleString(),
            cash: cash.toLocaleString(),
            pos: pos.toLocaleString(),
            cheque: cheque.toLocaleString(),
            credit: credit.toLocaleString(),
            insurance: insurance.toLocaleString(),
            other: other.toLocaleString(),
            data: objects
        }
    } catch (error: any) {
        logger.error({ message: error })
        throw new Error(error);
    }
}

export async function getBranchDailySalesSummary(_data: { start_date: string; end_date: string; }): Promise<DailyBranchSaleSummary> {
    try {
        let start = _data.start_date || getToday();
        let end = _data.end_date || getToday();
        let queries = await getDailySalesWithPaymentMethods(start, end);
        let hash: { [key: string]: any } = {};
        let overall_total = 0;
        let overall_cost = 0;
        let total_credit = 0;
        let overall_discount = 0;
        let objects = [];
        let overall_tax = 0;
        //get the range
        if (queries.length > 0) {
            let range = getDatesBetween(start, end);
            for (let i = 0; i < range.length; i++) {
                let curr_date = range[i];
                hash[curr_date] = {
                    date: curr_date,
                    total_sales: 0,
                    average_sale: 0,
                    mobile_money: 0,
                    cash: 0,
                    pos: 0,
                    cheque: 0,
                    credit: 0,
                    insurance: 0,
                    other: 0,
                    profit: 0,
                    cost: 0,
                    tax: 0,
                    discount: 0
                }
            }
            let last_date = "";
            let count = 0;
            queries.forEach(q => {
                /*the queries are like [  { date: '2021-07-11', payment_method: 'Cash', total: 3320.67, discount: 5.00, tax: 0.00 },
      { date: '2021-07-11', payment_method: 'Mobile Money', total: 201.5, discount: 5.00, tax: 0.00 },]
      with each day/payment_method combination. so we use the date to get the hash key and update it's payment
      method key*/
                //convert the payment_method to lowercase with underscores for spaces
                //once the date changes, push to the final objects
                hash[q.date][q.payment_method.toLowerCase().replace(" ", "_")] = q.total;
                //the discount and tax are issued per sale. thus the aggregated discount and taxes are split
                //between the payment methods. thus we must add increment those for each payment method total
                // hash[q.date].discount += q.discount;
                // hash[q.date].tax += q.tax;
                hash[q.date].total_sales += q.total;
                hash[q.date].cost += q.total_cost;

                overall_total += q.total || 0;
                overall_cost += q.total_cost || 0;
                if (q.payment_method == "Credit") {
                    total_credit += q.total!;
                }


                if (last_date == "") {
                    last_date = q.date;
                }
                if (last_date != q.date || count == queries.length - 1) {


                    hash[last_date].profit = (hash[last_date].total_sales - hash[last_date].cost).toLocaleString()
                    hash[last_date].total_sales = hash[last_date].total_sales.toLocaleString();
                    hash[last_date].cost = hash[last_date].cost.toLocaleString();
                    // objects.push(hash[last_date])
                    last_date = q.date
                }

                count++;
            });
        }

        //get the discount and tax for each date in the range the range
        let payment_method_discount_data = await
            getDiscountReportByPaymentMethodSpecific(start, end, "date");
        //{discount, tax, payment_method, date}
        payment_method_discount_data.forEach(obj => {
            //all the payment methods will have been created in the hash by the previous query
            //get actual amounts for each payment method by subtractin it's discount
            hash[obj.date][obj.payment_method.toLowerCase().replace(" ", "_")] =
                (hash[obj.date][obj.payment_method.toLowerCase().replace(" ", "_")]
                    - obj.discount).toLocaleString();

            hash[obj.date].tax += obj.tax;
            hash[obj.date].discount += obj.discount;
            overall_discount += obj.discount;
            overall_tax += obj.tax;

        });
        for (const key in hash) {
            if (Object.hasOwnProperty.call(hash, key)) {
                objects.push(hash[key]);

            }
        }


        let total_credit_paid = await getTotalIncomingPaid('', start, end)
        let credit_balance = total_credit - total_credit_paid;

        return {
            data: objects,
            // best_sellers: best_sellers,
            // worst_sellers: worst_sellers,
            total: overall_total.toLocaleString(),
            average: " 0",
            profit: (overall_total - overall_cost).toLocaleString(),
            cost: overall_cost.toLocaleString(),
            total_credit: total_credit.toLocaleString(),
            total_credit_paid: total_credit_paid.toLocaleString(),
            credit_balance: credit_balance.toLocaleString(),
            total_discount: overall_discount.toLocaleString(),
            total_tax: overall_tax.toLocaleString()
        }
    } catch (error: any) {
        logger.error({ message: error })
        throw new Error(error);
    }
}

/**
 * return a list of dates and their totals. total cash, discount,
 * @param _data an object containing the start and end dates
 * @returns a list of dates and their totals
 */
export async function getBranchDailyRecords(_data: { start_date: string; end_date: string; }): Promise<DailyRecords[]> {
    try {
        let start = _data.start_date || getToday();
        let end = _data.end_date || getToday();
        let queries = await getTotalSummary(start, end);
        //an object to hold the data for each date
        let hash: { [key: string]: any } = {};
        //the list of total sold from the sales details table
        let totalSales = await getTotalSalesList(start, end, ["date"])
        const results:DailyRecords[] = []
        if (queries.length > 0) {
            let range = getDatesBetween(start, end);
            for (let i = 0; i < range.length; i++) {
                let curr_date = range[i];
                hash[curr_date] = {
                    date: curr_date,

                    mobile_money: 0,
                    cash: 0,
                    pos: 0,
                    cheque: 0,
                    credit: 0,
                    insurance: 0,
                    other: 0,
                    total: 0,
                    computer_sales: 0,
                    difference: 0
                }
            }
            console.log('queries', queries)

            queries.forEach(q => {

                //once the date changes, push to the final objects
                hash[q.date]['cash'] = q.cash;
                hash[q.date]['mobile_money'] = q.momo;
                hash[q.date]['cheque'] = q.cheque;
                hash[q.date]['credit'] = q.credit;
                hash[q.date]['insurance'] = q.insurance;
                hash[q.date]['other'] = q.other;
                hash[q.date]['pos'] = q.pos;
                hash[q.date]['total_sales'] = q.amount;

            });

            totalSales.forEach(sale => {
                hash[sale.date]['computer_sales'] = sale.total;
                hash[sale.date]['difference'] = hash[sale.date]['difference'] - (sale.total || 0);
            })
        }
        for (const key in hash) {
            if (Object.hasOwnProperty.call(hash, key)) {
                results.push(hash[key]);

            }
        }


        return results;
    } catch (error: any) {
        logger.error({ message: error })
        throw new Error(error);
    }
}

export async function getCategorySales(_data: { start_date: string; end_date: string; limit: number; }): Promise<Products[]> {
    let start = _data.start_date || getToday();
    let end = _data.end_date || getToday();
    let limit = _data.limit || 10;
    let objects = Products.findAll({
        limit,
        attributes: [
            'category',
            [sequelize.literal(`(select sum(price * quantity) as total_amount from sales_details)`), STRING_TOTAL_AMOUNT]
        ],
        where: {
            ...(start && { date: { [Op.gte]: new Date(start) } }),
            ...(end && { date: { [Op.lte]: new Date(end) } })

        },
        order: [['total', 'DESC']],
        group: ['category'],
        include: {
            model: SalesDetails,
            attributes: []
        }
    });
    return objects;
}

interface ITotals {
    total: string;
    total_credit: string;
    total_paid: string;
    balance: string;
    total_discount: string;
}

interface SaleSummary {
    data: SaleSummaryData[];
    overall_discount: number;
    overall_total: number;
    overall_tax: number;
}

interface SaleSummaryData {
    total_amount: string;
    mobile_money: string;
    cash: number;
    pos: number;
    cheque: number;
    credit: number;
    insurance: number;
    other: number;
    discount: string;
    discounted_total: string;
    tax: string;
    shift: string;
}

interface PaymentMethodSummary {
    num_sales: number;
    total: string;
    momo: string;
    cash: string;
    pos: string;
    cheque: string;
    credit: string;
    insurance: string;
    other: string;
    data: any[]
}

interface DailyBranchSaleSummary {
    data: any[],
    // best_sellers: best_sellers,
    // worst_sellers: worst_sellers,
    total: string;
    average: string;
    profit: string;
    cost: string;
    total_credit: string;
    total_credit_paid: string;
    credit_balance: string;
    total_discount: string;
    total_tax: string;
}
