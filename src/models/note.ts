import {
  Sequelize,
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
  Unique,
} from "@sequelize/core/decorators-legacy";

export class Subject extends Model<
  InferAttributes<Subject>,
  InferCreationAttributes<Subject>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>;

  @Attribute(DataTypes.INTEGER)
    @NotNull
  declare autoid: CreationOptional<number>;

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare materiaid: number;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare name: string;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare descripcion: string;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare keywords: string;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare thematicunit: string;
  @Attribute(DataTypes.BOOLEAN)
  @NotNull
  declare visible: boolean;
}