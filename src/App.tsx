import { useState, useEffect, useCallback } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { SettingsProvider } from "./contexts/SettingsContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NotesList } from "./components/NotesList";
import { NoteEditor } from "./components/NoteEditor";
import LoginScreen from "./components/LoginScreen";
import { useNotes } from "./hooks/useNotes";
import { useAuth } from "./hooks/useAuth";
import { Note } from "./types/Note";
import SettingsPage from "./pages/SettingsPage";
import { auth } from "./config/firebase-config";

function RequireAuth({
  user,
  children,
  authAvailable,
}: {
  user: any;
  children: JSX.Element;
  authAvailable: boolean;
}) {
  const location = useLocation();

  // If auth is not available (Firebase not configured), allow access without authentication
  if (!authAvailable) {
    return children;
  }

  // If auth is available but user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  console.log("App component mounting...");

  // Add try-catch around hooks to prevent white screen
  let notes, folders, selectedNote, selectedFolderId;
  let setSelectedNote, setSelectedFolderId, createNote, updateNote, deleteNote;
  let createFolder, updateFolder, deleteFolder, toggleFolder;
  let user, loading;
  let authAvailable = false;

  try {
    const notesHook = useNotes();
    notes = notesHook.notes;
    folders = notesHook.folders;
    selectedNote = notesHook.selectedNote;
    selectedFolderId = notesHook.selectedFolderId;
    setSelectedNote = notesHook.setSelectedNote;
    setSelectedFolderId = notesHook.setSelectedFolderId;
    createNote = notesHook.createNote;
    updateNote = notesHook.updateNote;
    deleteNote = notesHook.deleteNote;
    createFolder = notesHook.createFolder;
    updateFolder = notesHook.updateFolder;
    deleteFolder = notesHook.deleteFolder;
    toggleFolder = notesHook.toggleFolder;

    const authHook = useAuth();
    user = authHook.user;
    loading = authHook.loading;

    // Check if Firebase auth is available
    authAvailable = !!auth;

    console.log("App state:", { user: !!user, loading, authAvailable });
  } catch (error) {
    console.error("Error in App hooks:", error);
    // Show error message instead of white screen
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Application Error
          </h1>
          <p className="text-gray-600 mb-4">
            Failed to initialize the application.
          </p>
          <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
            {error instanceof Error ? error.message : String(error)}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentSearchTerm, setCurrentSearchTerm] = useState<
    string | undefined
  >(undefined);

  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem("sidebarWidth");
    return saved ? parseInt(saved, 10) : 320;
  });
  const [isResizing, setIsResizing] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(() => {
    const saved = localStorage.getItem("sidebarVisible");
    return saved !== null ? saved === "true" : true;
  });

  // Save sidebar width to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("sidebarWidth", sidebarWidth.toString());
  }, [sidebarWidth]);

  // Save sidebar visibility to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("sidebarVisible", isSidebarVisible.toString());
  }, [isSidebarVisible]);

  // Handle mouse events for resizing
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = e.clientX;
      const minWidth = 200;
      const maxWidth = 600;

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setSidebarWidth(newWidth);
      }
    },
    [isResizing]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Handle keyboard shortcut for toggling sidebar (Ctrl/Cmd + Shift + B)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.key === "B" || e.key === "b")
      ) {
        e.preventDefault();
        e.stopPropagation();
        setIsSidebarVisible((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown, true); // Use capture phase
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, []);

  // Electron integration
  useEffect(() => {
    if (typeof window !== "undefined" && window.electronAPI) {
      // Handle menu events from Electron
      window.electronAPI.onMenuNewNote(() => {
        handleCreateNote(selectedFolderId);
      });

      window.electronAPI.onMenuSave(() => {
        // Save current note if any
        if (selectedNote) {
          updateNote(selectedNote);
        }
      });

      window.electronAPI.onMenuNewFolder(() => {
        // Create folder with default name
        const defaultName = `New Folder ${folders.length + 1}`;
        createFolder(defaultName, selectedFolderId);
      });

      window.electronAPI.onMenuExportPDF(() => {
        // Trigger PDF export for current note
        if (selectedNote) {
          // Import the export function and use it directly
          import("./utils/exportUtils").then(({ exportToPDF }) => {
            exportToPDF(selectedNote);
          });
        }
      });

      window.electronAPI.onMenuExportTXT(() => {
        // Trigger TXT export for current note
        if (selectedNote) {
          // Import the export function and use it directly
          import("./utils/exportUtils").then(({ exportToTXT }) => {
            exportToTXT(selectedNote);
          });
        }
      });

      // Cleanup listeners on unmount
      return () => {
        if (window.electronAPI) {
          window.electronAPI.removeAllListeners("menu-new-note");
          window.electronAPI.removeAllListeners("menu-save");
          window.electronAPI.removeAllListeners("menu-new-folder");
          window.electronAPI.removeAllListeners("menu-export-pdf");
          window.electronAPI.removeAllListeners("menu-export-txt");
        }
      };
    }
  }, [selectedNote, selectedFolderId, updateNote, createNote]);

  const handleCreateNote = (folderId: string | null = null) => {
    createNote(folderId);
  };

  const handleSelectFolder = (folderId: string | null) => {
    setSelectedFolderId(folderId);
    // Clear note selection when switching folders
    setSelectedNote(null);
    setCurrentSearchTerm(undefined);
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    // If there's an active search query, use it for highlighting in the editor
    if (searchQuery.trim()) {
      setCurrentSearchTerm(searchQuery.trim());
      // Clear the search term after highlighting
      setTimeout(() => setCurrentSearchTerm(undefined), 3000);
    } else {
      setCurrentSearchTerm(undefined);
    }
  };

  // Handle navigation to text from search references
  const handleNavigateToText = (note: Note, searchTerm: string) => {
    setSelectedNote(note);
    if (searchTerm.trim()) {
      setCurrentSearchTerm(searchTerm.trim());
      // Clear the search term after a short delay to allow highlighting
      setTimeout(() => setCurrentSearchTerm(undefined), 3000);
    }
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-screen fade-in"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <div className="text-center fade-in">
          {/* Animated logo/icon with modern styling */}
          <div
            className="w-20 h-20 mx-auto mb-8 rounded-2xl flex items-center justify-center pulse shadow-lg"
            style={{
              backgroundColor: "var(--accent)",
              boxShadow: "0 10px 40px var(--shadow-lg)",
            }}
          >
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>

          {/* Loading text */}
          <h2
            className="text-2xl font-bold mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            Loading Notes
          </h2>
          <p
            className="text-base mb-6"
            style={{ color: "var(--text-secondary)" }}
          >
            Authenticating and setting up your workspace...
          </p>

          {/* Loading animation */}
          <div className="flex justify-center">
            <div className="flex space-x-2">
              <div
                className="w-3 h-3 rounded-full animate-bounce"
                style={{
                  backgroundColor: "var(--accent)",
                  animationDelay: "0ms",
                }}
              ></div>
              <div
                className="w-3 h-3 rounded-full animate-bounce"
                style={{
                  backgroundColor: "var(--accent)",
                  animationDelay: "150ms",
                }}
              ></div>
              <div
                className="w-3 h-3 rounded-full animate-bounce"
                style={{
                  backgroundColor: "var(--accent)",
                  animationDelay: "300ms",
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <ThemeProvider>
      <SettingsProvider>
        <Router>
          <Routes>
            <Route
              path="/login"
              element={
                authAvailable ? (
                  user ? (
                    <Navigate to="/" replace />
                  ) : (
                    <LoginScreen />
                  )
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/"
              element={
                <RequireAuth user={user} authAvailable={authAvailable}>
                  <div
                    className="h-screen flex overflow-hidden fade-in"
                    style={{ background: "var(--bg-primary)" }}
                  >
                    <div className="flex flex-col w-full relative">
                      <div className="flex flex-1 h-full">
                        {/* Resizable sidebar with liquid glass effect */}
                        {isSidebarVisible && (
                          <>
                            <div
                              className="flex flex-col h-full relative slide-in-left backdrop-blur-xl"
                              style={{
                                width: `${sidebarWidth}px`,
                              }}
                            >
                              <NotesList
                                notes={notes}
                                folders={folders}
                                selectedNote={selectedNote}
                                selectedFolderId={selectedFolderId}
                                onSelectNote={handleSelectNote}
                                onSelectFolder={handleSelectFolder}
                                onCreateNote={handleCreateNote}
                                onCreateFolder={createFolder}
                                onUpdateFolder={updateFolder}
                                onDeleteFolder={deleteFolder}
                                onToggleFolder={toggleFolder}
                                onDeleteNote={deleteNote}
                                searchQuery={searchQuery}
                                onSearchChange={setSearchQuery}
                                selectedCategory={selectedCategory}
                                onCategoryChange={setSelectedCategory}
                                onNavigateToText={handleNavigateToText}
                              />
                            </div>

                            {/* Resize handle with liquid glass effect */}
                            <div
                              className="w-1 cursor-col-resize transition-all duration-300 relative group"
                              style={{
                                backgroundColor: "var(--border)",
                                boxShadow: "0 0 8px rgba(0, 0, 0, 0.05)",
                              }}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setIsResizing(true);
                              }}
                            >
                              <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300"
                                style={{
                                  backgroundColor: "var(--accent)",
                                  boxShadow: "0 0 12px var(--accent)",
                                }}
                              />
                            </div>
                          </>
                        )}

                        {/* Main content area with liquid glass styling */}
                        <div
                          className="flex-1 h-full overflow-auto fade-in"
                          style={{ background: "var(--bg-primary)" }}
                        >
                          <NoteEditor
                            note={selectedNote}
                            onSave={updateNote}
                            searchTerm={currentSearchTerm}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </RequireAuth>
              }
            />
            <Route
              path="/settings"
              element={
                <RequireAuth user={user} authAvailable={authAvailable}>
                  <SettingsPage />
                </RequireAuth>
              }
            />
          </Routes>
        </Router>
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;
