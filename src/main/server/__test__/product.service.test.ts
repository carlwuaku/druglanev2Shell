/**
 * 1. get list of products
 * 2. get single product
 * 3. created product
 * 4. update product
 * 5. calculate stock value
 * 6. calculate current stock
 * 7. make sure deleted product does not affect stock value
 * 8. make sure deleted product is not retrieved
 */
import { Products } from "../models/Products";
import { runMigrations } from "../config/migrations/migrations";
import { save, save_single_stock_adjustment, _getList } from "../services/product.service";
import { sampleProducts } from "./sample_products";
import { StockAdjustment } from "../models/StockAdjustment";
import { PurchaseDetails } from "../models/PurchaseDetails";
import { SalesDetails } from "../models/SalesDetails";
import { TransferDetails } from "../models/TransferDetails";
import { ReceivedTransferDetails } from "../models/ReceivedTransferDetails";
import { StockAdjustmentPending } from "../models/StockAdjustmentPending";


describe('Products Service', () => {
    beforeAll(async () => {
        
        await runMigrations();
        //all these need to be empty for the products to be deleted
        await PurchaseDetails.destroy({ truncate: true, force: true });
        await SalesDetails.destroy({ truncate: true, force: true });
        await TransferDetails.destroy({ truncate: true, force: true });
        await ReceivedTransferDetails.destroy({ truncate: true, force: true });
        await StockAdjustment.destroy({ truncate: true, force: true });
        await StockAdjustmentPending.destroy({ truncate: true, force: true });

        await Products.destroy({ truncate: true, force: true });

        await Products.bulkCreate(sampleProducts);
    });

    

    it('searches a product by name', async () => {
       
        let objects = await _getList({ param: JSON.stringify([{ field: 'name', operator: 'includes', param: 'chocho' }]) })
        expect(objects.length).toBe(1);
         

        let multiple = await _getList({
            param: JSON.stringify(
                [{ field: 'name', operator: 'includes', param: 'caps, taabea' }]
            )
        });
        expect(multiple.length).toBe(6);
        
    });

    it('searches expiry fields', async () => {
        
        //there should be 4 items with expiry dates in 2022
        let search3 = await _getList({ param: JSON.stringify([{ field: 'expiry', operator: 'dates_between', param: ['2022-01-01', '2022-12-31'] }]) })
        expect(search3.length).toBe(4);

        //there should be 8 items with expiry dates in 2023

        let search4 = await _getList({ param: JSON.stringify([{ field: 'expiry', operator: 'dates_between', param: ['2023-01-01', '2023-12-31'] }]) })
        expect(search4.length).toBe(8);
    });


    it('searches description (getting related products)', async () => {
       
        //there should be 4 items with expiry dates in 2022
        let search1 = await _getList({
            param: JSON.stringify([
                { field: 'description', operator: 'like', param: 'herbal cough syrups' },
                { field: 'current_stock', operator: 'greater_than', param: 0 }
            ])
        })
        expect(search1.length).toBe(2);

        let search2 = await _getList({
            param: JSON.stringify([
                { field: 'description', operator: 'like', param: 'HERBAL CAPS' },
                { field: 'current_stock', operator: 'greater_than', param: 0 }
            ])
        })
        expect(search2.length).toBe(2);

    });

    it('searches min stock', async () => {
        //clear the table and try to insert
        
        let search1 = await _getList({
            param: '',
            mode: 'stock_near_min'
        })
        expect(search1.length).toBe(1);

        

    });

    it('gets expired list', async () => {
        
       

        let search1 = await _getList({
            param: JSON.stringify([
                { field: 'expiry', operator: 'less_than_or_equal', param: '2023-12-31' },
                { field: 'current_stock', operator: 'greater_than', param: 0 }
            ])
        })
        expect(search1.length).toBe(2);

        let search2 = await _getList({
            param: JSON.stringify([
                { field: 'expiry', operator: 'less_than_or_equal', param: '2024-12-31' },
                { field: 'current_stock', operator: 'greater_than', param: 0 }
            ])
        })
        expect(search2.length).toBe(3);

    });

    test('create stock adjustment', async () => {

        //get the first item in the db
        let objects = await Products.findAll({
            limit: 1
        });
        let product = objects[0].id;
        await StockAdjustment.create({
            product: product,
            quantity_counted: 40,
            quantity_expected: 4,
            shelf: 'a2',
            expiry: '2024-02-01',
            quantity_damaged: 1,
            quantity_expired: 0,
            created_by: 1,
            current_price: 20,
            cost_price: 12
        });
        // let sadj = await save_single_stock_adjustment({
        //     product: product,
        //     quantity_counted: 40,
        //     quantity_expected: 4,
        //     shelf: 'a2',
        //     expiry: '2024-02-01',
        //     quantity_damaged: 1,
        //     quantity_expired: 0,
        //     created_by: 1,
        //     current_price: 20,
        //     cost_price: 12
        // });
        // expect(sadj).toBe(true)
        //check if the new stock is what was adjusted
        let obj = await Products.findByPk(product);
        expect (obj!.current_stock).toBe(40)

        

    });

    it('add a product', async () => {
        //clear the table and try to insert
        await Products.destroy({ truncate: true, force: true });
        let newProduct = {
            active_ingredients: "herbal products, mango leaves",
            barcode: "",
            category: "SYRUP",
            caution: "do not take on empty stomach",
            contraindications: "",
            cost_price: 16,
            created_on: "2021-06-05 19:22:16",
            current_stock: 0,
            description: "herbal cough syrups",
            drug_info: "",
            expiry: "2023-02-02",
            generic_name: "",
            indications: "cough",
            is_drug: "yes",
            markup: 1.33,
            max_stock: 20,
            min_stock: 1,
            name: "ice valley",
            notes: "",
            price: 26.6,
            shelf: "",
            size: "100ml",
            status: "",
            unit: "bottle"

        };
        let newObject = await save({ ...newProduct, user_id: "1" });
        expect(newObject).toBeInstanceOf(Products);
        //get the number of items in the table
        let count = await Products.count();
        expect(count).toBe(1)
    });

    

});




