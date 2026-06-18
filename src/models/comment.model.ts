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

export class Comment extends Model<
  InferAttributes<Comment>,
  InferCreationAttributes<Comment>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>;

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare noteId: number;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare authorId: string;

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare valoration: number;

  @Attribute(DataTypes.STRING)
  @NotNull
  declare message: string;
}
