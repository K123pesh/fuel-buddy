# Fuel Buddy - Installation Guide

## Prerequisites
- Node.js (v18 or higher) - [Download](https://nodejs.org/)
- MongoDB (local installation or MongoDB Atlas account)
- Git

## Installation Steps

### 1. Install Dependencies
```bash
# Install root dependencies
cd fuel-buddy-on-demand-main
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd frontend
npm install
```

### 2. Database Setup
The application uses MongoDB. Make sure it's installed and running locally, or create a MongoDB Atlas account for cloud hosting.

### 3. Run the Application

**Option 1: Using the startup script (Recommended)**
```powershell
# Run from the root directory
npm run dev
```

**Option 2: Manual startup**
```bash
# Terminal 1 - Start API
cd backend
npm run dev

# Terminal 2 - Start Frontend  
cd frontend
npm run dev
```

## Access the Application
- **Frontend**: http://localhost:5173
- **API Base URL**: http://localhost:5003/api

## Project Structure
- `backend/` - Node.js/Express.js API server
- `frontend/` - React frontend with TypeScript
- `docs/` - Documentation files

## Troubleshooting

### Database Issues
If you encounter database connection errors:
1. Ensure MongoDB is installed and running locally, or your MongoDB Atlas connection string is correct
2. Verify your MONGODB_URI in the backend/.env file

### Dependency Issues
For frontend dependency conflicts:
```bash
npm install --legacy-peer-deps
```

### Port Conflicts
If ports are in use, you can modify:
- Frontend port in `frontend/vite.config.ts`
- API port in `backend/.env` file