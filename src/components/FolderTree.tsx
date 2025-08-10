import { useState } from "react";
import {
  Folder,
  FolderOpen,
  File,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronDown,
  Download,
  Share2,
  Copy,
  Upload,
  FilePlus,
  FolderPlus,
  FileDown,
} from "lucide-react";
import { Folder as FolderType, Note } from "../types/Note";
import { exportToPDF, exportToTXT } from "../utils/exportUtils";

interface FolderTreeProps {
  folders: FolderType[];
  notes: Note[];
  selectedFolderId: string | null;
  selectedNote: Note | null;
  searchQuery: string;
  selectedCategory: string;
  onSelectFolder: (folderId: string | null) => void;
  onSelectNote: (note: Note) => void;
  onCreateFolder: (name: string, parentId: string | null) => void;
  onUpdateFolder: (folder: FolderType) => void;
  onDeleteFolder: (id: string) => void;
  onCreateNote: (folderId: string | null) => void;
  onToggleFolder: (folderId: string) => void;
  onDeleteNote: (id: string) => void;
}

export const FolderTree: React.FC<FolderTreeProps> = ({
  folders,
  notes,
  selectedFolderId,
  selectedNote,
  searchQuery,
  selectedCategory,
  onSelectFolder,
  onSelectNote,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  onCreateNote,
  onToggleFolder,
  onDeleteNote,
}) => {
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    type: "folder" | "note";
    folderId: string | null;
    noteId: string | null;
  } | null>(null);

  const getRootFolders = () => folders.filter((f) => f.parentId === null);
  const getChildFolders = (parentId: string) =>
    folders.filter((f) => f.parentId === parentId);
  const getFolderNotes = (folderId: string | null) => {
    return notes.filter((note) => {
      const matchesFolder = note.folderId === folderId;
      const matchesSearch =
        searchQuery === "" ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || note.category === selectedCategory;
      return matchesFolder && matchesSearch && matchesCategory;
    });
  };

  // Export functions for folders
  const exportFolderToPDF = async (folder: FolderType) => {
    const folderNotes = getFolderNotes(folder.id);
    if (folderNotes.length === 0) {
      alert("This folder contains no notes to export.");
      return;
    }

    // Export all notes in the folder as individual PDFs
    for (const note of folderNotes) {
      await exportToPDF(note);
    }
  };

  const exportFolderToTXT = (folder: FolderType) => {
    const folderNotes = getFolderNotes(folder.id);
    if (folderNotes.length === 0) {
      alert("This folder contains no notes to export.");
      return;
    }

    // Combine all notes in the folder into one TXT file
    const combinedContent = folderNotes
      .map(
        (note) =>
          `# ${note.title || "Untitled"}\n\n${note.content.replace(
            /<[^>]*>/g,
            ""
          )}\n\nCreated: ${note.createdAt.toLocaleDateString()}\nUpdated: ${note.updatedAt.toLocaleDateString()}\nCategory: ${
            note.category || "None"
          }\n\n---\n\n`
      )
      .join("");

    const blob = new Blob([combinedContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${folder.name}-notes.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFolderContextMenu = (
    e: React.MouseEvent,
    folderId: string | null
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      folderId,
      noteId: null,
      type: "folder",
    });
  };

  const handleNoteContextMenu = (e: React.MouseEvent, noteId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      folderId: null,
      noteId,
      type: "note",
    });
  };
  const handleEditFolder = (folder: FolderType) => {
    setEditingFolderId(folder.id);
    setEditingName(folder.name);
    setContextMenu(null);
  };

  const handleSaveEdit = () => {
    if (editingFolderId && editingName.trim()) {
      const folder = folders.find((f) => f.id === editingFolderId);
      if (folder) {
        onUpdateFolder({
          ...folder,
          name: editingName.trim(),
          updatedAt: new Date(),
        });
      }
    }
    setEditingFolderId(null);
    setEditingName("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      setEditingFolderId(null);
      setEditingName("");
    }
  };

  const exportNote = (note: Note) => {
    const content = `# ${note.title || "Untitled"}\n\n${note.content.replace(
      /<[^>]*>/g,
      ""
    )}\n\nCreated: ${note.createdAt.toLocaleDateString()}\nUpdated: ${note.updatedAt.toLocaleDateString()}\nCategory: ${
      note.category || "None"
    }`;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${note.title || "untitled"}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setContextMenu(null);
  };

  const exportFolder = (folderId: string | null) => {
    const folderNotes = getFolderNotes(folderId);
    const folderName = folderId
      ? folders.find((f) => f.id === folderId)?.name || "folder"
      : "root";

    if (folderNotes.length === 0) {
      alert("This folder contains no notes to export.");
      setContextMenu(null);
      return;
    }

    const content = folderNotes
      .map(
        (note) =>
          `# ${note.title || "Untitled"}\n\n${note.content.replace(
            /<[^>]*>/g,
            ""
          )}\n\nCreated: ${note.createdAt.toLocaleDateString()}\nUpdated: ${note.updatedAt.toLocaleDateString()}\nCategory: ${
            note.category || "None"
          }\n\n---\n\n`
      )
      .join("");

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${folderName}-notes.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setContextMenu(null);
  };

  const shareNote = async (note: Note) => {
    const shareData = {
      title: note.title || "Untitled Note",
      text: note.content.replace(/<[^>]*>/g, ""),
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      const content = `${note.title || "Untitled"}\n\n${note.content.replace(
        /<[^>]*>/g,
        ""
      )}`;
      navigator.clipboard
        .writeText(content)
        .then(() => {
          alert("Note content copied to clipboard!");
        })
        .catch(() => {
          alert("Failed to copy to clipboard");
        });
    }
    setContextMenu(null);
  };

  const shareFolder = async (folderId: string | null) => {
    const folderNotes = getFolderNotes(folderId);
    const folderName = folderId
      ? folders.find((f) => f.id === folderId)?.name || "folder"
      : "root";

    if (folderNotes.length === 0) {
      alert("This folder contains no notes to share.");
      setContextMenu(null);
      return;
    }

    const content = folderNotes
      .map(
        (note) =>
          `${note.title || "Untitled"}\n${note.content.replace(/<[^>]*>/g, "")}`
      )
      .join("\n\n---\n\n");

    const shareData = {
      title: `Notes from ${folderName}`,
      text: content,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard
        .writeText(content)
        .then(() => {
          alert("Folder content copied to clipboard!");
        })
        .catch(() => {
          alert("Failed to copy to clipboard");
        });
    }
    setContextMenu(null);
  };
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const truncateContent = (content: string, maxLength: number = 60) => {
    const plainText = content.replace(/<[^>]*>/g, "");
    return plainText.length > maxLength
      ? plainText.substring(0, maxLength) + "..."
      : plainText;
  };

  const renderFolder = (folder: FolderType, level: number = 0) => {
    const childFolders = getChildFolders(folder.id);
    const folderNotes = getFolderNotes(folder.id);
    const isSelected = selectedFolderId === folder.id;
    const hasChildren = childFolders.length > 0 || folderNotes.length > 0;

    return (
      <div key={folder.id} className="select-none">
        <div
          className={`flex items-center px-2 py-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.01] group shadow-sm hover:shadow-md ${
            isSelected ? "shadow-lg scale-[1.01]" : "hover:bg-selected"
          }`}
          style={{
            paddingLeft: `${8 + level * 16}px`,
            backgroundColor: isSelected ? "var(--selected)" : "var(--bg-card)",
            ...(isSelected && { borderLeft: "4px solid var(--accent)" }),
          }}
          onClick={() => onSelectFolder(folder.id)}
          onContextMenu={(e) => handleFolderContextMenu(e, folder.id)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFolder(folder.id);
            }}
            className="p-1 hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900 dark:hover:to-indigo-900 rounded-lg mr-1 transition-all duration-200"
          >
            {hasChildren ? (
              folder.isExpanded ? (
                <ChevronDown
                  size={14}
                  className="text-blue-600 dark:text-blue-400 transition-transform duration-200"
                />
              ) : (
                <ChevronRight
                  size={14}
                  className="text-blue-600 dark:text-blue-400 transition-transform duration-200"
                />
              )
            ) : (
              <div className="w-4 h-4" />
            )}
          </button>

          {folder.isExpanded ? (
            <FolderOpen
              size={16}
              className="mr-2 transition-all duration-200"
              style={{ color: "var(--accent)" }}
            />
          ) : (
            <Folder
              size={16}
              className="mr-2 transition-all duration-200"
              style={{ color: "var(--accent)" }}
            />
          )}

          {editingFolderId === folder.id ? (
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={handleKeyDown}
              className="flex-1 px-2 py-1 text-sm border rounded-lg focus:outline-none focus:ring-2 shadow-inner focus:ring-accent"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
              autoFocus
            />
          ) : (
            <span
              className="flex-1 text-sm font-semibold truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {folder.name}
            </span>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onCreateNote(folder.id);
            }}
            className="opacity-0 group-hover:opacity-100 p-1.5 bg-gradient-to-r from-gray-100 to-slate-100 hover:from-blue-100 hover:to-indigo-100 dark:from-gray-800 dark:to-slate-800 dark:hover:from-blue-900 dark:hover:to-indigo-900 rounded-lg ml-1 transition-all duration-300 transform hover:scale-110 shadow-sm hover:shadow-md"
            title="Add note"
          >
            <Plus
              size={12}
              className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200"
            />
          </button>
        </div>

        {folder.isExpanded && (
          <div>
            {childFolders.map((childFolder) =>
              renderFolder(childFolder, level + 1)
            )}
            {folderNotes.map((note) => (
              <div
                key={note.id}
                className={`group flex items-center px-2 py-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.01] relative shadow-sm hover:shadow-md ${
                  selectedNote?.id === note.id
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 shadow-lg scale-[1.01] dark:from-blue-900/30 dark:to-indigo-900/30 dark:border-blue-400"
                    : "bg-white/60 hover:bg-white dark:bg-zinc-800/40 dark:hover:bg-zinc-800"
                }`}
                style={{ paddingLeft: `${24 + (level + 1) * 16}px` }}
                onContextMenu={(e) => handleNoteContextMenu(e, note.id)}
              >
                <File
                  size={14}
                  className="mr-2 text-blue-600 dark:text-blue-400 flex-shrink-0 transition-colors duration-200"
                />
                <div
                  onClick={() => onSelectNote(note)}
                  className="flex-1 min-w-0"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {note.title || "Untitled"}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0 font-medium">
                      {formatDate(note.updatedAt)}
                    </span>
                  </div>
                  {note.content && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {truncateContent(note.content)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const rootNotes = getFolderNotes(null);

  return (
    <div
      className="flex-1 overflow-y-auto pt-2 scrollbar-hide"
      style={{ backgroundColor: "var(--bg-card)" }}
    >
      {/* Root level notes */}
      {rootNotes.map((note) => (
        <div
          key={note.id}
          className={`group flex items-center px-2 py-2 mx-2 mb-1 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] relative shadow-sm hover:shadow-md ${
            selectedNote?.id === note.id
              ? "border-l-4 shadow-lg scale-[1.02]"
              : "hover:bg-selected"
          }`}
          style={
            selectedNote?.id === note.id
              ? {
                  backgroundColor: "var(--selected)",
                  borderColor: "var(--accent)",
                }
              : {
                  backgroundColor: "var(--bg-card)",
                }
          }
          onContextMenu={(e) => handleNoteContextMenu(e, note.id)}
        >
          <File
            size={14}
            className="mr-2 flex-shrink-0 transition-colors duration-200"
            style={{ color: "var(--accent)" }}
          />
          <div onClick={() => onSelectNote(note)} className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span
                className="text-sm font-semibold truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {note.title || "Untitled"}
              </span>
              <span
                className="text-xs ml-2 flex-shrink-0 font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                {formatDate(note.updatedAt)}
              </span>
            </div>
            {note.content && (
              <p
                className="text-xs truncate"
                style={{ color: "var(--text-secondary)" }}
              >
                {truncateContent(note.content)}
              </p>
            )}
          </div>
        </div>
      ))}

      {/* Folders */}
      {getRootFolders().map((folder) => renderFolder(folder))}

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-50 bg-white/95 backdrop-blur-md dark:bg-zinc-900/95 border border-gray-200/50 dark:border-zinc-700/50 rounded-xl shadow-2xl py-2 min-w-48 animate-in fade-in zoom-in-95 duration-200"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            {contextMenu.type === "folder" && (
              <>
                <button
                  onClick={() => {
                    const defaultName = "New Folder";
                    onCreateFolder(defaultName, contextMenu.folderId || null);
                    setContextMenu(null);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 flex items-center text-gray-900 dark:text-white transition-all duration-200 group"
                >
                  <FolderPlus
                    size={16}
                    className="mr-3 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-200"
                  />
                  New Folder
                </button>
                <button
                  onClick={() => {
                    onCreateNote(contextMenu.folderId || null);
                    setContextMenu(null);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20 flex items-center text-gray-900 dark:text-white transition-all duration-200 group"
                >
                  <FilePlus
                    size={16}
                    className="mr-3 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-200"
                  />
                  New Note
                </button>
                <div className="border-t border-gray-100 dark:border-zinc-600 my-2" />
                {contextMenu.folderId && (
                  <button
                    onClick={() => {
                      const folder = folders.find(
                        (f) => f.id === contextMenu.folderId
                      );
                      if (folder) handleEditFolder(folder);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 dark:hover:from-yellow-900/20 dark:hover:to-orange-900/20 flex items-center text-gray-900 dark:text-white transition-all duration-200 group"
                  >
                    <Edit2
                      size={16}
                      className="mr-3 text-yellow-600 dark:text-yellow-400 group-hover:scale-110 transition-transform duration-200"
                    />
                    Rename
                  </button>
                )}
                <button
                  onClick={() => exportFolder(contextMenu.folderId || null)}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 flex items-center text-gray-900 dark:text-white transition-all duration-200 group"
                >
                  <Upload
                    size={16}
                    className="mr-3 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-200"
                  />
                  Export as MD
                </button>
                <button
                  onClick={() => {
                    const folder = folders.find(
                      (f) => f.id === contextMenu.folderId
                    );
                    if (folder) exportFolderToPDF(folder);
                    setContextMenu(null);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 flex items-center text-gray-900 dark:text-white transition-all duration-200 group"
                >
                  <FileDown
                    size={16}
                    className="mr-3 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform duration-200"
                  />
                  Export as PDF
                </button>
                <button
                  onClick={() => {
                    const folder = folders.find(
                      (f) => f.id === contextMenu.folderId
                    );
                    if (folder) exportFolderToTXT(folder);
                    setContextMenu(null);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20 flex items-center text-gray-900 dark:text-white transition-all duration-200 group"
                >
                  <Download
                    size={16}
                    className="mr-3 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-200"
                  />
                  Export as TXT
                </button>
                <button
                  onClick={() => shareFolder(contextMenu.folderId || null)}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 dark:hover:from-indigo-900/20 dark:hover:to-blue-900/20 flex items-center text-gray-900 dark:text-white transition-all duration-200 group"
                >
                  <Share2
                    size={16}
                    className="mr-3 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-200"
                  />
                  Share Folder
                </button>
                {contextMenu.folderId && (
                  <>
                    <div className="border-t border-gray-100 dark:border-zinc-600 my-2" />
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            "Delete this folder? Notes will be moved to root."
                          )
                        ) {
                          onDeleteFolder(contextMenu.folderId!);
                        }
                        setContextMenu(null);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 text-red-600 dark:text-red-400 flex items-center transition-all duration-200 group"
                    >
                      <Trash2
                        size={16}
                        className="mr-3 group-hover:scale-110 transition-transform duration-200"
                      />
                      Delete Folder
                    </button>
                  </>
                )}
              </>
            )}

            {contextMenu.type === "note" && contextMenu.noteId && (
              <>
                <button
                  onClick={() => {
                    const note = notes.find((n) => n.id === contextMenu.noteId);
                    if (note) {
                      exportToPDF(note);
                      setContextMenu(null);
                    }
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 flex items-center text-gray-900 dark:text-white transition-all duration-200 group"
                >
                  <FileDown
                    size={16}
                    className="mr-3 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform duration-200"
                  />
                  Export as PDF
                </button>
                <button
                  onClick={() => {
                    const note = notes.find((n) => n.id === contextMenu.noteId);
                    if (note) {
                      exportToTXT(note);
                      setContextMenu(null);
                    }
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20 flex items-center text-gray-900 dark:text-white transition-all duration-200 group"
                >
                  <Download
                    size={16}
                    className="mr-3 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-200"
                  />
                  Export as TXT
                </button>
                <button
                  onClick={() => {
                    const note = notes.find((n) => n.id === contextMenu.noteId);
                    if (note) exportNote(note);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 dark:hover:from-purple-900/20 dark:hover:to-indigo-900/20 flex items-center text-gray-900 dark:text-white transition-all duration-200 group"
                >
                  <Upload
                    size={16}
                    className="mr-3 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-200"
                  />
                  Export as Markdown
                </button>
                <button
                  onClick={() => {
                    const note = notes.find((n) => n.id === contextMenu.noteId);
                    if (note) shareNote(note);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-900/20 dark:hover:to-cyan-900/20 flex items-center text-gray-900 dark:text-white transition-all duration-200 group"
                >
                  <Share2
                    size={16}
                    className="mr-3 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-200"
                  />
                  Share Note
                </button>
                <button
                  onClick={() => {
                    const note = notes.find((n) => n.id === contextMenu.noteId);
                    if (note) {
                      const content = `${
                        note.title || "Untitled"
                      }\n\n${note.content.replace(/<[^>]*>/g, "")}`;
                      navigator.clipboard
                        .writeText(content)
                        .then(() => {
                          alert("Note copied to clipboard!");
                        })
                        .catch(() => {
                          alert("Failed to copy to clipboard");
                        });
                    }
                    setContextMenu(null);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 dark:hover:from-yellow-900/20 dark:hover:to-orange-900/20 flex items-center text-gray-900 dark:text-white transition-all duration-200 group"
                >
                  <Copy
                    size={16}
                    className="mr-3 text-yellow-600 dark:text-yellow-400 group-hover:scale-110 transition-transform duration-200"
                  />
                  Copy Note
                </button>
                <div className="border-t border-gray-100 dark:border-zinc-600 my-2" />
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this note?")) {
                      onDeleteNote(contextMenu.noteId!);
                    }
                    setContextMenu(null);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 text-red-600 dark:text-red-400 flex items-center transition-all duration-200 group"
                >
                  <Trash2
                    size={16}
                    className="mr-3 group-hover:scale-110 transition-transform duration-200"
                  />
                  Delete
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};
