const PORT = process.env.PORT || 5100;
// const appName = "Shoplane";
// const appLongName = "Shoplane POS & Inventory Management System";
// const databaseName = "shoplane.db";
import path from 'path';
import os from 'os';
const appName = "Druglane";
const appLongName = "Druglane Pharmacy Management System";
const databaseName = "druglanev1.db";

const appDirectory = "druglaneServerV1";
const settings_location:string =  path.join(process.env.APPDATA!, appDirectory);

export const constants = {
  appLongName : appLongName,
     appname : appName,
     server_url : process.env.NODE_ENV == "production" ? 
     "https://druglanepms.calgadsoftwares.com": "http://localhost/druglanebackend",
     settings_location,
     customer_image_url : "assets/customer_images/",
     customer_image_thumbnail_url : "assets/customer_images/thumbnails/",
         
     product_image_url : "assets/product_images/",
     product_image_thumbnail_url : "assets/product_images/thumbnails/",
     port : PORT, 
    
     
     firebase_user_collection : "users",
     firebase_requests_collection : "requests",
     firebase_responses_collection : "responses",
     
     settings_path :path.join( settings_location,'system-settings.json'),
     db_path : path.join( settings_location, databaseName),
     backup_folder : path.join(os.homedir(), `${appName}Backups`),
     settings_filename : 'system-settings.json',
     db_filename : databaseName,
     internal_backups_path :path.join( settings_location,'backups'),
  backup_temp_location : path.join(settings_location, 'backupRestoreTemp'),   
  company_id: '',
     default_functional_groups : [
       "Adult Analgesics Tablets",
       "Adult Analgesics Suppositories",
       "Paediatric Analgesics Syrups",
       "Paediatric Analgesics Suppositories",
       "Adult Dry Cough Syrups",
       "Adult Expectorant Syups",
       "Adult Cough & Cold Syrups",
       "Adult Dry Cough Tablets",
       "Adult Expectorant Tablets",
       "Adult Cough & Cold Tablets",
       "Baby Cough Syrups (0-1 years)",
       "Child Cough Syrups (up to 6 years)",
       "Child Cough Syrups (up to 12 years)",
       "Adult Catarrh Syrups",
       "Adult Catarrh Tablets",
       "Paediatric Catarrh Syrups",
       "Adult Blood Tonics",
       "Adult Multivitamins",
       "Paediatric Blood Tonics",
       "Paediatric Multivitamins"
     
     ],
     default_config : {
       port: PORT,
       host: "localhost",
       dbversion: 0,
       admin_set: 'no',
       company_set: 'no',
       auto_backup_time: 19,
       last_sync: 0,
       env: "production"
     },
     
     PERMISSION_VIEW_USER_ACTIVITIES : "View Sales History",
     PERMISSION_VIEW_PURCHASE_HISTORY : "View Purchase History",
     PERMISSION_VIEW_INVENTORY : "View Inventory",
     PERMISSION_VIEW_END_OF_DAY_REPORT : "View End Of Day Report",
     PERMISSION_VIEW_ACCOUNTS : "View Accounts",
     PERMISSION_TRANSFER_ITEMS : "Transfer Items",
     PERMISSION_RETURN_SOLD_ITEMS : "Return Sold Items",
     PERMISSION_RECEIVE_TRANSFERS : "Receive Transfers",
     PERMISSION_RECEIVE_PURCHASES : "Receive Purchases",
     PERMISSION_MANAGE_VENDORS : "Manage Vendors",
     PERMISSION_MANAGE_STAFF : "Manage Staff",
     PERMISSION_MANAGE_SETTINGS : "Manage Settings",
     PERMISSION_MANAGE_INVENTORY : "Manage Inventory",
     PERMISSION_MANAGE_CUSTOMERS : "Manage Customers",
     PERMISSION_MANAGE_ACCOUNTS : "Manage Accounts",
     PERMISSION_GIVE_DISCOUNT : "Give Discount",
     PERMISSION_EDIT_SALES : "Edit Sales",
     PERMISSION_DELETE_TRANSFERS : "Delete Transfers",
     PERMISSION_DELETE_SALES_RECORDS : "Sales Records",
     PERMISSION_DELETE_PURCHASES : "Delete Purchases",
     PERMISSION_CREATE_SALES : "Create Sales",
     PERMISSION_ADJUST_STOCK : "Adjust Stock",
     PERMISSION_VIEW_TRANSFER_HISTORY : "View Transfer History",
     PERMISSION_VIEW_SALES_REPORTS : "View Sales Reports",
  PERMISSION_VIEW_SALES_HISTORY: "View Sales History",
  STRING_DB_VERSION:"dbversion",
   
     
     }
