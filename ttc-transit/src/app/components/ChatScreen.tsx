import { useState } from 'react';
import { Send, ChevronLeft, Bot, User as UserIcon } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import type { Screen } from '../App';

interface ChatScreenProps {
  onNavigate: (screen: Screen) => void;
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

export function ChatScreen({ onNavigate }: ChatScreenProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Hello! I\'m the TTC Virtual Assistant. How can I help you today?',
      sender: 'bot',
      timestamp: '10:30 AM'
    },
  ]);

  const handleSend = () => {
    if (!message.trim()) return;

    const newUserMessage: Message = {
      id: messages.length + 1,
      text: message,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };

    setMessages([...messages, newUserMessage]);
    setMessage('');

    setTimeout(() => {
      const botResponse: Message = {
        id: messages.length + 2,
        text: 'Thank you for your message. A customer service representative will assist you shortly.',
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('profile')}>
            <ChevronLeft className="w-6 h-6 text-[#1B1E23]" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-[#DA291C] rounded-full p-2">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-[#1B1E23]">TTC Support</h1>
              <p className="text-xs text-gray-500">Always here to help</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`rounded-full p-2 h-fit ${
              msg.sender === 'user' ? 'bg-[#DA291C]' : 'bg-gray-200'
            }`}>
              {msg.sender === 'user' ? (
                <UserIcon className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-gray-700" />
              )}
            </div>
            <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} max-w-[70%]`}>
              <div className={`rounded-2xl px-4 py-3 ${
                msg.sender === 'user' 
                  ? 'bg-[#DA291C] text-white rounded-tr-sm' 
                  : 'bg-white text-[#1B1E23] rounded-tl-sm shadow-sm'
              }`}>
                <p className="text-sm">{msg.text}</p>
              </div>
              <span className="text-xs text-gray-500 mt-1">{msg.timestamp}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Replies */}
      <div className="px-6 py-3 bg-white border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-2">Quick replies:</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setMessage('Service delays?')}
            className="px-4 py-2 bg-gray-100 rounded-full text-sm whitespace-nowrap hover:bg-gray-200"
          >
            Service delays?
          </button>
          <button
            onClick={() => setMessage('Fare info')}
            className="px-4 py-2 bg-gray-100 rounded-full text-sm whitespace-nowrap hover:bg-gray-200"
          >
            Fare info
          </button>
          <button
            onClick={() => setMessage('Accessibility')}
            className="px-4 py-2 bg-gray-100 rounded-full text-sm whitespace-nowrap hover:bg-gray-200"
          >
            Accessibility
          </button>
        </div>
      </div>

      {/* Input */}
      <div className="px-6 py-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 rounded-full border-2 border-gray-200 focus:border-[#DA291C] h-12"
          />
          <Button
            onClick={handleSend}
            className="bg-[#DA291C] hover:bg-[#b31f15] text-white rounded-full w-12 h-12 p-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
