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
  BelongsTo,
} from "@sequelize/core/decorators-legacy";
import { Profile } from "./profile.model.js";
import { Note } from "./note.model.js";

export class Visit extends Model<
  InferAttributes<Visit>,
  InferCreationAttributes<Visit>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>;

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare noteId: CreationOptional<number>;

  @BelongsTo(() => Note, "noteId")
  declare note: CreationOptional<Note>;

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare profileId: number;

  @BelongsTo(() => Profile, "profileId")
  declare profile: CreationOptional<Profile>;
}
