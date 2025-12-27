# AI Code Reviewer

An intelligent code review platform that analyzes student coding attempts, identifies their approach, and provides personalized feedback using AI-powered insights.

## Features

- **Smart Code Analysis**: AI identifies the student's coding approach by analyzing code structure and editing patterns
- **Two-Step Review Process**:
  1. Approach detection and selection
  2. Detailed feedback generation with optimization points
- **Code Activity Tracking**: Monitors time spent, edit counts, and line-level activity
- **Interactive Code Editor**: Built-in Monaco Editor with syntax highlighting
- **User Authentication**: Secure JWT-based authentication system
- **Real-time Cursor Tracking**: Accurate line-level edit tracking with Monaco Editor integration

## Tech Stack

### Frontend
- **React** + **Vite** - Fast, modern UI framework
- **TailwindCSS** - Utility-first CSS framework
- **Monaco Editor** - VS Code-powered code editor
- **React Router** - Client-side routing
- **shadcn/ui** - Beautiful UI components

### Backend
- **FastAPI** - High-performance Python web framework
- **MongoDB** - NoSQL database for flexible data storage
- **OpenAI API** - AI-powered code analysis
- **JWT** - Secure token-based authentication
- **python-dotenv** - Environment variable management

## 📁 Project Structure

```
AI code reviewer/
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── context/          # React context providers
│   │   └── lib/              # Utility functions
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── auth/                 # Authentication logic
│   ├── database/             # Database models and schemas
│   ├── review/               # Code review routes
│   ├── ai/                   # AI service integration
│   ├── main.py               # FastAPI application entry
│   └── requirements.txt
│
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- **MongoDB** (local or Atlas)
- **OpenAI API Key**

### Installation

#### 1. Clone the repository
```bash
git clone <repository-url>
cd "AI code reviewer"
```

#### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
OPENAI_API_KEY=your_openai_api_key
```

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

### Running the Application

#### Start Backend Server
```bash
cd backend
uvicorn main:app --reload
```
Backend runs on `http://localhost:8000`

#### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token

### Code Review
- `POST /api/getapproaches` - Get possible coding approaches
  - Request: `{ code, language, question, parameters }`
  - Response: `{ approaches: [{ title, description }] }`

- `POST /api/approachselect` - Submit approach and get feedback
  - Request: `{ approach, code, question, stats }`
  - Response: `{ feedback_text, drawbacks: [{ drawback_text }] }`

## 📊 How It Works

1. **Student writes code** in the Monaco Editor
2. **System tracks activity**: time spent per line, edit counts, cursor movements
3. **Submit for review**: Code is sent to the AI service
4. **AI analyzes approach**: Identifies the coding strategy used
5. **Approach selection**: Student confirms their intended approach
6. **Feedback generation**: AI provides:
   - Overall analysis
   - Optimization points
   - Line-level insights based on edit patterns

## 🎨 UI Features

- **Dark Mode**: Professional dark theme optimized for coding
- **Real-time Stats**: Live display of code metrics
- **Interactive Panels**: 
  - Code editor with syntax highlighting
  - Approach selection cards
  - Feedback visualization with color-coded sections
- **Responsive Design**: Works on desktop and tablet screens

## 🔐 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/ai_code_reviewer
JWT_SECRET=your-secret-key-here
OPENAI_API_KEY=sk-...
```

### Frontend (.env - optional)
```env
VITE_API_URL=http://localhost:8000
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
