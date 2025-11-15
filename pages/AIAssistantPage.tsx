
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage } from '../types';
import { MessageAuthor } from '../types';
import { getChatResponse } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';

const AIAssistantPage: React.FC = () => {
  const { stories } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to find relevant stories from the library
  const findRelevantStories = useCallback((userMessage: string) => {
    if (!stories || stories.length === 0) return [];
    
    const messageLower = userMessage.toLowerCase();
    const publishedStories = stories.filter(s => s.status === 'published');
    
    return publishedStories.filter(story => {
      try {
        const titleMatch = story.title.toLowerCase().includes(messageLower);
        
        // Handle category as string or array
        const categoryArray = Array.isArray(story.category) ? story.category : [story.category];
        const categoryMatch = categoryArray.some(cat => messageLower.includes((cat as string)?.toLowerCase() || ''));
        
        // Handle tags safely
        const tagsMatch = story.tags && story.tags.some(tag => messageLower.includes(tag?.toLowerCase() || ''));
        const descMatch = story.shortDescription.toLowerCase().includes(messageLower);
        
        return titleMatch || categoryMatch || tagsMatch || descMatch;
      } catch (e) {
        return false;
      }
    }).slice(0, 3);
  }, [stories]);

  useEffect(() => {
    setMessages([
      {
        author: MessageAuthor.AI,
        text: "Hello! My name is Leo, your friendly guide to the Living Library. I'm here to help you discover the powerful stories within our collection. What are you curious about today?",
      },
    ]);
  }, []);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const newUserMessage: ChatMessage = { author: MessageAuthor.USER, text: userInput };
    const currentMessages = [...messages, newUserMessage];
    setMessages(currentMessages);
    setUserInput('');
    setIsLoading(true);

    const history = currentMessages
      .slice(0, -1)
      .filter(m => m.author === MessageAuthor.AI || m.author === MessageAuthor.USER)
      .map(m => ({
        role: m.author === MessageAuthor.USER ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

    try {
      // Find relevant stories from the library
      const relevantStories = findRelevantStories(userInput);
      
      // Add story context to AI prompt
      let enhancedUserMessage = userInput;
      if (relevantStories.length > 0) {
        const storyContext = `\n\n[Available resources related to your query: ${relevantStories.map(s => `"${s.title}"`).join(', ')}]`;
        enhancedUserMessage += storyContext;
      }
      
      const aiResponseText = await getChatResponse(history, enhancedUserMessage);
      
      // Format AI response with story references
      let formattedResponse = aiResponseText;
      if (relevantStories.length > 0) {
        const storyLinks = relevantStories
          .map(story => `• [${story.title}](/resource/${story.id}) - ${story.shortDescription}`)
          .join('\n');
        
        formattedResponse += `\n\n📚 **Related stories in our library:**\n${storyLinks}`;
      }
      
      const newAiMessage: ChatMessage = { 
        author: MessageAuthor.AI, 
        text: formattedResponse,
        relatedStories: relevantStories
      };
      setMessages(prev => [...prev, newAiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        author: MessageAuthor.AI,
        text: "I'm sorry, but I encountered an error. Please try again.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [userInput, isLoading, messages, findRelevantStories]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col h-[75vh]">
      <div className="p-4 border-b dark:border-slate-700">
        <h1 className="text-xl font-bold text-brand-navy">Leo, Your Library Guide</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Ask me about our stories or anything else you're curious about.</p>
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        <div className="space-y-4">
        {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.author === MessageAuthor.USER ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-lg px-4 py-2 rounded-xl ${msg.author === MessageAuthor.USER ? 'bg-brand-navy text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'}`}>
                <p className="whitespace-pre-wrap text-sm">{msg.text.split('📚')[0]}</p>
                {msg.text.includes('📚') && (
                  <div className="mt-3 pt-3 border-t border-slate-300 dark:border-slate-600">
                    <p className="font-semibold text-xs mb-2">📚 Related stories in our library:</p>
                    <div className="space-y-2">
                      {msg.relatedStories?.map((story, idx) => (
                        <Link
                          key={idx}
                          to={`/resource/${story.id}`}
                          className="block text-xs rounded px-2 py-1 transition-colors"
                          style={{
                            backgroundColor: msg.author === MessageAuthor.USER ? 'rgba(255,255,255,0.1)' : '#bf092f',
                            color: msg.author === MessageAuthor.USER ? 'white' : 'white',
                            textDecoration: 'none'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                          <div className="font-semibold">{story.title}</div>
                          <div className="text-xs opacity-90">{story.shortDescription}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="max-w-lg px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                <LoadingSpinner />
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 border-t dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask anything..."
            className="flex-grow w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-brand-navy focus:border-brand-navy disabled:bg-slate-200 dark:disabled:bg-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            className="text-white font-bold py-2 px-4 rounded-lg disabled:bg-slate-400 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#bf092f' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#8b0621'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#bf092f'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIAssistantPage;