import { Table, Model, Column, DataType, ForeignKey, Index, CreatedAt, BelongsTo, PrimaryKey } from "sequelize-typescript";
import { Products } from "./Products";
import { Transfers } from "./Transfers";
import { Users } from "./Users";

@Table({
   tableName: 'transfer_details',
  modelName: 'TransferDetails',
  paranoid: true,
})

export class TransferDetails extends Model{
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
  cost_price!: number;

  @Column
  unit!: string;

  @CreatedAt
  created_on!: string;

  @ForeignKey(() => Users)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  created_by!: number;

  @Column({
    type: DataType.DOUBLE,
    allowNull: false
  })
  markup!: number;

  @Index
  @ForeignKey(() => Transfers)
  @Column
  code!: string;

  @Index
  @Column({
    type: DataType.DATEONLY
  })
  date!: string;

  @Column({
    type: DataType.DOUBLE,
    allowNull: false
  })
  price!: number;
  
  @Column({
    type: DataType.DATEONLY
  })
  expiry!: string;
}
