import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from "@sequelize/core";
import {
  Attribute,
  PrimaryKey,
  AutoIncrement,
  NotNull,
} from "@sequelize/core/decorators-legacy";

export class Report extends Model<
  InferAttributes<Report>,
  InferCreationAttributes<Report>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>;

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare noteId: number;

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare reporterId: number;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare reason: string;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare state: string;
  
}
