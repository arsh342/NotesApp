import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  LogOut,
  Sun,
  Moon,
  Monitor,
  HardDrive,
  Palette,
  Settings as SettingsIcon,
  UserIcon,
  Type,
  Eye,
  Save,
  Keyboard,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useSettings } from "../contexts/SettingsContext";
import { useTheme } from "../contexts/ThemeContext";
import LoginScreen from "../components/LoginScreen";

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();

  const {
    autoSave,
    setAutoSave,
    autoSaveInterval,
    setAutoSaveInterval,
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
    lineHeight,
    setLineHeight,
    wordWrap,
    setWordWrap,
    showLineNumbers,
    setShowLineNumbers,
    tabSize,
    setTabSize,
    minimap,
    setMinimap,
    bracketMatching,
    setBracketMatching,
    autoIndent,
    setAutoIndent,
    shortcuts,
    updateShortcut,
    resetShortcuts,
  } = useSettings();

  const { theme, setTheme } = useTheme();
  const [showLoginScreen, setShowLoginScreen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<
    "account" | "appearance" | "editor" | "shortcuts" | "storage" | "about"
  >("account");

  // Shortcuts state
  const [editingShortcut, setEditingShortcut] = useState<string | null>(null);
  const [tempKeys, setTempKeys] = useState<string>("");

  const categories = [
    { id: "account", label: "Account", icon: UserIcon },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "editor", label: "Editor", icon: SettingsIcon },
    { id: "shortcuts", label: "Shortcuts", icon: Keyboard },
    { id: "storage", label: "Storage", icon: HardDrive },
    { id: "about", label: "About", icon: Monitor },
  ];

  function renderAccountSettings() {
    return (
      <div className="space-y-6">
        <div
          className="rounded-xl p-6 border"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border)",
          }}
        >
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="w-16 h-16 rounded-full object-cover border-2"
                    style={{ borderColor: "var(--accent)" }}
                    crossOrigin="anonymous"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      target.nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                ) : null}
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    user.photoURL ? "hidden" : ""
                  }`}
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  <User className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {user.displayName || "User"}
                  </h3>
                  <p
                    className="flex items-center space-x-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <Mail size={16} />
                    <span>{user.email}</span>
                  </p>
                  <div className="mt-2 flex items-center space-x-4 text-sm">
                    <span
                      className="flex items-center space-x-1"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          user.emailVerified ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      <span>
                        {user.emailVerified ? "Verified" : "Unverified"}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => signOut()}
                disabled={authLoading}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: "var(--bg-destructive)",
                  color: "white",
                }}
              >
                <LogOut size={16} />
                <span>{authLoading ? "Signing out..." : "Sign Out"}</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <User
                size={48}
                className="mx-auto mb-4"
                style={{ color: "var(--text-secondary)" }}
              />
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Sign in to sync your notes
              </h3>
              <p className="mb-4" style={{ color: "var(--text-secondary)" }}>
                Connect your account to save notes in the cloud
              </p>
              <button
                onClick={() => setShowLoginScreen(true)}
                className="px-6 py-2 rounded-lg text-white transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: "var(--accent)" }}
              >
                Sign In
              </button>
            </div>
          )}
        </div>

        {showLoginScreen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-md mx-4">
              <LoginScreen onClose={() => setShowLoginScreen(false)} />
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderAppearanceSettings() {
    return (
      <div className="space-y-6">
        <div
          className="rounded-xl p-6 border"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border)",
          }}
        >
          <h3
            className="text-lg font-semibold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Theme
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setTheme("light")}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                theme === "light" ? "scale-105" : "hover:scale-105"
              }`}
              style={{
                borderColor:
                  theme === "light" ? "var(--accent)" : "var(--border)",
                backgroundColor:
                  theme === "light" ? "var(--accent)" : "var(--bg-primary)",
              }}
            >
              <Sun
                size={24}
                className={`mx-auto mb-2 ${
                  theme === "light" ? "text-white" : ""
                }`}
                style={{
                  color: theme === "light" ? "white" : "var(--text-primary)",
                }}
              />
              <span
                className={`font-medium ${
                  theme === "light" ? "text-white" : ""
                }`}
                style={{
                  color: theme === "light" ? "white" : "var(--text-primary)",
                }}
              >
                Light
              </span>
            </button>

            <button
              onClick={() => setTheme("dark")}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                theme === "dark" ? "scale-105" : "hover:scale-105"
              }`}
              style={{
                borderColor:
                  theme === "dark" ? "var(--accent)" : "var(--border)",
                backgroundColor:
                  theme === "dark" ? "var(--accent)" : "var(--bg-primary)",
              }}
            >
              <Moon
                size={24}
                className={`mx-auto mb-2 ${
                  theme === "dark" ? "text-white" : ""
                }`}
                style={{
                  color: theme === "dark" ? "white" : "var(--text-primary)",
                }}
              />
              <span
                className={`font-medium ${
                  theme === "dark" ? "text-white" : ""
                }`}
                style={{
                  color: theme === "dark" ? "white" : "var(--text-primary)",
                }}
              >
                Dark
              </span>
            </button>

            <button
              onClick={() => setTheme("system")}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                theme === "system" ? "scale-105" : "hover:scale-105"
              }`}
              style={{
                borderColor:
                  theme === "system" ? "var(--accent)" : "var(--border)",
                backgroundColor:
                  theme === "system" ? "var(--accent)" : "var(--bg-primary)",
              }}
            >
              <Monitor
                size={24}
                className={`mx-auto mb-2 ${
                  theme === "system" ? "text-white" : ""
                }`}
                style={{
                  color: theme === "system" ? "white" : "var(--text-primary)",
                }}
              />
              <span
                className={`font-medium ${
                  theme === "system" ? "text-white" : ""
                }`}
                style={{
                  color: theme === "system" ? "white" : "var(--text-primary)",
                }}
              >
                System
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderShortcutsSettings() {
    const handleKeyCapture = (e: React.KeyboardEvent) => {
      e.preventDefault();
      const keys: string[] = [];

      if (e.metaKey) keys.push("Cmd");
      if (e.ctrlKey && !e.metaKey) keys.push("Ctrl");
      if (e.altKey) keys.push("Alt");
      if (e.shiftKey) keys.push("Shift");

      if (
        e.key !== "Meta" &&
        e.key !== "Control" &&
        e.key !== "Alt" &&
        e.key !== "Shift"
      ) {
        const key = e.key === " " ? "Space" : e.key;
        keys.push(key);
      }

      setTempKeys(keys.join("+"));
    };

    const saveShortcut = (id: string) => {
      if (tempKeys) {
        updateShortcut(id, tempKeys);
      }
      setEditingShortcut(null);
      setTempKeys("");
    };

    const cancelEdit = () => {
      setEditingShortcut(null);
      setTempKeys("");
    };

    const startEdit = (shortcut: any) => {
      setEditingShortcut(shortcut.id);
      setTempKeys(shortcut.keys);
    };

    const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = [];
      }
      acc[shortcut.category].push(shortcut);
      return acc;
    }, {} as Record<string, typeof shortcuts>);

    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <h3
            className="text-xl font-semibold"
            style={{ color: "var(--color-text)" }}
          >
            Keyboard Shortcuts
          </h3>
          <button
            onClick={resetShortcuts}
            className="px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: "var(--color-accent)",
              color: "white",
            }}
          >
            Reset to Defaults
          </button>
        </div>

        {Object.entries(groupedShortcuts).map(
          ([category, categoryShortcuts]) => (
            <div
              key={category}
              className="rounded-xl p-6 border"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border)",
              }}
            >
              <h4
                className="text-lg font-medium mb-4 capitalize"
                style={{ color: "var(--color-text)" }}
              >
                {category} Shortcuts
              </h4>
              <div className="space-y-3">
                {categoryShortcuts.map((shortcut) => (
                  <div
                    key={shortcut.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-medium truncate"
                        style={{ color: "var(--color-text)" }}
                      >
                        {shortcut.name}
                      </div>
                      <div
                        className="text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {shortcut.description}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {editingShortcut === shortcut.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={tempKeys}
                            onKeyDown={handleKeyCapture}
                            placeholder="Press keys..."
                            className="px-3 py-1 rounded border text-center w-32"
                            style={{
                              backgroundColor: "var(--color-background)",
                              borderColor: "var(--color-border)",
                              color: "var(--color-text)",
                            }}
                            autoFocus
                          />
                          <button
                            onClick={() => saveShortcut(shortcut.id)}
                            className="px-2 py-1 rounded text-xs whitespace-nowrap"
                            style={{
                              backgroundColor: "var(--color-accent)",
                              color: "white",
                            }}
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-2 py-1 rounded text-xs whitespace-nowrap"
                            style={{
                              backgroundColor: "var(--color-surface)",
                              borderColor: "var(--color-border)",
                              color: "var(--color-text)",
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <kbd
                            className="px-2 py-1 rounded text-sm font-mono border whitespace-nowrap"
                            style={{
                              backgroundColor: "var(--color-background)",
                              borderColor: "var(--color-border)",
                              color: "var(--color-text)",
                            }}
                          >
                            {shortcut.keys}
                          </kbd>
                          <button
                            onClick={() => startEdit(shortcut)}
                            className="px-2 py-1 rounded text-xs whitespace-nowrap"
                            style={{
                              backgroundColor: "var(--color-surface)",
                              borderColor: "var(--color-border)",
                              color: "var(--color-accent)",
                            }}
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {/* Reset to Defaults Button */}
        <div
          className="rounded-xl p-6 border"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h4
                className="font-medium mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                Reset Shortcuts
              </h4>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Reset all keyboard shortcuts to their default values
              </p>
            </div>
            <button
              onClick={() => {
                if (
                  confirm(
                    "Are you sure you want to reset all shortcuts to defaults?"
                  )
                ) {
                  resetShortcuts();
                }
              }}
              className="px-4 py-2 rounded-lg border text-sm font-medium transition-colors hover:opacity-80"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderEditorSettings() {
    const fontFamilyOptions = [
      { label: "Inter (Default)", value: "Inter, system-ui, sans-serif" },
      { label: "System Font", value: "system-ui, -apple-system, sans-serif" },
      { label: "Fira Code", value: "'Fira Code', 'Consolas', monospace" },
      {
        label: "JetBrains Mono",
        value: "'JetBrains Mono', 'Consolas', monospace",
      },
      { label: "Monaco", value: "'Monaco', 'Consolas', monospace" },
      { label: "Roboto", value: "'Roboto', sans-serif" },
    ];

    return (
      <div className="space-y-6">
        {/* Auto-Save Settings */}
        <div
          className="rounded-xl p-6 border"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border)",
          }}
        >
          <h3
            className="text-lg font-semibold mb-4 flex items-center"
            style={{ color: "var(--text-primary)" }}
          >
            <Save size={20} className="mr-2" />
            Auto-Save
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label
                  className="font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Enable Auto-Save
                </label>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Automatically save changes while typing
                </p>
              </div>
              <button
                onClick={() => setAutoSave(!autoSave)}
                className={`relative w-12 h-6 rounded-full transition-all duration-200 ${
                  autoSave ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <div
                  className={`absolute w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 top-0.5 ${
                    autoSave ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {autoSave && (
              <div>
                <label
                  className="block font-medium mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Auto-Save Interval: {autoSaveInterval / 1000}s
                </label>
                <input
                  type="range"
                  min="1000"
                  max="30000"
                  step="1000"
                  value={autoSaveInterval}
                  onChange={(e) => setAutoSaveInterval(Number(e.target.value))}
                  className="w-full"
                  style={{ accentColor: "var(--accent)" }}
                />
                <div
                  className="flex justify-between text-sm mt-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span>1s</span>
                  <span>30s</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Typography Settings */}
        <div
          className="rounded-xl p-6 border"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border)",
          }}
        >
          <h3
            className="text-lg font-semibold mb-4 flex items-center"
            style={{ color: "var(--text-primary)" }}
          >
            <Type size={20} className="mr-2" />
            Typography
          </h3>

          <div className="space-y-6">
            {/* Font Family */}
            <div>
              <label
                className="block font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Font Family
              </label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full p-3 rounded-lg border transition-colors"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                {fontFamilyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Size */}
            <div>
              <label
                className="block font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Font Size: {fontSize}px
              </label>
              <input
                type="range"
                min="10"
                max="24"
                step="1"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: "var(--accent)" }}
              />
              <div
                className="flex justify-between text-sm mt-1"
                style={{ color: "var(--text-secondary)" }}
              >
                <span>10px</span>
                <span>24px</span>
              </div>
            </div>

            {/* Line Height */}
            <div>
              <label
                className="block font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Line Height: {lineHeight}
              </label>
              <input
                type="range"
                min="1.2"
                max="2.0"
                step="0.1"
                value={lineHeight}
                onChange={(e) => setLineHeight(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: "var(--accent)" }}
              />
              <div
                className="flex justify-between text-sm mt-1"
                style={{ color: "var(--text-secondary)" }}
              >
                <span>1.2</span>
                <span>2.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Editor Behavior */}
        <div
          className="rounded-xl p-6 border"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border)",
          }}
        >
          <h3
            className="text-lg font-semibold mb-4 flex items-center"
            style={{ color: "var(--text-primary)" }}
          >
            <SettingsIcon size={20} className="mr-2" />
            Editor Behavior
          </h3>

          <div className="space-y-4">
            {/* Word Wrap */}
            <div className="flex items-center justify-between">
              <div>
                <label
                  className="font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Word Wrap
                </label>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Wrap long lines to fit in the editor
                </p>
              </div>
              <button
                onClick={() => setWordWrap(!wordWrap)}
                className={`relative w-12 h-6 rounded-full transition-all duration-200 ${
                  wordWrap ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <div
                  className={`absolute w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 top-0.5 ${
                    wordWrap ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Auto Indent */}
            <div className="flex items-center justify-between">
              <div>
                <label
                  className="font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Auto Indent
                </label>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Automatically indent new lines
                </p>
              </div>
              <button
                onClick={() => setAutoIndent(!autoIndent)}
                className={`relative w-12 h-6 rounded-full transition-all duration-200 ${
                  autoIndent ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <div
                  className={`absolute w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 top-0.5 ${
                    autoIndent ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Tab Size */}
            <div>
              <label
                className="block font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Tab Size: {tabSize} spaces
              </label>
              <input
                type="range"
                min="2"
                max="8"
                step="2"
                value={tabSize}
                onChange={(e) => setTabSize(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: "var(--accent)" }}
              />
              <div
                className="flex justify-between text-sm mt-1"
                style={{ color: "var(--text-secondary)" }}
              >
                <span>2</span>
                <span>4</span>
                <span>6</span>
                <span>8</span>
              </div>
            </div>
          </div>
        </div>

        {/* Display Options */}
        <div
          className="rounded-xl p-6 border"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border)",
          }}
        >
          <h3
            className="text-lg font-semibold mb-4 flex items-center"
            style={{ color: "var(--text-primary)" }}
          >
            <Eye size={20} className="mr-2" />
            Display Options
          </h3>

          <div className="space-y-4">
            {/* Line Numbers */}
            <div className="flex items-center justify-between">
              <div>
                <label
                  className="font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Show Line Numbers
                </label>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Display line numbers in the editor
                </p>
              </div>
              <button
                onClick={() => setShowLineNumbers(!showLineNumbers)}
                className={`relative w-12 h-6 rounded-full transition-all duration-200 ${
                  showLineNumbers
                    ? "bg-blue-500"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <div
                  className={`absolute w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 top-0.5 ${
                    showLineNumbers ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Minimap */}
            <div className="flex items-center justify-between">
              <div>
                <label
                  className="font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Minimap
                </label>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Show a minimap of the document
                </p>
              </div>
              <button
                onClick={() => setMinimap(!minimap)}
                className={`relative w-12 h-6 rounded-full transition-all duration-200 ${
                  minimap ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <div
                  className={`absolute w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 top-0.5 ${
                    minimap ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Bracket Matching */}
            <div className="flex items-center justify-between">
              <div>
                <label
                  className="font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Bracket Matching
                </label>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Highlight matching brackets
                </p>
              </div>
              <button
                onClick={() => setBracketMatching(!bracketMatching)}
                className={`relative w-12 h-6 rounded-full transition-all duration-200 ${
                  bracketMatching
                    ? "bg-blue-500"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <div
                  className={`absolute w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 top-0.5 ${
                    bracketMatching ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderStorageSettings() {
    return (
      <div className="space-y-6">
        <div
          className="rounded-xl p-6 border"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border)",
          }}
        >
          <h3
            className="text-lg font-semibold mb-4 flex items-center"
            style={{ color: "var(--text-primary)" }}
          >
            <HardDrive size={20} className="mr-2" />
            Local Storage
          </h3>

          <div className="space-y-4">
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: "var(--bg-primary)" }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Notes Data
                </span>
                <span
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Stored locally
                </span>
              </div>
              <p
                className="text-sm mt-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Your notes are saved in your browser's local storage
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderAboutSettings() {
    return (
      <div className="space-y-6">
        <div
          className="rounded-xl p-6 border"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border)",
          }}
        >
          <h3
            className="text-lg font-semibold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Notes App
          </h3>

          <div className="space-y-4">
            <div>
              <p
                className="font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Version 1.0.0
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                A modern note-taking application built with React and Electron
              </p>
            </div>

            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: "var(--bg-primary)" }}
            >
              <h4
                className="font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Features
              </h4>
              <ul
                className="text-sm space-y-1"
                style={{ color: "var(--text-secondary)" }}
              >
                <li>• Rich text editing with formatting tools</li>
                <li>• Folder organization and categorization</li>
                <li>• Search functionality</li>
                <li>• Dark and light themes</li>
                <li>• Auto-save capabilities</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderSettingsContent() {
    switch (activeCategory) {
      case "account":
        return renderAccountSettings();
      case "appearance":
        return renderAppearanceSettings();
      case "editor":
        return renderEditorSettings();
      case "shortcuts":
        return renderShortcutsSettings();
      case "storage":
        return renderStorageSettings();
      case "about":
        return renderAboutSettings();
      default:
        return null;
    }
  }

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      {/* Header */}
      <header className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <ArrowLeft size={20} style={{ color: "var(--text-primary)" }} />
          </button>
          <h1
            className="text-xl font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Settings
          </h1>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <aside
          className="w-64 border-r p-4"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border)",
          }}
        >
          <nav className="space-y-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;

              return (
                <button
                  key={category.id}
                  onClick={() =>
                    setActiveCategory(category.id as typeof activeCategory)
                  }
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                    isActive ? "scale-105" : "hover:scale-105"
                  }`}
                  style={{
                    backgroundColor: isActive ? "var(--accent)" : "transparent",
                    color: isActive ? "white" : "var(--text-primary)",
                  }}
                >
                  <Icon size={18} />
                  <span className="font-medium">{category.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {renderSettingsContent()}
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
