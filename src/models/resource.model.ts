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
} from "@sequelize/core/decorators-legacy";
import { Download } from "./download.model.js";


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

    @HasMany(() => Download, "recursoid")
    declare downloads: NonAttribute<Download[]>;
}
