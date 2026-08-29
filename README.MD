⚡ VIDYUTServerless Multi-Agent AI Ecosystem & Orchestration PlatformVidyut is a highly scalable, microservices-based AI platform that intelligently routes user intents to specialized autonomous agents. By combining LangGraph orchestration with a modern serverless infrastructure, Vidyut handles everything from RAG-powered document analysis and code generation to real-time web search and multimedia creation (PDFs/PPTs/Images), all backed by a robust credit-based billing engine.Table of ContentsOverviewProblem StatementSolution WorkflowArchitectureEngineering Challenges OvercomeCore FeaturesTech StackAPI ReferenceInstallation & SetupProject StructureFuture RoadmapContributingOverviewVidyut operates on a sophisticated Router-Agent architecture. Instead of relying on a single, easily confused monolithic LLM, Vidyut uses a high-speed routing model to analyze user prompts and delegate them to expert agents (Chat, Search, Coding, Vision, PDF, PPT).The platform recently underwent a major architectural migration to a fully serverless backend—swapping heavy AWS, Qdrant, and Docker setups for lightweight Supabase (Storage & pgvector) and Upstash (Serverless Redis), all tied together by a shared MongoDB database for user and conversation states.Problem StatementChallengeDetailsMonolithic AI LimitationsSingle LLMs struggle to handle diverse tasks (e.g., coding, drawing, searching) simultaneously without hallucinating or losing context.Infrastructure BloatMaintaining Dockerized Redis clusters and AWS S3 buckets created unnecessary DevOps overhead and scaled poorly during traffic spikes.Memory & State ManagementKeeping multi-turn conversations coherent across different specialized agents requires high-speed, synchronized caching.Monetization ComplexityGranular billing is required since different AI tasks (e.g., generating an image vs. simple chat) consume vastly different compute costs.Solution WorkflowPlaintextUser Submits Prompt & Optional File (Image/PDF)
         ↓
API Gateway (Authenticates via Upstash Redis Session)
         ↓
LangGraph Orchestrator (Router Agent)
         ├─→ Detects "Build a React App"   → Coding Agent (OpenRouter/DeepSeek)
         ├─→ Detects "Analyze this chart"  → Vision Agent (Gemini 2.5 Flash)
         ├─→ Detects "Search latest news"  → Search Agent (Tavily)
         └─→ Detects "Summarize this PDF"  → RAG Agent (Supabase pgvector)
         ↓
Execution & Artifact Generation (Code files, PDFs, PPTs, Images saved to Supabase)
         ↓
Billing Service (Deducts specific agent credits via MongoDB)
         ↓
Chat Service (Saves structured conversation to MongoDB)
         ↓
Response & Artifacts Delivered to User UI
ArchitectureVidyut is built on a decoupled microservices architecture, secured behind a centralized API Gateway.Plaintext┌─────────────────────────────────────────────────────┐
│             Frontend (React 19 + Vite 8)            │
│  - Multi-Agent Chat UI, Code Viewer, PPT/PDF Viewer │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP / REST via API Gateway
                   ↓
┌─────────────────────────────────────────────────────┐
│              Microservices (Node.js)                │
│  1. Auth Service    (Firebase Admin, User Mgmt)     │
│  2. Chat Service    (Conversation & Message state)  │
│  3. Billing Service (Razorpay, Credit allocation)   │
│  4. Agent Service   (LangGraph Orchestration)       │
└──────────┬──────────────────────────┬───────────────┘
           │                          │
           ↓                          ↓
  ┌─────────────────┐        ┌──────────────────┐
  │   Serverless    │        │   AI Providers   │
  │   Cache & DB    │        │                  │
  │ - Upstash Redis │        │ - Groq (Router)  │
  │ - Supabase      │        │ - OpenRouter     │
  │ - MongoDB Atlas │        │ - Gemini         │
  └─────────────────┘        └──────────────────┘
Engineering Challenges Overcome1. Serverless State Management (Upstash Migration)Problem: Traditional ioredis with Docker required persistent TCP connections, which crashed during serverless cold starts or high concurrent loads.Solution: Migrated to Upstash Serverless Redis, utilizing its REST API to handle session management, agent rate-limiting, and short-term conversation memory without connection pooling issues.2. Multi-Agent OrchestrationProblem: Hardcoding if/else logic to decide which AI model should handle a user's request is brittle and unscalable.Solution: Implemented LangGraph. A high-speed Groq model acts as the "Router Node," dynamically classifying the intent and pushing the state (prompt, files, conversation ID) to specific Agent Nodes.3. Unified Vector & Blob Storage (Supabase)Problem: Maintaining AWS S3 for files and a separate Qdrant instance for vector embeddings fragmented the data layer.Solution: Consolidated all storage to Supabase. User-generated PDFs, PPTs, and images are stored in Supabase Storage buckets, while the RAG (Retrieval-Augmented Generation) agent uses LangChain's Supabase integration to chunk and query document embeddings via pgvector.Core FeaturesDynamic Agent Routing — Automatically selects the best model for the job (e.g., DeepSeek for code, Gemini for vision).Rich Artifact Generation — Native agents can compile structured JSON into downloadable .pdf and .pptx files, or generate projects with multiple code files.RAG-Powered Document Analysis — Upload PDFs, instantly vectorize them, and chat with your documents.Granular Credit Economy — Razorpay integration with a cost-weighted deduction system (e.g., Chat = 1 credit, Vision = 10 credits).Cross-Service Authentication — Seamless, secure communication between microservices using HTTP proxying and shared MongoDB schemas.Tech StackBackend & InfrastructureTechnologyPurposeNode.js + Express 5Core API server framework & API GatewayLangGraph & LangChainMulti-agent state orchestration and tool bindingMongoDB AtlasShared primary database for Users, Chats, and PaymentsSupabaseCloud storage (Blobs) and Vector Database (pgvector)Upstash RedisServerless caching, rate limiting, and session managementAI ProvidersGroq (Fast routing), OpenRouter (Coding), Gemini (Vision), Tavily (Search)RazorpayPayment gateway for credit packagesFrontendTechnologyPurposeReact 19 + Vite 8High-performance UI frameworkTailwind CSS 4Utility-first stylingLucide ReactClean, consistent iconographyXLSXBrowser-side Excel generation (if applicable)API ReferenceAll requests pass through the API Gateway (port configured in .env), which securely proxies them to the underlying services.Agent Service — /api/agentMethodEndpointDescriptionPOST/chatAccepts prompt, agent (optional), and file. Triggers LangGraph workflow.Auth Service — /api/authMethodEndpointDescriptionPOST/loginVerifies Firebase token, creates user, issues Upstash session.POST/deduct-creditsInternal endpoint: Deducts weighted credits based on the agent used.Chat Service — /api/chatMethodEndpointDescriptionGET/create-conversationInitializes a new chat session in MongoDB.GET/get-messages/:idRetrieves structured message history and artifacts.Billing Service — /api/billingMethodEndpointDescriptionPOST/createGenerates a Razorpay order based on selected tier.POST/verifyVerifies HMAC signature and upgrades user plan.Installation & SetupPrerequisitesNode.js v18+MongoDB Atlas URISupabase Project (Storage + Database)Upstash Redis REST URL/TokenAPI Keys: Groq, OpenRouter, Google Gemini, Tavily, RazorpayBackend SetupClone the repositoryBashgit clone https://github.com/yourusername/vidyut-ai.git
cd vidyut-ai/backend
Configure Environment VariablesEnsure all microservices (auth, agent, chat, billing, gateway) share the exact same MONGODB_URI (e.g., ...mongodb.net/vidyut?retryWrites...) so collections populate correctly.Install Dependencies & RunNavigate to each microservice folder and install dependencies:Bashcd services/gateway && npm install && npm run dev
# Repeat for auth, chat, billing, and agent
Frontend SetupBashcd ../frontend
npm install
npm run dev
Project StructurePlaintextVIDYUT/
├── backend/
│   ├── gateway/                 # API Gateway & Auth Middleware
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── utils/
│   ├── services/
│   │   ├── agent/               # LangGraph Orchestrator & AI Logic
│   │   │   ├── agents/          # chat, coding, pdfRag, vision, ppt...
│   │   │   ├── config/          # LLM, VectorDB, Supabase, Upstash configs
│   │   │   ├── graph/           # LangGraph state & routing logic
│   │   │   └── utils/           # PDF/PPT generation, S3 uploads
│   │   ├── auth/                # Firebase + User Management
│   │   ├── billing/             # Razorpay Integration
│   │   └── chat/                # MongoDB Conversation Storage
│   └── shared/                  # Shared utilities
├── frontend/                    # React 19 + Vite + Tailwind
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── context/
└── README.md
Future RoadmapTargetPlanVoice AgentsIntegrate real-time WebRTC audio models for seamless voice conversations with agents.Custom Agent BuilderAllow users to define their own custom LangChain tools and prompts via the UI.Advanced MemoryImplement a semantic memory layer (Graph RAG) so Vidyut remembers user preferences across different conversation IDs.ContributingBash# 1. Create a feature branch
git checkout -b feature/new-ai-agent

# 2. Commit your changes
git commit -m "feat: added external API integration to agent graph"

# 3. Push and open a Pull Request
git push origin feature/new-ai-agent