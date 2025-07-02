# replit.md

## Overview

This is a full-stack goal management application built with React, TypeScript, Express.js, and PostgreSQL. The app implements a hierarchical goal structure with quarterly goals, monthly milestones, weekly tasks, and daily actions, allowing users to break down long-term objectives into manageable daily activities.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for the UI layer
- **Vite** as the build tool and development server
- **TanStack Query** for server state management and caching
- **React Hook Form** with Zod validation for form handling
- **Wouter** for client-side routing
- **Tailwind CSS** with **shadcn/ui** components for styling
- Component-based architecture with reusable UI components

### Backend Architecture
- **Express.js** with TypeScript for the REST API server
- **Node.js** runtime with ES modules
- RESTful API design with CRUD operations for each entity
- Middleware for request logging and error handling
- Interface-based storage abstraction pattern

### Data Storage
- **PostgreSQL** database with **Neon** serverless connection
- **Drizzle ORM** for database schema and queries
- **Drizzle Kit** for database migrations
- Hierarchical data model: Goals → Milestones → Tasks → Actions
- Additional daily check-in tracking for progress monitoring

## Key Components

### Database Schema
- `quarterlyGoals`: Main goal entities with title, description, quarter/year
- `monthlyMilestones`: Sub-goals linked to quarterly goals
- `weeklyTasks`: Weekly objectives linked to milestones  
- `dailyActions`: Daily actionable items linked to tasks
- `dailyCheckins`: Daily progress tracking with ratings and reflections

### API Structure
- `/api/quarterly-goals` - CRUD operations for quarterly goals
- `/api/monthly-milestones` - CRUD operations for monthly milestones
- `/api/weekly-tasks` - CRUD operations for weekly tasks
- `/api/daily-actions` - CRUD operations for daily actions
- `/api/daily-checkins` - CRUD operations for daily check-ins
- `/api/dashboard/stats` - Aggregated statistics for dashboard

### UI Components
- Dashboard with overview of all goal levels
- Create/edit dialogs for each entity type
- Progress tracking with circular progress indicators
- Celebration dialogs for completed goals
- Daily check-in interface with rating system

## Data Flow

1. **User Interaction**: User interacts with React components in the browser
2. **State Management**: TanStack Query manages API calls and caches responses
3. **API Requests**: Frontend makes HTTP requests to Express.js backend
4. **Data Processing**: Backend validates requests and processes data
5. **Database Operations**: Drizzle ORM executes SQL queries against PostgreSQL
6. **Response Flow**: Data flows back through the same layers to update the UI

### Key Data Relationships
- Quarterly Goals → Monthly Milestones (1:many)
- Monthly Milestones → Weekly Tasks (1:many)  
- Weekly Tasks → Daily Actions (1:many)
- Independent daily check-ins for progress tracking

## External Dependencies

### Runtime Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless connection
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI primitives
- **react-hook-form**: Form state management
- **zod**: Schema validation
- **date-fns**: Date manipulation utilities

### Development Dependencies
- **Vite**: Build tool and dev server
- **TypeScript**: Type checking and compilation
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Development
- Vite dev server for frontend with HMR
- Express server with TypeScript compilation via tsx
- Development and production environment separation
- Replit-specific development tooling integration

### Production Build
- Vite builds frontend to static assets
- ESBuild bundles backend to single executable file
- Environment-based configuration via process.env
- Database migrations via Drizzle Kit

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string (required)
- `NODE_ENV`: Environment flag (development/production)
- Path aliases configured for clean imports (@/, @shared/)

## Changelog

Changelog:
- July 02, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.