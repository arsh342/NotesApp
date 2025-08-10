import React, { useState, useMemo } from 'react';
import { Search, X, MapPin, Calendar } from 'lucide-react';
import { Note } from '../types/Note';

interface SearchResult {
  note: Note;
  matches: {
    context: string;
    highlightedContext: string;
    position: number;
  }[];
  totalMatches: number;
}

interface SearchReferencesProps {
  notes: Note[];
  isOpen: boolean;
  onClose: () => void;
  onSelectNote: (note: Note) => void;
  onNavigateToText: (note: Note, searchTerm: string) => void;
}

export const SearchReferences: React.FC<SearchReferencesProps> = ({
  notes,
  isOpen,
  onClose,
  onSelectNote,
  onNavigateToText,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const results: SearchResult[] = [];
    const term = caseSensitive ? searchTerm : searchTerm.toLowerCase();

    notes.forEach(note => {
      const title = caseSensitive ? note.title : note.title.toLowerCase();
      const content = caseSensitive ? note.content : note.content.toLowerCase();
      const combinedText = `${title} ${content}`;
      
      const matches: SearchResult['matches'] = [];
      let position = 0;

      // Find all matches in title and content
      while (position < combinedText.length) {
        const index = combinedText.indexOf(term, position);
        if (index === -1) break;

        // Get context around the match (50 characters before and after)
        const start = Math.max(0, index - 50);
        const end = Math.min(combinedText.length, index + term.length + 50);
        const context = combinedText.substring(start, end);
        
        // Create highlighted version
        const beforeMatch = context.substring(0, index - start);
        const match = context.substring(index - start, index - start + term.length);
        const afterMatch = context.substring(index - start + term.length);
        
        const highlightedContext = `${beforeMatch}<mark class="bg-yellow-200 dark:bg-yellow-600 px-1 rounded">${match}</mark>${afterMatch}`;

        matches.push({
          context: context,
          highlightedContext,
          position: index,
        });

        position = index + 1;
      }

      if (matches.length > 0) {
        results.push({
          note,
          matches: matches.slice(0, 5), // Limit to first 5 matches per note
          totalMatches: matches.length,
        });
      }
    });

    return results.sort((a, b) => b.totalMatches - a.totalMatches);
  }, [notes, searchTerm, caseSensitive]);

  const handleNoteClick = (result: SearchResult) => {
    onSelectNote(result.note);
    onNavigateToText(result.note, searchTerm);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 rounded-lg w-11/12 max-w-4xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Search References</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors duration-200"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-gray-200 dark:border-zinc-700">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search for text references across all notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              autoFocus
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="rounded border-gray-300 dark:border-zinc-600 text-blue-600 focus:ring-blue-500"
              />
              <span>Case sensitive</span>
            </label>
            
            {searchTerm && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Found {searchResults.reduce((sum, result) => sum + result.totalMatches, 0)} matches 
                in {searchResults.length} notes
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {!searchTerm ? (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
              <Search size={48} className="mx-auto mb-4 opacity-50" />
              <p>Enter a search term to find references across all notes</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
              <Search size={48} className="mx-auto mb-4 opacity-50" />
              <p>No matches found for "{searchTerm}"</p>
            </div>
          ) : (
            <div className="space-y-4">
              {searchResults.map((result) => (
                <div
                  key={result.note.id}
                  className="border border-gray-200 dark:border-zinc-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors duration-200"
                  onClick={() => handleNoteClick(result)}
                >
                  {/* Note Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {result.note.title || 'Untitled Note'}
                      </h3>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar size={12} />
                          <span>{new Date(result.note.updatedAt).toLocaleDateString()}</span>
                        </div>
                        {result.note.category && (
                          <div className="flex items-center space-x-1">
                            <MapPin size={12} />
                            <span>{result.note.category}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                      {result.totalMatches} match{result.totalMatches !== 1 ? 'es' : ''}
                    </div>
                  </div>

                  {/* Match Previews */}
                  <div className="space-y-2">
                    {result.matches.map((match, matchIndex) => (
                      <div
                        key={matchIndex}
                        className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-zinc-900 p-2 rounded border-l-2 border-blue-500"
                      >
                        <div
                          dangerouslySetInnerHTML={{
                            __html: `...${match.highlightedContext}...`
                          }}
                        />
                      </div>
                    ))}
                    {result.totalMatches > result.matches.length && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                        And {result.totalMatches - result.matches.length} more matches...
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
