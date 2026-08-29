# ⚡ VIDYUT AI

**Serverless Multi-Agent Ecosystem & Orchestration Platform**

Vidyut is a highly scalable, decoupled microservices AI platform that intelligently routes user intents to a fleet of specialized autonomous agents. By combining LangGraph stateful orchestration with a modern Serverless infrastructure (Upstash Redis, Supabase, MongoDB Atlas), Vidyut delivers complex AI capabilities—from RAG-powered document analysis and autonomous coding to real-time web search and multimedia generation.

## 🏛️ System Architecture

The Vidyut backend is split into 5 decoupled Node.js microservices communicating securely via an Express API Gateway. State and sessions are managed entirely serverless using Upstash, while persistent data is stored in a unified MongoDB Atlas cluster.

```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (React 19 + Vite)                │
│       (Redux State, Monaco Editor, Markdown Rendering)      │
└──────────────────────────────┬──────────────────────────────┘
                               │ (HTTP / Upstash Session Cookies)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 API Gateway (Port 8000)                     │
│  - auth.middleware.js (Validates Redis Session)             │
│  - proxyWithHeader.js (Injects x-user-id to microservices)  │
└──────┬───────────────┬───────────────┬───────────────┬──────┘
       │               │               │               │
       ▼               ▼               ▼               ▼
┌────────────┐  ┌────────────┐  ┌────────────┐  ┌─────────────┐
│ Auth (8002)│  │ Chat (8003)│  │Billing(8004│  │ Agent (8001)│
│- Firebase  │  │- MongoDB   │  │- Razorpay  │  │- LangGraph  │
│- MongoDB   │  │- Messages  │  │- Webhooks  │  │- AI Models  │
└──────┬─────┘  └──────┬─────┘  └──────┬─────┘  └──────┬──────┘
       │               │               │               │
       └───────────────┴───────┬───────┴───────────────┘
                               ▼
            ┌───────────────────────────────────┐
            │       Unified Data Layer          │
            │ - MongoDB Atlas (Persistent Data) │
            │ - Upstash Redis (Cache/Sessions)  │
            │ - Supabase (Blobs & VectorDB)     │
            └───────────────────────────────────┘
```

## 🧠 The AI Engine: LangGraph Orchestration

The core intelligence of Vidyut lives in the Agent Service. Instead of relying on a monolithic LLM that easily hallucinates, Vidyut uses a Directed Acyclic Graph (DAG) via LangGraph to manage state and route tasks to specialized models.

### Execution Flow Diagram

```
[ User Prompt + Uploaded Files (PDF/Image) ]
                      │
                      ▼
            ┌───────────────────┐
            │   Router Node     │ ──(Groq / LLaMA-3)
            │  (Intent Parsing) │ ──(Analyzes text + file types)
            └─────────┬─────────┘
                      │
   ┌────────────┬─────┴──────┬────────────┬────────────┐
   ▼            ▼            ▼            ▼            ▼
[Coding]     [Vision]      [RAG]       [Search]      [Chat]
 Agent        Agent        Agent        Agent        Agent
 (DeepSeek)   (Gemini)    (pgvector)   (Tavily)      (Groq)
   │            │            │            │            │
   └────────────┴─────┬──────┴────────────┴────────────┘
                      ▼
           ┌──────────────────────┐
           │  Artifact Generator  │
           │ (PDF, PPTX, Code UI) │
           └──────────────────────┘
```

### Deep Dive: Agent Service Mechanics

**State Management (`graph/state.js`)**
Every request initializes a LangGraph state object containing `{ prompt, file_urls, conversation_history, current_agent }`. This state context is passed seamlessly between nodes, ensuring the AI never loses track of a multi-turn conversation.

**The Router Node (`graph/router.js`)**
An ultra-fast, low-latency LLM (via Groq) acts as the orchestration brain. It reads the user prompt, evaluates attached files, and outputs a structured JSON routing decision to determine the exact agent node to execute next.

**The Agent Fleet (`agents/`)**
- `coding.agent.js`: Connects to OpenRouter (DeepSeek) for deep reasoning. Outputs are formatted specifically to inject into the frontend Monaco editor.
- `vision.agent.js`: Uses Gemini 2.5 Flash for multimodal processing. Analyzes charts, reads handwriting, and extracts data from Supabase-hosted image URLs.
- `pdfRag.agent.js`: Vectorizes uploaded documents via Google Embeddings, stores them in Supabase pgvector, and performs cosine-similarity searches to answer questions directly from the document.
- `search.agent.js`: Binds the Tavily Search API as a tool to fetch real-time internet data, entirely eliminating knowledge-cutoff hallucinations.
- `ppt.agent.js` & `pdf.agent.js`: Compiles structured JSON outputs from the LLMs into highly formatted, downloadable .pptx or .pdf files.

**Credit Economy (`utils/deductCredits.js`)**
Before the graph executes, the system checks the requested agent's computational weight (e.g., standard chat = 1 credit; Vision/Coding = 10 credits) and dynamically deducts it from the user's MongoDB balance via an internal API call to the Auth service.

## ⚙️ Backend Microservices Detail

- **API Gateway (`gateway/`)**: The single entry point. It intercepts requests, checks the session cookie against Upstash Redis, parsing the authenticated userId. It uses express-http-proxy and a custom proxyWithHeader utility to securely forward requests to internal microservices without exposing them to the internet.
- **Auth Service (`services/auth/`)**: Validates Google OAuth tokens via Firebase Admin. Upserts the user into MongoDB, generates a UUID session token, and caches it in Upstash Redis with a strict TTL.
- **Chat Service (`services/chat/`)**: Purely handles high-speed CRUD operations for the Conversation and Message arrays, keeping state history isolated from heavy AI processing.
- **Billing Service (`services/billing/`)**: Integrates Razorpay. Validates HMAC signatures via webhooks to prevent spoofing, and securely updates user tier and credit limits based on config/Plans.js.

## 💻 Tech Stack Overview

### Backend Infrastructure

| Component | Technology | Purpose |
|---|---|---|
| Routing / Core | Node.js, Express 5 | API Gateway, Microservice Framework |
| Orchestration | LangGraph, LangChain | Multi-Agent State and Tool Binding |
| Database | MongoDB Atlas | Persistent storage for Users, Chats, Payments |
| Cache / Sessions | Upstash Redis | Serverless REST-based caching & auth state |
| Blob / Vector DB | Supabase | File Storage + pgvector for RAG embeddings |
| AI Providers | Groq, OpenRouter, Gemini | LLM APIs for specialized execution |

### Frontend (Lightweight UI)

- **Framework:** React 19 + Vite
- **Styling & Animation:** Tailwind CSS v4, Framer Motion, Lucide React
- **State Management:** Redux Toolkit (userSlice, messageSlice)
- **Key Components:** Monaco Editor (@monaco-editor/react) for live code rendering, Markdown parser (react-markdown, remark-gfm) for structured AI responses.

## 📂 Complete Folder Structure

```
VIDYUT/
├── .gitignore
├── README.md
├── backend/
│   ├── .gitignore
│   ├── package.json (Concurrently runner)
│   ├── gateway/
│   │   ├── controllers/user.controller.js
│   │   ├── middleware/auth.middleware.js
│   │   ├── utils/proxyWithHeader.js
│   │   ├── index.js
│   │   └── package.json
│   ├── shared/
│   │   └── redis/redis.js
│   └── services/
│       ├── agent/
│       │   ├── agents/
│       │   │   ├── chat.agent.js
│       │   │   ├── coding.agent.js
│       │   │   ├── imageAnalyzer.agent.js
│       │   │   ├── pdf.agent.js
│       │   │   ├── pdfRag.agent.js
│       │   │   ├── ppt.agent.js
│       │   │   ├── search.agent.js
│       │   │   └── vision.agent.js
│       │   ├── config/
│       │   │   ├── agentLimit.js
│       │   │   ├── db.js
│       │   │   ├── embeddings.js
│       │   │   ├── llmModels.js
│       │   │   ├── memory.js
│       │   │   ├── multer.js
│       │   │   ├── supabase.js
│       │   │   ├── tavily.js
│       │   │   └── vectorDb.js
│       │   ├── controllers/agent.controller.js
│       │   ├── graph/
│       │   │   ├── graph.js
│       │   │   ├── router.js
│       │   │   └── state.js
│       │   ├── routes/agent.route.js
│       │   ├── temp/ (Generated files)
│       │   ├── utils/
│       │   │   ├── deductCredits.js
│       │   │   ├── generatePdf.js
│       │   │   ├── generatePpt.js
│       │   │   ├── getFromS3.js
│       │   │   ├── getMessages.js
│       │   │   └── uploadToS3.js
│       │   ├── index.js
│       │   └── package.json
│       ├── auth/
│       │   ├── config/db.js
│       │   ├── config/firebase.js
│       │   ├── controllers/auth.controller.js
│       │   ├── models/user.model.js
│       │   ├── routes/auth.route.js
│       │   ├── index.js
│       │   └── package.json
│       ├── billing/
│       │   ├── config/Plans.js
│       │   ├── config/db.js
│       │   ├── config/razorpay.js
│       │   ├── controllers/billing.controller.js
│       │   ├── models/payment.model.js
│       │   ├── routes/billing.route.js
│       │   ├── index.js
│       │   └── package.json
│       └── chat/
│           ├── config/db.js
│           ├── controllers/chat.controller.js
│           ├── models/coversation.model.js
│           ├── models/message.model.js
│           ├── routes/chat.routes.js
│           ├── index.js
│           └── package.json
└── frontend/
    ├── .gitignore
    ├── README.md
    ├── eslint.config.js
    ├── index.html
    ├── package-lock.json
    ├── package.json
    ├── vite.config.js
    ├── public/
    │   ├── favicon.svg
    │   └── icons.svg
    ├── utils/
    │   ├── axios.js
    │   └── firebase.js
    └── src/
        ├── App.jsx
        ├── index.css
        ├── main.jsx
        ├── assets/
        │   ├── hero.png
        │   ├── react.svg
        │   └── vite.svg
        ├── components/
        │   ├── Artifact.jsx
        │   ├── BillingDrawer.jsx
        │   ├── ChatArea.jsx
        │   ├── ChatInput.jsx
        │   ├── LoadingAnimation.jsx
        │   ├── MessageBubble.jsx
        │   ├── MessageList.jsx
        │   ├── Nav.jsx
        │   └── SideBar.jsx
        ├── features/
        │   ├── createConversation.js
        │   ├── createOrder.js
        │   ├── getConversations.js
        │   ├── getCurrentUser.js
        │   ├── getMessages.js
        │   ├── logOut.js
        │   ├── sendMessage.js
        │   ├── updateConversation.js
        │   └── verifyPayment.js
        ├── pages/
        │   └── Home.jsx
        └── redux/
            ├── conversationSlice.js
            ├── messageSlice.js
            ├── store.js
            └── userSlice.js
```

## 🚀 Installation & Local Development

### 1. Environment Setup

Create a .env file in the root of every backend microservice (gateway, auth, chat, billing, agent) and the frontend root.

Important: All backend services must share the identical MONGODB_URI string to allow shared collection schemas.

### 2. Bootstrapping the Ecosystem

A root-level concurrently script is configured to spin up the entire microservice architecture simultaneously with color-coded logging.

```bash
# 1. Install dependencies across the root backend
cd backend
npm install

# 2. Boot the API Gateway and all 4 microservices
npm run dev
```

### 3. Start the Frontend

In a separate terminal window:

```bash
cd frontend
npm install
npm run dev
```