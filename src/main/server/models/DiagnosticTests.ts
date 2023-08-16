import { Table, Model, Column, CreatedAt, Index, DataType, PrimaryKey } from "sequelize-typescript";

@Table({
   tableName: 'diagnostic_tests',
  modelName: 'DiagnosticTests',
  paranoid: true,
})

export class DiagnosticTests extends Model{
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true
  })
  id!: number;
  
  @Index
  @Column
  test_name!: string;

  @Column
  parameters!: string;

    @Column
  comments!: string;

    @CreatedAt
  created_on!: string;
}
