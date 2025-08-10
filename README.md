
# Notes App - Desktop

A modern, cross-platform notes application built with React, TypeScript, Vite, Electron, and Firebase Authentication (Google Sign-In and Email/Password).

## Features

- Modern React + TypeScript frontend
- Cross-platform desktop app (Electron)
- Responsive design (Tailwind CSS)
- Dark/Light theme support
- Folder organization for notes
- Search, keyboard shortcuts, auto-save
- Export notes as PDF/TXT
- Settings panel for customization
- **Authentication:**
  - Google Sign-In (OAuth)
  - Email/Password login & registration
  - Password reset
  - Persistent login

## Getting Started

### Prerequisites
- Node.js v18+
- npm
- Firebase project (see below)

### Installation & Development
```bash
npm install
npm run dev
```
This will start both the Vite dev server and Electron app together.

### Build
```bash
npm run build
```

## Authentication Setup (Firebase & Google Sign-In)

### 1. Create Firebase Project
- Go to [Firebase Console](https://console.firebase.google.com/)
- Create a new project
- Enable Authentication > Sign-in method > Google & Email/Password
- Add your app's domain to authorized domains

### 2. Google OAuth Credentials
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create OAuth 2.0 Client IDs:
  - Web application (for Firebase)
  - Desktop application (for Electron)
- Add `http://localhost:5173` as an authorized redirect URI

### 3. Environment Variables
- Copy `.env.example` to `.env`
- Fill in your Firebase and Google OAuth credentials:
  ```env
  VITE_FIREBASE_API_KEY=your_firebase_api_key
  VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
  VITE_FIREBASE_PROJECT_ID=your_project_id
  VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
  VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
  VITE_FIREBASE_APP_ID=your_app_id
  GOOGLE_CLIENT_ID=your_desktop_client_id.apps.googleusercontent.com
  GOOGLE_CLIENT_SECRET=your_desktop_client_secret
  ```

### 4. Electron OAuth Setup
- Update `electron/main.ts` with your Google OAuth config
- Ensure redirect URI matches your Google Cloud settings

### 5. Usage
- Click "Sign in with Google" or use email/password in the app
- Authentication state is persistent and available in settings
- Password reset available via email

## Project Structure
```
├── src/                 # React app source
├── electron/            # Electron main & preload scripts
├── dist/                # Built React app
├── dist-electron/       # Built Electron files
└── release/             # Distributable packages
```

## Security Notes
- Never commit your `.env` file with real credentials
- Use environment variables for secrets
- Desktop OAuth client is different from web client

## Technologies Used
- React 18, TypeScript, Vite, Tailwind CSS
- Electron
- Firebase Authentication
- Lucide React icons

## Keyboard Shortcuts
- `Ctrl/Cmd + N` - New note
- `Ctrl/Cmd + Shift + N` - New folder
- `Ctrl/Cmd + S` - Save note
- `Ctrl/Cmd + E` - Export as PDF
- `Ctrl/Cmd + Shift + E` - Export as TXT
- `Ctrl/Cmd + Q` - Quit app

## Settings & Export
- Theme: Light/Dark
- Auto-save: Enable/disable, set interval
- Export: PDF/TXT/JSON

## Authentication Components
- `src/hooks/useAuth.ts` - Main authentication hook
- `src/components/LoginScreen.tsx` - Login/signup modal
- `src/components/AuthStatus.tsx` - Auth status display
- `src/config/firebase-config.ts` - Firebase setup

## Troubleshooting
- Invalid redirect URI: Check Google Cloud OAuth settings
- Invalid client ID: Use desktop client ID for Electron
- Firebase errors: Check config and enabled providers

## License
MIT
