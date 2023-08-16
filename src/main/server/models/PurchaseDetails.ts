import { Table, Model, Column, DataType, ForeignKey, Index, CreatedAt, BelongsTo, PrimaryKey } from "sequelize-typescript";
import { Products } from "./Products";
import { Purchases } from "./Purchases";
import { Users } from "./Users";

@Table({
   tableName: 'purchase_details',
  modelName: 'PurchaseDetails',
  paranoid: true,
})

export class PurchaseDetails extends Model{
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true
  })
  id!: number;

  
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

  @CreatedAt
  created_on!: string;

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
  selling_price!: number;
  
  @Column({
    type: DataType.DATEONLY
  })
  expiry!: string;
}
