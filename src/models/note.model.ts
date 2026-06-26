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
import { Profile } from "./profile.model.js";
import { Comment } from "./comment.model.js";
import { Resource } from "./resource.model.js";
import { Report } from "./report.model.js";

export class Note extends Model<
  InferAttributes<Note>,
  InferCreationAttributes<Note>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>;

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare authorId: CreationOptional<number>;

  @BelongsTo(() => Profile, "authorId")
  declare author: NonAttribute<Profile>;

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare subjectId: number;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare name: string;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare description: string;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare keywords: string;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare thematicUnit: string;

  @Attribute(DataTypes.BOOLEAN)
  @NotNull
  declare visible: boolean;

  @HasMany(() => Comment, "noteId")
  declare comments: NonAttribute<Comment[]>;

  @HasMany(() => Resource, "noteId")
  declare resources: NonAttribute<Resource[]>;

  @HasMany(() => Report, "noteId")
  declare reports: NonAttribute<Report[]>;
}
