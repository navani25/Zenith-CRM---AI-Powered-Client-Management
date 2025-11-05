
import React, { useState, useRef, useEffect } from 'react';
import { isAiAvailable, runCrmQuery } from '../services/geminiService';
import { ChatMessage, Deal, Contact, Task } from '../types';

interface AIAssistantProps {
    deals: Deal[];
    contacts: Contact[];
    tasks: Task[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ deals, contacts, tasks }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'ai', text: 'Hello! I am Zenith AI. How can I help you with your CRM data today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isConfigured, setIsConfigured] = useState(isAiAvailable());


  useEffect(() => {
    // @ts-ignore
    if (window.lucide) {
        // @ts-ignore
        window.lucide.createIcons();
    }
  }, [messages, isConfigured]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await runCrmQuery(input, { deals, contacts, tasks });
      const aiMessage: ChatMessage = { sender: 'ai', text: responseText };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = { sender: 'ai', text: "Sorry, I encountered an error. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConfigured) {
    return (
        <div className="h-full p-4 md:p-6 flex items-center justify-center">
            <div className="text-center bg-card dark:bg-dark-card p-8 rounded-lg border border-border dark:border-dark-border max-w-md">
                <i data-lucide="sparkles" className="w-12 h-12 mx-auto text-primary mb-4"></i>
                <h2 className="text-xl font-semibold">AI Assistant Not Available</h2>
                <p className="mt-2 text-muted-foreground dark:text-dark-muted-foreground">
                    This feature has not been configured by the administrator.
                </p>
            </div>
        </div>
    );
  }

  return (
    <div className="h-full p-4 md:p-6">
      <div className="flex flex-col h-full bg-card dark:bg-dark-card rounded-lg border border-border dark:border-dark-border">
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-secondary dark:bg-dark-secondary flex items-center justify-center flex-shrink-0">
                    <i data-lucide="sparkles" className="w-4 h-4 text-foreground dark:text-dark-foreground"></i>
                  </div>
                )}
                <div className={`max-w-xl p-3 rounded-lg ${
                  msg.sender === 'ai' 
                  ? 'bg-secondary dark:bg-dark-secondary text-foreground dark:text-dark-foreground' 
                  : 'bg-primary text-primary-foreground'
                }`}>
                  <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
                </div>
                {msg.sender === 'user' && (
                  <img src="https://picsum.photos/seed/user/40/40" alt="User" className="w-8 h-8 rounded-full flex-shrink-0"/>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary dark:bg-dark-secondary flex items-center justify-center flex-shrink-0">
                  <i data-lucide="sparkles" className="w-4 h-4 text-foreground dark:text-dark-foreground"></i>
                </div>
                <div className="max-w-xl p-3 rounded-lg bg-secondary dark:bg-dark-secondary">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-muted-foreground dark:text-dark-muted-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-muted-foreground dark:text-dark-muted-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-muted-foreground dark:text-dark-muted-foreground rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="p-4 border-t border-border dark:border-dark-border">
          <form onSubmit={handleSendMessage} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your deals, contacts, or tasks..."
              className="w-full pl-4 pr-12 py-2.5 rounded-md bg-secondary dark:bg-dark-secondary border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md bg-primary text-primary-foreground disabled:bg-primary/50 disabled:cursor-not-allowed hover:bg-primary/90 transition"
            >
              <i data-lucide="send" className="w-5 h-5"></i>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;