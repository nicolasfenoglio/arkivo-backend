import {
  Sequelize,
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
  Unique,
  HasMany,
} from "@sequelize/core/decorators-legacy";
import { Subject } from "./subject.model.js";
export class Department extends Model<
    InferAttributes<Department>,
    InferCreationAttributes<Department>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare name: string;

  @HasMany(() => Subject, "departmentid")
  declare subjects: NonAttribute<Subject[]>;
}
