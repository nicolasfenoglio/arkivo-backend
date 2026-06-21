import { Sequelize } from "@sequelize/core";
import { PostgresDialect } from "@sequelize/postgres";
import { Profile } from "./profile.model.js";
import { Subject } from "./subject.model.js";
import { Note } from "./note.model.js";
import { Resource } from "./resource.model.js";
import { Download } from "./download.model.js";
import { Comment } from "./comment.model.js";
import { Report } from "./report.model.js";

const sequelize = new Sequelize({
  dialect: PostgresDialect,
  url: process.env.DATABASE_URL,
  models: [Profile, Subject, Note, Resource, Download, Comment, Report],
});

export default sequelize;
