export function generateBarcode(id:string,name:string): string{
    let padded = id.toString().padStart(7, "0");
    return `"${padded}-${name}"`;
}

export function sortObjects(objects:any[], key:string, order = 1):any[] {
    return objects.sort((leftSide, rightSide) => {
        if (leftSide[key] < rightSide[key]) return -1 * order;
        if (leftSide[key] > rightSide[key]) return 1 * order;
        return 0;
    });
}

export function extractSqlMessage(data: any): string | undefined {
    if (typeof data === 'object' && 'original' in data && data.original.sqlMessage) {
        return data.original.sqlMessage;
    }
    else if(typeof data === 'object' &&  data.errors ){
      return data.errors[0]?.message || "A vaildation error occured. Make sure the form is filled appropriately"
    }
    return data;
}


export function flattenNestedProductProperties(object: any) {
  if (!object) return;
  const flattenedObject = {
    ...object,
    preferred_vendor_name: object['Customer.name']
  };

  delete flattenedObject['Customer.customer_id'];
  delete flattenedObject['Customer.name'];
  delete flattenedObject['User.display_name'];
  delete flattenedObject['sales_details.total_amount'];
  delete flattenedObject['sales_details.num_of_items'];

  Object.assign(object, flattenedObject);
}
