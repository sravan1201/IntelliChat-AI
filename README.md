# 🚀 IntelliChat AI

<div align="center">
  <img src="client/public/vite.svg" alt="IntelliChat Logo" width="120" />
  <br/>
  <h3>Production-Grade AI Chat Platform</h3>
</div>

## 🌟 Features

- 💬 **AI Chat** — Streaming responses, Markdown rendering, Syntax highlighting
- 🎭 **AI Personas** — 5 built-in personas (General, Teacher, Interviewer, Debugger, Mentor)
- 👤 **Authentication** — Secure JWT-based auth with MongoDB
- 🧠 **Long-Term Memory** — AI learns and remembers your preferences, skills, and goals
- 📄 **Document RAG** — Upload PDFs, DOCX, and TXT files to chat with them
- 🖼️ **Image Generation** — Create AI images from text prompts with multiple styles
- 🔍 **Web Search** — Browse the web for current information
- 💻 **Code Assistant** — Explain, debug, optimize, and generate code
- 🎙️ **Voice Assistant** — Speech-to-text input capability
- 📊 **Analytics Dashboard** — Visualize your AI usage and chat statistics
- 🎨 **Premium UI** — Dark glassmorphism theme, fully responsive

## 🛠️ Tech Stack

**Frontend:**
- React 18 & TypeScript
- Vite (Build Tool)
- Tailwind CSS (Styling)
- React Router (Navigation)
- React Markdown & remark-gfm (Markdown)
- Lucide React (Icons)
- React Hot Toast (Notifications)

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose (Database)
- JWT & bcryptjs (Authentication)
- Multer (File Uploads)
- Google Gemini API (AI Models)

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- MongoDB (Local or Atlas)
- Google Gemini API Key (Optional, works in Demo Mode without it)

### Option 1: Local Development (Without Docker)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sravan1201/IntelliChat-AI.git
   cd IntelliChat-AI
   ```

2. **Setup Server:**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB URI and API keys
   npm start
   ```

3. **Setup Client:**
   ```bash
   # Open a new terminal
   cd client
   npm install
   cp .env.example .env
   npm run dev
   ```

4. **Open Application:**
   Navigate to `http://localhost:5173` in your browser.

### Option 2: Docker Deployment

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sravan1201/IntelliChat-AI.git
   cd IntelliChat-AI
   ```

2. **Start with Docker Compose:**
   ```bash
   # Set environment variables if needed
   export GEMINI_API_KEY="your_api_key"
   docker-compose up -d
   ```

3. **Open Application:**
   Navigate to `http://localhost:3001` in your browser.

## 📝 Demo Mode

IntelliChat AI comes with a built-in "Demo Mode". If you run the application without a MongoDB connection or API keys, it will gracefully fall back to using your browser's `localStorage` and a local AI simulator. This allows you to explore the UI and features instantly without any setup.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
