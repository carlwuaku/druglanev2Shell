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