import { Table, Model, Column, CreatedAt, Index, DataType, PrimaryKey } from "sequelize-typescript";

@Table({
   tableName: 'vendors',
  modelName: 'Vendors',
  paranoid: true,
  
})

export class Vendors extends Model{
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true
  })
  id!: number;
  
  @Index
  @Column
  name!: string;

  @Column
  location!: string;

  @Index
  @Column
  phone!: string;

  @Index
  @Column
  code!: string;

  @Index
  @Column
  email!: string;

 
  @Column
  notes!: string;

  @CreatedAt
  created_on!: string;
  @Column
  legacy_id!: string;
}




