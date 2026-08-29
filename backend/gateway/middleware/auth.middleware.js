import redis from "../../shared/redis/redis.js"

const protect = async (req, res, next) => {
    try {
        const sessionId = req.cookies?.session
        if (!sessionId) {
            return res.status(401).json({ message: "unauthorized" })
        }
        
        const session = await redis.get(`session-${sessionId}`)
        console.log("session:", session)
        
        if (!session) {
            return res.status(401).json({ message: "session expired" })
        }
        
        // Upstash auto-parses JSON, so we check if it's already an object
        req.user = typeof session === "string" ? JSON.parse(session) : session
        
        next()
        
    } catch (error) {
        return res.status(500).json({ message: `protect error ${error}` })
    }
}

export default protect