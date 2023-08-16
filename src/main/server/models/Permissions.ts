import { sequelize } from "../config/sequelize-config";
import { Table, Model, Column, DataType,  CreatedAt, PrimaryKey, ForeignKey,
   Index, HasMany, BelongsToMany, UpdatedAt } from "sequelize-typescript";
import { RolePermissions } from "./RolePermissions";
import { Roles } from "./Roles";

@Table({
   tableName: 'permissions',
  modelName: 'Permissions',
  paranoid: true,
  timestamps: false
})


export class Permissions extends Model{

  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true
  })
  permission_id!: number;

  @Index
  @Column({
    unique: true,
  })
  name!: string;

  @Index
  @Column
  description!: string;
  
  updatedAt!: false;
  deletedAt!: false;
  

  // @HasMany(() => Roles)
  // roles:Roles

 
}


// Permissions.belongsToMany(Roles, {through: RolePermissions})