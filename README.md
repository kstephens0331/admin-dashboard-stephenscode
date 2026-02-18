# StephensCode Admin Dashboard

## Overview

Internal administration dashboard for StephensCode LLC. Provides a centralized interface for monitoring business analytics, managing operational data, and tracking key performance metrics across all StephensCode ventures. Built with React 19 and Firebase for real-time data synchronization and secure authentication.

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS 3
- **Backend:** Firebase 11 (Auth, Firestore, Storage)
- **Charts:** Chart.js + react-chartjs-2
- **Animations:** Framer Motion
- **Icons:** React Icons
- **Routing:** React Router 7
- **Deployment:** Vercel

## Features

- **Analytics Charts** — Interactive data visualizations powered by Chart.js for revenue, traffic, and project metrics
- **Firebase Authentication** — Secure login with role-based access control via Firebase Auth
- **Real-Time Data** — Live updates from Firestore for business metrics and operational data
- **Business Data Management** — CRUD operations for clients, projects, invoices, and internal records
- **Animated UI** — Smooth page transitions and micro-interactions with Framer Motion
- **Responsive Layout** — Collapsible sidebar navigation optimized for desktop and tablet use
- **Dashboard Widgets** — Configurable cards displaying KPIs, recent activity, and alerts
- **Dark Mode** — Toggle between light and dark themes

## Getting Started

```bash
# Clone the repository
git clone https://github.com/kstephens0331/admin-dashboard-stephenscode.git
cd admin-dashboard-stephenscode

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Add your Firebase project credentials

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
admin-dashboard-stephenscode/
├── public/              # Static assets and favicon
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── charts/      # Chart.js visualization components
│   │   ├── layout/      # Sidebar, header, and layout shells
│   │   └── widgets/     # Dashboard card widgets
│   ├── pages/           # Route-level page components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Firebase client initialization
│   ├── services/        # Firestore data access layer
│   ├── utils/           # Utility functions and helpers
│   ├── types/           # TypeScript type definitions
│   └── App.tsx          # Root application component
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## License

All rights reserved. Internal tool for StephensCode LLC.

---

**Built by StephensCode LLC**
