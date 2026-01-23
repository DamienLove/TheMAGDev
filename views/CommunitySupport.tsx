import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

interface Message {
  id: string;
  sender: 'user' | 'ai' | 'human_agent';
  text: string;
  codeBlock?: string;
  timestamp: string;
}

const CommunitySupport: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I am Nexus AI. I can help you with IDE features, debugging, or documentation. How can I assist you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isHumanMode, setIsHumanMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<Chat | null>(null);

  // Initialize Gemini Chat
  useEffect(() => {
    if (!process.env.API_KEY) return;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    chatSessionRef.current = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `You are Nexus AI, a highly technical and helpful support assistant for the Nexus IDE. 
        Nexus IDE is a web-based integrated development environment.
        Help users with coding questions, IDE features (Editor, Design Studio, Infrastructure management), and debugging.
        If a user seems frustrated or asks for a human, suggest escalating the ticket using the keyword "ESCALATE_TO_HUMAN".
        Keep answers concise and technical. Format code blocks using markdown backticks.`
      }
    });
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    if (isHumanMode) {
      // Mock Human Agent Response
      setTimeout(() => {
        const agentMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'human_agent',
          text: "I'm looking into that for you right now. Could you please provide your deployment ID?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, agentMsg]);
        setIsTyping(false);
      }, 2000);
      return;
    }

    try {
      if (!chatSessionRef.current) {
        throw new Error("AI Service Unavailable");
      }

      const result = await chatSessionRef.current.sendMessage({ message: userMsg.text });
      const aiResponseText = result.text || "I'm having trouble connecting to the knowledge base.";

      // Check for escalation trigger
      if (aiResponseText.includes("ESCALATE_TO_HUMAN")) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: "I understand this is a complex issue. I am connecting you to a specialist now...",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setTimeout(() => {
           setIsHumanMode(true);
           setIsTyping(false);
           setMessages(prev => [...prev, {
             id: (Date.now() + 2).toString(),
             sender: 'human_agent',
             text: "Hi there! I'm Sarah, a senior support engineer. I've reviewed your chat history. How can I help resolve this?",
             timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
           }]);
        }, 1500);
        return;
      }

      // Parse code blocks roughly for display (simple split)
      const parts = aiResponseText.split('```');
      const textPart = parts[0];
      const codePart = parts.length > 1 ? parts[1] : undefined;
      // If there is code, usually the first line is language, e.g. "typescript\n..."
      let cleanCode = codePart;
      if (codePart) {
        const firstLineBreak = codePart.indexOf('\n');
        if (firstLineBreak > -1) {
            cleanCode = codePart.substring(firstLineBreak + 1);
        }
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: textPart,
        codeBlock: cleanCode,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "I apologize, but I'm currently offline. Please try again later.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      if (!isHumanMode) setIsTyping(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-950 flex flex-col h-full overflow-hidden">
      <header className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
        <div>
          <h1 className="text-2xl font-bold text-white">Community & Support</h1>
          <p className="text-slate-400 text-sm">
            {isHumanMode ? 'Live Chat with Support Specialist' : 'Nexus AI Assistant'}
          </p>
        </div>
        <div className="flex items-center gap-4">
            {!isHumanMode && (
                <button 
                    onClick={() => { setIsHumanMode(true); setIsTyping(false); setMessages(p => [...p, { id: Date.now().toString(), sender: 'human_agent', text: "Connecting you to an agent...", timestamp: ""}]); }}
                    className="text-xs text-indigo-400 hover:text-white border border-indigo-500/30 rounded px-3 py-1 transition-colors"
                >
                    Request Human Agent
                </button>
            )}
            <div className="flex -space-x-2">
            {[1,2,3,4].map(i => (
                <div key={i} className={`w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-white bg-indigo-${i*100 + 400}`}>
                {i === 4 ? '+9' : ''}
                </div>
            ))}
            </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col relative">
          <div className="flex-1 p-8 overflow-y-auto space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg ${
                  msg.sender === 'ai' ? 'bg-indigo-600 shadow-indigo-500/20' : 
                  msg.sender === 'human_agent' ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-slate-700'
                }`}>
                  <span className="material-symbols-rounded text-white">
                    {msg.sender === 'ai' ? 'smart_toy' : msg.sender === 'human_agent' ? 'support_agent' : 'person'}
                  </span>
                </div>
                <div className={`${msg.sender === 'user' ? 'text-right' : 'w-full'}`}>
                  <div className={`flex items-center gap-2 mb-1 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                    {msg.sender !== 'user' && <span className="font-bold text-white">{msg.sender === 'ai' ? 'Nexus AI' : 'Sarah (Support)'}</span>}
                    <span className="text-xs text-slate-500">{msg.timestamp}</span>
                    {msg.sender === 'user' && <span className="font-bold text-white">You</span>}
                  </div>
                  <div className={`p-4 rounded-2xl shadow-sm inline-block text-left ${
                    msg.sender === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none w-full'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    {msg.codeBlock && (
                      <div className="mt-3 bg-slate-950 rounded border border-slate-800 p-3 font-mono text-xs overflow-x-auto relative group">
                        <button className="absolute right-2 top-2 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-rounded text-sm">content_copy</span>
                        </button>
                        <pre className="text-emerald-400">{msg.codeBlock}</pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
                <div className="flex gap-4 max-w-3xl">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isHumanMode ? 'bg-emerald-600' : 'bg-indigo-600'}`}>
                        <span className="material-symbols-rounded text-white">{isHumanMode ? 'support_agent' : 'smart_toy'}</span>
                     </div>
                     <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl rounded-tl-none flex items-center gap-1">
                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100"></span>
                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200"></span>
                     </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-slate-900 border-t border-slate-800 z-10">
            <div className="relative max-w-4xl mx-auto">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isHumanMode ? "Type your message to support..." : "Ask Nexus AI for help..."}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-6 pr-14 text-white focus:outline-none focus:border-indigo-500 shadow-lg"
              />
              <button 
                onClick={handleSend}
                className="absolute right-3 top-3 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
              >
                <span className="material-symbols-rounded">send</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar - Support Topics */}
        <div className="w-80 bg-slate-900 border-l border-slate-800 hidden xl:flex flex-col">
          <div className="p-4 border-b border-slate-800">
            <h3 className="font-bold text-white mb-4">Documentation</h3>
            <div className="space-y-2">
              {['Getting Started', 'Authentication', 'Database Rules', 'Deployments'].map((topic, i) => (
                <a key={i} href="#" className="flex items-center justify-between p-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded transition-colors group">
                  <span className="text-sm">{topic}</span>
                  <span className="material-symbols-rounded text-[16px] opacity-0 group-hover:opacity-100">arrow_forward</span>
                </a>
              ))}
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-bold text-white mb-4">Active Forum Topics</h3>
            <div className="space-y-4">
              <div className="group cursor-pointer">
                <h4 className="text-sm font-medium text-indigo-400 group-hover:underline">Build failing on iOS 17</h4>
                <p className="text-xs text-slate-500 mt-1">24 replies • 2h ago</p>
              </div>
              <div className="group cursor-pointer">
                <h4 className="text-sm font-medium text-indigo-400 group-hover:underline">Best practices for large DBs?</h4>
                <p className="text-xs text-slate-500 mt-1">12 replies • 5h ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunitySupport;