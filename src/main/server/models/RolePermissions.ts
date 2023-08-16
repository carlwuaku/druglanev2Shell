import { Table, Model, Column, DataType,  CreatedAt, PrimaryKey, ForeignKey } from "sequelize-typescript";
import { Permissions } from "./Permissions";
import { Roles } from "./Roles";

@Table({
   tableName: 'role_permissions',
  modelName: 'RolePermissions',
  paranoid: true,
  
})
export class RolePermissions extends Model{
  @ForeignKey(() => Roles)
  @Column({
    type: DataType.INTEGER
  })
  role_id!: number;

  @ForeignKey(() => Permissions)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  permission_id!: number;
  
  @CreatedAt
  created_on!: string;

  updatedAt: false = false;
}






// const {
//   Model
// } = require('sequelize');
// const Roles = require("./roles");
// const Permissions = require("./permissions")
// module.exports = (sequelize, DataTypes) => {
//   class role_permissions extends Model {
//     /**
//      * Helper method for defining associations.
//      * This method is not a part of Sequelize lifecycle.
//      * The `models/index` file will call this method automatically.
//      */
//     static associate(models) {
//       // define association here
//     }
//   };
//   role_permissions.init({
//     role_id: {type: DataTypes.INTEGER
//     },
//     permission_id: {type: DataTypes.INTEGER
//     }
//   }, {
//     sequelize,
//     modelName: 'role_permissions',
//   });



//   return role_permissions;
// };