import { getOperatorParamArray, parseSearchQuery } from "../../helpers/searchHelper"
import { Op, WhereOptions } from "sequelize";

describe('search Helper', () => { 
    it('generates seach query', () => {
        let query = getOperatorParamArray('includes', 'carl');
        
        expect(query.length).toBe(1)
    })

    it('generates seach query for multiple params separated by a comma', () => {
        let query = getOperatorParamArray('includes', 'carl, mark, mike');
        expect(query.length).toBe(3);
    });

    it('parses correctly the search query', () => {
        let result = parseSearchQuery([{ field: 'name', operator: 'includes', param: 'carl' }]);
        console.log(result)
        expect(result).toBeTruthy();
    });
})