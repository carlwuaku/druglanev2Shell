import { sequelize } from "../config/sequelize-config";
import { Table, Model, Column, DataType, ForeignKey, Index, CreatedAt, PrimaryKey } from "sequelize-typescript";
import { Products } from "./Products";

@Table({
  tableName: "transaction_types",
  modelName: 'TransactionTypes',
  paranoid: true,
  createdAt: false
})
 export class TransactionTypes extends Model{

  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true
  })
  id!: number;


@Index
@Column({
  unique: true
})
name!: string;

@Index
@Column
stock_effect!: string;

@Index
@Column
payment_required!: string;



@Column({
    type: DataType.DATE,
    allowNull: false
  })
  created_on!: string;

@Index
@Column
editable!: string;

 }



