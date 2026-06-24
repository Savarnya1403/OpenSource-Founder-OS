# OpenFounder OS

> **AI Cofounder & Startup Ecosystem Intelligence Platform for Indian Founders**
> Open source · Powered by Claude AI · India-first

---

## What is it?

OpenFounder OS is a multi-agent AI platform that acts as your cofounder:

- **AI Cofounder Chat** — Strategy, validation, hiring, GTM, unit economics — backed by Claude
- **Government Scheme Matcher** — 33 central + state schemes (DPIIT, SIDBI, BIRAC, MeitY, DST, NABARD…) matched to your startup profile
- **Market Researcher** — TAM/SAM/SOM, competitor maps, India-specific industry data
- **Pitch Coach** — Investor-ready decks, VC landscape, term sheet basics, Indian fundraising

**Architecture:** FastAPI + LangGraph (multi-agent) + OmniRAG (Qdrant + Neo4j hybrid search) + Next.js

---

## Quick Start (Local Dev — no databases needed)

### 1. Backend

```bash
cd backend
cp .env.example .env

# Add your Anthropic API key (required for AI chat):
echo 'ANTHROPIC_API_KEY=sk-ant-...' >> .env

python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

uvicorn app.main:app --reload
# → http://localhost:8000
# → Swagger UI: http://localhost:8000/docs
```

**Default mode:** `USE_MOCK_RAG=true` — no Qdrant or Neo4j needed. The 33 schemes run in-memory.

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install --legacy-peer-deps
npm run dev
# → http://localhost:3000
```

---

## AI Agents

| Agent | Triggered by | Does |
|-------|-------------|------|
| 🧠 **Mentor** | Strategy, product, team, growth questions | AI cofounder guidance with Indian startup context |
| 🏛️ **Schemes** | "What grants?", "find funding" | RAG-powered scheme matching from 33 Indian govt schemes |
| 🔍 **Researcher** | Market size, competitors, trends | India-focused market intelligence |
| 🎯 **Pitch Coach** | Pitch deck, fundraising, valuation | Investor-ready pitch guidance, Indian VC landscape |

The **Supervisor** agent automatically routes each message to the right specialist.

---

## Government Schemes Covered (33 total)

| Ministry | Key Schemes |
|----------|------------|
| DPIIT | Startup India Recognition, Seed Fund (SISFS), Fund of Funds, CGSS |
| DST | NIDHI PRAYAS, NIDHI SSS, ANRF Grants, TDB |
| BIRAC/DBT | BIG Grant, SPARSH, PACE |
| MeitY | TIDE 2.0, MeitY Startup Hub (MSH) |
| NITI Aayog | Atal Incubation Centres, ANIC, WEP |
| SIDBI | SMILE, India Aspiration Fund |
| MSME | CGTMSE, NSIC, Cluster Development |
| Finance | PMMY (MUDRA), Stand-Up India |
| NABARD | Rural Innovation Fund, ABIF |
| State Schemes | NSRCEL IIMB, CIIE IIMA, T-Hub, Kerala Startup Mission, Karnataka ELEVATE 100 |

---

## API Reference

```
GET  /health                     Server health + config status
POST /api/auth/register          Create account
POST /api/auth/login             Sign in → JWT token
GET  /api/auth/me                Current user profile
PATCH /api/auth/me               Update startup profile

POST /api/chat/stream            Streaming SSE chat (recommended)
POST /api/chat/message           Non-streaming chat

GET  /api/schemes                List schemes (search, sector, stage, ministry filters)
GET  /api/schemes/meta           All filter options (ministries, sectors, tags)
GET  /api/schemes/{id}           Single scheme detail
POST /api/schemes/match          Match schemes to your startup profile
GET  /api/schemes/search/{q}     Semantic search
```

Full docs: http://localhost:8000/docs

---

## Connecting Real Databases (Optional)

### Qdrant (Vector Search)
```bash
docker run -p 6333:6333 qdrant/qdrant
# In .env: USE_MOCK_RAG=false, QDRANT_URL=http://localhost:6333
```

### Neo4j (Knowledge Graph)
```bash
docker run -p 7474:7474 -p 7687:7687 -e NEO4J_AUTH=neo4j/openfounder neo4j:5
# In .env: NEO4J_URI=bolt://localhost:7687, NEO4J_USER=neo4j, NEO4J_PASSWORD=openfounder
```

### Full Docker Compose
```bash
cp backend/.env.example backend/.env  # Add ANTHROPIC_API_KEY
docker compose up
```

---

## Environment Variables

| Variable | Default | Notes |
|----------|---------|-------|
| `ANTHROPIC_API_KEY` | — | **Required** for AI chat. Get at console.anthropic.com |
| `CLAUDE_MODEL` | `claude-sonnet-4-6` | Model for all agents |
| `USE_MOCK_RAG` | `true` | `false` to use real Qdrant + Neo4j |
| `SECRET_KEY` | dev value | Change in production |
| `DATABASE_URL` | SQLite | No setup needed for dev |

---

## References

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [NexusAI Pattern](https://github.com/ALucek/nexus-ai) — Multi-agent with FastAPI, LangGraph, Neo4j, Qdrant
- [OmniRAG Pattern](https://github.com/ALucek/omnirag) — Hybrid search with Qdrant + Neo4j
- [Startup India](https://www.startupindia.gov.in)

---

**Built for Indian founders. Open source. Powered by [Claude AI](https://anthropic.com).**
