# LLM Prompt Optimizer

A MERN stack web application that converts natural language prompts into optimized JSON for LLM consumption, featuring authentication via Kinde and multi-provider LLM integration with fallback logic.

## 🚀 Features

- **Natural Language to JSON Conversion**: Convert human-readable prompts into structured JSON optimized for LLMs
- **Multi-Provider LLM Integration**: Support for Google Gemini, Mistral AI, Cohere, and OpenAI with intelligent fallback
- **OAuth Authentication**: Secure authentication via Kinde with user profile management
- **User Management**: MongoDB-based user storage with webhook synchronization
- **Conversion History**: Track and view past prompt conversions
- **Modern UI**: Beautiful React interface with Tailwind CSS and Shadcn UI components
- **Robust Error Handling**: Comprehensive error handling and retry logic

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS with Shadcn UI components
- **Authentication**: Kinde OAuth integration
- **State Management**: React hooks for local state
- **HTTP Client**: Fetch API with authentication headers

### Backend (Express.js + MongoDB)
- **Framework**: Express.js with ES6 modules
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Kinde token validation middleware
- **LLM Integration**: LangChain with multiple providers
- **Webhooks**: Kinde webhook handling for user synchronization
- **API Structure**: RESTful routes with proper separation of concerns

## 📁 Project Structure

```
promptcraft/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── lib/           # Utilities
│   │   └── App.tsx        # Main application
│   └── package.json
├── server/                 # Express backend
│   ├── controllers/        # Route handlers
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── constants/         # Application constants
│   ├── kindeAuth.js       # Authentication middleware
│   ├── llmService.js      # LLM integration
│   └── index.js           # Server entry point
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (free tier works)
- Kinde account for authentication
- API keys for at least one LLM provider

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd promptcraft

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Environment Configuration

#### Backend (.env)
```bash
# Server Configuration
PORT=5000

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/promptcraft?retryWrites=true&w=majority

# Kinde Authentication (Backend App)
KINDE_DOMAIN=your_kinde_domain
KINDE_CLIENT_ID=your_backend_client_id
KINDE_CLIENT_SECRET=your_backend_client_secret
KINDE_REDIRECT_URI=http://localhost:3000
KINDE_WEBHOOK_SECRET=your_kinde_webhook_secret

# LLM API Keys (at least one required)
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
MISTRAL_API_KEY=your_mistral_api_key
COHERE_API_KEY=your_cohere_api_key
OPENAI_API_KEY=your_openai_api_key
```

#### Frontend (.env)
```bash
# Kinde Authentication (Frontend App)
VITE_KINDE_CLIENT_ID=your_frontend_client_id
VITE_KINDE_DOMAIN=your_kinde_domain
VITE_KINDE_REDIRECT_URI=http://localhost:3000
```

### 3. Kinde Setup

1. **Create Two Applications in Kinde**:
   - **Frontend App**: For React OAuth flow
   - **Backend App**: For API protection and webhooks

2. **Configure Redirect URIs**:
   - Frontend: `http://localhost:3000/callback` (new callback page)
   - Backend: `http://localhost:3000/callback` (legacy requirement)

3. **Set Up Webhooks**:
   - URL: `https://your-domain.com/api/webhook` (use ngrok for local development)
   - Events: `user.created`, `user.updated`, `user.deleted`
   - Secret: Generate and add to backend .env

### 4. MongoDB Setup

1. Create a MongoDB Atlas cluster
2. Create a database user with read/write permissions
3. Get your connection string and add to backend .env

### 5. LLM Provider Setup

Configure at least one of the following providers:

- **Google Gemini**: Get API key from Google AI Studio
- **Mistral AI**: Get API key from Mistral AI dashboard
- **Cohere**: Get API key from Cohere dashboard
- **OpenAI**: Get API key from OpenAI dashboard

### 6. Development Setup

```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
cd client
npm run dev

# Terminal 3: Start ngrok for webhooks (optional)
ngrok http 5000
```

## 🔐 Authentication Flow

### Modern OAuth Flow with Callback Page
1. User clicks login → redirects to Kinde
2. Kinde redirects to `/callback` page with tokens
3. Callback page syncs user to backend via API
4. Callback page redirects to main app (`/`)
5. Backend verifies tokens and creates/updates user in MongoDB

### User Synchronization Strategy
- **Primary**: Callback-based synchronization (frontend calls backend after OAuth)
- **Secondary**: Webhook-based real-time synchronization
- **Fallback**: Auth middleware creates users if both callback and webhook fail
- **Eventual Consistency**: Handles cases where webhook delivery fails

### Callback Page Features
- **User Sync**: Automatically syncs user data to backend
- **Loading States**: Shows progress during synchronization
- **Error Handling**: Displays errors and retry options
- **Auto Redirect**: Redirects to main app after successful sync

## 🤖 LLM Integration

### Multi-Provider Architecture
- **Primary**: Google Gemini (fastest, most reliable)
- **Fallback**: Mistral AI → Cohere → OpenAI
- **Retry Logic**: Automatic retries with different prompts
- **Error Handling**: Graceful degradation on provider failures

### JSON Schema
```json
{
  "action": "string (required)",
  "entities": [{"name": "string", "type": "string"}],
  "constraints": ["string"],
  "output_format": "string",
  "original_prompt": "string (required)"
}
```

## 📊 API Endpoints

### Authentication
- `GET /api/protected` - Test protected route

### Prompt Conversion
- `POST /api/convert-prompt` - Convert prompt to JSON
- `GET /api/history` - Get user's conversion history

### User Management
- `POST /api/sync-user` - Sync user from OAuth callback (public endpoint)
- `GET /api/profile` - Get or create user profile
- `GET /api/profile/details` - Get detailed user profile
- `PUT /api/profile` - Update user profile

### Webhooks
- `POST /api/webhook` - Handle Kinde webhook events

## 🚀 Deployment

### Backend Deployment
1. Deploy to Vercel, Railway, or similar
2. Set environment variables
3. Configure webhook URL in Kinde dashboard

### Frontend Deployment
1. Deploy to Vercel, Netlify, or similar
2. Update Kinde redirect URIs
3. Set environment variables

### Database
- Use MongoDB Atlas for production
- Ensure proper indexing on `kindeId` and `email` fields

## 🔧 Development Tools

### Local Webhook Testing
```bash
# Install ngrok
npm install -g ngrok

# Start ngrok tunnel
ngrok http 5000

# Use the HTTPS URL in Kinde webhook configuration
```

### Database Management
```bash
# Connect to MongoDB Atlas
mongosh "your-connection-string"

# View collections
show collections

# Query users
db.users.find()
```

## 🐛 Troubleshooting

### Common Issues

1. **Webhook Not Working Locally**
   - Use ngrok to expose local server
   - Update webhook URL in Kinde dashboard

2. **Authentication Errors**
   - Verify Kinde client IDs match frontend/backend apps
   - Check environment variables are set correctly

3. **LLM Provider Errors**
   - Verify API keys are valid
   - Check rate limits and quotas
   - Ensure at least one provider is configured

4. **Database Connection Issues**
   - Verify MongoDB connection string
   - Check network access and IP whitelist

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review Kinde and LLM provider documentation
- Open an issue on GitHub 