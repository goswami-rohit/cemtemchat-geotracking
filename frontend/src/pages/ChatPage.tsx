// frontend/src/pages/ChatPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import GeoTrackingHistorySidebar from './GeoTrackingHistory'; // Correct import path

interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
}

interface SafeRelativeTimeProps {
    timestamp: Date;
}

// Safe time display component to fix hydration error (standard React, keep as is)
function SafeTimeDisplay({ timestamp }: { timestamp: Date }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <span className="text-xs text-gray-400 mt-1">...</span>;
    }

    return (
        <span className="text-xs text-gray-400 mt-1">
            {timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            })}
        </span>
    );
}

// Safe relative time display for chat history (standard React, keep as is)
const SafeRelativeTime: React.FC<SafeRelativeTimeProps> = ({ timestamp }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <span className="text-xs text-gray-400">...</span>;
    }

    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return <span className="text-xs text-gray-400">Just now</span>;
    if (minutes < 60) return <span className="text-xs text-gray-400">{minutes}m ago</span>;
    if (hours < 24) return <span className="text-xs text-gray-400">{hours}h ago</span>;
    return <span className="text-xs text-gray-400">{days}d ago</span>;
};
export { SafeRelativeTime };

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            content: 'Hello! I\'m CemTemBot, your AI-powered business assistant. How can I help you manage your company today?',
            role: 'assistant',
            timestamp: new Date(),
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false); // For mobile sidebar toggle
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            content: inputMessage,
            role: 'user',
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        // Auto-resize textarea back to single line
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        // Simulate AI response (replace with actual API call later)
        setTimeout(() => {
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: 'Thank you for your message! I\'m here to help you with company management tasks. This is a placeholder response - the actual AI integration will be implemented in the next phase.',
                role: 'assistant',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, assistantMessage]);
            setIsLoading(false);
        }, 1500);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputMessage(e.target.value);

        // Auto-resize textarea
        const textarea = e.target;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    };

    return (
        // Main container: Keeping w-screen as requested.
        <div className="relative flex h-screen w-screen bg-gray-900 text-gray-100 overflow-hidden">
            {/* Desktop Geo Tracking History Sidebar */}
            <div className="hidden md:block w-80 border-r border-gray-700 bg-gray-800 shadow-lg flex-shrink-0">
                <GeoTrackingHistorySidebar />
            </div>

            {/* Mobile Sidebar Overlay (simple implementation) */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-70 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}
            <div
                className={`fixed top-0 left-0 h-full w-80 bg-gray-800 shadow-lg z-50 transform transition-transform duration-300 ease-in-out md:hidden
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <GeoTrackingHistorySidebar />
                {/* Close button for mobile sidebar */}
                <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
                    onClick={() => setSidebarOpen(false)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </button>
            </div>

            {/* Main Chat Area: Added w-full and min-w-0 for mobile layout fix */}
            <div className="flex-1 flex flex-col h-full w-full min-w-0">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800 shadow-sm">
                    <button
                        className="p-2 rounded-md hover:bg-gray-700 text-gray-200"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
                    </button>

                    <div className="flex items-center space-x-2 text-lg font-semibold text-gray-100">
                        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bot"><path d="M12 8V4H8" /><rect width="12" height="12" x="6" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg>
                        </div>
                        <span>CemTemBot</span>
                    </div>

                    <button className="p-2 rounded-md hover:bg-gray-700 text-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.78 1.22a2 2 0 0 0 .73 2.73l.09.09a2 2 0 0 1 0 2.83l-.08.08a2 2 0 0 0-.73 2.73l.78 1.22a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.78-1.22a2 2 0 0 0-.73-2.73l-.09-.09a2 2 0 0 1 0-2.83l.08-.08a2 2 0 0 0 .73-2.73l-.78-1.22a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto py-6">
                    <div className="space-y-6">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'} px-4`}
                            >
                                {message.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bot"><path d="M12 8V4H8" /><rect width="12" height="12" x="6" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg>
                                    </div>
                                )}

                                <div className={`flex flex-col max-w-[80%] md:max-w-[70%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div
                                        className={`rounded-lg px-4 py-3 shadow-sm ${message.role === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-700 border border-gray-600 text-gray-100'
                                            }`}
                                    >
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                            {message.content}
                                        </p>
                                    </div>
                                    <SafeTimeDisplay timestamp={message.timestamp} />
                                </div>

                                {message.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-gray-200 flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="flex gap-4 justify-start px-4">
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bot"><path d="M12 8V4H8" /><rect width="12" height="12" x="6" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg>
                                </div>
                                <div className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 shadow-sm">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-700 bg-gray-800 py-4 shadow-md flex-shrink-0">
                    <div className="px-4">
                        <div className="flex gap-2 items-end">
                            <div className="flex-1 relative">
                                <textarea
                                    ref={textareaRef}
                                    value={inputMessage}
                                    onChange={handleTextareaChange}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Message CemTemBot..."
                                    className="w-full min-h-[44px] max-h-[120px] resize-none pr-12 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-100 bg-gray-700"
                                    disabled={isLoading}
                                ></textarea>
                                <button
                                    onClick={handleSendMessage}
                                    disabled={isLoading || !inputMessage.trim()}
                                    className="absolute right-2 bottom-2 h-8 w-8 p-0 bg-blue-600 text-white rounded-md flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send"><path d="m22 2-7 20-4-9-9-4 20-7Z" /><path d="M22 2 11 13" /></svg>
                                </button>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 text-center">
                            CemTemBot can make mistakes. Please verify important information.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}