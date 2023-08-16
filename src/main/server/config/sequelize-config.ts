import { Sequelize } from 'sequelize-typescript'
import allModels from '../models/index';
import { config } from './config';
import { Branches } from '../models/Branches';
import { CustomerDiagnostics } from '../models/CustomerDiagnostics';
import { Customers } from '../models/Customers';
import { Permissions } from '../models/Permissions';
import { Products } from '../models/Products';
import { PurchaseDetails } from '../models/PurchaseDetails';
import { Purchases } from '../models/Purchases';
import { ReceivedTransferDetails } from '../models/ReceivedTransferDetails';
import { ReceivedTransfers } from '../models/ReceivedTransfers';
import { Refills } from '../models/Refills';
import { Roles } from '../models/Roles';
import { RolePermissions } from '../models/RolePermissions';
import { Sales } from '../models/Sales';
import { SalesDetails } from '../models/SalesDetails';
import { StockAdjustment } from '../models/StockAdjustment';
import { StockAdjustmentPending } from '../models/StockAdjustmentPending';
import { TransferDetails } from '../models/TransferDetails';
import { Transfers } from '../models/Transfers';
import { Users } from '../models/Users';
import { Vendors } from '../models/Vendors';
import { Activities } from '../models/Activities';
import { IncomingPayments } from '../models/IncomingPayments';
import { logger } from './logger';
import { flattenNestedProperties, formatDateTime } from '../helpers/salesHelper';
import { flattenNestedUserProperties } from '../helpers/userHelper';
// const databaseNames: { [key:string]:string} = {test:'test', development: 'dev'}
/**
 * SequelizeConnectionError: This error is thrown if Sequelize is unable to establish a connection to the database. This could be due to various reasons such as an incorrect database name, hostname, port, or authentication credentials.

SequelizeHostNotReachableError: This error is thrown if the database host is not reachable. This could be due to a network issue or the database server being down.

SequelizeAccessDeniedError: This error is thrown if the authentication credentials provided are incorrect. This could be due to an incorrect username, password, or database permissions.

SequelizeConnectionRefusedError: This error is thrown if the database server refuses the connection. This could be due to a configuration issue on the server or an issue with the database software itself.

SequelizeConnectionTimedOutError: This error is thrown if the connection times out while waiting for a response from the database server. This could be due to a network issue or a high load on the database server.

SequelizeConnectionAcquireTimeoutError: This error is thrown if Sequelize is unable to acquire a connection from the pool within the specified timeout period. This could be due to a high load on the database server or a misconfiguration of the connection pool.

SequelizeInvalidConnectionError: This error is thrown if the connection parameters provided are invalid. This could be due to a typo in the connection string or an incorrect configuration of the database server.
Unable to connect to the database:  ConnectionError [SequelizeConnectionError]: (conn=32, no: 1049, SQLState: 42000) Unknown database 'test' 
code: 'ER_BAD_DB_ERROR'
SequelizeDatabaseError: (conn=60, no: 1046, SQLState: 3D000) No database selected
*/

const connection = new Sequelize(config[process.env.NODE_ENV!]);

export async function authenticate():Promise<boolean> {
    try {
        await connection.authenticate();
        return true;
    } catch (error: any) {
        logger.error({ message: error });
        throw new Error(error);
        
    }
}

connection.addModels(allModels);

Permissions.belongsToMany(Roles, {
    through: RolePermissions,
    foreignKey: 'permission_id'
});

Roles.belongsToMany(Permissions, {
    through: RolePermissions,
    foreignKey: 'role_id'
});

Roles.hasMany(Users, {
    foreignKey: 'role_id'
})

Customers.hasMany(CustomerDiagnostics, {
    foreignKey: 'customer', 
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})
CustomerDiagnostics.belongsTo(Customers, {
    foreignKey: 'customer'
})

Customers.hasMany(Sales, {
    foreignKey: 'customer',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
})
Sales.belongsTo(Customers, {
    foreignKey: 'customer'
});

Products.hasMany(SalesDetails, {
    foreignKey: 'product',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
})
SalesDetails.belongsTo(Products, {
    foreignKey: 'product'
})


Products.hasMany(PurchaseDetails, {
    foreignKey: 'product',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
})
PurchaseDetails.belongsTo(Products, {
    foreignKey: 'product'
})


Products.hasMany(TransferDetails, {
    foreignKey: 'product',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
})
TransferDetails.belongsTo(Products, {
    foreignKey: 'product'
})

Products.hasMany(ReceivedTransferDetails, {
    foreignKey: 'product',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
})
ReceivedTransferDetails.belongsTo(Products, {
    foreignKey: 'product'
})

Products.hasMany(StockAdjustment, {
    foreignKey: 'product',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
})
StockAdjustment.belongsTo(Products, {
    foreignKey: 'product'})

Products.hasMany(StockAdjustmentPending, {
    foreignKey: 'product',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})
StockAdjustmentPending.belongsTo(Products, {
    foreignKey: 'product'})

Purchases.hasMany(PurchaseDetails, {
    foreignKey: 'code',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    sourceKey:'code'

});
PurchaseDetails.belongsTo(Purchases, {
    foreignKey: 'code',
    targetKey: 'code',
});

Vendors.hasMany(Purchases, {
    foreignKey: 'vendor',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
})
Purchases.belongsTo(Vendors, {
    foreignKey: 'vendor'});

ReceivedTransfers.hasMany(ReceivedTransferDetails, {
    foreignKey: 'code',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})
ReceivedTransferDetails.belongsTo(ReceivedTransfers, {
    foreignKey: 'code'
});

Branches.hasMany(ReceivedTransfers, {
    foreignKey: 'sender',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
})
ReceivedTransfers.belongsTo(Branches, {
    foreignKey: 'sender'
});

Customers.hasMany(Refills, {
    foreignKey: "customer_id",
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Refills.belongsTo(Customers, {
    foreignKey: "customer_id"
});

Sales.hasMany(SalesDetails, {
    foreignKey: 'code',
    sourceKey: 'code',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    as: SalesDetails.tableName
});
SalesDetails.belongsTo(Sales, {
    foreignKey: 'code',
    targetKey: 'code',
    as: Sales.tableName
});

Customers.hasMany(Sales, {
    foreignKey: 'customer',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
});
Sales.belongsTo(Customers, {
    foreignKey: 'customer'
});


Transfers.hasMany(TransferDetails, {
    foreignKey: 'code',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})
TransferDetails.belongsTo(Transfers, {
    foreignKey: 'code',
    targetKey: 'code'
});

Branches.hasMany(Transfers, {
    foreignKey: 'recipient',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
})
Transfers.belongsTo(Branches, {
    foreignKey: 'recipient'
});

Users.hasMany(StockAdjustmentPending, {
    foreignKey: 'created_by',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
})
StockAdjustmentPending.belongsTo(Users, {
    foreignKey: 'created_by'
});

Users.hasMany(StockAdjustment, {
    foreignKey: 'created_by',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
StockAdjustment.belongsTo(Users, {
    foreignKey: 'created_by'
});

Users.hasMany(Activities, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Activities.belongsTo(Users, {
    foreignKey: 'user_id'
});

Users.hasMany(IncomingPayments, {
    foreignKey: 'created_by',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});
IncomingPayments.belongsTo(Users, {
    foreignKey: 'created_by'
});

Users.hasMany(PurchaseDetails, {
    foreignKey: 'created_by',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});
PurchaseDetails.belongsTo(Users, {
    foreignKey: 'created_by'
});

Users.hasMany(Purchases, {
    foreignKey: 'created_by',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});
Purchases.belongsTo(Users, {
    foreignKey: 'created_by'
});

Users.hasMany(ReceivedTransferDetails, {
    foreignKey: 'created_by',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});
ReceivedTransferDetails.belongsTo(Users, {
    foreignKey: 'created_by'
});

Users.hasMany(ReceivedTransfers, {
    foreignKey: 'created_by',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});
ReceivedTransfers.belongsTo(Users, {
    foreignKey: 'created_by'
});

Users.hasMany(Refills, {
    foreignKey: 'created_by',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});
Refills.belongsTo(Users, {
    foreignKey: 'created_by'
});

Users.hasMany(Sales, {
    foreignKey: 'created_by',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});
Sales.belongsTo(Users, {
    foreignKey: 'created_by'
});

Users.hasMany(SalesDetails, {
    foreignKey: 'created_by',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});
SalesDetails.belongsTo(Users, {
    foreignKey: 'created_by'
});


Users.hasMany(TransferDetails, {
    foreignKey: 'created_by',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});
TransferDetails.belongsTo(Users, {
    foreignKey: 'created_by'
});

Users.hasMany(Transfers, {
    foreignKey: 'created_by',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});
Transfers.belongsTo(Users, {
    foreignKey: 'created_by'
});

Sales.addHook('afterFind', (results) => {
    if (Array.isArray(results)) {
        results.forEach((result) => {
            flattenNestedProperties(result);
        });
    } else {
        flattenNestedProperties(results);
    }
});
SalesDetails.addHook('afterFind', (results) => {
    if (Array.isArray(results)) {
        results.forEach((result) => {
            formatDateTime(result);
        });
    } else {
        formatDateTime(results);
    }
});

Users.addHook('afterFind', (results) => {
    if (Array.isArray(results)) {
        results.forEach((result) => {
            flattenNestedUserProperties(result);
        });
    } else {
        flattenNestedUserProperties(results);
    }
});







//transferdetails->product
//stockadjustment->product
//receivedtrans->product
//





export { connection as sequelize };
