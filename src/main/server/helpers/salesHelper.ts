import { SalesDetails } from "../models/SalesDetails";
import { Users } from "../models/Users";
import { Op } from "sequelize";
import { sequelize } from "../config/sequelize-config";
import { Sales } from "../models/Sales";
import { DailyRecords } from "../models/DailyRecords";
import { IncomingPayments } from "../models/IncomingPayments";
import { STRING_NUMBER_OF_ITEMS, STRING_TOTAL, STRING_TOTAL_COST } from "../utils/strings";
import { getToday } from "./dateHelper";

/**
 * get the discount and tax grouped by payment method and e.g. the users or shift
 * @param start a start date
 * @param end an end date
 * @param field a field to group by
 * @returns list of sales objects
 */
export async function getDiscountReportByPaymentMethodSpecific(start: string, end: string, field: string): Promise<Sales[]> {
    let objects = await Sales.findAll({
        attributes: [
            [sequelize.literal(`sum(tax)`), 'tax'],
            [sequelize.literal(`sum(discount)`), 'discount'],
            "payment_method",
            field
        ],
        where: {
            date: {
                [Op.gte]: start,
                [Op.lte]: end
            },

        },
        group: ['payment_method', field],
        subQuery: false,
        raw: true
    });
    return objects
}

/**
 * get a list of total discount and tax per user, ignoring the payment method
 * @param start a start date
 * @param end the end date
 * @returns list of sales objects
 */
export async function getDiscountTaxReportByUser(start: string, end: string): Promise<Sales[]> {
    let objects = await Sales.findAll({
        attributes: [
            'created_by',
            [sequelize.literal(`sum(tax)`), 'tax'],
            [sequelize.literal(`sum(discount)`), 'discount'],

        ],
        where: {
            date: {
                [Op.gte]: start,
                [Op.lte]: end
            },

        },
        group: [sequelize.col(`${Sales.tableName}.created_by`)],
        order: [[sequelize.col(`${Sales.tableName}.created_by`), 'asc']],
        raw: true,
        subQuery: false,
        include: [
            {
                model: Users,
                attributes: ['display_name']
            }
        ]
    });

    return objects
}

/**
 * get a list of total discount and tax per shift, ignoring the payment method
 * @param start a start date
 * @param end the end date
 * @returns list of sales objects
 */
export async function getDiscountTaxReportByShift(start: string, end: string): Promise<Sales[]> {
    let objects = await Sales.findAll({
        attributes: [
            'shift',
            [sequelize.literal(`sum(tax)`), 'tax'],
            [sequelize.literal(`sum(discount)`), 'discount'],

        ],
        where: {
            date: {
                [Op.gte]: start,
                [Op.lte]: end
            },

        },
        group: [sequelize.col(`${Sales.tableName}.shift`)],
        order: [[sequelize.col(`${Sales.tableName}.shift`), 'asc']],
        raw: true,
        subQuery: false
    });

    return objects
}

/**
 * get total amount, total cost of items sold,total discount and tax per user per payment 
 * method
 * @param start a start date
 * @param end the end date
 * @returns a list of sales objects
 */
export async function getSalesReportByUser(start: string, end: string): Promise<Sales[]> {
    let objects = await Sales.findAll({
        attributes: [
            "payment_method",
            "created_by",
            [sequelize.literal(`sum(tax)`), 'tax'],
            [sequelize.literal(`sum(discount)`), 'discount'],

        ],
        where: {
            date: {
                 [Op.gte]: start ,
                 [Op.lte]: end 
            },

        },
        group: [sequelize.col(`${Sales.tableName}.created_by`), 'payment_method'],
        subQuery: false,
        raw: true,
        order: [[sequelize.col(`${Sales.tableName}.created_by`), 'asc']],
        include: [
            {
                model: Users,
                attributes: ['display_name']
            },
            {
                model: SalesDetails,
                as: SalesDetails.tableName,

                attributes: [
                    [sequelize.literal('SUM(quantity * price)'), STRING_TOTAL],
                    [sequelize.literal('SUM(quantity * cost_price)'), STRING_TOTAL_COST],
                ]

            }
        ]
    });

    return objects
}

export async function getSalesReportByShift(start: string, end: string): Promise<Sales[]> {
    let objects = Sales.findAll({
        attributes: [
            "payment_method",
            "shift",
            [sequelize.literal(`sum(tax) `), 'tax'],
            [sequelize.literal(` sum(discount) `), 'discount'],

        ],
        where: {
            date: {
                [Op.gte]: start,
                [Op.lte]: end
            },

        },
        group: ['shift', 'payment_method'],
        subQuery: false,
        raw: true,
        order: [['shift', 'asc']],
        include: [

            
            {
                model: SalesDetails,
                as: SalesDetails.tableName,

                attributes: [
                    [sequelize.literal('SUM(quantity * price)'), STRING_TOTAL],
                    [sequelize.literal('SUM(quantity * cost_price)'), STRING_TOTAL_COST],
                ]

            }
        ]
    });
    return objects
}

export async function getUserSales(start: string, end: string): Promise<Sales[]> {
    let objects = Sales.findAll({
        attributes: [
            "created_by",
        ],
        where: {
            date: {
                [Op.gte]: start,
                [Op.lte]: end
            },

        },
        group: [sequelize.col(`${Sales.tableName}.created_by`)],
        subQuery: false,
        raw: true,
        include: [
            {
                model: Users,
                attributes: ['display_name']
            },
            {
                model: SalesDetails,
                as: SalesDetails.tableName,

                attributes: [
                    [sequelize.literal('SUM(quantity * price)'), STRING_TOTAL],
                    [sequelize.literal('SUM(quantity * cost_price)'), STRING_TOTAL_COST],
                    [sequelize.literal(`count(${SalesDetails.tableName}.id)`), STRING_NUMBER_OF_ITEMS]

                ]

            }
        ]
    });
    return objects
}

/**
 * get the total sold per payment method between some dates
 * @param start start date
 * @param end end date
 * @param payment_method optional
 * @returns payment_method, total
 */
export async function getSalesByPaymentMethod(start: string, end: string, payment_method?: string): Promise<Sales[]> {
    let objects = Sales.findAll({
        attributes: [
            "payment_method",
        ],
        where: {
            date: {
                [Op.gte]: start,
                [Op.lte]: end
            },
            ...(payment_method && { payment_method: payment_method })

        },
        group: ['payment_method'],
        subQuery: false,
        raw: true,
        include: [

            {
                model: SalesDetails,
                as: SalesDetails.tableName,
                attributes: [
                    [sequelize.literal('SUM(quantity * price)'), STRING_TOTAL],

                ]
            }
        ]
    });
    return objects
}

/**
 * 
 * @param start the start date
 * @param end the end date
 * @returns a list of of dates, payment_method, total, total_cost, tax and discount
 */
export async function getDailySalesWithPaymentMethods(start: string, end: string): Promise<Sales[]> {
    let objects = Sales.findAll({
        attributes: [
            "payment_method",
            "date",
            [sequelize.literal(` sum(tax)`), 'tax'],
            [sequelize.literal(`sum(discount)`), 'discount'],

        ],
        where: {
            date: {
                [Op.gte]: start,
                [Op.lte]: end
            },

        },
        group: ['date', 'payment_method'],
        subQuery: false,
        raw: true,
        include: [

            {
                model: SalesDetails,
                as: SalesDetails.tableName,
                attributes: [
                    [sequelize.literal('SUM(quantity * price)'), STRING_TOTAL],
                    [sequelize.literal('SUM(quantity * cost_price)'), STRING_TOTAL_COST],

                ],

            }
        ]
    });
    return objects
}

/**
 * get an object with the total of each payment method
 * @param date a date
 * @returns a daily records object
 */
export async function getTotalSummary(start: string, end:string): Promise<DailyRecords[]> {
    try {
        let objects = await DailyRecords.findAll({
            attributes: [
                'date',
                'amount',
                [sequelize.literal('SUM(cash)'), 'cash'],
                [sequelize.literal('SUM(momo)'), 'momo'],
                [sequelize.literal('SUM(pos)'), 'pos'],
                [sequelize.literal('SUM(cheque)'), 'cheque'],
                [sequelize.literal('SUM(other)'), 'other'],
                [sequelize.literal('SUM(credit)'), 'credit'],
                [sequelize.literal('SUM(insurance)'), 'insurance'],


            ],
            where: {
                date: {
                    [Op.gte]: start,
                    [Op.lte]: end
                },
            },
            group: ['date'],
            subQuery: false,
            raw: true
        });
        if (!objects) {
            throw new Error("getTotalSummary object not found");
        }
        return objects
    } catch (error: any) {
        throw new Error(error)
    }

}

export async function getTotalIncomingPaid(payer?: string, start?: string, end?: string): Promise<number> {
    try {

        let object = await IncomingPayments.findOne({
            attributes: [
                [sequelize.fn("SUM", sequelize.col('amount')), 'total']
            ],
            where: {
                type: 'Credit Sale Payment',
                ...(start && { date: { [Op.gte]: new Date(start) } }),
                ...(end && { date: { [Op.lte]: new Date(end) } }),
                ...(payer && { payer: payer })
            }
        });

        if (!object) {
            throw new Error("getTotalIncomingPaid object not found");
        }
        return object.total || 0
    } catch (error: any) {
        throw new Error(error)
    }
}

export async function getTotalSales(start: string, end: string): Promise<number> {
    try {
        let object = await SalesDetails.findOne({
            attributes: [
                [sequelize.literal(`sum(price * quantity)`), STRING_TOTAL]
            ],
            where: {
                date: {
                    [Op.gte]: start,
                    [Op.lte]: end
                },

            }
        });
        if (!object) {
            throw new Error("getTotalSales object not found");
        }
        return object.total || 0
    } catch (error: any) {
        throw new Error(error)
    }
    
}

/**
 * get a list of total sales by date
 * @param start the start date
 * @param end the end date
 * @returns list of {date, total}
 */
export async function getTotalSalesList(start: string, end: string, group_by:string[] = ["date"]): Promise<SalesDetails[]> {
    try {
        let objects = await SalesDetails.findAll({
            attributes: [
                ...group_by,
                [sequelize.literal(`sum(price * quantity)`), STRING_TOTAL]
            ],
            where: {
                date: {
                    [Op.gte]: start,
                    [Op.lte]: end
                },

            },
            group: group_by,
            subQuery: false
        });
        if (!objects) {
            throw new Error("getTotalSalesList object not found");
        }
        return objects
    } catch (error: any) {
        throw new Error(error)
    }

}

export function formatDateTime(object: any) {
    if (!object || !object.created_on) return;
    const timestamp = getToday("timestamp", object.created_on);
    console.log(timestamp)
    Object.assign(object, {...object, created_on: timestamp});

}

export function flattenNestedProperties(object:any) {
    if (!object) return;
    const flattenedObject = {
        ...object,
        customer_id: object['Customer.customer_id'],
        customer_name: object['Customer.customer_name'],
        display_name: object['User.display_name'],
        total: object['sales_details.total'],
        total_cost: object['sales_details.total_cost'],
        num_of_items: object['sales_details.num_of_items'],
        created_on: getToday("timestamp", object.created_on)
    };

    delete flattenedObject['Customer.customer_id'];
    delete flattenedObject['Customer.customer_name'];
    delete flattenedObject['User.display_name'];
    delete flattenedObject['sales_details.total_amount'];
    delete flattenedObject['sales_details.num_of_items'];

    Object.assign(object, flattenedObject);
}