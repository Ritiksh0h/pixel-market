import { createClient } from "@supabase/supabase-js";

// Client-side Supabase (public anon key — safe for browser)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server-side Supabase (service role — NEVER expose to client)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Storage bucket names
export const BUCKETS = {
  PHOTOS: "photos",
  THUMBNAILS: "thumbnails",
  WATERMARKED: "watermarked",
  AVATARS: "avatars",
  COVERS: "covers",
} as const;

/**
 * Upload a file to Supabase Storage and return its public URL.
 * Uses service role to bypass RLS.
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: Buffer | Blob,
  contentType: string
): Promise<string> {
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, file, {
      contentType,
      upsert: true,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);

  return publicUrl;
}

export async function deleteFile(
  bucket: string,
  path: string
): Promise<void> {
  const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}
