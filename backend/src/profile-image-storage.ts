import { createClient } from "@supabase/supabase-js";

export type ProfileImageStorage = {
  upload(path: string, bytes: Uint8Array, contentType: string, upsert?: boolean): Promise<void>;
  download(path: string): Promise<Uint8Array>;
  remove(path: string): Promise<void>;
};

export function createProfileImageStorage(env = process.env): ProfileImageStorage | undefined {
  const supabaseUrl = env.SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl && !serviceRoleKey) return undefined;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must both be configured");
  }

  const bucket = env.SUPABASE_PROFILE_IMAGE_BUCKET || "feedback-profile-images";
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const storage = supabase.storage.from(bucket);

  return {
    async upload(path, bytes, contentType, upsert = false) {
      const { error } = await storage.upload(path, bytes, { contentType, upsert });
      if (error) throw error;
    },
    async download(path) {
      const { data, error } = await storage.download(path);
      if (error) throw error;
      return new Uint8Array(await data.arrayBuffer());
    },
    async remove(path) {
      const { error } = await storage.remove([path]);
      if (error) throw error;
    },
  };
}