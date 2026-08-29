import { supabase } from "../config/supabase.js";

export const getFromS3 = async (filename, expiresIn = 600) => {
    const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET_NAME)
        .createSignedUrl(filename, expiresIn);

    if (error) throw new Error(`URL Error: ${error.message}`);
    return data.signedUrl;
};