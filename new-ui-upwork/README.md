# Upwork Automation - Simplified Admin Interface

A simplified job management application with Clerk authentication for admin users.

## Features

- **Clerk Authentication**: Secure user authentication and management
- **Jobs Management**: View, search, and manage job listings from Upwork
- **Proposal Generation**: AI-powered proposal generation for job applications
- **Admin Dashboard**: Simplified admin interface with job tracking
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Clerk account for authentication

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   VITE_APP_URL=http://localhost:8000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Authentication

The application uses Clerk for authentication. Users must sign in to access the admin interface.

## Pages

- **Jobs Page** (`/jobs`): Main job management interface with search, filtering, and proposal generation
- **Dashboard** (`/dashboard`): Under construction
- **Users** (`/users`): Under construction  
- **Reports** (`/reports`): Under construction
- **Settings** (`/settings`): Under construction

## Current Status

- ✅ Jobs management with full functionality
- ✅ Clerk authentication integration
- ✅ Responsive design
- ✅ Proposal generation
- 🚧 Other pages show "Under Construction" message

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui components
- Clerk authentication
- React Router DOM
# upwork-frontend
