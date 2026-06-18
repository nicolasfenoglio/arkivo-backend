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

export class Resource extends Model<
  InferAttributes<Resource>,
  InferCreationAttributes<Resource>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>;

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare apunteid: CreationOptional<number>;

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare materiaid: number;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare url: string;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare extension: string;

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare tamanioBytes: number;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare nombreOriginal: string;
}
