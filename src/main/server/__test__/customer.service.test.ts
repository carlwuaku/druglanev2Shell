import { runMigrations } from "../config/migrations/migrations";
import { Customers } from "../models/Customers";
import { _delete, _findById, _save, _getList } from "../services/customer.service";


const customeryaro = {
    "name": "bABA yARO",
    "sex": "Male",
    "email": "wuakuc@gmail.com",
    "phone": "0207085244",
    "location": "kojokrom",
    "date_of_birth": "1990-02-12"
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

const customerHarriet2 = {
    "name": "wuaku harriet",
    "sex": "Female",
    "email": "wharriet@gmail.com",
    "phone": "0207030345",
    "location": "uk",
    "date_of_birth": "1997-02-12"
};

describe('Customer Service', () => {
    beforeAll(() => {
        
        return runMigrations();
    });

    it('add a customer', async () => {
        //clear the table and try to insert
        await Customers.destroy({ truncate: true, force: true });
        let newObject = await _save({ ...customerDoris, user_id: "1" });
        expect(newObject).toBeInstanceOf(Customers);
        //get the number of items in the table
        let count = await Customers.count();
        expect(count).toBe(1)
    });

    it('searches a customer with name', async () => {
        //clear the table and try to insert
        await Customers.destroy({ truncate: true, force: true });
         await _save({ ...customerDoris, user_id: "1" });
        await _save({ ...customerHarriet, user_id: "1" });
        await _save({ ...customeryaro, user_id: "1" });
        let objects = await _getList({param:JSON.stringify([{field:'name', operator: 'includes', param: 'doris'}])})
        expect(objects.length).toBe(1);
    });

    it('searches multiple customers with name', async () => {
        //clear the table and try to insert
        await Customers.destroy({ truncate: true, force: true });
        await _save({ ...customerDoris, user_id: "1" });
        await _save({ ...customerHarriet, user_id: "1" });
        await _save({ ...customeryaro, user_id: "1" });
        let objects = await _getList({ param: JSON.stringify([{ field: 'name', operator: 'includes', param: 'doris, harriet' }]) });

        expect(objects.length).toBe(2);
        //the results are sorted in ascending order by name
        expect(objects[0].name).toBe(customerDoris.name)
        expect(objects[1].name).toBe(customerHarriet.name)
    });

    it('search no results with wrong name', async () => {
        //clear the table and try to insert
        await Customers.destroy({ truncate: true, force: true });
        await _save({ ...customerDoris, user_id: "1" });
        await _save({ ...customerHarriet, user_id: "1" });
        await _save({ ...customeryaro, user_id: "1" });
        let objects = await _getList({ param: JSON.stringify([{ field: 'name', operator: 'includes', param: 'michael' }]) });

        expect(objects.length).toBe(0);
    });

    it('searches with email and name', async () => {
        //clear the table and try to insert
        await Customers.destroy({ truncate: true, force: true });
        await _save({ ...customerDoris, user_id: "1" });
        await _save({ ...customerHarriet, user_id: "1" });
        await _save({ ...customeryaro, user_id: "1" });
        let objects = await _getList({
            param: JSON.stringify(
                [
                    { field: 'name', operator: 'includes', param: 'harr, doris' },
                    { field: 'email', operator: 'includes', param: 'harr' }
                ]
            )
        });

        expect(objects.length).toBe(1);
    });

    it('searches using start_with, ends_with name', async () => {
        //clear the table and try to insert
        await Customers.destroy({ truncate: true, force: true });
        await _save({ ...customerDoris, user_id: "1" });
        await _save({ ...customerHarriet, user_id: "1" });
        await _save({ ...customeryaro, user_id: "1" });
        await _save({ ...customerHarriet2, user_id: "1" });
        // let objects = await _getList({
        //     param: JSON.stringify(
        //         [
        //             { field: 'name', operator: 'starts_with', param: 'harr, doris' }
        //         ]
        //     )
        // });

        // expect(objects.length).toBe(2);

        let objects2 = await _getList({
            param: JSON.stringify(
                [
                    { field: 'name', operator: 'starts_with', param: 'wuaku, doris' }
                ]
            )
        });

        expect(objects2.length).toBe(2);
    });

    it('searches using date_of_birth between', async () => {
        //clear the table and try to insert
        await Customers.destroy({ truncate: true, force: true });
        await _save({ ...customerDoris, user_id: "1" });
        await _save({ ...customerHarriet, user_id: "1" });
        await _save({ ...customeryaro, user_id: "1" });
        await _save({ ...customerHarriet2, user_id: "1" });
        // let objects = await _getList({
        //     param: JSON.stringify(
        //         [
        //             { field: 'name', operator: 'starts_with', param: 'harr, doris' }
        //         ]
        //     )
        // });

        // expect(objects.length).toBe(2);

        let objects2 = await _getList({
            param: JSON.stringify(
                [
                    { field: 'date_of_birth', operator: 'between', param: ['1994-02-01','1997-02-13'] }
                ]
            )
        });

        expect(objects2.length).toBe(3);
    });

    it('deletes a customer', async () => {
        //clear the table and try to insert
        await Customers.destroy({ truncate: true, force: true });
        let doris =await  Customers.create(customerDoris)
        let harriet =await  Customers.create(customerHarriet)

        let yaro = await Customers.create(customeryaro)
        let initial = await Customers.count();
         await _delete({
            id: yaro.id
        });
        let final = await Customers.count();

        expect(final).toEqual(initial -1);
    });

    it('finds customer by id', async () => {
        //clear the table and try to insert
        await Customers.destroy({ truncate: true, force: true });
        let doris  = await _save({ ...customerDoris, user_id: "1" });
        let find = await _findById({ id: doris.id });
        expect(find.name).toEqual(doris.name);
    });

    

})