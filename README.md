# Olympido

Competitive Academic Olympiad & Contest Platform.

Olympido allows verified educational institutions and teachers to host Olympiads (Physics, Mathematics, Chemistry, Informatics, and more) while providing students with an arena to compete, earn ratings, track leaderboards, and share verified digital scorecards.

---

## Architecture & Specifications

Comprehensive specifications have been established under [`docs/`](./docs):

- **[System Design & Architecture Specification](docs/SYSTEM_DESIGN.md)**:
  - Role-Based Access Control (Student, Teacher, Organizer, Admin)
  - Institutional domain validation for school/organizer registrations
  - Contest review & Admin approval pipeline
  - Points & Rating calculation engine (Elo/Glicko-2)
  - Weekly, Monthly, and All-Time Leaderboards
  - PostgreSQL Relational Database Schema & Data Models
  - Core REST API Endpoint specifications

- **[UI/UX Design System & Frontend Architecture](docs/UI_UX_DESIGN.md)**:
  - Visual identity, color palette, and typography design tokens
  - Student Profile & Digital Scorecard wireframes
  - Leaderboard podium and rank view
  - Organizer Contest Creation Wizard & Domain verification modal
  - Admin Moderation & Approval Console
  - Dynamic micro-animations, transitions, and responsive layout guidelines

---

## Project Structure

- **[`frontend/`](./frontend)**: Web frontend application (Next.js / React).
- **[`backend/`](./backend)**: Backend services, REST API, rating engine, and background queues.
- **[`mobile/`](./mobile)**: Mobile application (iOS & Android).
- **[`ai-agent/`](./ai-agent)**: AI agent and bot service for hints and automated evaluation assistance.
- **[`docs/`](./docs)**: System design specifications, architecture diagrams, and guides.
