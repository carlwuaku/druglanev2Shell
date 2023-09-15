import { Table, Model, Column, DataType,  CreatedAt, HasMany, Index, PrimaryKey } from "sequelize-typescript";
import { CustomerDiagnostics } from "./CustomerDiagnostics";

@Table({
   tableName: 'customers',
  modelName: 'Customers',
  paranoid: true,

})

export class Customers extends Model{

  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true
  })
  id!: number;

  
  @Index
  @Column({
    allowNull: false
  })
  name!: string;

  
  @Column
  sex!: string;

  @Index
  @Column
  phone!: string;

  @Index
  @Column({
    validate: {
      isEmail: true
    }
  })
  email!: string;

  @Column({
    validate: {
      isDate: true
    }
  })
  date_of_birth!: string;

  @CreatedAt
  created_on!: string;

  @Column
  location!: string;

  @HasMany(() => CustomerDiagnostics)
  customerDiagnostics!: CustomerDiagnostics[];
}
