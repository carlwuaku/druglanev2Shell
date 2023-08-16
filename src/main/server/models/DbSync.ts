import { Table, Model, Column,   CreatedAt, DataType, PrimaryKey } from "sequelize-typescript";

@Table({
   tableName: 'db_sync',
  modelName: 'DbSync',
  paranoid: true,
})

export class DbSync extends Model{
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true
  })
  id!: number;
  
  @Column
  type!: string;

  @Column
  action!: string;

  @Column
  data!: string;

  @CreatedAt
  created_on!: string;
}

