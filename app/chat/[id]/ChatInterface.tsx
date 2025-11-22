'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { sendMessage } from '@/app/actions/chat';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Send, ArrowLeft, Phone, Home } from 'lucide-react';
import { formatDistance } from 'date-fns';

type Message = {
  id: string;
  text: string;
  createdAt: Date;
  sender: {
    id: string;
    name: string | null;
    profilePic?: string | null;
  };
};

type Chat = {
  id: string;
  property: {
    id: string;
    title: string;
    images: string[] | null;
    rent: number;
  };
  user: {
    id: string;
    name: string | null;
    profilePic?: string | null;
    email: string;
    phone?: string | null;
  };
  owner: {
    id: string;
    name: string | null;
    profilePic?: string | null;
    email: string;
    phone?: string | null;
  };
};

export function ChatInterface({
  chat,
  messages: initialMessages,
  currentUserId,
}: {
  chat: Chat;
  messages: Message[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherPerson = currentUserId === chat.user.id ? chat.owner : chat.user;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    setSending(true);
    const result = await sendMessage(chat.id, newMessage.trim());

    if (result.success && result.message) {
      setMessages((prev) => [...prev, result.message as any]);
      setNewMessage('');
      scrollToBottom();
    } else {
      alert(result.error || 'Failed to send message');
    }
    
    setSending(false);
  };

  const handleCall = () => {
    if (otherPerson.phone) {
      window.location.href = `tel:${otherPerson.phone}`;
    } else {
      alert('Phone number not available');
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-80px)] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={20} />
          </button>
          
          {otherPerson.profilePic ? (
            <img
              src={otherPerson.profilePic}
              alt={otherPerson.name || 'User'}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="font-bold text-blue-600">
                {otherPerson.name?.[0] || 'U'}
              </span>
            </div>
          )}
          
          <div>
            <p className="font-semibold">{otherPerson.name}</p>
            <p className="text-sm text-gray-500">{otherPerson.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {otherPerson.phone && (
            <Button onClick={handleCall} variant="outline" size="sm">
              <Phone size={18} />
            </Button>
          )}
          <Button
            onClick={() => router.push(`/property/${chat.property.id}`)}
            variant="outline"
            size="sm"
          >
            <Home size={18} />
          </Button>
        </div>
      </div>

      {/* Property Info */}
      <div className="bg-gray-50 border-b px-4 py-3">
        <div className="flex items-center gap-3">
          {chat.property.images?.[0] && (
            <img
              src={chat.property.images[0]}
              alt={chat.property.title}
              className="w-12 h-12 rounded object-cover"
            />
          )}
          <div>
            <p className="font-medium">{chat.property.title}</p>
            <p className="text-sm text-gray-600">
              ₹{chat.property.rent.toLocaleString()}/month
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender.id === currentUserId;
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-md ${isOwn ? 'flex-row-reverse' : ''}`}>
                  {!isOwn && message.sender.profilePic && (
                    <img
                      src={message.sender.profilePic}
                      alt={message.sender.name || 'User'}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  
                  <div>
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        isOwn
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-900'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.text}</p>
                    </div>
                    <p className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : ''}`}>
                      {formatDistance(new Date(message.createdAt), new Date(), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1"
          />
          <Button type="submit" disabled={sending || !newMessage.trim()}>
            <Send size={20} />
          </Button>
        </form>
      </div>
    </div>
  );
}