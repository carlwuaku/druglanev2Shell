import { Table, Model, PrimaryKey, Column, DataType, CreatedAt } from "sequelize-typescript";

@Table({
    tableName: 'tokens',
    modelName: 'Tokens',
    paranoid: false,
    updatedAt: false
})


export class Tokens extends Model {
    @PrimaryKey
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true
    })
    id!: number;

    @Column({
        type: DataType.STRING
    })
    name!: string;

    @CreatedAt
    created_on!: string;

    @Column({
        type: DataType.STRING
    })
    token!: string;
}