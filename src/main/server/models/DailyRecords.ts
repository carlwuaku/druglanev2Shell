
import { sequelize } from "../config/sequelize-config";
import { Table, Model, Column, DataType,  CreatedAt, HasMany, Index, ForeignKey, PrimaryKey } from "sequelize-typescript";
import { Users } from "./Users";

@Table({
   tableName: 'dailyRecords',
  modelName: 'DailyRecords',
  paranoid: true,
})

export class DailyRecords extends Model{
    
    
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
  date!: string;


  @Column({
    type: DataType.DOUBLE,
    defaultValue: 0
  })
  amount!: number;


  @Column({
    type: DataType.DOUBLE,
    defaultValue: 0
  })
  pos!: number;


  @Column({
    type: DataType.DOUBLE,
    defaultValue: 0
  })
  cheque!: number;


  @Column({
    type: DataType.DOUBLE,
    defaultValue: 0
  })
  insurance!: number;


  @Column({
    type: DataType.DOUBLE,
    defaultValue: 0
  })
  momo!: number;


  @Column({
    type: DataType.DOUBLE,
    defaultValue: 0
  })
  cash!: number;


  @Column({
    type: DataType.DOUBLE,
    defaultValue: 0
  })
  other!: number;


  @Column({
    type: DataType.DOUBLE,
    defaultValue: 0
  })
  credit!: number;


  @Column({
    type: DataType.STRING
  })
  shift!: string;


  @ForeignKey(() => Users)
  @Column({
    type: DataType.INTEGER
  })
  created_by!: number;


  @Index
  @CreatedAt
  created_on!: number;

  computer_sales?: string;
  difference?: number;
  total_sales?: number;

}
