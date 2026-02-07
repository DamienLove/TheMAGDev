import React, { memo } from 'react';
import { ChatMessage } from '../../services/AIProvider';

interface ChatMessageItemProps {
  message: ChatMessage;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
}

const ChatMessageItem = memo(({ message, copiedId, onCopy }: ChatMessageItemProps) => {
  const formatCode = (content: string, messageId: string) => {
    // Simple code block formatting
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```')) {
        const match = part.match(/```(\w*)\n?([\s\S]*?)```/);
        if (match) {
          const [, lang, code] = match;
          const blockId = `${messageId}-code-${i}`;
          const isCopied = copiedId === blockId;

          return (
            <div key={i} className="my-2 rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800">
              <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800">
                <span className="text-[10px] text-zinc-500 font-mono uppercase">{lang || 'code'}</span>
                <button
                  onClick={() => onCopy(code.trim(), blockId)}
                  className={`transition-colors ${isCopied ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                  title="Copy code"
                  aria-label="Copy code"
                >
                  <span className="material-symbols-rounded text-sm">{isCopied ? 'check' : 'content_copy'}</span>
                </button>
              </div>
              <pre className="p-3 text-xs font-mono text-zinc-300 overflow-x-auto">{code.trim()}</pre>
            </div>
          );
        }
      }
      // Format inline code
      return (
        <span key={i}>
          {part.split(/(`[^`]+`)/g).map((segment, j) => {
            if (segment.startsWith('`') && segment.endsWith('`')) {
              return (
                <code key={j} className="bg-zinc-800 px-1.5 py-0.5 rounded text-indigo-300 text-[11px]">
                  {segment.slice(1, -1)}
                </code>
              );
            }
            return segment;
          })}
        </span>
      );
    });
  };

  return (
    <div
      className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
    >
      <div className={`shrink-0 size-8 rounded flex items-center justify-center ${
        message.role === 'user'
          ? 'bg-zinc-800'
          : 'bg-indigo-600/20 border border-indigo-500/30'
      }`}>
        <span className={`material-symbols-rounded text-sm ${
          message.role === 'user' ? 'text-zinc-500' : 'text-indigo-400'
        }`}>
          {message.role === 'user' ? 'person' : 'smart_toy'}
        </span>
      </div>
      <div className={`flex-1 max-w-[85%] ${message.role === 'user' ? 'text-right' : ''}`}>
        <div className={`inline-block p-3 rounded-lg ${
          message.role === 'user'
            ? 'bg-indigo-600 text-white rounded-tr-none'
            : 'bg-zinc-950 border border-zinc-800 rounded-tl-none'
        }`}>
          <div className={`text-xs leading-relaxed ${
            message.role === 'user' ? '' : 'text-zinc-300'
          }`}>
            {message.role === 'assistant' ? formatCode(message.content, message.id) : message.content}
          </div>
        </div>
        {message.role === 'assistant' && (
          <div className="flex items-center gap-2 mt-1 ml-1">
            <button
              onClick={() => onCopy(message.content, message.id)}
              className={`transition-colors p-1 ${copiedId === message.id ? 'text-emerald-400' : 'text-zinc-600 hover:text-zinc-400'}`}
              title="Copy message"
              aria-label="Copy message"
            >
              <span className="material-symbols-rounded text-xs">{copiedId === message.id ? 'check' : 'content_copy'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export default ChatMessageItem;
