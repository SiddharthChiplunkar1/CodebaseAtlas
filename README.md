# Codebase Atlas

**The interactive, AI-powered map your codebase never had.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://github.com/SiddharthChiplunkar1/CodebaseAtlas)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.0-6DB33F?logo=spring)](https://spring.io/projects/spring-boot)
[![gRPC](https://img.shields.io/badge/gRPC-Ready-00A6D6?logo=google)](https://grpc.io/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python)](https://python.org)
[![pgvector](https://img.shields.io/badge/pgvector-Ready-336791?logo=postgresql)](https://postgresql.org)

---

## What is Codebase Atlas?

Navigating a massive legacy codebase or onboarding onto a new project can feel like stumbling through the dark. 

**Codebase Atlas** solves this by automatically parsing any GitHub repository into a highly interactive, beautifully rendered **dependency graph**. Powered by `tree-sitter` for precise AST extraction and `pgvector` for semantic AI embeddings, Atlas doesn't just show you code—it helps you understand it.

### Key Features

- **Deep AST Extraction**: Automatically parses Python and TypeScript codebases to extract Classes, Functions, Routes, and Tests.
- **Organic Architecture Graph**: Atlas uses `d3-force` to render an interactive, physics-based network graph of your entire application's dependencies.
- **Intelligent Dependency Tracing**: Click any class or service to instantly visualize its blast radius—highlighting direct callers, indirect dependencies, and affected routes.
- **Ask Atlas (Coming Soon)**: A built-in LLM chat that answers architectural questions perfectly grounded in the exact nodes and services you've selected on the graph.
- **Real-time GitHub Sync**: Just paste a repo URL and let the background worker clone, parse, and embed the codebase instantly.

---

## Architecture

Codebase Atlas is built using a modern microservice architecture, communicating via highly efficient **gRPC protocols**.

![Architecture Diagram](https://mermaid.ink/img/pako:eNptkctuwjAQRX8lzTqVCiQWKBSFblA1W3aIuKjKxhM8NnZkO0FUiH_vOA-Ubtgz174z967G-UYZpMh3UoX5aBRL6zZ80m-oEa8oU6sF7a53vGfFjL0ZcK69wV72FqHlWkE_dILfH07gU-98uP4q4Fh5j73j6J-D0Tf4tH4Jv_cO_j6a8mE8fQ7_xS37z179-847-Pd8Xz4_R_8-_P-f9w5-vV1dF375fHz_D2_F672Dn92H-9Fv_PnV9_V8vP8Nf_wff57v2-v48_r_8ffx_jP8_f748-vXf371_X08_Px6fD-_v_n9-PP58efXv_7z7fX15_fj_fH78fnx__nn-_X_H_8BAM9_AQ==)

| Service | Technology | Role |
| :--- | :--- | :--- |
| **`atlas-frontend`** | **Next.js 14, React Flow, D3-Force** | Rich client, graph rendering, and interactive dashboard. |
| **`atlas-api`** | **Spring Boot 3 (Java 21)** | REST API, Hexagonal Architecture, Batch Processing, gRPC client. |
| **`atlas-ai`** | **Python 3.12** | gRPC server, `tree-sitter` AST parsing, OpenAI embeddings. |
| **Database** | **PostgreSQL + pgvector** | Vector storage for code chunks, metadata, and edges. |

---

## Domain-Driven Design (Spring Boot)

The `atlas-api` core backend strictly follows **Hexagonal Architecture** (Ports and Adapters) to ensure domain logic is completely isolated from infrastructure and database frameworks.

```text
atlas-api/
 ├── web/              → Adapters In  (Controllers, DTOs, WebSockets)
 ├── application/      → Use Cases    (Orchestration, Services)
 ├── domain/           → Core         (Pure Java Models, Port Interfaces)
 └── infrastructure/   → Adapters Out (JPA, gRPC, GitHub, Cache)
```

---

## Getting Started

### Prerequisites
- Docker & Docker Compose
- GitHub OAuth App (for login authentication)
- OpenAI API Key / Groq API Key (for embeddings and chat)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SiddharthChiplunkar1/CodebaseAtlas.git
   cd CodebaseAtlas
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Add your GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, and GROQ_API_KEY
   ```

3. **Spin up the stack**
   ```bash
   docker-compose up --build
   ```

4. **Run the frontend**
   ```bash
   cd atlas-frontend
   npm install
   npm run dev
   ```

Visit `http://localhost:3000` to access the dashboard.
