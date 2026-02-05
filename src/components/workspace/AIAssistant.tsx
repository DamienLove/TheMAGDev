import React, { useState, useRef, useEffect, useCallback } from 'react';
import aiProvider, { ChatMessage, AIProviderConfig, AIProviderResponse } from '../../services/AIProvider';
import { useWorkspace } from './WorkspaceContext';

interface AIAssistantProps {
  className?: string;
  onClose?: () => void;
  onPopOut?: () => void;
  onOpenWindow?: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ className, onClose, onPopOut, onOpenWindow }) => {
  const { activeFile, getFileContent, openFiles } = useWorkspace();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState<AIProviderConfig | null>(null);
  const [showProviderSelect, setShowProviderSelect] = useState(false);
  const [tokenUsage, setTokenUsage] = useState<{ input: number; output: number }>({ input: 0, output: 0 });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setActiveProvider(aiProvider.getActiveProvider());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getContext = useCallback((): string => {
    const contextParts: string[] = [];

    // Add current file context
    if (activeFile) {
      const content = getFileContent(activeFile);
      if (content) {
        contextParts.push(`Current file: ${activeFile}\n\`\`\`\n${content.slice(0, 2000)}\n\`\`\``);
      }
    }

    // Add other open files (limited)
    const otherFiles = openFiles.filter(f => f !== activeFile).slice(0, 2);
    otherFiles.forEach(file => {
      const content = getFileContent(file);
      if (content) {
        contextParts.push(`Open file: ${file}\n\`\`\`\n${content.slice(0, 500)}\n\`\`\``);
      }
    });

    return contextParts.join('\n\n');
  }, [activeFile, openFiles, getFileContent]);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const context = getContext();
      const response: AIProviderResponse = await aiProvider.sendMessage(
        [...messages, userMessage],
        context
      );

      if (response.error) {
        const errorMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: `Error: ${response.error}`,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, errorMessage]);
      } else {
        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: response.content,
          timestamp: Date.now(),
          providerId: activeProvider?.id,
        };
        setMessages(prev => [...prev, assistantMessage]);

        if (response.usage) {
          setTokenUsage(prev => ({
            input: prev.input + response.usage!.inputTokens,
            output: prev.output + response.usage!.outputTokens,
          }));
        }
      }
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${error.message || 'Failed to get response'}`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleProviderChange = (providerId: string) => {
    aiProvider.setActiveProvider(providerId);
    setActiveProvider(aiProvider.getActiveProvider());
    setShowProviderSelect(false);
  };

  const clearChat = () => {
    setMessages([]);
    setTokenUsage({ input: 0, output: 0 });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const providers = aiProvider.getProviders();

  const isProviderReady = activeProvider?.apiKey || activeProvider?.type === 'ollama';

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
                  onClick={() => copyToClipboard(code.trim(), blockId)}
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
    <aside className={`bg-zinc-900 border-l border-zinc-800 flex flex-col overflow-hidden ${className}`}>
      {/* Header */}
      <div className="h-10 px-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950 shrink-0">
        <div className="flex items-center gap-2">
          <span className="material-symbols-rounded text-indigo-500 text-lg">smart_toy</span>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">AI Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowProviderSelect(!showProviderSelect)}
            className="flex items-center gap-1 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-zinc-300"
          >
            {activeProvider?.name.split(' ')[0] || 'Select'}
            <span className="material-symbols-rounded text-sm">expand_more</span>
          </button>
          {onPopOut && (
            <button
              onClick={onPopOut}
              className="text-zinc-600 hover:text-zinc-300"
              title="Pop out panel"
              aria-label="Pop out panel"
            >
              <span className="material-symbols-rounded text-sm">open_in_new</span>
            </button>
          )}
          {onOpenWindow && (
            <button
              onClick={onOpenWindow}
              className="text-zinc-600 hover:text-zinc-300"
              title="Open in new window"
              aria-label="Open in new window"
            >
              <span className="material-symbols-rounded text-sm">launch</span>
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-zinc-600 hover:text-zinc-400"
              aria-label="Close assistant"
            >
              <span className="material-symbols-rounded text-sm">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Provider Dropdown */}
      {showProviderSelect && (
        <div className="absolute right-2 top-12 z-50 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl py-1 min-w-[200px]">
          {providers.map(provider => (
            <button
              key={provider.id}
              onClick={() => handleProviderChange(provider.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-zinc-800 ${
                activeProvider?.id === provider.id ? 'bg-indigo-500/10' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded flex items-center justify-center ${
                provider.type === 'claude' ? 'bg-orange-500/20 text-orange-400' :
                provider.type === 'openai' ? 'bg-emerald-500/20 text-emerald-400' :
                provider.type === 'gemini' ? 'bg-blue-500/20 text-blue-400' :
                provider.type === 'perplexity' ? 'bg-purple-500/20 text-purple-400' :
                'bg-zinc-700 text-zinc-400'
              }`}>
                <span className="material-symbols-rounded text-sm">smart_toy</span>
              </div>
              <div className="flex-1">
                <div className="text-xs font-medium text-zinc-200">{provider.name}</div>
                <div className="text-[10px] text-zinc-500">{provider.model}</div>
              </div>
              {provider.apiKey && (
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              )}
              {activeProvider?.id === provider.id && (
                <span className="material-symbols-rounded text-indigo-400 text-sm">check</span>
              )}
            </button>
          ))}
          <div className="border-t border-zinc-800 mt-1 pt-1">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); setShowProviderSelect(false); }}
              className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
            >
              <span className="material-symbols-rounded text-sm">settings</span>
              Manage API Keys
            </a>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <span className="material-symbols-rounded text-4xl text-zinc-700 mb-3 block">chat</span>
            <p className="text-sm text-zinc-500 mb-2">Start a conversation</p>
            <p className="text-xs text-zinc-600">
              {isProviderReady
                ? `Using ${activeProvider?.name}`
                : 'Configure an API key in Settings to get started'}
            </p>
          </div>
        )}

        {messages.map(message => (
          <div
            key={message.id}
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
                    onClick={() => copyToClipboard(message.content, message.id)}
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
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="size-8 rounded bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-rounded text-indigo-400 text-sm animate-pulse">smart_toy</span>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg rounded-tl-none">
              <div className="flex items-center gap-2">
                <span className="material-symbols-rounded text-sm text-zinc-500 animate-spin">progress_activity</span>
                <span className="text-xs text-zinc-500">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-950">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isProviderReady ? "Ask a question..." : "Configure API key in Settings..."}
            disabled={!isProviderReady || isLoading}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-3 pr-10 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-all resize-none h-20 disabled:opacity-50"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || !isProviderReady || isLoading}
            className="absolute right-2 bottom-3 text-indigo-500 hover:text-indigo-400 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <span className="material-symbols-rounded">send</span>
          </button>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-[9px] font-bold text-zinc-600 uppercase">
            {tokenUsage.input + tokenUsage.output > 0
              ? `Tokens: ${tokenUsage.input + tokenUsage.output}`
              : activeFile
                ? `Context: ${activeFile.split('/').pop()}`
                : 'No context'
            }
          </span>
          <button
            onClick={clearChat}
            className="text-[9px] font-bold text-indigo-500 hover:underline uppercase tracking-tight"
          >
            Clear Thread
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AIAssistant;
