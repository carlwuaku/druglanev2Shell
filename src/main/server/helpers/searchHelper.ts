import { Op, WhereOptions } from "sequelize";

//parse params sent through an array object [{field:name, operator:includes, param: some product name}]
/**
 * get the where options for a search query
 * @param data an array of search query [{field:name, operator:includes, param: some product name}]
 * @returns sequelize WhereOptions
 */
export function parseSearchQuery(data: SearchQuery[]): WhereOptions<any> {
    //for each item, use the operator to determine the sequelize operator
    let where: WhereOptions<any> = {};
    for (let index = 0; index < data.length; index++) {
        const element = data[index];
        where[element.field] = getOperator(element.operator, element.param)
    }
    return where;
}

export function getOperator(operator: operatorString, param: string): any {
    //the param may be separated by commas.
    //TODO: CONSIDER changing that to an array of strings instead

    //store the like operator queries
    let like_queries: any[] = getOperatorParamArray(operator, param);

    switch (operator) {
        case 'includes':

            return {
                [Op.or]: like_queries //the result of a loop goes here}
            }
        default:
            return {
                [Op.or]: like_queries //the result of a loop goes here}
            }
    }
}

type operatorString = "dates_between"|"includes"|"starts_with"|"ends_with"|"equals"|
"between"|"less_than"|"greater_than"|"greater_than_or_equal"|
"less_than_or_equal"|"in"|"date_less_than"|"date_greater_than"

export function getOperatorParamArray(operator: operatorString, param: string | Array<any> | Date): Object[] {
  let params = typeof(param) === "string" ? param.split(",").map(p => p.trim()) : [param]
    //store the like operator queries
    let like_queries: any[] = []
    params.forEach(p => {
        //if we're looking for dates between, each item has to be converted into a date object with new Date()
        if (operator === 'dates_between' && Array.isArray(p)) {
            p.map(obj => {
                obj = new Date(obj)
            });
        }
        if ((operator === 'date_less_than' || operator === 'date_greater_than') && typeof(p) === "string" ) {
            p = new Date(p);
        }
        switch (operator) {
            case 'includes':
                like_queries.push({ [Op.like]: `%${p}%` })
                break;
            case 'starts_with':
                like_queries.push({ [Op.like]: `${p}%` })
                break;
            case 'ends_with':
                like_queries.push({ [Op.like]: `%${p}` })
                break;
            case 'equals':
                like_queries.push({ [Op.eq]: `${p}` })
                break;
            case 'between':
                like_queries.push({ [Op.between]: p })//an array is expected for the value
                break;
            case 'dates_between':
                like_queries.push({ [Op.between]: p })//an array is expected for the value
                break;
            case 'less_than':
                like_queries.push({ [Op.lt]: p })//a number is expected for the value
                break;
            case 'greater_than':
                like_queries.push({ [Op.gt]: p })//a number is expected for the value
                break;
            case 'greater_than_or_equal':
                like_queries.push({ [Op.gte]: p })//a number is expected for the value
                break;
            case 'less_than_or_equal':
                like_queries.push({ [Op.lte]: p })//a number is expected for the value
                break;
            case 'in':
                like_queries.push({[Op.in]: p})//an array of values is expected [1,2,3]
                break;
                case 'date_greater_than':
                like_queries.push({[Op.gt]: p})//a date is expected
                break;
                case 'date_less_than':
                like_queries.push({[Op.lt]: p})//a date is expected
                break;

            default:
                like_queries.push({ [Op.like]: `${p}` })
        }
    });
    return like_queries
}

export interface SearchQuery {
    field: string;
    operator: operatorString;
    param: string;
}
