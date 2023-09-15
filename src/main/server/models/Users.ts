import { Table, Model, Column, DataType,  CreatedAt, ForeignKey, Index, BelongsTo, PrimaryKey } from "sequelize-typescript";
import { Permissions } from "./Permissions";
import { Roles } from "./Roles";

@Table({
   tableName: 'users',
  modelName: 'Users',
  paranoid: true,
})


export class Users extends Model{
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true
  })
  id!: number;
  
  @ForeignKey(() => Roles)
  @Column({
    type: DataType.INTEGER
  })
  role_id!: number;

  @Index
  @Column({
    allowNull: false,
    type: DataType.STRING,
    unique: true,
  })
  email!: string;

    @Index
  @Column({
    allowNull: false,
    type: DataType.STRING,
    unique: true
  })
  username!: string;

    @Index
  @Column({
    allowNull: false,
    type: DataType.TEXT,
  })
  password_hash?: string;

    @Column({
    allowNull: true,
    type: DataType.DATEONLY,
  })
  last_login!: string;

    @Column({
    type: DataType.TEXT
  })
  last_ip!: string;

    @CreatedAt
  created_on!: string;

    @Column
  display_name!: string;

    @Index
  @Column({
    type: DataType.INTEGER,
    defaultValue: 1,
    allowNull: false
  })
  active!: number;

    @Column
  last_seen!: string;

    @Index
  @Column({
    allowNull: false,
    type: DataType.TEXT,
    unique: true
  })
  phone!: string;
    token!: string;
    role: any;
    type!: string;

    @BelongsTo(() => Roles)
  userRole!: Roles;

  permissions?:Permissions[]
}
