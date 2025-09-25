# Job Portal Backend API

A Node.js + Express + Mongoose backend API for a job portal application supporting multiple user roles (User, Recruiter, Admin).

## Features

- **Multi-role Authentication**: Support for users, recruiters, and admins
- **JWT-based Authentication**: Secure token-based authentication
- **Role-based Access Control**: Middleware for protecting routes based on user roles
- **MongoDB Integration**: Mongoose ODM for database operations
- **File Upload Support**: Cloudinary integration for file handling
- **Email Services**: Nodemailer for email notifications
- **Error Handling**: Centralized error handling middleware
- **Logging**: Custom logger utility
- **Docker Support**: Containerized application with Docker Compose
- **API Documentation**: Swagger integration (placeholder)

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer + Cloudinary
- **Email**: Nodemailer
- **Security**: Helmet, CORS, bcryptjs
- **Containerization**: Docker & Docker Compose

## Prerequisites

- Node.js 16+ 
- MongoDB 4.4+
- Docker & Docker Compose (optional)

## Installation

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd job-app/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Fill in the required environment variables in `.env`:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/job-portal
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   # ... other variables
   ```

4. **Start MongoDB** (if running locally)
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7.0
   ```

5. **Run the application**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

### Docker Setup

1. **Build and start services**
   ```bash
   # From the server directory
   docker-compose up --build -d
   ```

2. **View logs**
   ```bash
   docker-compose logs -f app
   ```

3. **Stop services**
   ```bash
   docker-compose down
   ```

4. **Healthchecks**
   - App: `GET http://localhost:3000/health`
   - Mongo: `mongosh --eval "db.adminCommand('ping')"`
   - Redis: `redis-cli ping`

## Environment Variables

Create a `.env` file based on `.env.example`:

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | Yes | `development` |
| `PORT` | Server port | No | `3000` |
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `JWT_EXPIRE` | JWT expiration time | No | `7d` |
| `EMAIL_HOST` | SMTP host for emails | Yes | - |
| `EMAIL_USER` | SMTP username | Yes | - |
| `EMAIL_PASS` | SMTP password | Yes | - |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes | - |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes | - |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes | - |

### Docker Environment Mapping

When running with Docker Compose, the following environment variables are set in `docker-compose.yml` and can be overridden in `.env`:

- `NODE_ENV=production`
- `PORT=3000`
- `MONGODB_URI=mongodb://admin:password123@mongo:27017/job-portal?authSource=admin`
- `REDIS_URL=redis://redis:6379` (optional)

You can also add secrets like `JWT_SECRET`, `EMAIL_*`, and `CLOUDINARY_*` to your `.env` file; they are loaded into the `app` service via the `env_file` entry.

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/applications` - Get job applications
- `POST /api/users/applications/:jobId` - Apply for job
- `GET /api/users/saved-jobs` - Get saved jobs
- `POST /api/users/saved-jobs/:jobId` - Save job
- `DELETE /api/users/saved-jobs/:jobId` - Remove saved job

### Recruiters
- `GET /api/recruiter/dashboard` - Recruiter dashboard
- `GET /api/recruiter/jobs` - Get recruiter jobs
- `POST /api/recruiter/jobs` - Create job posting
- `PUT /api/recruiter/jobs/:jobId` - Update job posting
- `DELETE /api/recruiter/jobs/:jobId` - Delete job posting
- `GET /api/recruiter/jobs/:jobId/applications` - Get job applications
- `PUT /api/recruiter/applications/:applicationId/status` - Update application status
- `GET /api/recruiter/candidates` - Search candidates
- `GET /api/recruiter/candidates/:candidateId` - Get candidate profile

### Admin
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:userId` - Get user details
- `PUT /api/admin/users/:userId/status` - Update user status
- `DELETE /api/admin/users/:userId` - Delete user
- `GET /api/admin/recruiters` - Get all recruiters
- `PUT /api/admin/recruiters/:recruiterId/verify` - Verify recruiter
- `GET /api/admin/jobs` - Get all jobs
- `PUT /api/admin/jobs/:jobId/status` - Update job status
- `GET /api/admin/analytics` - Get analytics data
- `GET /api/admin/reports` - Generate reports

### Jobs (Public)
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/search` - Search jobs
- `GET /api/jobs/:jobId` - Get job details
- `POST /api/jobs/:jobId/apply` - Apply for job (authenticated)
- `POST /api/jobs/:jobId/save` - Save job (authenticated)
- `DELETE /api/jobs/:jobId/save` - Remove saved job (authenticated)
- `GET /api/jobs/categories/list` - Get job categories
- `GET /api/jobs/locations/list` - Get job locations
- `GET /api/jobs/skills/popular` - Get popular skills

## Scripts

```bash
# Start application in production
npm start

# Start application in development mode with auto-restart
npm run dev

# Run tests
npm test

# Install dependencies
npm install
```

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── db.js              # Database connection
│   ├── middleware/
│   │   ├── auth.js            # Authentication middleware
│   │   └── errorHandler.js    # Error handling middleware
│   ├── models/
│   │   └── User.js            # User model
│   ├── routes/
│   │   ├── index.js           # Route mounting
│   │   ├── auth.js            # Authentication routes
│   │   ├── users.js           # User routes
│   │   ├── recruiter.js       # Recruiter routes
│   │   ├── admin.js           # Admin routes
│   │   └── jobs.js            # Job routes
│   ├── utils/
│   │   └── logger.js          # Logging utility
│   └── server.js              # Main application file
├── .env.example               # Environment variables template
├── docker-compose.yml         # Docker Compose configuration
├── Dockerfile                 # Docker configuration
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## Development

### Adding New Routes

1. Create route file in `src/routes/`
2. Import and mount in `src/routes/index.js`
3. Add authentication/authorization middleware as needed

### Adding New Models

1. Create model file in `src/models/`
2. Define schema with Mongoose
3. Export model for use in controllers

### Error Handling

All errors are handled centrally in `src/middleware/errorHandler.js`. Use the `asyncHandler` wrapper for async route handlers to catch errors automatically.

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **JWT**: Secure authentication
- **bcrypt**: Password hashing
- **Input Validation**: Mongoose schema validation
- **Rate Limiting**: (To be implemented)

## Monitoring

- Health check endpoint: `GET /health`
- Custom logging with different levels
- Error tracking and reporting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please open an issue in the repository.
