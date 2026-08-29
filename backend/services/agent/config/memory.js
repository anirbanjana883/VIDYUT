import redis from "../../../shared/redis/redis.js"
import { getMessages } from "../utils/getMessages.js"

export const getMemory = async (conversationId) => {
    const key = `messages-${conversationId}`
    const cached = await redis.get(key)
    
    if (cached) {
        // Upstash auto-parses JSON, so we handle both string and object cases
        return typeof cached === "string" ? JSON.parse(cached) : cached
    }
    
    const messages = await getMessages(conversationId)
    
    // Upstash requires the expiration to be an options object
    await redis.set(key, JSON.stringify(messages), { ex: 24 * 60 * 60 })
    
    return messages
}

export const addMessage = async (conversationId, role, content) => {
     const key = `messages-${conversationId}`
     const rawMessages = await redis.get(key)
     
     // Handle Upstash JSON auto-parsing
     const messages = rawMessages 
        ? (typeof rawMessages === "string" ? JSON.parse(rawMessages) : rawMessages) 
        : []
        
     messages.push({
        role, content
     })

     if (messages.length > 20) {
        messages.shift()
     }

     await redis.set(key, JSON.stringify(messages))
}