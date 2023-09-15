
import { Table, Model, Column, DataType, ForeignKey, CreatedAt, Index, PrimaryKey } from "sequelize-typescript";
import { Branches } from "./Branches";
import { Users } from "./Users";


@Table({
  tableName: 'received_transfers',
  modelName: 'ReceivedTransfers',
  paranoid: true,
})

export class ReceivedTransfers extends Model{
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true
  })
  id!: number;
  
  @Column({
    type: DataType.DATEONLY,
    allowNull: false
  })
  date!: string;

  @Index
  @Column({
    allowNull: false
  })
  code!: string;
  
  @Index
  @Column({
    allowNull: false
  })
  invoice!: string;

  @CreatedAt
  created_on!: string;

  @ForeignKey(() => Users)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  created_by!: number;

  @ForeignKey(() => Branches)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  sender!: number;
}

