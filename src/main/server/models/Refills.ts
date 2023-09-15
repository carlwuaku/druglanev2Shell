
import { Table, Model, Column, DataType, ForeignKey, CreatedAt, Index, PrimaryKey } from "sequelize-typescript";
import { Customers } from "./Customers";
import { Products } from "./Products";
import { Users } from "./Users";


@Table({
  tableName: 'refills',
  modelName: 'Refills',
  paranoid: true,
})

export class Refills extends Model{
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true
  })
  id!: number;
  
  @Index
  @Column
  product!: string;

  @ForeignKey(() => Products)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  product_id!: number;

   @Column({
    type: DataType.DOUBLE,
    defaultValue: 1
  })
  quantity!: number;

    @Index
  @Column({
    type: DataType.DATEONLY,
    allowNull: false
  })
  start_date!: string;

    @Index
  @Column({
    type: DataType.DATEONLY,
  })
  end_date!: string;

    @ForeignKey(() => Users)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  created_by!: number;

    @Index
  @Column
  status!: string;

    @ForeignKey(() => Customers)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  customer_id!: number;

    @Column
  customer_name!: string;

    @CreatedAt
  created_on!: string;
    
}
