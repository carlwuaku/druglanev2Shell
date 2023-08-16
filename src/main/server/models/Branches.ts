import { Table, Model, Column, DataType, PrimaryKey, CreatedAt, Index } from "sequelize-typescript";

@Table({
   tableName: 'branches',
  modelName: 'Branches',
  paranoid: true,
})

export class Branches extends Model{
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true
  })
  id!: number;

  @Index
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  name!: string;
  
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  location!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  phone!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  address!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  email!: string;

  @CreatedAt
  created_on!: string;

}