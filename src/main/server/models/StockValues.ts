import { Column, CreatedAt, DataType, Index, Model, PrimaryKey, Table } from "sequelize-typescript";

@Table({
  tableName: "stock_values",
  modelName: 'StockValues',
  paranoid: true,
})

export class StockValues extends Model{
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true
  })
  id!: number;
  
  @Index
  @Column({
    type: DataType.DATEONLY,
    unique: true,
    validate: {
      isDate: true
    }
  })
  date!: string;

  @Column({
    type: DataType.DATEONLY
  })
  last_modified!: string;

  @Index
  @Column({
    type: DataType.DOUBLE,
    allowNull: false,
    defaultValue: 0
  })
  selling_value!: number;

  @Index
  @Column({
    type: DataType.DOUBLE,
    allowNull: false,
    defaultValue: 0
  })
  cost_value!: number;

  @CreatedAt
  created_on!: string;
  
}
