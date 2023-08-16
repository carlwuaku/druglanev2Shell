
export function flattenNestedUserProperties(object: any) {
    if (!object) return;
    const flattenedObject = {
        ...object,
        role_name: object['userRole.role_name'],
        role_description: object['userRole.description'],
        role_id: object['userRole.role_id']
    };

    delete flattenedObject['userRole.role_name'];
    delete flattenedObject['userRole.description'];
    delete flattenedObject['userRole.role_id'];

    Object.assign(object, flattenedObject);
}