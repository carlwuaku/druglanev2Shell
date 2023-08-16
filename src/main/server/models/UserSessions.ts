import { Column, CreatedAt, DataType, ForeignKey, Index, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Users } from "./Users";

@Table({
  tableName: 'user_sessions',
  modelName: 'UserSessions',
  paranoid: true,
})

export class UserSessions extends Model{
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true
  })
  id!: number;
  
  @ForeignKey(() => Users)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  user_id!: number;

  @Index
  @Column
  token!: string;

  @CreatedAt
  created_on!: string;

  @Column({
    type: DataType.DATEONLY
  })
  expires!: string;
}

