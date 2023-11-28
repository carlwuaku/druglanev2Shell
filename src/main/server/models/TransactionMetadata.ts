import { Table, Model, Column, DataType,  Index, ForeignKey, PrimaryKey } from "sequelize-typescript";
import { Transactions } from "./Transactions";

@Table({
   tableName: 'transaction_metadata',
  modelName: 'TransactionMetadata',
  paranoid: true,
})

export class TransactionMetadata extends Model{

  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true
  })
  id!: number;

  @Index
  @Column
  name!: string;
@Index
  @Column
  value!: string;

   @Index
  @ForeignKey(() => Transactions)
  @Column
  code!: string;

}
