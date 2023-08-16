import { Table, Model, Column, DataType, ForeignKey, CreatedAt, PrimaryKey } from "sequelize-typescript";

@Table({
   tableName: 'online_backups',
  modelName: 'OnlineBackups',
  paranoid: true,
})
export class OnlineBackups extends Model{
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

  @Column
  url!: string;


  @CreatedAt
  created_on!: string;
}
