# JARVIS Dashboard

## Overview

A Progressive Web App (PWA) dashboard for the JARVIS Living Household Operating System. This dashboard provides a centralized control interface for monitoring household automation agents, managing tasks, viewing performance metrics, and interacting with all JARVIS subsystems. Built with Next.js 16 and Tailwind CSS for a fast, responsive experience across desktop and mobile devices.

## Tech Stack

| Layer        | Technology          |
|-------------|---------------------|
| Framework   | Next.js 16          |
| Language    | TypeScript          |
| Styling     | Tailwind CSS 4      |
| Runtime     | Node.js 20+         |
| Type        | Progressive Web App |

## Features

- **Agent Monitoring** -- Real-time status and health monitoring for all JARVIS automation agents
- **Task Management** -- Create, assign, and track household tasks across family members
- **Performance Metrics** -- Visual dashboards displaying system performance, uptime, and resource usage
- **Module Controls** -- Direct access to JARVIS subsystems (calendar, meals, shopping, smart home, etc.)
- **Family Dashboard** -- Household overview with schedules, chores, and activity feeds
- **Notification Center** -- Centralized hub for alerts, reminders, and system notifications
- **PWA Support** -- Installable on mobile devices with offline capability and push notifications
- **Responsive Layout** -- Optimized for desktop, tablet, and mobile viewports

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- A running JARVIS backend instance

### Installation

```bash
git clone https://github.com/kstephens0331/jarvis-dashboard.git
cd jarvis-dashboard
npm install
```

### Environment Setup

```bash
cp .env.example .env.local
# Configure JARVIS API endpoint and authentication credentials
```

### Development

```bash
npm run dev
```

The dashboard will be available at `http://localhost:3000`.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
jarvis-dashboard/
├── src/
│   ├── app/              # Next.js App Router pages and layouts
│   ├── components/       # Reusable UI components
│   ├── lib/              # Utility functions and API clients
│   └── types/            # TypeScript type definitions
├── public/               # Static assets and PWA manifest
├── next.config.ts        # Next.js configuration
├── postcss.config.mjs    # PostCSS configuration
├── tsconfig.json         # TypeScript configuration
├── package.json
├── package-lock.json
└── .gitignore
```

## License

All rights reserved. Proprietary software owned by StephensCode LLC.

---

**Built by StephensCode LLC**
