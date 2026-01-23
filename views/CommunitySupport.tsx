import React, { useState, useRef, useEffect } from 'react';

interface Question {
  id: string;
  title: string;
  preview: string;
  author: string;
  authorAvatar: string;
  votes: number;
  answers: number;
  tags: string[];
  timestamp: string;
  isSolved: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

const CommunitySupport: React.FC = () => {
  const [showAiChat, setShowAiChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'ai', text: "Hello! I'm Nexus AI, your development assistant. I can help you with build errors, configuration issues, and platform questions. How can I assist you today?", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);

  const aiResponses: Record<string, string> = {
    'build': "Build errors can often be resolved by:\n\n1. Clearing your build cache: `npm run clean`\n2. Reinstalling dependencies: `rm -rf node_modules && npm install`\n3. Checking for TypeScript errors: `npx tsc --noEmit`\n\nWould you like me to analyze a specific error message?",
    'deploy': "For deployment issues, ensure:\n\n1. Your environment variables are configured correctly\n2. The build output directory matches your hosting config\n3. All API endpoints are using the correct production URLs\n\nWhat specific deployment error are you seeing?",
    'error': "I'd be happy to help debug that error! Could you share:\n\n1. The full error message\n2. What action triggered the error\n3. Your current environment (Node version, OS)\n\nThis will help me provide a more accurate solution.",
    'default': "That's a great question! Based on common patterns, I'd suggest checking the Nexus documentation for detailed guides. Is there a specific aspect you'd like me to elaborate on?"
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [chatMessages]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const inputLower = chatInput.toLowerCase();
      let response = aiResponses.default;
      if (inputLower.includes('build') || inputLower.includes('compile')) response = aiResponses.build;
      else if (inputLower.includes('deploy') || inputLower.includes('production')) response = aiResponses.deploy;
      else if (inputLower.includes('error') || inputLower.includes('fail')) response = aiResponses.error;

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };
  const [questions] = useState<Question[]>([
    {
      id: 'q-1',
      title: 'iOS Build failure on XCode 15.2 with LLVM linker error code 65',
      preview: "I'm encountering a consistent failure in the CI/CD pipeline after upgrading the build agent environment. The logs indicate a symbol conflict in the static library linking phase...",
      author: '@dev_guru',
      authorAvatar: 'DG',
      votes: 34,
      answers: 5,
      tags: ['ios', 'build-pipeline', 'llvm'],
      timestamp: '2h ago',
      isSolved: true
    },
    {
      id: 'q-2',
      title: 'Optimizing Hot Reload performance for large-scale Flutter monorepos',
      preview: "Our project has grown significantly and hot reload now takes upwards of 10 seconds. We've tried splitting into more packages but the overhead remains. Any suggestions for dev-server tuning?",
      author: '@sarah_js',
      authorAvatar: 'SJ',
      votes: 12,
      answers: 2,
      tags: ['flutter', 'performance', 'monorepo'],
      timestamp: '5h ago',
      isSolved: false
    },
    {
      id: 'q-3',
      title: 'Establishing secure MCP bridge between local Docker and Nexus Cloud',
      preview: "I'm having trouble with the authentication handshake when connecting my local Model Context Protocol server. The CORS policy seems to block the websocket initialization...",
      author: '@m_foster',
      authorAvatar: 'MF',
      votes: 8,
      answers: 1,
      tags: ['mcp', 'docker', 'security'],
      timestamp: '1d ago',
      isSolved: false
    }
  ]);

  const contributors = [
    { name: '@dev_guru', score: '5.2k', rank: 1, color: 'bg-indigo-500' },
    { name: '@sarah_js', score: '3.8k', rank: 2, color: 'bg-emerald-500' },
    { name: '@alex_rust', score: '2.1k', rank: 3, color: 'bg-orange-500' },
    { name: '@m_foster', score: '1.9k', rank: 4, color: 'bg-purple-500' },
  ];

  return (
    <div className="flex-1 bg-zinc-950 overflow-hidden flex flex-col font-sans">
      <header className="px-8 py-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Community Ecosystem</h1>
          <p className="text-zinc-400 text-sm">Collaborative debugging and platform knowledge sharing.</p>
        </div>
        <div className="flex gap-3">
           <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-zinc-500 text-sm">search</span>
              <input 
                type="text" 
                placeholder="Search knowledge base..."
                className="bg-zinc-950 border border-zinc-800 rounded-lg py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all w-64"
              />
           </div>
           <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all">
              <span className="material-symbols-rounded text-sm">add_circle</span> Start Discussion
           </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Feed */}
        <main className="flex-1 overflow-y-auto p-8 space-y-6">
           <div className="flex gap-6 border-b border-zinc-800 pb-2">
              {['Recent Discussions', 'Unanswered', 'Trending', 'My Contributions'].map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  className={`pb-2 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === i ? 'text-indigo-400 border-indigo-500' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
                >
                  {tab}
                </button>
              ))}
           </div>

           <div className="space-y-4">
              {questions.map(q => (
                <article key={q.id} className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-all group cursor-pointer shadow-xl">
                   <div className="flex gap-6">
                      {/* Stats */}
                      <div className="flex flex-col items-center gap-3 shrink-0">
                         <div className="flex flex-col items-center text-zinc-400 group-hover:text-indigo-400 transition-colors">
                            <span className="material-symbols-rounded">expand_less</span>
                            <span className="text-sm font-bold text-white">{q.votes}</span>
                         </div>
                         <div className={`size-12 rounded-xl flex flex-col items-center justify-center border ${q.isSolved ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}>
                            <span className="text-sm font-bold leading-none">{q.answers}</span>
                            <span className="text-[8px] font-bold uppercase mt-1">Ans</span>
                         </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                         <div className="flex items-start justify-between gap-4 mb-2">
                            <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-indigo-400 transition-colors leading-snug">{q.title}</h3>
                            {q.isSolved && (
                              <span className="material-symbols-rounded text-emerald-500" title="Verified Solution">check_circle</span>
                            )}
                         </div>
                         <p className="text-zinc-400 text-sm line-clamp-2 leading-relaxed mb-4">{q.preview}</p>
                         <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                               {q.tags.map(tag => (
                                 <span key={tag} className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-500 text-[10px] font-bold uppercase tracking-tight hover:text-indigo-400 hover:border-indigo-500/30 transition-all">#{tag}</span>
                               ))}
                            </div>
                            <div className="flex items-center gap-2">
                               <div className="size-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 border border-zinc-700">{q.authorAvatar}</div>
                               <span className="text-xs text-zinc-500">{q.author} • {q.timestamp}</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </article>
              ))}
           </div>
           
           <button className="w-full py-4 text-center text-xs font-bold text-zinc-500 hover:text-zinc-300 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-xl hover:bg-zinc-900/50 transition-all uppercase tracking-[0.2em]">Fetch Older Discussions</button>
        </main>

        {/* Sidebar */}
        <aside className="w-80 bg-zinc-900 border-l border-zinc-800 p-6 space-y-8 overflow-y-auto">
           <section>
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6">Distinguished Contributors</h3>
              <div className="space-y-4">
                 {contributors.map(c => (
                   <div key={c.name} className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-3">
                         <div className="relative">
                            <div className={`size-10 rounded-full ${c.color} flex items-center justify-center text-white font-bold border-2 border-zinc-900 shadow-lg group-hover:scale-110 transition-transform`}>
                               {c.name.substring(1, 3).toUpperCase()}
                            </div>
                            <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                               {c.rank}
                            </div>
                         </div>
                         <div className="flex flex-col">
                            <span className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">{c.name}</span>
                            <span className="text-[10px] font-mono text-zinc-500">{c.score} contribution pts</span>
                         </div>
                      </div>
                      <span className="material-symbols-rounded text-zinc-700 group-hover:text-indigo-500 transition-colors text-lg">military_tech</span>
                   </div>
                 ))}
              </div>
              <button className="w-full mt-6 py-2 text-xs font-bold text-indigo-400 hover:underline">View Global Leaderboard</button>
           </section>

           <section className="p-5 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <span className="material-symbols-rounded text-6xl text-indigo-400">psychology</span>
              </div>
              <h4 className="text-sm font-bold text-white mb-2 relative z-10">Nexus AI Insights</h4>
              <p className="text-xs text-indigo-200/60 leading-relaxed mb-4 relative z-10">Get instant automated resolutions for common build errors using our fine-tuned LLM.</p>
              <button
                onClick={() => setShowAiChat(true)}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all relative z-10 shadow-lg shadow-indigo-500/20"
              >
                Open AI Chat
              </button>
           </section>

           <section>
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">Trending Ecosystem Tags</h3>
              <div className="flex flex-wrap gap-2">
                 {['#rust', '#web-gpu', '#mcp-v2', '#k8s-mesh', '#wasm', '#grpc'].map(tag => (
                   <span key={tag} className="px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-400 hover:text-indigo-400 hover:border-indigo-500/30 cursor-pointer transition-all">{tag}</span>
                 ))}
              </div>
           </section>
        </aside>

        {/* AI Chat Panel */}
        {showAiChat && (
          <aside className="w-96 bg-zinc-900 border-l border-zinc-800 flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <span className="material-symbols-rounded text-white text-lg">smart_toy</span>
                </div>
                <div>
                  <span className="text-sm font-bold text-white">Nexus AI</span>
                  <div className="flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] text-zinc-500">Online</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowAiChat(false)} className="text-zinc-500 hover:text-white">
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${msg.sender === 'ai' ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
                    <span className="material-symbols-rounded text-white text-sm">{msg.sender === 'ai' ? 'smart_toy' : 'person'}</span>
                  </div>
                  <div className={`max-w-[80%] ${msg.sender === 'user' ? 'text-right' : ''}`}>
                    <div className={`p-3 rounded-xl text-sm ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-tl-none'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    <span className="text-[10px] text-zinc-600 mt-1 block">{msg.timestamp}</span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="size-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <span className="material-symbols-rounded text-white text-sm">smart_toy</span>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl rounded-tl-none">
                    <div className="flex gap-1">
                      <span className="size-2 bg-zinc-600 rounded-full animate-bounce"></span>
                      <span className="size-2 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                      <span className="size-2 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-zinc-800 bg-zinc-950/50">
              <div className="relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask Nexus AI..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="absolute right-2 top-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                >
                  <span className="material-symbols-rounded text-lg">send</span>
                </button>
              </div>
              <div className="flex justify-between items-center mt-2 text-[10px] text-zinc-600">
                <span>Powered by Nexus LLM</span>
                <button onClick={() => setChatMessages([chatMessages[0]])} className="text-indigo-400 hover:underline">Clear Chat</button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default CommunitySupport;