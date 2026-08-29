import axios from "axios"
import { graph } from "../graph/graph.js"
import { addMessage } from "../config/memory.js"

export const agent = async (req, res, next) => {
    try {
        const { prompt, conversationId, agent } = req.body
        const file = req.file
        console.log("file", file)
        
        const userId = req.headers["x-user-id"]
        
        // Save user message to MongoDB via Chat Service
        await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
            conversationId, role: "user", content: prompt
        })
        
        // Invoke LangGraph workflow
        const result = await graph.invoke({
            prompt, conversationId, agent, userId, file
        })
        console.log("result", result)
        
        // Save to Upstash Redis cache
        await addMessage(conversationId, "user", prompt)
        await addMessage(conversationId, "assistant", result.aiResponse)
        
        // Save AI response to MongoDB via Chat Service
        await axios.post(`${process.env.CHAT_SERVICE}/save-message`, {
            conversationId, 
            role: "assistant", 
            content: result?.aiResponse, 
            images: result?.images, 
            artifacts: result?.artifacts
        })
        
        return res.status(200).json({
            answer: result?.aiResponse,
            images: result?.images,
            artifacts: result?.artifacts
        })
        
    } catch (error) {
        // If an error happens and a file was uploaded, we should probably clean it up
        if (req.file) {
            import('fs').then(fs => fs.unlink(req.file.path, () => {})).catch(() => {});
        }
        next(error)
    }
}