import { Column, CreatedAt, DataType, ForeignKey, Index, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Users } from "./Users";


@Table({
  tableName: "stock_adjustment_sessions",
  modelName: 'StockAdjustmentSessions',
  paranoid: true,
})

export class StockAdjustmentSessions extends Model{
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true
  })
  id!: number;
  
  @Index
  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true
    }
  })
  date!: string;

  @Index
  @Column({
    unique: true
  })
  code!: string;

  @CreatedAt
  created_on!: string;

  @ForeignKey(() => Users)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  created_by!: number;


}
