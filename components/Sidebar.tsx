'use client';

import { getLoggedInUser } from '@/lib/actions/user.action';
import { createChat, getChats } from '@/lib/actions/chat.action';
import { useState, useEffect } from 'react';
import { useSidebarToggle } from '@/hooks/useSidebarToggle';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare } from 'lucide-react';
import Link from 'next/link'; 
import { useRouter } from 'next/navigation';

const Sidebar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isOpen } = useSidebarToggle();
  const router = useRouter();

  useEffect(() => {
    const checkLoggedInStatus = async () => {
      try {
        const loggedInUser = await getLoggedInUser();
        setUser(loggedInUser || null);
        setIsLoggedIn(!!loggedInUser);

        if (loggedInUser) {
          const userChats = await getChats(loggedInUser.user_id);
          setChats(userChats || []);
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      }
    };

    checkLoggedInStatus();
  }, []);

  const handleCreateChat = async () => {
    if (loading || !user || !user.user_id) return;
    setLoading(true);

    try {
      const chat = await createChat(user.user_id);

      if (chat) {
        localStorage.removeItem('chat_id');
        localStorage.setItem('chat_id', chat.chat_id);

        setChats((prevChats) => [chat, ...prevChats]);
        router.push(`/chat/${chat.chat_id}`);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className={`fixed top-12 left-0 h-screen bg-gray-200 dark:bg-gray-800 text-black dark:text-white flex flex-col border-r-2 border-gray-400 transition-all duration-300 ${
        isOpen ? 'w-48' : 'w-0 opacity-0'
      }`}
    >
      <div className="w-full p-4 flex flex-col gap-4">
        <div className="font-bold text-lg">
          {isLoggedIn ? (
            <Button onClick={handleCreateChat} disabled={loading}>
              <Plus size={24} />
              {loading ? "Creating..." : "Create Chat"}
            </Button>
          ) : (
            <p>Not Logged In</p>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 px-1">Recent Chats</h3>
          {chats.length > 0 ? (
            chats.map((chat) => (
              <Link
                key={chat.$id}
                href={`/chat/${chat.$id}`}
                className="flex items-center gap-2 hover:bg-gray-300 dark:hover:bg-gray-700 p-2 rounded truncate"
              >
                <MessageSquare size={16} />
                <span>{chat.title || `Chat ${chat.$id.slice(0, 8)}`}</span>
              </Link>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 px-2">No chats yet</p>
          )}
        </div>
      </div>
      
      <div className="mt-auto border-t-2 border-gray-400 w-full p-4">
        <div className="text-sm opacity-75">Logged in as:</div>
        <div className="font-medium truncate">{user?.email || 'Not logged in'}</div>
      </div>
    </div>
  );
};

export default Sidebar;
