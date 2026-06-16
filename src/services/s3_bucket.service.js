import {
  S3Client,
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "node:crypto";

const client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
});

const BUCKET = process.env.S3_BUCKET;

class S3BucketService {
  buildResourceKey(noteUid, filename) {
    const id = crypto.randomUUID();

    return `notes/${noteUid}/${id}-${filename}`;
  }

  async generateUploadUrl({ noteUid, filename, contentType, expiresIn = 900 }) {
    const key = this.buildResourceKey(noteUid, filename);

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn,
    });

    return {
      key,
      uploadUrl,
    };
  }

  async generateDownloadUrl({ key, expiresIn = 900 }) {
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });

    return getSignedUrl(client, command, {
      expiresIn,
    });
  }

  async exists(key) {
    try {
      await client.send(
        new HeadObjectCommand({
          Bucket: BUCKET,
          Key: key,
        }),
      );

      return true;
    } catch {
      return false;
    }
  }

  async delete(key) {
    await client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
      }),
    );
  }
}

export default new S3BucketService();
