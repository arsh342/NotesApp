import React, { useState } from 'react';
import { X, Upload, FileText } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportNotes: (notes: any[]) => void;
  onImportFolders: (folders: any[]) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportNotes,
  onImportFolders,
}) => {
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    const importedNotes: any[] = [];
    const importedFolders: any[] = [];

    for (const file of files) {
      try {
        const content = await file.text();
        
        if (file.name.endsWith('.json')) {
          // JSON import
          const data = JSON.parse(content);
          if (data.notes) importedNotes.push(...data.notes);
          if (data.folders) importedFolders.push(...data.folders);
        } else if (file.name.endsWith('.md') || file.name.endsWith('.txt')) {
          // Markdown/Text import
          const note = {
            id: Date.now().toString() + Math.random(),
            title: file.name.replace(/\.(md|txt)$/, ''),
            content: content,
            category: '',
            folderId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          importedNotes.push(note);
        }
      } catch (error) {
        console.error('Error importing file:', file.name, error);
        alert(`Error importing ${file.name}: ${error}`);
      }
    }

    if (importedNotes.length > 0) {
      onImportNotes(importedNotes);
    }
    if (importedFolders.length > 0) {
      onImportFolders(importedFolders);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-96 max-w-90vw">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Import Files</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-zinc-600'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Drag and drop files here, or click to select
          </p>
          <input
            type="file"
            multiple
            accept=".json,.md,.txt"
            onChange={handleFileInput}
            className="hidden"
            id="file-input"
          />
          <label
            htmlFor="file-input"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            <FileText size={16} className="mr-2" />
            Select Files
          </label>
        </div>

        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          <p className="mb-2">Supported formats:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>JSON files (exported from this app)</li>
            <li>Markdown files (.md)</li>
            <li>Text files (.txt)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};