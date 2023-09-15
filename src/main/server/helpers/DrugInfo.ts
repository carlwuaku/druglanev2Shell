import { Table, Model, Column,   CreatedAt } from "sequelize-typescript";

@Table({
   tableName: 'drug_info',
  modelName: 'DrugInfo',
  paranoid: true,
})

export class DrugInfo extends Model{
  @Column
  name!: string;

  @Column
  pregnancy!: string;

    @Column
  pharmacodynamics!: string;

    @Column
  indications_and_usage!: string;
    @Column
  contraindications!: string;
    @Column
  drug_interactions_table!: string;
    @Column
  warnings_and_cautions!: string;
    @Column
  dosage_and_administration!: string;
    @Column
  adverse_reactions!: string;
    @Column
  information_for_patients!: string;
    @Column
  clinical_pharmacology!: string;
    @Column
  drug_abuse_and_dependence!: string;
    @Column
  teratogenic_effects!: string;
    @Column
  geriatric_use!: string;
    @Column
  overdosage!: string;

  @CreatedAt
  created_on!: string;

  updatedAt!: false;
}
