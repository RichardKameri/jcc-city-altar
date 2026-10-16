import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before setting up image storage");
}

const bucketName = process.env.SUPABASE_PROFILE_IMAGE_BUCKET || "feedback-profile-images";
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: buckets, error: listError } = await supabase.storage.listBuckets();
if (listError) throw listError;

const existingBucket = buckets.find((bucket) => bucket.name === bucketName);
if (existingBucket) {
  if (existingBucket.public) {
    throw new Error(`Supabase bucket "${bucketName}" exists but is public; make it private before continuing`);
  }
  const { error } = await supabase.storage.updateBucket(bucketName, {
    public: false,
    fileSizeLimit: "2097152",
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  });
  if (error) throw error;
  console.info(`Verified private Supabase bucket "${bucketName}" settings`);
} else {
  const { error } = await supabase.storage.createBucket(bucketName, {
    public: false,
    fileSizeLimit: "2097152",
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  });
  if (error) throw error;
  console.info(`Created private Supabase bucket "${bucketName}"`);
}