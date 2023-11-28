import { sequelize } from "../config/sequelize-config";
import { Table, Model, Column, DataType, ForeignKey, Index, CreatedAt, PrimaryKey } from "sequelize-typescript";
import { Products } from "./Products";
import { Transactions } from "./Transactions";

@Table({
  tableName: "transaction_details",
  modelName: 'TransactionDetails',
  paranoid: true,
  createdAt: false
})
 export class TransactionDetails extends Model{

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
@Column
product_name!: string;




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



  @Column
  label!: string;

  @Index
  @ForeignKey(() => Transactions)
  @Column
  code!: string;


  @Column({
    type: DataType.DOUBLE,
    allowNull: false
  })
  cost_price!: number;

  @Index
  @Column
  expiry!: string;

    @Column
  batch_number!: string;

  total?: number;
  display_name?: string;
  product_id?: string;

 }



