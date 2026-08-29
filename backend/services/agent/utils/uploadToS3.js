import { supabase } from "../config/supabase.js";

export const uploadToS3 = async (filename, buffer, contentType) => {
    const { error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET_NAME)
        .upload(filename, buffer, {
            contentType: contentType,
            upsert: true
        });

    if (error) throw new Error(`Upload Error: ${error.message}`);
    return filename;
};