# AI Form Generator

A minimal, clean, and fast AI-powered form generator that converts natural language prompts into structured, ready-to-use web forms. Focused on simplicity, speed, and developer productivity.

## 🚀 Overview

This project lets you generate dynamic forms simply by describing them in plain English. It uses embeddings + semantic search to provide context-aware generation and supports scalable form storage, file uploads, and an easy-to-use shareable form interface.

## ✨ Features

- AI-powered form generation (Groq LLaMA models)  
- Clean JSON schema output  
- Dynamic form rendering (public share links)  
- Image/file upload via Cloudinary  
- Simple authentication (JWT)  
- Semantic search using embeddings  
- Top‑K context retrieval  
- MongoDB storage for forms & submissions  

## 📦 Tech Stack

- **Frontend:** Next.js, TypeScript, Tailwind  
- **Backend:** Express.js, TypeScript  
- **Database:** MongoDB Atlas  
- **AI:** Groq API (LLaMA 3.3)  
- **Storage:** Cloudinary  
- **Deployment:** Vercel + Render  

## 🛠 Installation

```bash
git clone https://github.com/YOUR_USERNAME/ai-form-generator.git
cd ai-form-generator
```

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🔧 Environment Variables

Create `backend/.env`:

```
MONGODB_URI=
GROQ_API_KEY=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
PORT=5000
```

Create `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
```

## ▶️ Usage

1. Log in or sign up  
2. Enter a natural language prompt, e.g.  
   > "Create a job application form with name, email, and resume upload"  
3. AI generates the form schema  
4. Share the public form link  
5. View submissions in the dashboard  

## 📁 Project Structure

```
/backend
  /src
    controllers/
    models/
    routes/
    services/
    utils/
/frontend
  /app
  /components
  /lib
```

## 📄 License

MIT License. Free to use and modify.

---

Minimal, simple, scalable. Perfect for production or learning.
