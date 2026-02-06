import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import path from "path";

const DEFAULT_REGION = "us-west-004";
const DEFAULT_ENDPOINT = "https://s3.us-west-004.backblazeb2.com";

type B2Config = {
  keyId: string;
  applicationKey: string;
  bucketId: string;
  bucketName: string;
  region: string;
  endpoint: string;
};

type ObjectKeyInput = {
  projectId: string;
  trackId: string;
  versionId: string;
  filename: string;
};

export type B2UploadResult = {
  key: string;
  url: string;
  expiresAt: string;
  bucketId: string;
  bucketName: string;
  etag: string | null;
};

export type B2SignedUrlResult = {
  url: string;
  expiresAt: string;
};

let cachedClient: S3Client | null = null;

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name} environment variable`);
  }

  return value;
}

function getB2Config(): B2Config {
  return {
    keyId: requireEnv("B2_KEY_ID"),
    applicationKey: requireEnv("B2_APPLICATION_KEY"),
    bucketId: requireEnv("B2_BUCKET_ID"),
    bucketName: requireEnv("B2_BUCKET_NAME"),
    region: process.env.B2_REGION || DEFAULT_REGION,
    endpoint: process.env.B2_ENDPOINT || DEFAULT_ENDPOINT,
  };
}

function getB2Client() {
  if (cachedClient) {
    return cachedClient;
  }

  const config = getB2Config();

  cachedClient = new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: config.keyId,
      secretAccessKey: config.applicationKey,
    },
  });

  return cachedClient;
}

function sanitizeFilename(filename: string) {
  const base = path.basename(filename || "audio");
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_").trim();

  if (!cleaned) {
    return "audio.bin";
  }

  if (!cleaned.includes(".")) {
    return `${cleaned}.bin`;
  }

  return cleaned;
}

function buildObjectKey({ projectId, trackId, versionId, filename }: ObjectKeyInput) {
  const safeFilename = sanitizeFilename(filename);

  return `${projectId}/${trackId}/${versionId}/${safeFilename}`;
}

export async function uploadToB2({
  projectId,
  trackId,
  versionId,
  filename,
  body,
  contentType,
  expiresInSeconds = 3600,
}: ObjectKeyInput & {
  body: Buffer;
  contentType?: string | null;
  expiresInSeconds?: number;
}): Promise<B2UploadResult> {
  const config = getB2Config();
  const client = getB2Client();
  const key = buildObjectKey({ projectId, trackId, versionId, filename });

  const putResult = await client.send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      Body: body,
      ContentType: contentType ?? undefined,
    })
  );

  const signedUrl = await getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    }),
    { expiresIn: expiresInSeconds }
  );

  return {
    key,
    url: signedUrl,
    expiresAt: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
    bucketId: config.bucketId,
    bucketName: config.bucketName,
    etag: putResult.ETag ?? null,
  };
}

export async function getB2SignedUrl({
  key,
  expiresInSeconds = 3600,
}: {
  key: string;
  expiresInSeconds?: number;
}): Promise<B2SignedUrlResult> {
  const config = getB2Config();
  const client = getB2Client();

  const url = await getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    }),
    { expiresIn: expiresInSeconds }
  );

  return {
    url,
    expiresAt: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
  };
}
