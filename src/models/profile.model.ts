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
  Unique,
  HasMany,
  Default,
} from "@sequelize/core/decorators-legacy";
import { Comment } from "./comment.model.js";
import { Download } from "./download.model.js";
import { Note } from "./note.model.js";

export class Profile extends Model<
  InferAttributes<Profile>,
  InferCreationAttributes<Profile>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>;

  @Attribute(DataTypes.STRING)
  @Unique
  @NotNull
  declare authId: string;

  @Attribute(DataTypes.STRING)
  @Unique
  @NotNull
  declare email: string;

  @Attribute(DataTypes.STRING)
  @Unique
  @NotNull
  declare username: string;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare firstName: string;

  @Attribute(DataTypes.STRING)
  declare lastName: string | null;

  @Attribute(DataTypes.STRING)
  @Default("/default.webp")
  declare avatarKey: string | null;

  @HasMany(() => Comment, "authorId")
  declare comments: NonAttribute<Comment[]>;

  @HasMany(() => Download, "perfilid")
  declare downloads: NonAttribute<Download[]>;

  @HasMany(() => Note, "authorId")
  declare notes: NonAttribute<Note[]>;
}
