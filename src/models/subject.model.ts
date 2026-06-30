import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
  type NonAttribute,
} from "@sequelize/core";
import {
  Attribute,
  PrimaryKey,
  AutoIncrement,
  NotNull,
  HasMany,
  BelongsTo,
} from "@sequelize/core/decorators-legacy";
import { Note } from "./note.model.js";
import { Department } from "./department.model.js";

export class Subject extends Model<
  InferAttributes<Subject>,
  InferCreationAttributes<Subject>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare name: string;

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare departmentid: number;

  @BelongsTo(() => Department, "departmentid")
  declare department: NonAttribute<Department>;

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare level: number;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare studyplan: string;

  @HasMany(() => Note, "subjectId")
  declare notes: NonAttribute<Note[]>;
}
