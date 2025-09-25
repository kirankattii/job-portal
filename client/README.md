# JobPortal Frontend

A modern React + Vite + Tailwind CSS application for job searching and recruitment.

## 🚀 Features

- **Modern Tech Stack**: React 19, Vite 7, Tailwind CSS 3
- **TypeScript Ready**: Full TypeScript support with proper type definitions
- **State Management**: Zustand for lightweight state management
- **Routing**: React Router DOM for client-side routing
- **UI Components**: Headless UI + Framer Motion for accessible animations
- **Form Handling**: React Hook Form + Zod for type-safe form validation
- **Styling**: Tailwind CSS with custom design system
- **Dark Mode**: Built-in dark mode support with system preference detection
- **API Integration**: Axios with interceptors for API calls
- **File Handling**: React Dropzone for file uploads
- **Charts**: Recharts for data visualization
- **PDF Support**: React PDF for document viewing
- **Notifications**: React Hot Toast for user feedback

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── forms/        # Form-specific components
│   ├── layout/       # Layout components (Header, Footer, etc.)
│   └── common/       # Common shared components
├── pages/
│   ├── auth/         # Authentication pages
│   ├── user/         # User dashboard pages
│   ├── recruiter/    # Recruiter panel pages
│   └── admin/        # Admin panel pages
├── hooks/            # Custom React hooks
├── services/         # API services and external integrations
├── utils/            # Utility functions and helpers
├── stores/           # Zustand stores for state management
├── contexts/         # React contexts
├── constants/        # App constants and configuration
└── assets/           # Static assets (images, icons, etc.)
```

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ (recommended: Node.js 20+)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment files:
```bash
# Development
cp .env.development.example .env.development

# Production
cp .env.production.example .env.production
```

3. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Design System

### Colors

The application uses a comprehensive color palette:

- **Primary**: Blue shades for main actions and branding
- **Secondary**: Gray shades for neutral elements
- **Success**: Green shades for positive actions
- **Warning**: Yellow/Orange shades for warnings
- **Error**: Red shades for errors and destructive actions
- **Info**: Light blue shades for informational content

### Typography

- **Font Family**: Inter (primary), JetBrains Mono (monospace)
- **Scale**: Responsive typography with consistent line heights
- **Weights**: 300-900 available

### Components

Pre-built component classes are available:

- `.btn` - Button base styles
- `.btn-primary`, `.btn-secondary`, `.btn-outline`, `.btn-ghost` - Button variants
- `.btn-sm`, `.btn-md`, `.btn-lg` - Button sizes
- `.input` - Input field styles
- `.card` - Card container styles
- `.card-header`, `.card-title`, `.card-description`, `.card-content`, `.card-footer` - Card parts

### Animations

Custom animations are available:

- `animate-fade-in` - Fade in animation
- `animate-fade-in-up` - Fade in from bottom
- `animate-fade-in-down` - Fade in from top
- `animate-slide-in-right` - Slide in from right
- `animate-slide-in-left` - Slide in from left
- `animate-bounce-gentle` - Gentle bounce
- `animate-float` - Floating animation
- `animate-gradient` - Gradient animation

## 🔧 Configuration

### Environment Variables

- `VITE_API_BASE_URL` - Backend API base URL
- `VITE_APP_NAME` - Application name
- `VITE_NODE_ENV` - Environment (development/production)

### Vite Configuration

The Vite config includes:

- **Proxy**: API requests proxied to backend server
- **Aliases**: Path aliases for cleaner imports
- **Optimization**: Code splitting and dependency optimization
- **HMR**: Hot module replacement for development
- **CORS**: Cross-origin resource sharing enabled

### Tailwind Configuration

Enhanced Tailwind config with:

- **Custom Colors**: Brand-specific color palette
- **Dark Mode**: Class-based dark mode support
- **Custom Animations**: Additional keyframes and animations
- **Typography**: Custom font families and scales
- **Spacing**: Extended spacing scale
- **Shadows**: Custom shadow utilities
- **Gradients**: Predefined gradient backgrounds

## 📱 Responsive Design

The application is fully responsive with breakpoints:

- `xs`: 475px
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px
- `3xl`: 1600px
- `4xl`: 1920px

## 🌙 Dark Mode

Dark mode is fully supported with:

- System preference detection
- Manual toggle
- Persistent user preference
- Smooth transitions
- Proper contrast ratios

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

The built files will be in the `dist/` directory.

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [React Router Documentation](https://reactrouter.com/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Headless UI Documentation](https://headlessui.com/)
- [Framer Motion Documentation](https://www.framer.com/motion/)