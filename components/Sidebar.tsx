'use client';

import { getLoggedInUser } from '@/lib/actions/user.action';
import { createChat } from '@/lib/actions/chat.action';
import { useState, useEffect } from 'react';
import { useSidebarToggle } from '@/hooks/useSidebarToggle';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Sidebar = () => {
  const [user, setUser] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { isOpen } = useSidebarToggle();

  console.log(isOpen)

  useEffect(() => {
    const checkLoggedInStatus = async () => {
      try {
        const loggedInUser = await getLoggedInUser();
        setUser(loggedInUser || {});
        setIsLoggedIn(!!loggedInUser);
      } catch (error) {
        console.error('Error checking login status:', error);
      }
    };

    checkLoggedInStatus();
  }, []);

  const handleCreateChat = async () => {
    try {
      const chat = await createChat(user.user_id);

      if(chat) {
        console.log(chat);
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div 
      className={`fixed top-12 left-0 h-screen bg-gray-200 dark:bg-gray-800 text-black dark:text-white flex flex-col border-r-2 border-gray-400 transition-all duration-300 ${
        isOpen ? 'w-48' : 'w-0 opacity-0'
      }`}
    >
      <div className="w-full p-4 flex flex-col gap-4">
        <div className="font-bold text-lg">
          { isLoggedIn ? (
            <Button onClick={handleCreateChat}>
              <Plus size={24} />
              Create Chat
            </Button>
          ) : (
            <p>Not Logged In</p>
          )}
        </div>
        
        <nav className="flex flex-col gap-2">
          <a href="/dashboard" className="hover:bg-gray-300 dark:hover:bg-gray-700 p-2 rounded">Dashboard</a>
          <a href="/profile" className="hover:bg-gray-300 dark:hover:bg-gray-700 p-2 rounded">Profile</a>
          <a href="/settings" className="hover:bg-gray-300 dark:hover:bg-gray-700 p-2 rounded">Settings</a>
        </nav>
      </div>
      
      <div className="mt-auto border-t-2 border-gray-400 w-full p-4">
        <div className="text-sm opacity-75">Logged in as:</div>
        <div className="font-medium truncate">{user.email || 'Not logged in'}</div>
      </div>
    </div>
  );
};

export default Sidebar;