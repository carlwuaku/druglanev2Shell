import { Table, Model, Column, DataType, ForeignKey, Index, CreatedAt, PrimaryKey } from "sequelize-typescript";
import { Customers } from "./Customers";
import { Users } from "./Users";

@Table({
  tableName: "transactions",
  modelName: 'Transactions',
  paranoid: true,
  createdAt: false
})

export class Transactions extends Model{
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true
  })
  id!: number;

  @ForeignKey(() => Customers)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: null
  })
  customer!: number;

  @Index
  @Column
  type!: string;

  @Index
  @Column
  client_name!: string;

  @Index
  @Column
  client_contact!: string;

  @Index
  @Column
  client_address!: string;

  @Index
  @Column
  user_name!: string;




  @Index
  @Column({
    allowNull: false,
    unique: true
  })
  code!: string;

  @ForeignKey(() => Users)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  created_by!: number;

  @Column({
    type: DataType.DATE
  })
  created_on!: string;


  @Column({
    type: DataType.DOUBLE
  })
  discount!: number;

  @Column({
    type: DataType.DOUBLE
  })
  tax!: number;

  @Index
  @Column
  shift!: string;

  total?: number;
  display_name?: string;
  num_of_items?: number;
  total_cost?: number;
  total_paid?: number;
  payments?: any[]
}
