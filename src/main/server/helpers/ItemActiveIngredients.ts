import { Table, Model, Column, DataType, ForeignKey } from "sequelize-typescript";

@Table({
   tableName: 'item_active_ingredients',
  modelName: 'ItemActiveIngredients',
  paranoid: true,
   
})
export class ItemActiveIngredients extends Model{
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  product!: number;

  @Column
  ingredient!: string;
}
