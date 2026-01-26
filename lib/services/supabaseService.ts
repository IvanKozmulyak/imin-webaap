import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';

const supabaseProjectRef = process.env.SUPABASE_PROJECT_REF || '';
const supabaseRegion = process.env.SUPABASE_REGION || 'us-east-1';
const supabaseAccessKeyId = process.env.SUPABASE_ACCESS_KEY_ID || '';
const supabaseSecretAccessKey = process.env.SUPABASE_SECRET_ACCESS_KEY || '';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseProjectRef || !supabaseAccessKeyId || !supabaseSecretAccessKey) {
  console.warn('Supabase S3 environment variables are not set. Image upload/retrieval will not work.');
}

const s3Client = supabaseProjectRef && supabaseAccessKeyId && supabaseSecretAccessKey
  ? new S3Client({
      forcePathStyle: true,
      region: supabaseRegion,
      endpoint: `https://${supabaseProjectRef}.storage.supabase.co/storage/v1/s3`,
      credentials: {
        accessKeyId: supabaseAccessKeyId,
        secretAccessKey: supabaseSecretAccessKey,
      },
    })
  : null;

// Create Supabase client for generating public URLs
const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const BUCKET_NAME = 'event-images';

/**
 * Upload an image to Supabase Storage via S3 API
 * @param file - File object to upload
 * @param fileName - Name for the file (will be prefixed with timestamp)
 * @returns Public URL of the uploaded image
 */
export async function uploadEventImage(file: File, fileName: string): Promise<string> {
  if (!s3Client) {
    throw new Error('Supabase S3 is not configured. Please set SUPABASE_PROJECT_REF, SUPABASE_REGION, SUPABASE_ACCESS_KEY_ID, and SUPABASE_SECRET_ACCESS_KEY environment variables.');
  }

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set. This is required to generate public URLs.');
  }

  const timestamp = Date.now();
  const fileExt = fileName.split('.').pop() || 'jpg';
  const filePath = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const key = `${BUCKET_NAME}/${filePath}`;

  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filePath,
      Body: buffer,
      ContentType: file.type || 'image/jpeg',
      CacheControl: '3600',
    });

    await s3Client.send(command);

    // Generate public URL using Supabase client's getPublicUrl method
    // This ensures the correct URL format
    if (!supabase) {
      throw new Error('Supabase client is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
    }

    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete an image from Supabase Storage via S3 API
 * @param imageUrl - Full URL of the image to delete
 */
export async function deleteEventImage(imageUrl: string): Promise<void> {
  if (!s3Client) {
    throw new Error('Supabase S3 is not configured.');
  }

  // Extract the file path from the URL
  // URL format: https://{project_ref}.supabase.co/storage/v1/object/public/{bucket}/{path}
  const urlParts = imageUrl.split('/');
  const bucketIndex = urlParts.indexOf('public');
  if (bucketIndex === -1 || bucketIndex >= urlParts.length - 1) {
    throw new Error('Invalid image URL format');
  }

  const bucketName = urlParts[bucketIndex + 1];
  const filePath = urlParts.slice(bucketIndex + 2).join('/');

  if (bucketName !== BUCKET_NAME) {
    throw new Error(`Invalid bucket name: ${bucketName}`);
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filePath,
    });

    await s3Client.send(command);
  } catch (error) {
    throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get a public URL for an image
 * @param imagePath - Path to the image in storage (relative to bucket)
 * @returns Public URL
 */
export function getImageUrl(imagePath: string): string {
  if (!supabase) {
    return imagePath; // Return as-is if Supabase not configured
  }

  // Remove bucket name from path if present
  const cleanPath = imagePath.startsWith(`${BUCKET_NAME}/`) 
    ? imagePath.substring(BUCKET_NAME.length + 1)
    : imagePath;

  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(cleanPath);

  return data.publicUrl;
}

/**
 * Check if an image exists in storage
 * @param imagePath - Path to the image in storage
 * @returns True if image exists, false otherwise
 */
export async function imageExists(imagePath: string): Promise<boolean> {
  if (!s3Client) {
    return false;
  }

  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: imagePath,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    return false;
  }
}
