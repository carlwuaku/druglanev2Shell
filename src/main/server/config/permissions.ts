
 export const PERMISSION_VIEW_USER_ACTIVITIES = "View User Activity";
 export const PERMISSION_VIEW_PURCHASE_HISTORY = "View Purchase History";
 export const PERMISSION_VIEW_INVENTORY = "View Inventory";
 export const PERMISSION_VIEW_END_OF_DAY_REPORT = "View End Of Day Report";
 export const PERMISSION_VIEW_ACCOUNTS = "View Accounts";
 export const PERMISSION_TRANSFER_ITEMS = "Transfer Items";
 export const PERMISSION_RETURN_SOLD_ITEMS = "Return Sold Items";
 export const PERMISSION_RECEIVE_TRANSFERS = "Receive Transfers";
 export const PERMISSION_RECEIVE_PURCHASES = "Receive Purchases";
 export const PERMISSION_MANAGE_VENDORS = "Manage Vendors";
 export const PERMISSION_MANAGE_STAFF = "Manage Staff";
 export const PERMISSION_MANAGE_SETTINGS = "Manage Settings";
 export const PERMISSION_MANAGE_INVENTORY = "Manage Inventory";
 export const PERMISSION_MANAGE_CUSTOMERS = "Manage Customers";
 export const PERMISSION_MANAGE_ACCOUNTS = "Manage Accounts";
 export const PERMISSION_GIVE_DISCOUNT = "Give Discount";
 export const PERMISSION_EDIT_SALES = "Edit Sales";
 export const PERMISSION_DELETE_TRANSFERS = "Delete Transfers";
 export const PERMISSION_DELETE_SALES_RECORDS = "Sales Records";
 export const PERMISSION_DELETE_PURCHASES = "Delete Purchases";
 export const PERMISSION_CREATE_SALES = "Create Sales";
 export const PERMISSION_ADJUST_STOCK = "Adjust Stock";
 export const PERMISSION_VIEW_TRANSFER_HISTORY = "View Transfer History";
 export const PERMISSION_VIEW_SALES_REPORTS = "View Sales Reports";
 export const PERMISSION_VIEW_SALES_HISTORY = "View Sales History";

const SETTING_DUPLICATE_RECORD_TIMEOUT = "duplicate_record_timeout";
 const STRING_NO_UPCOMING_REFILLS_FOUND = "No upcoming refills found";

export const allPermissions: Map<String, PermissionType> = new Map(Object.entries({
    PERMISSION_VIEW_SALES_HISTORY: {
        name: PERMISSION_VIEW_SALES_HISTORY,
        permission_id: 59,
        description: 'view sales invoices'
    },
    PERMISSION_RETURN_SOLD_ITEMS: {
        name: PERMISSION_RETURN_SOLD_ITEMS,
        permission_id: 60,
        description: 'received items returned. This will alter stock levels'
    },
    PERMISSION_DELETE_SALES_RECORDS: {
        name: PERMISSION_DELETE_SALES_RECORDS,
        permission_id: 61,
        description: 'delete sales receipts. this erases the receipt from the database. it will affect stock levels and sales'
    },
    PERMISSION_VIEW_SALES_REPORTS: {
        name: PERMISSION_VIEW_SALES_REPORTS,
        permission_id: 62,
        description: 'View the monthly/daily sales reports page '
    },
    PERMISSION_VIEW_END_OF_DAY_REPORT: {
        name: PERMISSION_VIEW_END_OF_DAY_REPORT,
        permission_id: 63,
        description: 'view the end of day sales summary'
    },
    PERMISSION_TRANSFER_ITEMS: {
        name: PERMISSION_TRANSFER_ITEMS,
        permission_id: 64,
        description: 'transfer products to another branch. this will affect stock levels'
    },
    PERMISSION_RECEIVE_TRANSFERS: {
        name: PERMISSION_RECEIVE_TRANSFERS,
        permission_id: 65,
        description: 'receive items transferred from another branch. this will affect stock levels'
    },
    PERMISSION_VIEW_INVENTORY: {
        name: PERMISSION_VIEW_INVENTORY,
        permission_id: 67,
        description: 'view the products list, expiries, and stock-out'
    },
    PERMISSION_MANAGE_INVENTORY: {
        name: PERMISSION_MANAGE_INVENTORY,
        permission_id: 68,
        description: 'add a new product to the inventory/edit products, delete products'
    },
    PERMISSION_ADJUST_STOCK: {
        name: PERMISSION_ADJUST_STOCK,
        permission_id: 72,
        description: 'adjust the stock of products or initiate stock-taking'
    },
    PERMISSION_RECEIVE_PURCHASES: {
        name: PERMISSION_RECEIVE_PURCHASES,
        permission_id: 73,
        description: 'receive new purchases'
    },
    PERMISSION_VIEW_PURCHASE_HISTORY: {
        name: PERMISSION_VIEW_PURCHASE_HISTORY,
        permission_id: 74,
        description: 'view purchase history'
    },
    PERMISSION_CREATE_SALES: {
        name: PERMISSION_CREATE_SALES,
        permission_id: 75,
        description: 'make sales'
    },
    PERMISSION_DELETE_PURCHASES: {
        name: PERMISSION_DELETE_PURCHASES,
        permission_id: 76,
        description: 'delete purchases invoices. This will affect stock levels'
    },
    PERMISSION_MANAGE_VENDORS: {
        name: PERMISSION_MANAGE_VENDORS,
        permission_id: 77,
        description: 'add/delete vendors'
    },
    PERMISSION_VIEW_TRANSFER_HISTORY: {
        name: PERMISSION_VIEW_TRANSFER_HISTORY,
        permission_id: 78,
        description: 'view outgoing/incoming transfer history'
    },
    PERMISSION_DELETE_TRANSFERS: {
        name: PERMISSION_DELETE_TRANSFERS,
        permission_id: 79,
        description: 'elete transfer records. this will affect stock levels'
    },
    PERMISSION_VIEW_USER_ACTIVITIES: {
        name: PERMISSION_VIEW_USER_ACTIVITIES,
        permission_id: 80,
        description: 'view all activities by user and time'
    },
    PERMISSION_MANAGE_STAFF: {
        name: PERMISSION_MANAGE_STAFF,
        permission_id: 81,
        description: 'add/edit/delete users. Also can change a user role or permissions'
    },
    PERMISSION_MANAGE_CUSTOMERS: {
        name: PERMISSION_MANAGE_CUSTOMERS,
        permission_id: 82,
        description: 'add/edit/delete customers data.'
    },
    PERMISSION_MANAGE_SETTINGS: {
        name: PERMISSION_MANAGE_SETTINGS,
        permission_id: 83,
        description: 'edit company name, phone, address, etc'
    },
    PERMISSION_VIEW_ACCOUNTS: {
        name: PERMISSION_VIEW_ACCOUNTS,
        permission_id: 84,
        description: 'view accounts details/reports'
    },
    PERMISSION_MANAGE_ACCOUNTS: {
        name: PERMISSION_MANAGE_ACCOUNTS,
        permission_id: 85,
        description: 'delete/add expenses/accounts details/reports'
    },
    PERMISSION_GIVE_DISCOUNT: {
        name: PERMISSION_GIVE_DISCOUNT,
        permission_id: 86,
        description: 'offer discounts to clients during sales'
    },
    PERMISSION_EDIT_SALES: {
        name: PERMISSION_EDIT_SALES,
        permission_id: 87,
        description: 'edit a sales date, payment method, amount paid, customer and shift'
    }
}));

export const defaultSalesPersonPermissions: number[] = [
    59, 62, 63, 67, 74, 80, 75
]



 interface PermissionType{
    permission_id: number;
    name: string;
    description: string;
}

 interface RolePermissionType{
    role_id: number;
    permission_id: number;
}
