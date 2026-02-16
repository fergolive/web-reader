# 📚 Web Reader - EPUB & PDF Reader

A modern web-based reader for EPUB and PDF files built with Next.js and Firebase.

## ✨ Features

- 📖 Read PDF and EPUB files in your browser
- 🔐 Google Authentication with Firebase
- ☁️ Cloud storage for your books
- 📊 Automatic reading progress tracking
- 🎨 Modern, responsive UI with dark mode support
- 📤 Upload progress indicator

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A Firebase project (free tier works fine)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd web-reader
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use an existing one)
3. Enable **Authentication** > **Google Sign-In**
4. Enable **Firestore Database** (start in test mode for development)
5. Enable **Storage** (start in test mode for development)
6. Go to **Project Settings** > **General** > **Your apps** > **Web app**
7. Copy your Firebase configuration

### 4. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 5. Configure Firebase Storage Rules

In Firebase Console, go to **Storage** > **Rules** and update them:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /books/{userId}/{fileName} {
      allow read: if true;  // Public read access
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 6. Configure Firestore Rules

In Firebase Console, go to **Firestore Database** > **Rules**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /books/{bookId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 7. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## 📖 Usage

1. **Login**: Click "Sign in with Google" on the login page
2. **Upload**: Click "Upload Book" and select a PDF or EPUB file
3. **Read**: Click on any book in your library to start reading
4. **Progress**: Your reading position is automatically saved

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Storage**: Firebase Storage
- **PDF Viewer**: react-pdf
- **EPUB Viewer**: react-reader
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.
