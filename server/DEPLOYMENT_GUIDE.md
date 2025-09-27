# Vercel Deployment Guide

## Required Environment Variables

You need to set these environment variables in your Vercel dashboard:

### 1. Database Configuration
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/job-portal?retryWrites=true&w=majority
```

### 2. JWT Configuration
```
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
```

### 3. Email Service (Optional)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 4. Cloudinary (File Upload)
```
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### 5. CORS Configuration
```
FRONTEND_URL=https://your-frontend-domain.vercel.app
CLIENT_URL=https://your-frontend-domain.vercel.app
```

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable above with the appropriate value
5. Redeploy your application

## Testing Your Deployment

After deployment, test these endpoints:

### Basic Health Check
```
GET https://your-domain.vercel.app/health
```

### Database Health Check
```
GET https://your-domain.vercel.app/health/db
```

### Public Job APIs
```
GET https://your-domain.vercel.app/api/jobs
GET https://your-domain.vercel.app/api/jobs/categories/list
GET https://your-domain.vercel.app/api/jobs/locations/list
GET https://your-domain.vercel.app/api/jobs/skills/popular
```

## Common Issues and Solutions

### 1. 500 Internal Server Error
- Check if all required environment variables are set
- Verify MongoDB URI is correct
- Check Vercel function logs for detailed error messages

### 2. Database Connection Issues
- Ensure MongoDB URI is accessible from Vercel
- Check if MongoDB cluster allows connections from all IPs (0.0.0.0/0)
- Verify database credentials are correct

### 3. CORS Issues
- Update FRONTEND_URL and CLIENT_URL environment variables
- Ensure your frontend domain is included in CORS configuration

## Deployment Checklist

- [ ] All environment variables are set in Vercel
- [ ] MongoDB database is accessible
- [ ] Deployment protection is disabled (if you want public access)
- [ ] Health check endpoints are working
- [ ] Public job APIs are accessible
- [ ] Frontend can connect to the API
