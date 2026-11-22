# Infrastructure & Application Reliability Platform (`API Guardian` + `ServerHealth` + `DeployMate`)

[![NodeJS](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.19+-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

An enterprise **Site Reliability Engineering (SRE) and Application Observability Platform** that unifies real-time API latency monitoring, cluster node hardware telemetry, CI/CD deployment history, and automated incident causality correlation.

---

## 🌟 Standout Feature: Deployment-Incident Causality Correlation Engine

When production outages occur, SREs frequently struggle to determine whether an outage was caused by infrastructure exhaustion or a faulty code release.

**This platform directly correlates deployment events with application incidents:**
- **Temporal Event Fusion**: Links APM error anomalies (P95 latency spikes, 5xx rate surges) with preceding CI/CD rollouts within critical time windows.
- **Causality Probability Grading**: Computes confidence scores (e.g. 96% match) attributing incidents directly to specific releases and commit authors.
- **Automated Rollback Guidance**: Evaluates canary telemetry and recommends the exact safe rollback release (e.g. `v2.4.2`).
- **1-Click Self-Healing**: Triggers instant rollback deployment with zero manual terminal commands, restoring healthy endpoint baselines.

---

## 🏗️ Architecture

```
                                  ┌──────────────────────────────┐
                                  │   React 18 + Tailwind UI     │
                                  │  - Causality Radar Cockpit   │
                                  │  - API Guardian Telemetry    │
                                  │  - ServerHealth Node Grid    │
                                  │  - DeployMate Rollout Board  │
                                  └──────────────┬───────────────┘
                                                 │ HTTP / JSON
                                                 ▼
                                  ┌──────────────────────────────┐
                                  │   Express REST API Gateway   │
                                  │        (/api/v1/*)           │
                                  └──────────────┬───────────────┘
                                                 │
                   ┌─────────────────────────────┼─────────────────────────────┐
                   ▼                             ▼                             ▼
       ┌──────────────────────┐      ┌──────────────────────┐      ┌──────────────────────┐
       │   API Guardian       │      │   ServerHealth       │      │   DeployMate         │
       │  - P95 / P99 Latency │      │  - CPU & RAM Saturation│    │  - CI/CD Deploy Log  │
       │  - 5xx Error Spikes  │      │  - NVMe Disk I/O & Temp│    │  - 1-Click Rollback  │
       └──────────────────────┘      └──────────────────────┘      └──────────────────────┘
```

---

## 🚀 Quickstart

### Option 1: Docker Compose (Recommended)
```bash
git clone https://github.com/Prasunnandi/infra-reliability-platform.git
cd infra-reliability-platform
docker-compose up --build
```
- Frontend UI: `http://localhost:3000`
- API Backend: `http://localhost:5002/api/v1/health`

### Option 2: Local Development

#### 1. Backend (Express)
```bash
cd backend
npm install
npm run dev
```

#### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

---

## 📡 REST API Reference

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/v1/endpoints` | `GET` | Retrieve API synthetic probe latencies and error rates |
| `/api/v1/servers` | `GET` | Query production server nodes (CPU, RAM, Disk, Thermal) |
| `/api/v1/deployments` | `GET` | List CI/CD release history, commit SHAs, and deployers |
| `/api/v1/causality-correlation` | `GET` | **Standout Feature**: Compute causality correlation between deployments and active outages |
| `/api/v1/deployments/rollback` | `POST` | Execute automated rollback to previous verified release |

---

## 📜 License
Distributed under the MIT License.
