import React, { useState, useEffect } from "react";
import {
  Search,
  FilePlus,
  FolderPlus,
  MoreHorizontal,
  Upload,
  Download,
  FileText,
  Settings,
} from "lucide-react";
import { Note, Folder } from "../types/Note";
import { FolderTree } from "./FolderTree";
import { ImportModal } from "./ImportModal";
import { SearchReferences } from "./SearchReferences";
import { exportAllNotesToTXT } from "../utils/exportUtils";
import { useNavigate } from "react-router-dom";

interface NotesListProps {
  notes: Note[];
  folders: Folder[];
  selectedNote: Note | null;
  selectedFolderId: string | null;
  onSelectNote: (note: Note) => void;
  onSelectFolder: (folderId: string | null) => void;
  onCreateNote: (folderId?: string | null) => void;
  onCreateFolder: (name: string, parentId: string | null) => void;
  onUpdateFolder: (folder: Folder) => void;
  onDeleteFolder: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onToggleFolder: (folderId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onNavigateToText?: (note: Note, searchTerm: string) => void;
}

export const NotesList: React.FC<NotesListProps> = ({
  notes,
  folders,
  selectedNote,
  selectedFolderId,
  onSelectNote,
  onSelectFolder,
  onCreateNote,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  onDeleteNote,
  onToggleFolder,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onNavigateToText,
}) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [showSearchReferences, setShowSearchReferences] = useState(false);

  // Add keyboard shortcut for Cmd+F / Ctrl+F
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "f") {
        // Only handle Cmd+F if the active element is within the notes list sidebar
        // or if no specific input/textarea is focused
        const activeElement = document.activeElement;
        const isWithinNotesList =
          activeElement &&
          (activeElement.closest(".notes-list-container") !== null ||
            activeElement.id === "notes-search-input" ||
            activeElement.tagName === "BODY");

        // Don't interfere if user is typing in a contenteditable area (note editor)
        const isInEditor =
          activeElement &&
          (activeElement.getAttribute("contenteditable") === "true" ||
            activeElement.closest('[contenteditable="true"]') !== null);

        if (isWithinNotesList && !isInEditor) {
          event.preventDefault();
          // Focus on the search input instead of opening modal
          const searchInput = document.getElementById(
            "notes-search-input"
          ) as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
            searchInput.select();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const categories = [
    "All",
    ...new Set(notes.map((note) => note.category).filter(Boolean)),
  ];

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || note.category === selectedCategory;
    const matchesFolder =
      selectedFolderId === null || note.folderId === selectedFolderId;
    return matchesSearch && matchesCategory && matchesFolder;
  });

  // Function to highlight search terms in text
  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(
      `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          style={{
            backgroundColor: "var(--accent)",
            color: "white",
            padding: "1px 2px",
            borderRadius: "2px",
          }}
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const handleCreateFolder = () => {
    setShowFolderDialog(true);
    setShowMenu(false);
  };

  const handleConfirmCreateFolder = () => {
    if (folderName.trim()) {
      onCreateFolder(folderName.trim(), selectedFolderId);
    }
    setShowFolderDialog(false);
    setFolderName("");
  };

  const handleCancelCreateFolder = () => {
    setShowFolderDialog(false);
    setFolderName("");
  };

  const handleImportNotes = (importedNotes: Note[]) => {
    importedNotes.forEach((note) => {
      // Generate new IDs to avoid conflicts
      const newNote = {
        ...note,
        id: Date.now().toString() + Math.random(),
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      };
      // This would need to be passed up to the parent component
      // For now, we'll just log it
      console.log("Imported note:", newNote);
    });
  };

  const handleImportFolders = (importedFolders: Folder[]) => {
    importedFolders.forEach((folder) => {
      const newFolder = {
        ...folder,
        id: Date.now().toString() + Math.random(),
        createdAt: new Date(folder.createdAt),
        updatedAt: new Date(folder.updatedAt),
      };
      console.log("Imported folder:", newFolder);
    });
  };

  const exportAllData = () => {
    const data = {
      notes,
      folders,
      exportDate: new Date().toISOString(),
      version: "1.0",
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notes-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowMenu(false);
  };

  return (
    <>
      <div
        className="w-full h-full flex flex-col notes-list-container"
        style={{ background: "transparent" }}
      >
        {/* Header Section with Liquid Glass Toolbar Effect */}
        <div className="p-4 fade-in material-toolbar">
          <div className="flex items-center justify-between mb-4">
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Notes
            </h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onCreateNote(selectedFolderId)}
                className="modern-btn group p-2.5 text-white shadow-md hover:shadow-lg"
                style={{ backgroundColor: "var(--accent)" }}
                title="New Note"
              >
                <FilePlus
                  size={18}
                  className="group-hover:rotate-12 transition-transform duration-200"
                />
              </button>
              <button
                onClick={handleCreateFolder}
                className="modern-btn group p-2.5 text-white shadow-md hover:shadow-lg"
                style={{
                  backgroundColor: "var(--success)",
                }}
                title="New Folder"
              >
                <FolderPlus
                  size={18}
                  className="group-hover:rotate-12 transition-transform duration-200"
                />
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="modern-btn group p-2.5 shadow-sm hover:shadow-md"
                  style={{
                    backgroundColor: "var(--input-bg)",
                    color: "var(--text-secondary)",
                  }}
                  title="More Options"
                >
                  <MoreHorizontal
                    size={18}
                    className="group-hover:rotate-90 transition-transform duration-300"
                  />
                </button>
                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowMenu(false)}
                    />
                    <div
                      className="absolute left-2 right-0 top-full mt-2 z-50 rounded-2xl shadow-2xl py-2 min-w-48 backdrop-blur-sm fade-in"
                      style={{
                        backgroundColor: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        boxShadow: "0 20px 40px var(--shadow-lg)",
                      }}
                    >
                      <button
                        onClick={() => {
                          setShowImportModal(true);
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-selected flex items-center transition-all duration-200 group"
                        style={{ color: "var(--text-primary)" }}
                      >
                        <Download
                          size={16}
                          className="mr-3 transition-colors"
                          style={{ color: "var(--text-secondary)" }}
                        />
                        <span className="font-medium">Import Files</span>
                      </button>
                      <button
                        onClick={exportAllData}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-selected flex items-center transition-all duration-200 group"
                        style={{ color: "var(--text-primary)" }}
                      >
                        <Upload
                          size={16}
                          className="mr-3 transition-colors"
                          style={{ color: "var(--text-secondary)" }}
                        />
                        <span className="font-medium">Export All (JSON)</span>
                      </button>
                      <button
                        onClick={() => {
                          exportAllNotesToTXT(notes);
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-selected flex items-center transition-all duration-200 group"
                        style={{ color: "var(--text-primary)" }}
                      >
                        <FileText
                          size={16}
                          className="mr-3 transition-colors"
                          style={{ color: "var(--text-secondary)" }}
                        />
                        <span className="font-medium">Export All (TXT)</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Search Section */}
          <div className="relative w-full mb-2">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200"
              style={{ color: "var(--text-secondary)" }}
              size={18}
            />
            <input
              id="notes-search-input"
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="modern-input w-full pl-12 py-3 shadow-sm focus:shadow-lg"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Enhanced Category Tags */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`modern-btn px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === category
                    ? "text-white shadow-md scale-105"
                    : "hover:scale-105 border"
                }`}
                style={
                  selectedCategory === category
                    ? {
                        backgroundColor: "var(--accent)",
                        boxShadow: "0 4px 12px var(--shadow-md)",
                      }
                    : {
                        backgroundColor: "var(--bg-card)",
                        color: "var(--text-primary)",
                        borderColor: "var(--border)",
                      }
                }
              >
                {category}
              </button>
            ))}
          </div>

          {/* Folder Breadcrumb */}
          {selectedFolderId && (
            <div
              className="flex items-center space-x-2 text-sm mb-4 p-3 rounded-xl"
              style={{
                backgroundColor: "var(--bg-card)",
                color: "var(--text-secondary)",
              }}
            >
              <FolderPlus size={16} style={{ color: "var(--accent)" }} />
              <span className="font-medium">
                {folders.find((f) => f.id === selectedFolderId)?.name ||
                  "Unknown Folder"}
              </span>
            </div>
          )}
        </div>

        <FolderTree
          folders={folders}
          notes={notes}
          selectedFolderId={selectedFolderId}
          selectedNote={selectedNote}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          onSelectFolder={onSelectFolder}
          onSelectNote={onSelectNote}
          onCreateFolder={onCreateFolder}
          onUpdateFolder={onUpdateFolder}
          onDeleteFolder={onDeleteFolder}
          onCreateNote={onCreateNote}
          onToggleFolder={onToggleFolder}
          onDeleteNote={onDeleteNote}
        />

        {searchQuery && (
          <div className=" p-4">
            <h3
              className="text-sm font-semibold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Search Results ({filteredNotes.length})
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className={`group p-2 rounded-lg cursor-pointer transition-all duration-200 relative ${
                    selectedNote?.id === note.id
                      ? "border"
                      : "hover:bg-selected"
                  }`}
                  style={
                    selectedNote?.id === note.id
                      ? {
                          backgroundColor: "var(--selected)",
                          borderColor: "var(--accent)",
                        }
                      : { backgroundColor: "var(--bg-card)" }
                  }
                >
                  <div onClick={() => onSelectNote(note)} className="flex-1">
                    <div
                      className="text-sm font-medium truncate pr-16"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {searchQuery
                        ? highlightText(note.title || "Untitled", searchQuery)
                        : note.title || "Untitled"}
                    </div>
                    <div
                      className="text-xs truncate pr-16"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {searchQuery
                        ? highlightText(
                            note.content
                              .replace(/<[^>]*>/g, "")
                              .substring(0, 50) + "...",
                            searchQuery
                          )
                        : note.content
                            .replace(/<[^>]*>/g, "")
                            .substring(0, 50) + "..."}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Settings Button with Liquid Glass */}
        <div className="mt-auto p-4 fade-in material-toolbar">
          <button
            onClick={() => navigate("/settings")}
            className="modern-btn w-full flex items-center justify-center space-x-3 p-4 text-white shadow-md hover:shadow-xl group"
            style={{
              backgroundColor: "var(--accent)",
              backgroundImage:
                "linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)",
            }}
            title="Settings"
          >
            <Settings
              size={20}
              className="group-hover:rotate-90 transition-transform duration-500"
            />
            <span className="font-semibold text-base">Settings</span>
          </button>
        </div>
      </div>

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportNotes={handleImportNotes}
        onImportFolders={handleImportFolders}
      />

      {/* Folder Creation Dialog with Liquid Glass */}
      {showFolderDialog && (
        <div
          className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 fade-in"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
        >
          <div className="liquid-glass-modal p-8 w-96 max-w-md mx-4">
            <h3
              className="text-xl font-bold mb-6"
              style={{ color: "var(--text-primary)" }}
            >
              Create New Folder
            </h3>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name..."
              className="modern-input w-full px-4 py-3 mb-6"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleConfirmCreateFolder();
                } else if (e.key === "Escape") {
                  handleCancelCreateFolder();
                }
              }}
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelCreateFolder}
                className="modern-btn px-6 py-2.5 rounded-lg transition-all duration-200 font-medium"
                style={{
                  color: "var(--text-secondary)",
                  backgroundColor: "var(--input-bg)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCreateFolder}
                disabled={!folderName.trim()}
                className="modern-btn px-6 py-2.5 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
                style={{ backgroundColor: "var(--accent)" }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search References Modal */}
      <SearchReferences
        notes={notes}
        isOpen={showSearchReferences}
        onClose={() => setShowSearchReferences(false)}
        onSelectNote={onSelectNote}
        onNavigateToText={(note, searchTerm) => {
          if (onNavigateToText) {
            onNavigateToText(note, searchTerm);
          }
        }}
      />
    </>
  );
};
