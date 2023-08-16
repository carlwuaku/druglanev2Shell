import { sequelize } from "../config/sequelize-config";
import { Table, Model, Column, DataType, ForeignKey, Index, CreatedAt, PrimaryKey } from "sequelize-typescript";
import { Products } from "./Products";
import { Sales } from "./Sales";
import { Op } from "sequelize";

@Table({
  tableName: "sales_details",
  modelName: 'SalesDetails',
  paranoid: true,
  createdAt: false
})
 export class SalesDetails extends Model{
  
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true
  })
  id!: number;
  
  @ForeignKey(() => Products)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  product!: number;

  @Index
  @Column({
    type: DataType.DOUBLE,
    allowNull: false
  })
  quantity!: number;

  @Column({
    type: DataType.DOUBLE,
    allowNull: false
  })
  price!: number;

  @Column
  unit!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  created_on!: string;

  @Column
  label!: string;
  
  @Index
  @ForeignKey(() => Sales)
  @Column
  code!: string;

  @Index
  @Column
  date!: string;

  @Column({
    type: DataType.DOUBLE,
    allowNull: false
  })
  cost_price!: number;

  @Index
  @Column
  expiry!: string;

  total?: number;
  num_of_items?: number;
  display_name?: string;
  product_name?: string;
  product_id?: string;
  
 }



