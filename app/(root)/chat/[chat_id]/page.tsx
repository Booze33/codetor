'use client';

import { getChat } from '@/lib/actions/chat.action';
import { getMessages, sendMessage } from '@/lib/actions/chat.action';
import { useEffect, useRef, useState } from 'react';
import { getLoggedInUser } from '@/lib/actions/user.action';
import { Textarea } from '@/components/ui/textarea';
import { use } from 'react';

interface MessageProps {
  $id: string;
  sender: string;
  content: string;
  chat_id: string;
  user_id: string;
  timestamp?: string;
}

interface Chat {
  $id: string;
  title: string;
  user_id: string;
  created_at?: string;
}

interface ChatPageProps {
  params: Promise<{
    chat_id: string;
  }>;
}

const ChatPage = ({ params }: ChatPageProps) => {
  const { chat_id } = use(params);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const connectWebSocket = () => {
      wsRef.current = new WebSocket("wss://socket-prioprity-pro.onrender.com");

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
      };

      wsRef.current.onmessage = (event) => {
        console.log(event);
        try {
          const messageData = JSON.parse(event.data);
          console.log(messageData);
          if (messageData.type === 'message') {
            setMessages(prev => [...prev, messageData.data]);
            console.log('websocket test completed');
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setTimeout(connectWebSocket, 3000);
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [chat_id]);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        setLoading(true);

        const user = await getLoggedInUser();
        if (!user) {
          throw new Error('No user found');
        }
        setCurrentUser(user);

        const fetchedChat = await getChat(chat_id);
        console.log('fetched chat data', fetchedChat);

        if(!fetchedChat) {
          throw new Error('Chat not found - no data returned');
        } else if (!Array.isArray(fetchedChat) && fetchedChat.length === 0) {
          throw new Error('Chat not found - empty array returned');
        }
        setChat(fetchedChat[0]);

        const chatMessages = await getMessages(chat_id);
        if (Array.isArray(chatMessages)) {
          setMessages(chatMessages);
        }

      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
        console.error('Initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeChat();
  }, [chat_id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chat || !currentUser) return;

    try {
      const messageData = {
        $id: `temp-${Date.now()}`,
        sender: 'user',
        content: newMessage,
        chat_id: chat_id,
        user_id: currentUser.user_id,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, messageData])

      if (wsRef.current) {
        wsRef.current.send(JSON.stringify(messageData));
      }

      const response = await sendMessage(chat_id, currentUser.user_id, newMessage);
      console.log('Message sent successfully:', response);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-white shadow-sm p-4 flex items-center">
        <h1 className="text-lg font-semibold">
          {chat?.title || 'Chat'}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.$id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`p-3 rounded-lg break-words whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-900 shadow'
                  }`}
                  style={{ maxWidth: '80%', wordWrap: 'break-word' }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="border-t bg-white p-4 flex gap-2">
        <Textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          rows={2}
        />
        <button 
          onClick={handleSendMessage}
          disabled={loading || !newMessage.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPage;