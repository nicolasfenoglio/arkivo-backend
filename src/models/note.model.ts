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
  HasOne,
  HasMany,
} from "@sequelize/core/decorators-legacy";
import { Profile } from "./profile.model.js";
import { Comment } from "./comment.model.js";
import { Subject } from "./subject.model.js";
import { Resource } from "./resource.model.js";
import { Report } from "./report.model.js";
import { Download } from "./download.model.js";
import { Visit } from "./visit.model.js";

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

  @HasMany(() => Resource, "apunteid")
  declare resources: NonAttribute<Resource[]>;

  @HasMany(() => Report, "noteId")
  declare reports: NonAttribute<Report[]>;

  @HasMany(() => Visit, "noteId")
  declare visits: NonAttribute<Visit[]>;
}
