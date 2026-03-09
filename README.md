# Fuel Buddy - On-Demand Fuel Delivery

Welcome to Fuel Buddy, an innovative on-demand fuel delivery platform that brings fuel directly to your location. This monorepo contains both the backend API and frontend application.

## 📁 Project Structure

```
fuel-buddy/
├── backend/                 # Node.js/Express API server
│   ├── config/              # Configuration files
│   ├── middleware/          # Authentication & validation middleware
│   ├── models/              # Database models
│   ├── routes/              # API route definitions
│   ├── services/            # Business logic services
│   ├── tests/               # Backend test files
│   │   ├── scripts/         # Test setup scripts
│   │   └── *.js             # Individual test files
│   ├── utils/               # Utility functions
│   ├── index.js             # Entry point
│   ├── package.json         # Backend dependencies
│   └── .env                 # Environment variables
├── frontend/                # React/Vite frontend application
│   ├── public/              # Static assets
│   │   ├── favicon.ico
│   │   ├── manifest.json
│   │   ├── placeholder.svg
│   │   ├── robots.txt
│   │   └── sw.js
│   ├── src/
│   │   ├── assets/          # Images and static files
│   │   │   ├── hero-image.jpg
│   │   │   └── kotak-qr-new.png
│   │   ├── components/      # Reusable UI components
│   │   │   ├── admin/       # Admin-specific components
│   │   │   ├── ui/          # Radix UI components
│   │   │   ├── *.tsx        # Feature components
│   │   │   └── *.ts         # Component utilities
│   │   ├── contexts/        # React Context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── integrations/    # Third-party integrations
│   │   ├── lib/             # Core library functions
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service calls
│   │   ├── types/           # TypeScript type definitions
│   │   ├── utils/           # Utility functions
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── components.json      # Component configuration
│   ├── eslint.config.js     # ESLint configuration
│   ├── index.html           # HTML template
│   ├── package.json         # Frontend dependencies
│   ├── postcss.config.js    # PostCSS configuration
│   ├── tailwind.config.ts   # Tailwind CSS configuration
│   ├── tsconfig.app.json    # TypeScript app config
│   ├── tsconfig.json        # TypeScript root config
│   ├── tsconfig.node.json   # TypeScript node config
│   └── vite.config.ts       # Vite configuration
├── docs/                    # Documentation
│   ├── CONNECTION_GUIDE.md
│   ├── INSTALLATION.md
│   ├── MONGODB_SETUP.md
│   ├── ORGANIZATION_PLAN.md
│   └── PROJECT_SUMMARY.md
├── scripts/                 # Utility scripts
│   └── start.ps1            # PowerShell startup script
├── .gitignore               # Git ignore rules
├── package.json             # Root package.json (monorepo)
├── package-lock.json        # Root package lock
├── README.md                # Project documentation
├── tsconfig.json            # Root TypeScript config
└── .env                     # Root environment variables (if needed)
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (for backend)
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd fuel-buddy
   ```

2. Install dependencies for all projects:
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. Set up environment variables:
   - Create `.env.local` files in both `backend/` and `frontend/` directories based on the existing `.env` files
   - Update the environment variables as needed

### Running the Application

#### Development Mode
To run both backend and frontend in development mode:
```bash
npm run dev
```

Or run them separately:

Backend only:
```bash
cd backend
npm run dev
```

Frontend only:
```bash
cd frontend
npm run dev
```

#### Production Mode
To build and run for production:
```bash
# Build the frontend
cd frontend
npm run build

# Start the backend
cd backend
npm start
```

## 🛠 Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose ODM
- JSON Web Tokens (JWT) for authentication
- bcrypt for password hashing

### Frontend
- React (v18+)
- TypeScript
- Vite (bundler)
- Tailwind CSS (styling)
- Radix UI (accessible components)
- Lucide React (icons)
- React Router DOM (navigation)

### Additional Libraries
- CORS for cross-origin requests
- Dotenv for environment variables
- Concurrently for running multiple processes

## 🔐 Environment Variables

### Backend (.env in backend/)
```
PORT=5003
MONGODB_URI=mongodb://localhost:27017/fuel-buddy
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d
```

### Frontend (.env in frontend/)
```
VITE_API_URL=http://localhost:5003/api
```

## 🤖 AI Features

This application includes an AI-powered chatbot assistant that helps users with fuel delivery services. To use the AI features, you need to configure a Google Gemini API key. See [AI Configuration Guide](./docs/AI_CONFIGURATION.md) for setup instructions.

## 📡 API Endpoints

The backend provides the following main API routes:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (requires authentication)
- `GET /api/fuel-stations` - Get available fuel stations
- `POST /api/orders` - Create new fuel order
- `GET /api/orders/:id` - Get order details
- `GET /api/loyalty` - Get loyalty program details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Support

If you have any questions or need help, please open an issue in the repository.