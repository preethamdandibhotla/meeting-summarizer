# 🎤 Meeting Summarizer AI

**Meeting Summarizer AI** is an intelligent full-stack web application that transcribes and summarizes meeting audio recordings.  
Simply upload an audio file, and the system — powered by **Google's Gemini AI** — will generate:

- ✅ A full transcript  
- 🧠 A concise meeting summary  
- 🗝️ Key decisions  
- 📋 Action items with assignees and priorities  

---

## ✨ Features

- **🔐 Secure Authentication** – JWT-based login and registration system.  
- **📤 Drag & Drop Uploads** – Upload meeting recordings in `.mp3`, `.wav`, `.m4a`, and more.  
- **🤖 AI-Powered Analysis** – Uses **Google Gemini 1.5 Pro** for:  
  - High-accuracy audio transcription  
  - Paragraph-based summarization  
  - Extraction of decisions and tasks  
- **💻 Dynamic UI** – Modern, responsive React + Vite interface.  
- **⚙️ Background Processing** – Long-running AI tasks handled asynchronously.  
- **🗂️ Meeting Management** – Track all meeting uploads, their status, and delete when done.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React, Vite, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose) |
| **AI Model** | Google Gemini API (`@google/genai`) |
| **File Handling** | Multer |

---

## 📋 Prerequisites

Before setting up the project, ensure the following are installed:

- **Node.js** (v18.0 or later)
- **npm** (comes with Node.js)
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Google Gemini API Key** (obtain from [Google AI Studio](https://makersuite.google.com/app/apikey))

---

## ⚙️ Installation and Setup

### 🧩 1. Backend Setup

```bash
# Navigate to backend directory
cd path/to/your/backend

# Install dependencies
npm install

# Create environment variables
touch .env
