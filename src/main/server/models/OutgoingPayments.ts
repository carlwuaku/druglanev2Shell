import { Table, Model, Column, DataType, ForeignKey, CreatedAt, Index, PrimaryKey } from "sequelize-typescript";
import { Users } from "./Users";


@Table({
  tableName: 'outgoing_payments',
  modelName: 'OutgoingPayments',
  paranoid: true,
})

export class OutgoingPayments extends Model{
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true
  })
  id!: number;
  
  @Index
  @Column({
    type: DataType.DATEONLY,
    allowNull: false
  })
  date!: string;

  @Column({
    type: DataType.DOUBLE,
    allowNull: false
  })
  amount!: number;
    @Index
  @Column
  type!: string;

    @Index
  @Column
  recipient!: string;

    @Column
  transaction_id!: string;

    @Column
  item_code!: string;

    @Column
  notes!: string;

    @ForeignKey(() => Users)
  @Column({
    type: DataType.INTEGER
  })
  created_by!: number;

    @CreatedAt
  created_on!: string;
}
