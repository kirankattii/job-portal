# User Profile Management System

A comprehensive user profile management system built with React and Node.js, featuring responsive design, real-time progress tracking, and advanced profile management capabilities.

## 🚀 Features

### 1. Responsive Profile Page with Tabbed Interface
- **Personal Information**: Name, email, phone, bio, location
- **Professional Details**: Current position, company, salary, experience
- **Skills & Experience**: Skills with proficiency levels, work experience management
- **Education**: Academic records, degrees, institutions
- **Resume Upload**: Drag-and-drop PDF upload with auto-parsing
- **Account Settings**: Notifications, privacy, visibility controls

### 2. Profile Completion System
- Real-time progress calculation
- Visual progress bar with color coding
- Completion percentage display
- Missing fields highlighting
- Completion tips and suggestions

### 3. Resume Upload & Processing
- Drag-and-drop interface with visual feedback
- PDF file validation (5MB limit)
- Upload progress indicator
- Auto-fill profile from parsed resume using AI
- Resume preview and download functionality

### 4. Skills Management
- Add/remove skills with proficiency levels
- Real-time skill suggestions from comprehensive database
- Skill categories and filtering
- Search and autocomplete functionality
- Popular skills recommendations

### 5. Experience Management
- Add/edit work experience entries
- Date validation and current job toggle
- Company and position details
- Description and achievements
- Experience timeline view

### 6. Education Management
- Add/edit education entries
- Institution and degree validation
- Field of study and dates
- GPA tracking and achievements
- Academic timeline view

### 7. Profile Visibility Settings
- Public, private, recruiters-only options
- Contact information privacy controls
- Resume download permissions
- Notification preferences

## 🛠️ Technical Implementation

### Frontend Components

#### Main Profile Page (`/client/src/pages/user/Profile.jsx`)
- Tabbed interface with responsive design
- State management for profile data
- Real-time updates and synchronization

#### Profile Components
- `ProfileCompletion.jsx` - Progress tracking and visual indicators
- `PersonalInfoTab.jsx` - Personal information management
- `ProfessionalDetailsTab.jsx` - Professional details and salary
- `SkillsExperienceTab.jsx` - Skills and work experience
- `EducationTab.jsx` - Education records management
- `ResumeUploadTab.jsx` - Resume upload with drag-and-drop
- `AccountSettingsTab.jsx` - Privacy and notification settings

#### Enhanced UI Components
- `Button.jsx` - Multiple variants and sizes
- `LoadingSpinner.jsx` - Various sizes and styles
- `InputField.jsx` - Form input with validation

### Backend APIs

#### User Profile Endpoints
- `GET /api/users/profile` - Fetch user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/upload-resume` - Upload and parse resume
- `GET /api/users/skills/suggestions` - Get skill suggestions

#### Skills API Features
- Comprehensive skills database with 100+ skills
- Category-based filtering (Programming, Frameworks, Databases, etc.)
- Popular skills recommendations
- Search with autocomplete
- Skill popularity scoring

### Data Models

#### User Schema Enhancements
```javascript
{
  // Personal Information
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  bio: String,
  location: {
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  
  // Professional Details
  currentPosition: String,
  currentCompany: String,
  currentSalary: Number,
  expectedSalary: Number,
  experienceYears: Number,
  currentLocation: String,
  preferredLocation: String,
  
  // Skills & Experience
  skills: [{
    name: String,
    level: String // Beginner, Intermediate, Advanced, Expert
  }],
  experience: [{
    title: String,
    company: String,
    location: String,
    startDate: Date,
    endDate: Date,
    current: Boolean,
    description: String
  }],
  
  // Education
  education: [{
    institution: String,
    degree: String,
    field: String,
    startDate: Date,
    endDate: Date,
    current: Boolean,
    gpa: Number,
    description: String
  }],
  
  // Resume & Files
  resumeUrl: String,
  avatarUrl: String,
  
  // Profile Management
  profileCompletion: Number,
  lastProfileUpdatedAt: Date,
  
  // Settings
  preferences: {
    emailNotifications: Boolean,
    jobAlerts: Boolean,
    profileVisibility: String // public, private, recruiters-only
  }
}
```

## 🎨 Design System

### Color Scheme
- Primary: Blue (#0ea5e9)
- Success: Green (#22c55e)
- Warning: Yellow (#f59e0b)
- Error: Red (#ef4444)
- Neutral: Gray scale

### Typography
- Font Family: Inter (primary), system fonts (fallback)
- Responsive font sizes with proper line heights
- Consistent spacing using 4px base unit

### Components
- Consistent border radius (4px, 8px, 12px)
- Shadow system for depth
- Smooth transitions and animations
- Dark mode support

## 📱 Responsive Design

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Mobile Features
- Collapsible tab navigation
- Touch-friendly drag-and-drop
- Optimized form layouts
- Swipe gestures support

## 🔧 Installation & Setup

### Prerequisites
- Node.js 16+
- MongoDB
- Cloudinary account (for file uploads)

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

### Backend Setup
```bash
cd server
npm install
npm run dev
```

### Environment Variables
```env
# Frontend
VITE_API_BASE_URL=http://localhost:3000/api

# Backend
MONGODB_URI=mongodb://localhost:27017/jobportal
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🚀 Usage

### Profile Management
1. Navigate to `/profile` in the application
2. Use the tabbed interface to manage different sections
3. Real-time progress tracking shows completion status
4. Save changes automatically sync with backend

### Resume Upload
1. Go to "Resume Upload" tab
2. Drag and drop PDF file or click to browse
3. File is automatically parsed and profile is updated
4. Resume becomes visible to recruiters

### Skills Management
1. Go to "Skills & Experience" tab
2. Type to search for skills with autocomplete
3. Select proficiency level for each skill
4. Add work experience with detailed information

### Privacy Settings
1. Go to "Account Settings" tab
2. Configure notification preferences
3. Set profile visibility (public/private/recruiters-only)
4. Manage contact information privacy

## 🔒 Security Features

- File type validation (PDF only)
- File size limits (5MB)
- Input sanitization and validation
- CSRF protection
- Rate limiting on API endpoints
- Secure file storage with Cloudinary

## 📊 Performance Optimizations

- Lazy loading of tab content
- Debounced search for skill suggestions
- Optimized API calls with caching
- Image optimization and compression
- Bundle splitting and code splitting

## 🧪 Testing

### Frontend Testing
```bash
cd client
npm run test
```

### Backend Testing
```bash
cd server
npm run test
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd client
npm run build
# Deploy dist folder
```

### Backend (Railway/Heroku)
```bash
cd server
npm start
```

## 📈 Future Enhancements

- [ ] Advanced resume parsing with multiple formats
- [ ] Skills assessment and testing
- [ ] Profile analytics and insights
- [ ] Social media integration
- [ ] Video resume support
- [ ] AI-powered profile optimization
- [ ] Multi-language support
- [ ] Advanced search and filtering

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

Built with ❤️ using React, Node.js, MongoDB, and Cloudinary
