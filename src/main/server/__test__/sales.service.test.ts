import { runMigrations } from "../config/migrations/migrations";
import { calculateCurrentStock } from "../helpers/productsHelper";
import { Products } from "../models/Products";
import { PurchaseDetails } from "../models/PurchaseDetails";
import { Purchases } from "../models/Purchases";
import { ReceivedTransferDetails } from "../models/ReceivedTransferDetails";
import { SalesDetails } from "../models/SalesDetails";
import { Sales } from "../models/Sales"
import { StockAdjustment } from "../models/StockAdjustment";
import { StockAdjustmentPending } from "../models/StockAdjustmentPending";
import { TransferDetails } from "../models/TransferDetails";
import { Vendors } from "../models/Vendors";
import { deleteSales, find, findPaymentMethodSummaryBetweenDates, findShiftSummaryBetweenDates, findUserSummaryBetweenDates, getBranchDailyRecords, getBranchDailySalesSummary, getDetails, getList, getTotals, save, saveDailyRecord } from "../services/sale.service";
import { sampleProducts } from "./sample_products";
import { getToday } from "../helpers/dateHelper";
import { _save } from "../services/customer.service";
import { Users } from "../models/Users";
import { save_user_function } from "../services/admin.service";

const userCarl = {
    "name": "carl",
    "role_id": 1,
    "email": "wuakuc@gmail.com",
    username: "carl",
    "display_name": "Carl Kojo",
    "active": 1,
    "phone": "0203934",
    "allow_online": "yes",
    "password": "1234",
    "id": 1
};

const userDoris = {
    "name": "doris",
    "role_id": 1,
    "email": "doris@gmail.com",
    username: "doris",
    "display_name": "Abena Dross",
    "active": 1,
    "phone": "020399874",
    "allow_online": "yes",
    "password": "2345",
    "id": 2
};

const customerDoris = {
    "name": "doris wuaku",
    "sex": "Female",
    "email": "doris@gmail.com",
    "phone": "0207123444",
    "location": "accra",
    "date_of_birth": "1996-02-12"
};

const customerHarriet = {
    "name": "harriet yankson",
    "sex": "Female",
    "email": "harriet@gmail.com",
    "phone": "0207030344",
    "location": "uk",
    "date_of_birth": "1995-02-12"
};


describe('Sales Service', () => {
    beforeAll(async () => {

        await runMigrations();
        //add some products and purchases
        await PurchaseDetails.destroy({ where: {}, force: true });
        await SalesDetails.destroy({
            where: {}, force: true
        });
        await TransferDetails.destroy({
            where: {}, force: true
        });
        await ReceivedTransferDetails.destroy({
            where: {}, force: true
        });
        await StockAdjustmentPending.destroy({
            where: {}, force: true
        });
        await StockAdjustment.destroy({
            where: {}, force: true
        });
        await Purchases.destroy({
            force: true, where: {}
        });

        await Products.destroy({
            force: true, where: {}
        });
        await Vendors.destroy({
            where: {},
            force: true
        });

        await Users.destroy({ truncate: true, force: true });
        await save_user_function({ ...userCarl, user_id: "1" });
        await save_user_function({ ...userDoris, user_id: "1" });
    });

    beforeEach(async () => {
        await Sales.destroy({ force: true, where: {} });
        await StockAdjustment.destroy({ force: true, where: {} })
        await Products.destroy({ force: true, where: {} });
        await Products.bulkCreate(sampleProducts);
        await Promise.all(sampleProducts.map(async (product) => {
            await StockAdjustment.create({
                created_by: `1`,
                date: `${getToday()}`,
                product: product.id,
                quantity_counted: product.current_stock,
                quantity_expected: product.current_stock,
                current_price: product.price,
                cost_price: product.cost_price,
                created_on: `${getToday("timestamp")}`
            })
        }));


    })
    /**
     * 1. create a sale and confirm that it was indeed created
     * 2. create multiple sales and confirm that they were all created
     * 3. create multiple sales with a specified date and confirm that they have the correct date
     * 4. create multiple sales with a single customer and confirm that they were set correctly
     * 5. search sales receipt using codes
     * 6. search sales receipts using products
     * 7. create multiple sales and confirm that the stock of the items are set correctly
     * 8. create multiple sales and confirm that the end of day report is correct
     * 9. add discounts to sales and confirm that the total is calculated correctly
     * 10. create multiple sales with different payment methods
     * 
     */


    test('creates  a sale', async () => {

        let product1Stock = await calculateCurrentStock(1);
        let product2Stock = await calculateCurrentStock(2)
        let product5Stock = await calculateCurrentStock(5)
        let code = await save({
            created_by: '1',
            amount_paid: '1120',
            payment_method: 'Mobile Money',
            momo_reference: '12345',
            discount: '15',
            tax: '0',
            shift: 'Morning',
            items: `[
                {
                    "product": 1,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 4,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 2,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 7,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 5,
                    "created_by": 1,
                    "cost_price": 20,
                    "quantity": 50,
                    "price": 30,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '1'
        });
        const salesObject = await Sales.findOne({
            where: { code: code }
        });
        expect(salesObject).toBeInstanceOf(Sales);
        const details = await SalesDetails.findAll({
            where: { code: code }
        })
        expect(details).toHaveLength(3)
        //check the products, make sure their details have
        //updated, stocks have updated
        let updated_product1 = await Products.findByPk(1);
        let updated_product2 = await Products.findByPk(2);
        let updated_product5 = await Products.findByPk(5);
        expect(updated_product1!.current_stock).toEqual(product1Stock - 9);
        expect(updated_product2!.current_stock).toEqual(product2Stock - 20);
        expect(updated_product5!.current_stock).toEqual(product5Stock - 50);


    });

    test('should not create with incorrect product id', async () => {

        let product1Stock = await calculateCurrentStock(1);
        let product2Stock = await calculateCurrentStock(2)
        await save({
            //product 10 should not exists
            created_by: '1',
            amount_paid: '1120',
            payment_method: 'Mobile Money',
            momo_reference: '12345',
            discount: '15',
            tax: '0',
            shift: 'Morning',
            items: `[
                {
                    "product": 1,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 4,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 2,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 7,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 55,
                    "created_by": 1,
                    "cost_price": 20,
                    "quantity": 50,
                    "price": 30,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '1'
        }).catch(e => expect(e).toBeTruthy())

        //check the products, make sure their details have
        //updated, stocks have not been affected updated
        let updated_product1 = await Products.findByPk(1);
        let updated_product2 = await Products.findByPk(2);
        expect(updated_product1!.current_stock).toEqual(product1Stock);
        expect(updated_product2!.current_stock).toEqual(product2Stock);
    });

    
    test('search sales details', async () => {
        const customer = await _save({ ...customerDoris, user_id: "1" });

        let code1 = await save({
            created_by: '1',
            customer: customer.id.toString(),
            amount_paid: '1120',
            payment_method: 'Mobile Money',
            momo_reference: '12345',
            discount: '15',
            tax: '0',
            shift: 'Morning',
            items: `[
                {
                    "product": 1,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 4,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 2,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 7,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 5,
                    "created_by": 1,
                    "cost_price": 20,
                    "quantity": 50,
                    "price": 30,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '1'
        });

        let code2 = await save({
            created_by: '1',
            amount_paid: '150',
            payment_method: 'Cash',
            momo_reference: '',
            discount: '1',
            tax: '0',
            shift: 'Evening',
            items: `[
                {
                    "product": 4,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 34,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 6,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 72,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 2,
                    "created_by": 1,
                    "cost_price": 12,
                    "quantity": 5,
                    "price": 30,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '1'
        });
        const product4 = await Products.findByPk(4);
        const product6 = await Products.findByPk(6);


        let returnSale = await save({
            created_by: '1',
            amount_paid: '0',
            payment_method: 'Cash',
            momo_reference: '',
            discount: '0',
            tax: '0',
            shift: 'Evening',
            return: "yes",
            items: `[
                {
                    "product": 4,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": -3,
                    "price": 34,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 6,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": -2,
                    "price": 72,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                }
            ]`,
            user_id: '1'
        });
        const product4After = await Products.findByPk(4);
        const product6After = await Products.findByPk(6);
        console.log("product 4 " + product4!.current_stock, product4After!.current_stock)
        console.log("product 6 " + product6!.current_stock, product6After!.current_stock)

        expect(product4After?.current_stock).toEqual(product4!.current_stock + 3)
        expect(product6After?.current_stock).toEqual(product6!.current_stock + 2)

        const findByCustomer = await getDetails({ "customer": customer.id.toString() })
        expect(findByCustomer).toHaveLength(3);
        expect(findByCustomer[0].total).toEqual(36);

        const findByCodes = await getDetails({
            "param": JSON.stringify([
                { field: 'code', operator: 'in', param: [code1, code2] }
            ])
        });
        expect(findByCodes).toHaveLength(6);
        expect(findByCodes[0]).toHaveProperty('id');
        expect(findByCodes[0]).toHaveProperty('total');
        expect(findByCodes[0]).toHaveProperty('product_id');
        expect(findByCodes[0]).toHaveProperty('product_name');
        expect(findByCodes[0]).toHaveProperty('product');
        expect(findByCodes[0]).toHaveProperty('quantity');
        expect(findByCodes[0]).toHaveProperty('code');

        const findByProductId = await getDetails({
            "param": JSON.stringify([
                { field: 'product', operator: 'in', param: [1, 2] }
            ])
        });
        expect(findByProductId).toHaveLength(3);

        const findReturnSale = await getDetails({
            "param": JSON.stringify([
                { field: 'code', operator: 'includes', param: "RT" }
            ])
        });
        expect(findReturnSale).toHaveLength(2);
        expect(findReturnSale[0].total).toEqual(-102);

    });



    test('delete sold items', async () => {
        //get the stock counts before and after. they need to be the same
        const product4 = await Products.findByPk(4);
        const product6 = await Products.findByPk(6);
        const product2 = await Products.findByPk(2);


        let code1 = await save({
            created_by: '1',
            amount_paid: '150',
            payment_method: 'Cash',
            momo_reference: '',
            discount: '1',
            tax: '0',
            shift: 'Evening',
            items: `[
                {
                    "product": 4,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 34,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 6,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 72,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 2,
                    "created_by": 1,
                    "cost_price": 12,
                    "quantity": 5,
                    "price": 30,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '1'
        });

        await deleteSales({ codes: JSON.stringify([code1]), user_id: "1" });
        //searching should return undefined
        const searchSales = await Sales.findOne({ where: { code: code1 } });
        const searchSalesDetails = await SalesDetails.findAll({ where: { code: code1 } });
        expect(searchSales).toBeNull();
        expect(searchSalesDetails).toHaveLength(0);

        const product4After = await Products.findByPk(4);
        const product6After = await Products.findByPk(6);
        const product2After = await Products.findByPk(2);

        expect(product2?.current_stock).toEqual(product2After?.current_stock)
        expect(product4?.current_stock).toEqual(product4After?.current_stock)
        expect(product6?.current_stock).toEqual(product6After?.current_stock)

    });

    test('search by code or id', async () => {
        let code1 = await save({
            created_by: '1',
            amount_paid: '150',
            payment_method: 'Cash',
            momo_reference: '',
            discount: '1',
            tax: '0',
            shift: 'Evening',
            items: `[
                {
                    "product": 4,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 34,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 6,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 72,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 2,
                    "created_by": 1,
                    "cost_price": 12,
                    "quantity": 5,
                    "price": 30,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '1'
        });

        let code2 = await save({
            created_by: '1',
            amount_paid: '150',
            payment_method: 'Cash',
            momo_reference: '',
            discount: '1',
            tax: '0',
            shift: 'Evening',
            items: `[
                {
                    "product": 4,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 34,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 6,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 7,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 3,
                    "created_by": 1,
                    "cost_price": 12,
                    "quantity": 5,
                    "price": 3,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '1'
        });

        let returnSale = await save({
            created_by: '1',
            amount_paid: '0',
            payment_method: 'Cash',
            momo_reference: '',
            discount: '0',
            tax: '0',
            shift: 'Evening',
            return: "yes",
            items: `[
                {
                    "product": 4,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": -3,
                    "price": 34,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 6,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": -2,
                    "price": 72,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                }
            ]`,
            user_id: '1'
        });

        const findByCode = await find({ id: code1 });
        expect(findByCode).toHaveProperty("id");
        expect(findByCode.total).toEqual(1896);
        expect(findByCode.num_of_items).toEqual(3);
        expect(findByCode.code).not.toBeNull();
        expect(findByCode.display_name).toBeTruthy();
        expect(findByCode.payment_method).toBe('Cash');
        expect(findByCode).toHaveProperty('customer_id');
        expect(findByCode).toHaveProperty('customer_name');
        expect(findByCode).toHaveProperty('display_name');
        expect(findByCode).toHaveProperty('num_of_items');
        expect(findByCode).toHaveProperty('total');

        const findByCode2 = await find({ id: code2 });
        expect(findByCode2).toHaveProperty("id");
        expect(findByCode2.total).toEqual(461);
        expect(findByCode2.num_of_items).toEqual(3);

        const findByCode3 = await find({ id: returnSale });
        expect(findByCode3).toHaveProperty("id");
        expect(findByCode3.total).toEqual(-246);
        expect(findByCode3.num_of_items).toEqual(2);
    });

    test('get list of sales', async () => {
        const customer = await _save({ ...customerDoris, user_id: "1" });

        let code1 = await save({
            created_by: '1',
            customer: customer.id.toString(),
            amount_paid: '1120',
            payment_method: 'Mobile Money',
            momo_reference: '12345',
            discount: '15',
            tax: '0',
            shift: 'Morning',
            items: `[
                {
                    "product": 1,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 4,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 2,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 7,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 5,
                    "created_by": 1,
                    "cost_price": 20,
                    "quantity": 50,
                    "price": 30,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '1'
        });

        let code2 = await save({
            created_by: '1',
            amount_paid: '150',
            payment_method: 'Cash',
            momo_reference: '',
            discount: '1',
            tax: '0',
            shift: 'Evening',
            items: `[
                {
                    "product": 4,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 34,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 6,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 7,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 3,
                    "created_by": 1,
                    "cost_price": 12,
                    "quantity": 5,
                    "price": 3,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '1'
        });

        let returnSale = await save({
            created_by: '1',
            amount_paid: '0',
            payment_method: 'Cash',
            momo_reference: '',
            discount: '0',
            tax: '0',
            shift: 'Evening',
            return: "yes",
            items: `[
                {
                    "product": 4,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": -3,
                    "price": 34,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 6,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": -2,
                    "price": 72,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                }
            ]`,
            user_id: '1'
        });

        const list = await getList({});
        expect(list).toHaveLength(3);
        //due to race conditions there's no guarantee that they'll be saved in the same order
        //thus we only check that they have the required properties and the totals and num_items 
        //are not 0
        expect(list[1]).toHaveProperty('customer_id');
        expect(list[1]).toHaveProperty('customer_name');
        expect(list[1]).toHaveProperty('display_name');
        expect(list[1]).toHaveProperty('num_of_items');
        expect(list[1]).toHaveProperty('total');
        expect(list[1].total).toBeGreaterThan(0);
        expect(list[1].num_of_items).toBeGreaterThan(0);

        //product id 6
        const addyzoaSales = await getList({
            product: 'addyzoa'
        });
        expect(addyzoaSales).toHaveLength(3);
        expect(addyzoaSales[1]).toHaveProperty('customer_id');
        expect(addyzoaSales[1]).toHaveProperty('customer_name');
        expect(addyzoaSales[1]).toHaveProperty('display_name');
        expect(addyzoaSales[1]).toHaveProperty('num_of_items');
        expect(addyzoaSales[1]).toHaveProperty('total');
        expect(addyzoaSales[1].total).toBeGreaterThan(0);
        expect(addyzoaSales[1].num_of_items).toBeGreaterThan(0);
    });

    test('get total sold, discount,etc at end of day', async () => {
        const customer = await _save({ ...customerDoris, user_id: "1" });

        let code1 = await save({
            created_by: '1',
            customer: customer.id.toString(),
            amount_paid: '1120',
            payment_method: 'Mobile Money',
            momo_reference: '12345',
            discount: '15',
            date: '2023-05-21',
            created_on: '2023-05-21 13:01:00',
            tax: '0',
            shift: 'Morning',
            items: `[
                {
                    "product": 1,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 4,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 2,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 7,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 5,
                    "created_by": 1,
                    "cost_price": 20,
                    "quantity": 50,
                    "price": 30,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '1'
        });

        let code2 = await save({
            created_by: '1',
            amount_paid: '150',
            payment_method: 'Credit',
            momo_reference: '',
            date: '2023-05-21',
            created_on: '2023-05-21 13:03:00',
            discount: '8.5',
            tax: '0',
            shift: 'Evening',
            items: `[
                {
                    "product": 4,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 34,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 6,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 7,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 3,
                    "created_by": 1,
                    "cost_price": 12,
                    "quantity": 5,
                    "price": 3,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '1'
        });
        let code3 = await save({
            created_by: '1',
            amount_paid: '150',
            payment_method: 'Cash',
            momo_reference: '',

            date: '2023-05-22',
            created_on: '2023-05-21 13:01:00',
            discount: '4',
            tax: '0',
            shift: 'Evening',
            items: `[
                {
                    "product": 4,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 34,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 10,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 7,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 9,
                    "created_by": 1,
                    "cost_price": 12,
                    "quantity": 5,
                    "price": 3,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '1'
        });

        let code4 = await save({
            created_by: '1',
            customer: customer.id.toString(),
            amount_paid: '1120',
            payment_method: 'Mobile Money',
            momo_reference: '12345',
            discount: '15',
            date: '2023-04-21',
            created_on: '2023-04-21 13:01:00',
            tax: '0',
            shift: 'Morning',
            items: `[
                {
                    "product": 1,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 4,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 2,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 7,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 5,
                    "created_by": 1,
                    "cost_price": 20,
                    "quantity": 50,
                    "price": 30,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '1'
        });

        let code5 = await save({
            created_by: '1',
            amount_paid: '150',
            payment_method: 'Cash',
            momo_reference: '',
            date: '2023-04-21',
            created_on: '2023-04-21 13:03:00',
            discount: '1.3',
            tax: '0',
            shift: 'Evening',
            items: `[
                {
                    "product": 4,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 34,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 6,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 7,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 3,
                    "created_by": 1,
                    "cost_price": 12,
                    "quantity": 5,
                    "price": 3,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '1'
        });
        let code6 = await save({
            created_by: '1',
            amount_paid: '150',
            payment_method: 'Cash',
            momo_reference: '',

            date: '2023-06-22',
            created_on: '2023-06-21 13:01:00',
            discount: '10',
            tax: '0',
            shift: 'Evening',
            items: `[
                {
                    "product": 4,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 34,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 10,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 7,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 9,
                    "created_by": 1,
                    "cost_price": 12,
                    "quantity": 5,
                    "price": 3,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '1'
        });

        let totals = await getTotals({
            start_date: '2023-05-21',
            end_date: '2023-05-21'
        });


        expect(totals.total).toEqual("2,570.5");
        expect(totals.total_credit).toEqual("461");
        expect(totals.total_paid).toEqual("0");
        expect(totals.balance).toEqual("2,570.5");
        expect(totals.total_discount).toEqual("27.5");

    });

    test('findUserSummaryBetweenDates', async () => {
        const customer = await _save({ ...customerDoris, user_id: "1" });

        let code1 = await save({
            created_by: '1',
            customer: customer.id.toString(),
            amount_paid: '1120',
            payment_method: 'Mobile Money',
            momo_reference: '12345',
            discount: '15',
            date: '2023-05-21',
            created_on: '2023-05-21 13:01:00',
            tax: '0',
            shift: 'Morning',
            items: `[
                {
                    "product": 1,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 4,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 2,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 7,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 5,
                    "created_by": 1,
                    "cost_price": 20,
                    "quantity": 50,
                    "price": 30,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '1'
        });

        let code2 = await save({
            created_by: '1',
            amount_paid: '150',
            payment_method: 'Credit',
            momo_reference: '',
            date: '2023-05-21',
            created_on: '2023-05-21 13:03:00',
            discount: '8.5',
            tax: '0',
            shift: 'Evening',
            items: `[
                {
                    "product": 4,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 34,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 6,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 7,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 3,
                    "created_by": 1,
                    "cost_price": 12,
                    "quantity": 5,
                    "price": 3,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '2'
        });
        let code3 = await save({
            created_by: '1',
            amount_paid: '150',
            payment_method: 'Cash',
            momo_reference: '',

            date: '2023-05-22',
            created_on: '2023-05-21 13:01:00',
            discount: '4',
            tax: '0',
            shift: 'Evening',
            items: `[
                {
                    "product": 4,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 34,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 10,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 7,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 9,
                    "created_by": 1,
                    "cost_price": 12,
                    "quantity": 5,
                    "price": 3,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '1'
        });

        let code4 = await save({
            created_by: '1',
            customer: customer.id.toString(),
            amount_paid: '1120',
            payment_method: 'Mobile Money',
            momo_reference: '12345',
            discount: '15',
            date: '2023-04-21',
            created_on: '2023-04-21 13:01:00',
            tax: '0',
            shift: 'Morning',
            items: `[
                {
                    "product": 1,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 4,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 2,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 7,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 5,
                    "created_by": 1,
                    "cost_price": 20,
                    "quantity": 50,
                    "price": 30,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '1'
        });

        let code5 = await save({
            created_by: '1',
            amount_paid: '150',
            payment_method: 'Cash',
            momo_reference: '',
            date: '2023-04-21',
            created_on: '2023-04-21 13:03:00',
            discount: '1.3',
            tax: '0',
            shift: 'Evening',
            items: `[
                {
                    "product": 4,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 34,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 6,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 7,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 3,
                    "created_by": 1,
                    "cost_price": 12,
                    "quantity": 5,
                    "price": 3,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '1'
        });
        let code6 = await save({
            created_by: '1',
            amount_paid: '150',
            payment_method: 'Cash',
            momo_reference: '',

            date: '2023-06-22',
            created_on: '2023-06-21 13:01:00',
            discount: '10',
            tax: '0',
            shift: 'Evening',
            items: `[
                {
                    "product": 4,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 34,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 10,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 7,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 9,
                    "created_by": 1,
                    "cost_price": 12,
                    "quantity": 5,
                    "price": 3,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '1'
        });

        let userSummary1 = await findUserSummaryBetweenDates({
            start_date: '2023-05-21',
            end_date: '2023-05-21'
        });
        expect(userSummary1.data.length).toBe(2);
        expect(userSummary1.data[0]).toHaveProperty("total_amount");
        expect(userSummary1.data[0]).toHaveProperty("mobile_money");
        expect(userSummary1.data[0]).toHaveProperty("cash");
        expect(userSummary1.data[0]).toHaveProperty("pos");
        expect(userSummary1.data[0]).toHaveProperty("cheque");
        expect(userSummary1.data[0]).toHaveProperty("credit");
        expect(userSummary1.data[0]).toHaveProperty("insurance");
        expect(userSummary1.data[0]).toHaveProperty("other");
        expect(userSummary1.data[0]).toHaveProperty("discount");
        expect(userSummary1.data[0]).toHaveProperty("discounted_total");
        expect(userSummary1.data[0]).toHaveProperty("tax");
        expect(userSummary1.data[0]).toHaveProperty("display_name");
    });


    test('findShiftSummaryBetweenDates', async () => {
        const customer = await _save({ ...customerDoris, user_id: "1" });

        let code1 = await save({
            created_by: '1',
            customer: customer.id.toString(),
            amount_paid: '1120',
            payment_method: 'Mobile Money',
            momo_reference: '12345',
            discount: '15',
            date: '2023-05-21',
            created_on: '2023-05-21 13:01:00',
            tax: '0',
            shift: 'Morning',
            items: `[
                {
                    "product": 1,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 4,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 2,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 7,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 5,
                    "created_by": 1,
                    "cost_price": 20,
                    "quantity": 50,
                    "price": 30,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '1'
        });

        let code2 = await save({
            created_by: '1',
            amount_paid: '150',
            payment_method: 'Credit',
            momo_reference: '',
            date: '2023-05-21',
            created_on: '2023-05-21 13:03:00',
            discount: '8.5',
            tax: '0',
            shift: 'Evening',
            items: `[
                {
                    "product": 4,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 34,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 6,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 7,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 3,
                    "created_by": 1,
                    "cost_price": 12,
                    "quantity": 5,
                    "price": 3,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '2'
        });
        let code3 = await save({
            created_by: '1',
            amount_paid: '150',
            payment_method: 'Cash',
            momo_reference: '',

            date: '2023-05-22',
            created_on: '2023-05-21 13:01:00',
            discount: '4',
            tax: '0',
            shift: 'Evening',
            items: `[
                {
                    "product": 4,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 34,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 10,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 7,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 9,
                    "created_by": 1,
                    "cost_price": 12,
                    "quantity": 5,
                    "price": 3,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '1'
        });

        let code4 = await save({
            created_by: '1',
            customer: customer.id.toString(),
            amount_paid: '1120',
            payment_method: 'Mobile Money',
            momo_reference: '12345',
            discount: '15',
            date: '2023-04-21',
            created_on: '2023-04-21 13:01:00',
            tax: '0',
            shift: 'Morning',
            items: `[
                {
                    "product": 1,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 4,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 2,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 7,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 5,
                    "created_by": 1,
                    "cost_price": 20,
                    "quantity": 50,
                    "price": 30,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '1'
        });

        let code5 = await save({
            created_by: '1',
            amount_paid: '150',
            payment_method: 'Cash',
            momo_reference: '',
            date: '2023-04-21',
            created_on: '2023-04-21 13:03:00',
            discount: '1.3',
            tax: '0',
            shift: 'Afternoon',
            items: `[
                {
                    "product": 4,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 34,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 6,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 7,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 3,
                    "created_by": 1,
                    "cost_price": 12,
                    "quantity": 5,
                    "price": 3,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '1'
        });
        let code6 = await save({
            created_by: '1',
            amount_paid: '150',
            payment_method: 'Cash',
            momo_reference: '',

            date: '2023-06-22',
            created_on: '2023-06-21 13:01:00',
            discount: '10',
            tax: '0',
            shift: 'Evening',
            items: `[
                {
                    "product": 4,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 34,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 10,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 7,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 9,
                    "created_by": 1,
                    "cost_price": 12,
                    "quantity": 5,
                    "price": 3,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '1'
        });

        let summary1 = await findShiftSummaryBetweenDates({
            start_date: '2023-05-21',
            end_date: '2023-05-21'
        });
        expect(summary1.data.length).toBe(2);
        expect(summary1.data[0]).toHaveProperty("total_amount");
        expect(summary1.data[0]).toHaveProperty("mobile_money");
        expect(summary1.data[0]).toHaveProperty("cash");
        expect(summary1.data[0]).toHaveProperty("pos");
        expect(summary1.data[0]).toHaveProperty("cheque");
        expect(summary1.data[0]).toHaveProperty("credit");
        expect(summary1.data[0]).toHaveProperty("insurance");
        expect(summary1.data[0]).toHaveProperty("other");
        expect(summary1.data[0]).toHaveProperty("discount");
        expect(summary1.data[0]).toHaveProperty("discounted_total");
        expect(summary1.data[0]).toHaveProperty("tax");
        expect(summary1.data[0]).toHaveProperty("shift");

        expect(parseFloat(summary1.data[0].total_amount)).toEqual(parseFloat(summary1.data[0].discount) + parseFloat(summary1.data[0].discounted_total))
    });

    test('findPaymentMethodSummaryBetweenDates', async () => {
        const customer = await _save({ ...customerDoris, user_id: "1" });

        let code1 = await save({
            created_by: '1',
            customer: customer.id.toString(),
            amount_paid: '1120',
            payment_method: 'Mobile Money',
            momo_reference: '12345',
            discount: '15',
            date: '2023-05-21',
            created_on: '2023-05-21 13:01:00',
            tax: '0',
            shift: 'Morning',
            items: `[
                {
                    "product": 1,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 4,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 2,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 7,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 5,
                    "created_by": 1,
                    "cost_price": 20,
                    "quantity": 50,
                    "price": 30,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '1'
        });

        let code2 = await save({
            created_by: '1',
            amount_paid: '150',
            payment_method: 'Credit',
            momo_reference: '',
            date: '2023-05-21',
            created_on: '2023-05-21 13:03:00',
            discount: '8.5',
            tax: '0',
            shift: 'Evening',
            items: `[
                {
                    "product": 4,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 34,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 6,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 7,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 3,
                    "created_by": 1,
                    "cost_price": 12,
                    "quantity": 5,
                    "price": 3,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '2'
        });
        let code3 = await save({
            created_by: '1',
            amount_paid: '150',
            payment_method: 'Cash',
            momo_reference: '',

            date: '2023-05-22',
            created_on: '2023-05-21 13:01:00',
            discount: '4',
            tax: '0',
            shift: 'Evening',
            items: `[
                {
                    "product": 4,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 34,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 10,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 7,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 9,
                    "created_by": 1,
                    "cost_price": 12,
                    "quantity": 5,
                    "price": 3,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '1'
        });

        let code4 = await save({
            created_by: '1',
            customer: customer.id.toString(),
            amount_paid: '1120',
            payment_method: 'Mobile Money',
            momo_reference: '12345',
            discount: '15',
            date: '2023-04-21',
            created_on: '2023-04-21 13:01:00',
            tax: '0',
            shift: 'Morning',
            items: `[
                {
                    "product": 1,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 4,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 2,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 7,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 5,
                    "created_by": 1,
                    "cost_price": 20,
                    "quantity": 50,
                    "price": 30,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '1'
        });

        let code5 = await save({
            created_by: '1',
            amount_paid: '150',
            payment_method: 'Cash',
            momo_reference: '',
            date: '2023-04-21',
            created_on: '2023-04-21 13:03:00',
            discount: '1.3',
            tax: '0',
            shift: 'Afternoon',
            items: `[
                {
                    "product": 4,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 34,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 6,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 7,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 3,
                    "created_by": 1,
                    "cost_price": 12,
                    "quantity": 5,
                    "price": 3,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '1'
        });
        let code6 = await save({
            created_by: '1',
            amount_paid: '150',
            payment_method: 'Cash',
            momo_reference: '',

            date: '2023-06-22',
            created_on: '2023-06-21 13:01:00',
            discount: '10',
            tax: '0',
            shift: 'Evening',
            items: `[
                {
                    "product": 4,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 34,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 10,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 7,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 9,
                    "created_by": 1,
                    "cost_price": 12,
                    "quantity": 5,
                    "price": 3,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '1'
        });

        let summary1 = await findPaymentMethodSummaryBetweenDates({
            start_date: '2023-05-21',
            end_date: '2023-06-22'
        });

        expect(parseFloat(summary1.total.replace(",", ""))).toEqual(
            parseFloat(summary1.momo.replace(",", "")) +
            parseFloat(summary1.cash.replace(",", "")) +
            parseFloat(summary1.pos.replace(",", "")) +
            parseFloat(summary1.cheque.replace(",", "")) +
            parseFloat(summary1.credit.replace(",", "")) +
            parseFloat(summary1.insurance.replace(",", "")) +
            parseFloat(summary1.other.replace(",", ""))
        );

        expect(summary1.num_sales).toBe(12);
    });

    //total sales: 5196, total cost: 3002, total
    /**
     * code 1: total: 1676, cost: 1127, date: 2023-05-21, discount: 15, Mobile Money,
     * code 2: total: 461, cost: 187,date: 2023-05-21, discount: 8.5, Credit
     * code 3: total: 461, cost: 187, date: 2023-05-22, discount: 4, Cash
     * code 4: total: 461, cost: 187, date: 2023-04-21, discount: 15, Mobile Money
     * code 5: total: 1676, cost: 1127, date: 2023-04-21, discount: 1.3, Cash
     * code 6: total: 461, cost: 187, date: 2023-06-22, discount: 10, Cash

     */

    async function insertSampleSales() {
        const customer = await _save({ ...customerDoris, user_id: "1" });
        let code1 = await save({
            created_by: '1',
            customer: customer.id.toString(),
            amount_paid: '1120',
            payment_method: 'Mobile Money',
            momo_reference: '12345',
            discount: '15',
            date: '2023-05-21',
            created_on: '2023-05-21 13:01:00',
            tax: '0.5',
            shift: 'Morning',
            items: `[
                {
                    "product": 1,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 4,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 2,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 7,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 5,
                    "created_by": 1,
                    "cost_price": 20,
                    "quantity": 50,
                    "price": 30,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '1'
        });

        let code2 = await save({
            created_by: '1',
            amount_paid: '150',
            payment_method: 'Credit',
            momo_reference: '',
            date: '2023-05-21',
            created_on: '2023-05-21 13:03:00',
            discount: '8.5',
            tax: '0',
            shift: 'Evening',
            items: `[
                {
                    "product": 4,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 34,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 6,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 7,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 3,
                    "created_by": 1,
                    "cost_price": 12,
                    "quantity": 5,
                    "price": 3,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '2'
        });
        let code3 = await save({
            created_by: '1',
            amount_paid: '150',
            payment_method: 'Cash',
            momo_reference: '',

            date: '2023-05-22',
            created_on: '2023-05-21 13:01:00',
            discount: '4',
            tax: '0',
            shift: 'Evening',
            items: `[
                {
                    "product": 4,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 34,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 10,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 7,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 9,
                    "created_by": 1,
                    "cost_price": 12,
                    "quantity": 5,
                    "price": 3,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '1'
        });

        let code4 = await save({
            created_by: '1',
            customer: customer.id.toString(),
            amount_paid: '1120',
            payment_method: 'Mobile Money',
            momo_reference: '12345',
            discount: '15',
            date: '2023-04-21',
            created_on: '2023-04-21 13:01:00',
            tax: '0',
            shift: 'Morning',
            items: `[
                {
                    "product": 1,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 4,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 2,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 7,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 5,
                    "created_by": 1,
                    "cost_price": 20,
                    "quantity": 50,
                    "price": 30,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '1'
        });

        let code5 = await save({
            created_by: '1',
            amount_paid: '150',
            payment_method: 'Cash',
            momo_reference: '',
            date: '2023-04-21',
            created_on: '2023-04-21 13:03:00',
            discount: '1.3',
            tax: '0',
            shift: 'Afternoon',
            items: `[
                {
                    "product": 4,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 34,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 6,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 7,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 3,
                    "created_by": 1,
                    "cost_price": 12,
                    "quantity": 5,
                    "price": 3,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '1'
        });
        let code6 = await save({
            created_by: '1',
            amount_paid: '150',
            payment_method: 'Cash',
            momo_reference: '',

            date: '2023-06-22',
            created_on: '2023-06-21 13:01:00',
            discount: '10',
            tax: '4',
            shift: 'Evening',
            items: `[
                {
                    "product": 4,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 34,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 10,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 7,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 9,
                    "created_by": 1,
                    "cost_price": 12,
                    "quantity": 5,
                    "price": 3,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '1'
        });
    }

    test('getBranchDailySalesSummary', async () => {
        await insertSampleSales();



        let summary1 = await getBranchDailySalesSummary({
            start_date: '2023-05-21',
            end_date: '2023-06-22'
        });

        expect(summary1.data.length).toBe(33);
        expect(summary1.total).toBe('3,059');
        expect(summary1.total_discount).toBe('37.5');
        expect(summary1.total_credit).toBe('461');
        expect(summary1.cost).toBe('1,688');
        expect(summary1.profit).toBe('1,371');
        expect(summary1.total_tax).toBe('4.5')
    });

    test('getBranchDailyRecords', async () => {
        await insertSampleSales();

        await saveDailyRecord({
            date: '2023-05-21',
            shift: 'Morning',
            amount: '3500',
            cash: '2000',
            momo: '1000',
            insurance: '0',
            credit: '500',
            pos: '0',
            cheque: '0',
            created_by: '1',
            other: '0',
            user_id: '1'
        });

        let summary1 = await getBranchDailyRecords({
            start_date: '2023-05-21',
            end_date: '2023-06-22'
        });

        console.log(summary1)
        expect(summary1).toBeTruthy();
    });

    test('edit a sale', async () => {

        let code = await save({
            created_by: '1',
            amount_paid: '1120',
            payment_method: 'Mobile Money',
            momo_reference: '12345',
            discount: '15',
            tax: '0',
            shift: 'Morning',
            items: `[
                {
                    "product": 1,
                    "created_by": 1,
                    "cost_price": 3,
                    "quantity": 9,
                    "price": 4,
                    "unit": "tablet",
                    "label":"no label",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 2,
                    "created_by": 1,
                    "cost_price": 5,
                    "quantity": 20,
                    "price": 7,
                    "unit": "tablet",
                    "label": "take 2 tablets 3 times daily",
                    "expiry": "2024-01-02"
                },
                {
                    "product": 5,
                    "created_by": 1,
                    "cost_price": 20,
                    "quantity": 50,
                    "price": 30,
                    "unit": "strip",
                    "label": "take 4 tabs a day",
                    "expiry": "2025-01-02"
                }
            ]`,
            user_id: '1'
        });

        const customer = await _save({ ...customerDoris, user_id: "1" });
        await save({
            created_by: '1',
            customer: customer.id.toString(),
            amount_paid: '1100',
            payment_method: 'Cash',
            created_on: '2023-06-01 09:08:33',
            user_id: '1',
            code: code
        });
        //update the customer and the date and time of the sale
        const salesObject = await Sales.findOne({
            where: { code: code },
            raw: true
        });
        console.log('salesobject', salesObject)
        expect(salesObject!.created_on).toEqual("2023-06-01 09:08:33");
        expect(salesObject!.amount_paid).toEqual(1100);
        expect(salesObject!.payment_method).toEqual("Cash");
        expect(salesObject!.customer).toEqual(customer.id.toString());
        const details = await SalesDetails.findAll({
            where: { code: code },
            raw: true
        })
        expect(details).toHaveLength(3)
        //check the details, the dates created on should change
        expect(details[0].created_on).toEqual("2023-06-01 09:08:33")
        expect(details[1].created_on).toEqual("2023-06-01 09:08:33")
        expect(details[2].created_on).toEqual("2023-06-01 09:08:33")


    });

})

