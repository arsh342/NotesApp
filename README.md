
# 🗒️ Notes App - Modern Desktop Application

A beautiful, modern cross-platform notes application built with React, TypeScript, Vite, Electron, and Firebase Authentication. Features a sophisticated UI with liquid glass effects, context menus, and professional text editing capabilities.

## ✨ Features

### 📝 **Core Functionality**
- **Rich Text Editor** with formatting tools (bold, italic, underline, highlight)
- **Folder Organization** for structured note management
- **Search & Filter** with real-time results
- **Auto-save** with customizable intervals
- **Export Options** (PDF, TXT, JSON)
- **Keyboard Shortcuts** for power users

### 🔐 **Authentication**
- **Google Sign-In** (OAuth)
- **Email/Password** login & registration
- **Password Reset** functionality
- **Persistent Login** sessions

### 🎨 **Modern UI Design**
- **macOS Sequoia Liquid Glass** effects with vibrant transparency
- **Dynamic Blur** and glass morphism
- **Black & Grey Theme** with colorful accent buttons
- **Smooth Animations** and transitions
- **Dark/Light Mode** support
- **Responsive Design** for all screen sizes

### 🖱️ **Context Menu (MS Word-style)**
- **Right-click** on selected text for instant formatting
- **Text Operations**: Copy, Cut, Paste, Delete
- **Formatting Tools**: Bold, Italic, Underline, Highlight
- **Smart Detection**: Menu adapts based on text selection
- **Keyboard Shortcuts** displayed for each action

### ⚙️ **Advanced Settings**
- **Theme Customization** (Light/Dark)
- **Editor Preferences** (Font size, family, line height)
- **Auto-save Configuration**
- **Keyboard Shortcuts** customization
- **Export Preferences**

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm or yarn
- Firebase project (for authentication)

### Installation & Development
```bash
# Clone the repository
git clone https://github.com/arsh342/Notes-App.git
cd Notes-App

# Install dependencies
npm install

# Start development server
npm run dev
```

This starts both the Vite dev server and Electron app.

### Build for Production
```bash
npm run build
```

## 🔧 Firebase & Authentication Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication → Sign-in methods → Google & Email/Password
4. Add your domain to authorized domains

### 2. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 Client IDs:
   - **Web application** (for Firebase)
   - **Desktop application** (for Electron)
3. Add `http://localhost:5173` as authorized redirect URI

### 3. Environment Configuration
Copy `.env.example` to `.env` and fill in your credentials:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
GOOGLE_CLIENT_ID=your_desktop_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_desktop_client_secret
```

## 🎨 UI Design Features

### **Liquid Glass Effects**
- **Semi-transparent backgrounds** with backdrop blur
- **Vibrancy overlays** for depth
- **Dynamic saturation** and brightness adjustments
- **Smooth material transitions**

### **Modern Components**
- **20px border radius** buttons for pill-like appearance
- **Gradient backgrounds** and shadow effects
- **Hover animations** with scale transformations
- **Icon rotations** and smooth transitions

### **Color Scheme**
- **Light Mode**: Clean grays with vibrant accent colors
- **Dark Mode**: Deep blacks with bright accents
- **Colorful Buttons**: Blue primary, green success, red danger
- **Smart Contrasts** for accessibility

### **Animations & Transitions**
- **Fade-in** effects for new elements
- **Slide-in** animations for sidebar
- **Pulse** effects for loading states
- **Smooth scaling** on hover

## ⌨️ Keyboard Shortcuts

### **File Operations**
- `Ctrl/Cmd + N` - New note
- `Ctrl/Cmd + Shift + N` - New folder
- `Ctrl/Cmd + S` - Save note
- `Ctrl/Cmd + Shift + B` - Toggle sidebar

### **Text Formatting**
- `Ctrl/Cmd + B` - Bold
- `Ctrl/Cmd + I` - Italic
- `Ctrl/Cmd + U` - Underline
- `Ctrl/Cmd + F` - Find in notes

### **Export & App**
- `Ctrl/Cmd + E` - Export as PDF
- `Ctrl/Cmd + Shift + E` - Export as TXT
- `Ctrl/Cmd + Q` - Quit app

## 🖱️ Context Menu Usage

### **How to Use**
1. **Select text** in the note editor
2. **Right-click** to open context menu
3. **Choose action** from the menu
4. **Menu closes** automatically

### **Available Actions**
- **Copy/Cut/Paste** - Standard clipboard operations
- **Bold/Italic/Underline** - Quick formatting
- **Highlight** - Add yellow background
- **Delete** - Remove selected text

## 📁 Project Structure

```
Notes-App/
├── src/                          # React app source
│   ├── components/              # UI components
│   │   ├── ContextMenu.tsx     # Right-click context menu
│   │   ├── NoteEditor.tsx      # Rich text editor
│   │   ├── NotesList.tsx       # Notes sidebar
│   │   └── LoginScreen.tsx     # Authentication
│   ├── contexts/               # React contexts
│   ├── hooks/                  # Custom hooks
│   ├── types/                  # TypeScript types
│   └── utils/                  # Utility functions
├── electron/                    # Electron main process
├── dist/                       # Built React app
├── dist-electron/              # Built Electron files
└── public/                     # Static assets
```

## 🔧 Technologies Used

### **Frontend**
- **React 18** with TypeScript
- **Vite** for fast builds
- **Tailwind CSS** for styling
- **Lucide React** for icons

### **Desktop**
- **Electron** for cross-platform desktop app
- **Concurrently** for running dev processes

### **Authentication**
- **Firebase Authentication**
- **Google OAuth 2.0**

### **Styling**
- **CSS Custom Properties** for theming
- **Backdrop-filter** for glass effects
- **CSS Animations** for smooth transitions

## 🛡️ Security Features

- **Environment variables** for sensitive data
- **Firebase security rules** for authentication
- **Content Security Policy** for Electron
- **OAuth 2.0** secure authentication flow

## 🎯 Performance Optimizations

- **Lazy loading** of components
- **Debounced search** for performance
- **Efficient re-renders** with React hooks
- **Auto-save throttling** to prevent spam

## 🔍 Troubleshooting

### **Authentication Issues**
- Check Firebase configuration in `.env`
- Verify Google OAuth client IDs
- Ensure authorized domains are set

### **UI Issues**
- Clear browser cache and restart
- Check for console errors
- Verify all dependencies are installed

### **Build Issues**
- Delete `node_modules` and reinstall
- Check Node.js version compatibility
- Verify environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using modern web technologies for a beautiful, productive note-taking experience.**
