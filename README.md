# URL Checker Service

A full-stack application for asynchronous URL checking built with TypeScript, Node.js, and React.

## Features

### Backend (Node.js + TypeScript + Express)
- **REST API endpoints**:
  - `POST /api/jobs` - Create a new URL checking job
  - `GET /api/jobs` - List all jobs with statistics
  - `GET /api/jobs/:id` - Get detailed job information
  - `DELETE /api/jobs/:id` - Cancel a running job
- **Asynchronous processing**:
  - Concurrent URL checking (max 5 concurrent requests per job)
  - Artificial random delays (0-10 seconds) between processing
  - HTTP HEAD requests for URL validation
  - In-memory job storage (no database required)

### Frontend (React + TypeScript)
- **Job creation form**: Textarea for entering URLs (one per line)
- **Job list**: Real-time list of all jobs with status and statistics
- **Job details**: Detailed view showing progress and individual URL results
- **Auto-refresh**: Automatic polling for job status updates
- **Cancel functionality**: Ability to cancel running jobs
- **Responsive design**: Works on desktop and mobile devices

## Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **HTTP Client**: Axios for URL checking
- **UUID generation**: uuid for unique job IDs
- **Development**: ts-node-dev for hot reload

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Styling**: CSS modules with responsive design
- **Date formatting**: date-fns
- **HTTP Client**: Axios

### Deployment
- **Docker**: Multi-container setup with docker-compose
- **Reverse Proxy**: Nginx for frontend serving and API proxying

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose (optional)

### Local Development

#### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd url-checker-service

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

#### 2. Start Backend Server

```bash
# From backend directory
cd backend
npm run dev
```

The backend will start on `http://localhost:3000`

#### 3. Start Frontend Development Server

```bash
# From frontend directory
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173` and proxy API requests to the backend.

### Docker Deployment

```bash
# Build and start all services
docker-compose up --build

# Access the application at:
# Frontend: http://localhost:80
# Backend API: http://localhost:3000

# For simpler deployment, use:
docker-compose -f docker-compose.simple.yml up --build
# Frontend: http://localhost:8080
# Backend API: http://localhost:3000

# Run in detached mode
docker-compose up -d --build

# Stop services
docker-compose down
```

## API Documentation

### Create Job
```http
POST /api/jobs
Content-Type: application/json

{
  "urls": ["https://example.com", "https://google.com"]
}
```

Response:
```json
{
  "jobId": "uuid-string-here"
}
```

### Get Job List
```http
GET /api/jobs
```

Response:
```json
[
  {
    "id": "uuid-string",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "status": "pending|in_progress|completed|cancelled|failed",
    "urls": ["https://example.com"],
    "stats": {
      "total": 5,
      "success": 3,
      "error": 1,
      "pending": 0,
      "inProgress": 1,
      "cancelled": 0
    }
  }
]
```

### Get Job Details
```http
GET /api/jobs/:id
```

Response:
```json
{
  "id": "uuid-string",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "status": "completed",
  "urls": ["https://example.com"],
  "results": [
    {
      "url": "https://example.com",
      "status": "success|error|pending|in_progress|cancelled",
      "httpStatus": 200,
      "errorMessage": "Error message if any",
      "startTime": "2024-01-01T00:00:00.000Z",
      "endTime": "2024-01-01T00:00:01.000Z",
      "duration": 1000
    }
  ],
  "stats": {
    "total": 1,
    "success": 1,
    "error": 0,
    "pending": 0,
    "inProgress": 0,
    "cancelled": 0
  }
}
```

### Cancel Job
```http
DELETE /api/jobs/:id
```

Response:
```json
{
  "message": "Job cancelled successfully"
}
```

## Project Structure

```
url-checker-service/
├── backend/
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── services/       # Business logic
│   │   ├── routes/         # API routes
│   │   └── index.ts        # Application entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── store/         # State management
│   │   ├── App.tsx        # Main App component
│   │   └── index.tsx      # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

## Testing

```bash
# Test backend API
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"urls": ["https://example.com", "https://google.com"]}'

# Get job list
curl http://localhost:3000/api/jobs
```

## Design Decisions

1. **In-memory storage**: Chosen for simplicity as per requirements. For production, would use Redis or a database.
2. **HTTP HEAD requests**: More efficient than GET for URL validation.
3. **Artificial delays**: Implemented to simulate real-world network conditions.
4. **Concurrent processing**: Limited to 5 concurrent requests per job to prevent overwhelming servers.
5. **TypeScript**: Used throughout for type safety and better developer experience.
6. **React with Zustand**: Simple state management solution that meets requirements.
7. **Docker containers**: Isolated services with proper networking.

## License

MIT