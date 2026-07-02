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
  requestChecksumCalculation: "WHEN_REQUIRED",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
});

const BUCKET = process.env.S3_BUCKET!;

interface UploadUrlOptions {
  noteUid: number;
  expiresIn?: number;
}

interface UploadUrlResponse {
  key: string;
  uploadUrl: string;
}

interface DownloadUrlOptions {
  key: string;
  expiresIn?: number;
}

class S3BucketService {
  buildResourceKey(noteUid: number): string {
    return `notes/${noteUid}/${crypto.randomUUID()}`;
  }

  buildAvatarKey(id: number): string {
    return `avatars/${id}/${crypto.randomUUID()}.webp`;
  }

  async generateUploadUrl({
    noteUid,
    expiresIn = 900,
  }: UploadUrlOptions): Promise<UploadUrlResponse> {
    const key = this.buildResourceKey(noteUid);

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });

    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn,
    });

    return {
      key,
      uploadUrl,
    };
  }

  async generateUploadAvatarUrl({
    id,
    expiresIn = 900,
  }: {
    id: number;
    expiresIn?: number;
  }) {
    const key = this.buildAvatarKey(id);

    const command = new PutObjectCommand({
      Bucket: "public",
      Key: key,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000",
    });

    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn,
    });

    return {
      key,
      uploadUrl,
    };
  }

  async generateDownloadUrl({
    key,
    expiresIn = 900,
  }: DownloadUrlOptions): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });

    return getSignedUrl(client, command, {
      expiresIn,
    });
  }

  async exists(key: string, bucket: string = BUCKET): Promise<boolean> {
    try {
      await client.send(
        new HeadObjectCommand({
          Bucket: bucket,
          Key: key,
        }),
      );
      return true;
    } catch {
      return false;
    }
  }

  async delete(key: string): Promise<void> {
    await client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
      }),
    );
  }
}

export default new S3BucketService();
