import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Smile, Bot, User, HelpCircle } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatSystem({ isOpen, onClose }: ChatSystemProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: "Hello! 🌾 I'm Freshy, your FreshMarket Co. virtual shopping assistant. I can help you check active shelf stock, suggest delicious recipes using our ingredients, or trace delivery details. Ask me anything!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      const data = await response.json();
      setIsTyping(false);

      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: data.reply || "I am processing your grocery request!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setIsTyping(false);

      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'system',
        text: 'Connection error. Freshy is stocking shelves and will be back shortly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const sampleQuestions = [
    "What fresh fruits are in stock?",
    "Do you have organic sourdough bread?",
    "Tell me your delivery slots and pricing.",
    "Suggest a salmon recipe with ingredients."
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[500px] w-full max-w-sm flex-col rounded-2xl border border-slate-100 bg-white shadow-2xl overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-sm">
            <Bot className="h-4.5 w-4.5" />
          </div>
          <div className="text-left">
            <p className="font-display text-sm font-bold leading-tight">Freshy</p>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold leading-none">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Store Assistant
            </span>
          </div>
        </div>
        <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages Thread */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-slate-50/50 p-4 space-y-3.5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
          >
            {/* Avatar icon */}
            <div
              className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border text-[11px] font-bold ${
                msg.sender === 'user'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                  : msg.sender === 'system'
                  ? 'bg-red-50 text-red-800 border-red-100'
                  : 'bg-white text-slate-800 border-slate-200 shadow-xs'
              }`}
            >
              {msg.sender === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
            </div>

            <div className="text-left">
              <div
                className={`rounded-2xl px-3 py-2 text-xs font-semibold leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : msg.sender === 'system'
                    ? 'bg-red-50 text-red-700 border border-red-100 rounded-tl-none'
                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[9px] text-slate-400 font-bold mt-1 block px-1 text-right">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2 mr-auto max-w-[85%]">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border bg-white border-slate-200 text-slate-800 shadow-xs">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="rounded-2xl rounded-tl-none border border-slate-100 bg-white px-3.5 py-2.5 shadow-xs flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested quick questions */}
      {messages.length === 1 && (
        <div className="bg-slate-50 border-t border-slate-100 p-2 text-left space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Suggested Inquiries</p>
          <div className="flex flex-col gap-1 max-h-24 overflow-y-auto">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => setInputText(q)}
                className="text-[11px] font-bold text-slate-600 hover:text-emerald-700 bg-white border border-slate-200 px-2 py-1 rounded-lg text-left truncate hover:bg-emerald-50 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input controls */}
      <form onSubmit={handleSend} className="flex border-t border-slate-100 bg-white p-2.5 items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask Freshy about stock or slots..."
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-100 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100 transition-all flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
