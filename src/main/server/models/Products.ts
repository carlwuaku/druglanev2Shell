import { Table, Model, Column, DataType, ForeignKey, Index, CreatedAt, PrimaryKey } from "sequelize-typescript";

@Table({
   tableName: 'products',
  modelName: 'Products',
  paranoid: true,
})

export class Products extends Model{
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true
  })
  id!: number;
  
  @Index
  @Column({
    allowNull: false,
    unique: true,
  })
  name!: string;

  @Index
  @Column({
    type: DataType.DOUBLE,
    allowNull: false,
    defaultValue: 0,
    validate: {
      isNumeric: true
    }
  })
  price!: number;

  @Index
  @Column
  category!: string;

  @Column
  notes!: string;

  @Column
  unit!: string;

  @Column
  picture!: string;

  @Index
  @CreatedAt
  created_on!: string;

  @Index
  @Column({
    type: DataType.DOUBLE,
    allowNull: false,
    defaultValue: 0,
    validate: {
      isNumeric: true
    }
  })
  max_stock!: number;

  @Index
  @Column({
    type: DataType.DOUBLE,
    allowNull: false,
    defaultValue: 0,
    validate: {
      isNumeric: true
    }
  })
  min_stock!: number;

  @Index
  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true
    }
  })
  expiry!: string;

  @Column
  barcode!: string;

  @Index
  @Column({
    type: DataType.DOUBLE,
    allowNull: false,
    defaultValue: 0,
    validate: {
      isNumeric: true
    }
  })
  current_stock!: number;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true
  })
  last_modified!: string;

  @Index
  @Column({
    type: DataType.DOUBLE,
    allowNull: false,
    defaultValue: 0,
    validate: {
      isNumeric: true
    }
  })
  cost_price!: number;

  @Column
  size!: string;

  @Index
  @Column
  description!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1
  })
  status!: number;

  @Column
  shelf!: string;

  @Column({
    type: DataType.STRING
  })
  preferred_vendor!: number;

  @Column
  is_drug!: string;

  @Column
  generic_name!: string;

  @Column
  contraindications!: string;

  @Column
  pregnancy!: string;

  @Column
  side_effects!: string;

  @Column
  caution!: string;

  @Column
  indications!: string;

  @Column({
    type: DataType.DOUBLE,
    allowNull: false,
    defaultValue: 1.33,
    validate: {
      isNumeric: true,
      isFloat: true
    }
  })
  markup!: number;

  @Column
  active_ingredients!: string;

  @Column
  drug_info!: string;

  @Column
  last_stock_modification!: string;

  @Column({
    type: DataType.VIRTUAL,
    get() {
      return Date.parse(this.getDataValue('expiry')) < Date.now();
    },
  })
  expired!: boolean;

  @Column({
    type: DataType.VIRTUAL,
    get() {
      return this.getDataValue('current_stock') < 1;
    },
  })
  out_of_stock!: boolean;

  @Column({
    type: DataType.VIRTUAL,
    get() {
      return this.getDataValue('current_stock') > 0 &&
        this.getDataValue('current_stock') <= this.getDataValue('min_stock');
    },
  })
  near_min!: boolean;

  @Column({
    type: DataType.VIRTUAL,
    get() {
      return this.getDataValue('current_stock') > 0 &&
        this.getDataValue('current_stock') >= this.getDataValue('max_stock');
    },
  })
  near_max!: boolean;

  

  stock_value?: number
  selling_value?: number;
  cost_value?: number
  

}



