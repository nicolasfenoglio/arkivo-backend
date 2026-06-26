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
  BelongsTo,
} from "@sequelize/core/decorators-legacy";
import { Profile } from "./profile.model.js";
import { Resource } from "./resource.model.js";

export class Download extends Model<
  InferAttributes<Download>,
  InferCreationAttributes<Download>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>;

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare recursoid: CreationOptional<number>;

  @BelongsTo(() => Resource, "recursoid")
  declare resource: CreationOptional<Resource>;

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare perfilid: number;

  @BelongsTo(() => Profile, "perfilid")
  declare profile: CreationOptional<Profile>;
}
