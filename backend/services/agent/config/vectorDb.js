import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { embeddings } from "./embeddings.js";
import { supabase } from "./supabase.js"; 

export const vectorStore = async (docs, collectionName) => {
    const formattedDocs = docs.map(doc => ({
        ...doc,
        metadata: { ...doc.metadata, collection: collectionName }
    }));

    const store = new SupabaseVectorStore(embeddings, {
        client: supabase,
        tableName: "documents",
        queryName: "match_documents",
    });

    await store.addDocuments(formattedDocs);
    return store;
};