import { sequelize } from "../config/sequelize-config";
import { Table, Model, Column, DataType,  CreatedAt, Index, ForeignKey, PrimaryKey } from "sequelize-typescript";
import { Op } from "sequelize";
import { Users } from "./Users";
import { Transactions } from "./Transactions";

@Table({
   tableName: 'transaction_payments',
  modelName: 'TransactionPayments',
  paranoid: true,
})

export class TransactionPayments extends Model{

  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true
  })
  id!: number;

  @Index
  @Column({
    type: DataType.DATEONLY
  })
  payment_date!: string;

  @Column({
    type: DataType.DOUBLE
  })
  amount!: number;

   @Index
  @ForeignKey(() => Transactions)
  @Column
  code!: string;

    @Index
  @Column
  payer!: string;

    @Index
  @Column
  payment_method!: string;




    @Column
  notes!: string;

    @ForeignKey(() => Users)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  created_by!: number;

  @Index
  @CreatedAt
  created_on!: string;

  total?: number;
}
