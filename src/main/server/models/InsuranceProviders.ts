import { Table, Model, Column, CreatedAt, PrimaryKey, DataType } from "sequelize-typescript";

@Table({
   tableName: 'insurance_providers',
  modelName: 'InsuranceProviders',
  paranoid: true,
})
export class InsuranceProviders extends Model{
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true
  })
  id!: number;
  
  @Column
  name!: string;
  
  @CreatedAt
  created_on!: string;

  updatedAt!: false;
}
