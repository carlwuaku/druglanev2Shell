import { Table, Model, Column, DataType, Index, CreatedAt, PrimaryKey } from "sequelize-typescript";

@Table({
   tableName: 'purchases',
  modelName: 'Purchases',
  paranoid: true,
})

export class Purchases extends Model{

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
  vendor!: number;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false
  })
  date!: string;

  @Column
  site!: string;

  @Index
  @Column
  code!: string;

  @Column
  status!: string;

  @CreatedAt
  created_on!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  created_by!: number;

  @Index
  @Column
  invoice!: string;

  @Index
  @Column
  payment_method!: string;

  @Column({
    type: DataType.DOUBLE
  })
  amount_paid!: number;

  @Column({
    type: DataType.DATEONLY,
  })
  last_payment_date!: string;

  
}



