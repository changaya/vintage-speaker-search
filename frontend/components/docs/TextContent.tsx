'use client';

import { useState, useCallback } from 'react';

// =============================================================================
// Types
// =============================================================================

interface TextContentProps {
  content: string | null;
  className?: string;
  maxHeight?: string;
}

// =============================================================================
// Component
// =============================================================================

export default function TextContent({
  content,
  className = '',
  maxHeight = '500px',
}: TextContentProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!content) return;

    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  }, [content]);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  // Empty state
  if (!content || content.trim().length === 0) {
    return (
      <div className={`bg-gray-50 rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-center h-32 text-gray-400">
          <div className="text-center">
            <svg
              className="w-10 h-10 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-sm">No text content extracted</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700">
          Extracted Text
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleExpand}
            className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
          >
            {isCopied ? (
              <>
                <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        className="overflow-auto transition-all duration-200"
        style={{ maxHeight: isExpanded ? 'none' : maxHeight }}
      >
        <pre className="p-4 text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
          <code>{content}</code>
        </pre>
      </div>

      {/* Show more indicator */}
      {!isExpanded && content.length > 500 && (
        <div className="px-4 py-2 border-t border-gray-200 bg-gradient-to-t from-gray-100 to-transparent">
          <button
            onClick={toggleExpand}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
          >
            Show full text
          </button>
        </div>
      )}
    </div>
  );
}
