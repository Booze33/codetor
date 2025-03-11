'use client';

import { getChat, getMessages, sendMessage, sendAiMessage, writeTitle } from '@/lib/actions/chat.action';
import { useEffect, useRef, useState, useCallback, use } from 'react';
import { getLoggedInUser } from '@/lib/actions/user.action';
import { Textarea } from '@/components/ui/textarea';

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

const useWebSocket = () => {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current) return;

    const ws = new WebSocket("wss://socket-prioprity-pro.onrender.com");
    wsRef.current = ws;

    ws.onopen = () => console.log('WebSocket connected');

    ws.onmessage = (event) => {
      try {
        const messageData = JSON.parse(event.data);
        if (messageData.type === 'message') {
          setMessages((prev) => [...prev, messageData.data]);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected. Reconnecting in 3 seconds...');
      wsRef.current = null; // Allow reconnection
      setTimeout(connectWebSocket, 3000);
    };
  }, []);

  useEffect(() => {
    connectWebSocket();
    return () => wsRef.current?.close(); // Cleanup on unmount
  }, [connectWebSocket]);

  const sendWebSocketMessage = useCallback((message: MessageProps) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  return { messages, setMessages, sendWebSocketMessage };
};

const useChatInitialization = (chat_id: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<MessageProps[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [user, fetchedChat, chatMessages] = await Promise.all([
          getLoggedInUser(),
          getChat(chat_id),
          getMessages(chat_id),
        ]);

        if (!user) throw new Error('No user found');
        if (!fetchedChat?.length) throw new Error('Chat not found');

        setCurrentUser(user);
        setChat(fetchedChat[0]);
        setMessages(Array.isArray(chatMessages) ? chatMessages : []);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
        console.error('Initialization error:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [chat_id]);

  return { loading, error, chat, currentUser, messages, setMessages };
};

const ChatPage = ({ params }: ChatPageProps) => {
  const { chat_id } = use(params);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    loading,
    error,
    chat,
    currentUser,
    messages,
    setMessages,
  } = useChatInitialization(chat_id);

  const { sendWebSocketMessage } = useWebSocket();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !chat || !currentUser) return;

    const messageData: MessageProps = {
      $id: `temp-${Date.now()}`,
      sender: 'user',
      content: newMessage,
      chat_id,
      user_id: currentUser.user_id,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, messageData]);
    sendWebSocketMessage(messageData);
    setNewMessage('');

    try {
      const response = await sendMessage(chat_id, currentUser.user_id, newMessage);
      if (response) console.log(response);
      Promise.allSettled([
        sendAiMessage(chat_id, currentUser.user_id, newMessage),
        chat.title === "New Chat" ? writeTitle(chat_id, newMessage) : null,
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [newMessage, chat, currentUser, chat_id, sendWebSocketMessage, setMessages]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

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
        <h1 className="text-lg font-semibold">{chat?.title || 'Chat'}</h1>
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
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
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
