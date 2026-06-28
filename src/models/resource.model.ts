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
import { Download } from "./download.model.js";
import { Note } from "./note.model.js";

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
  declare noteId: CreationOptional<number>;

  @BelongsTo(() => Note, "noteId")
  declare note: NonAttribute<Note>;

  @Attribute(DataTypes.STRING)
  declare key?: string;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare fileName: string;

  @HasMany(() => Download, "recursoid")
  declare downloads: NonAttribute<Download[]>;
}
