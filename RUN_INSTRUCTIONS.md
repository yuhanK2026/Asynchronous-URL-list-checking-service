# Run Instructions

## Quick Start with Docker (Recommended)

```bash
# Build and start all services
docker-compose up --build

# Access the application at:
# Frontend: http://localhost:80
# Backend API: http://localhost:3000
```

## Manual Development Setup

### 1. Backend Setup

```bash
cd backend
npm install
npm run dev
```

Backend runs on: http://localhost:3000

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:5173

### 3. Using the Windows Batch File

Double-click `run-dev.bat` or run:
```bash
run-dev.bat
```

## Testing the API

After starting the backend, you can test the API:

### Create a job:
```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"urls": ["https://example.com", "https://google.com"]}'
```

### Get jobs list:
```bash
curl http://localhost:3000/api/jobs
```

### Health check:
```bash
curl http://localhost:3000/health
```

## Project Structure

- `/backend` - Node.js + TypeScript API server
- `/frontend` - React + TypeScript frontend application
- `docker-compose.yml` - Docker setup for both services
- `README.md` - Complete documentation

## API Endpoints

- `POST /api/jobs` - Create new URL checking job
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get job details
- `DELETE /api/jobs/:id` - Cancel job
- `GET /health` - Health check endpoint