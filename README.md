🎤 Meeting Summarizer AI
An intelligent web application that transcribes and summarizes your meeting audio files. Upload an audio recording, and the application will use Google's Gemini AI to provide a full transcript, a concise summary, key decisions, and a list of action items.

This project is a full-stack application built with a React frontend and a Node.js/Express backend.

✨ Features
Secure User Authentication: JWT-based login and registration system.

Drag & Drop File Uploads: Easily upload your meeting audio files (.mp3, .wav, .m4a, etc.).

AI-Powered Analysis: Utilizes the Google Gemini 1.5 Pro model for:

Accurate audio transcription.

Concise, paragraph-based summaries.

Extraction of key decisions.

Identification of actionable items with assignees and priorities.

Dynamic UI: A responsive and modern user interface built with React and Vite.

Background Processing: Long-running AI tasks are handled in the background, allowing you to continue using the app without waiting.

Meeting Management: View a list of all your recent meetings, see their processing status, and delete them when no longer needed.

🛠️ Tech Stack
Frontend: React, Vite, Axios

Backend: Node.js, Express.js

Database: MongoDB (with Mongoose)

AI: Google Gemini API (@google/genai)

File Uploads: Multer

📋 Prerequisites
Before you begin, ensure you have the following installed:

Node.js (v18.0 or later recommended)

npm (comes with Node.js)

MongoDB (or a MongoDB Atlas cloud instance)

You will also need an API Key from Google AI Studio.

⚙️ Installation and Setup
Follow these steps to get the project running on your local machine.

1. Backend Setup
First, set up and run the server.

Bash

# 1. Navigate to the backend directory
cd path/to/your/backend

# 2. Install the required dependencies
npm install

# 3. Create an environment file
# Create a file named .env in the backend directory and add the following,
# replacing the placeholder values with your actual credentials.

GEMINI_API_KEY=your_google_gemini_api_key_here
MONGODB_URI=your_mongodb_connection_string_here
PORT=5000

# 4. Start the backend server
npm start
The server will be running at http://localhost:5000.

2. Frontend Setup
Next, set up and run the React application.

Bash

# 1. Open a new terminal and navigate to the frontend directory
cd path/to/your/frontend

# 2. Install the required dependencies
npm install

# 3. (Optional) Create a vite.config.js file for proxying API requests
# This is the recommended setup for development. Create a vite.config.js
# file in the frontend root and add the following:

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Your backend server
        changeOrigin: true,
      },
    },
  },
});


# 4. Start the frontend development server
npm run dev
The application will be available at http://localhost:3000.

🚀 Running the Application
Make sure both the backend and frontend servers are running in their respective terminals.

Open your web browser and navigate to http://localhost:3000.

You can now upload audio files and view the generated summaries.