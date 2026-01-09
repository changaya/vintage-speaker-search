/**
 * MarkdownDisplay
 * Renders markdown content using react-markdown
 */

'use client';

import ReactMarkdown from 'react-markdown';

interface MarkdownDisplayProps {
  content: string;
}

export default function MarkdownDisplay({ content }: MarkdownDisplayProps) {
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        components={{
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="text-gray-700 mb-3 leading-relaxed" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside space-y-1 text-gray-700 mb-3" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="ml-2" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-gray-900" {...props} />
          ),
          code: ({ node, ...props }) => (
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
