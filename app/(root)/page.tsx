'use client';

import { getLoggedInUser } from '@/lib/actions/user.action';
import { createChat, createMessage } from '@/lib/actions/chat.action';
import React, { useState, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

const Home = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkLoggedInStatus = async () => {
      try {
        const loggedInUser = await getLoggedInUser();
        setUser(loggedInUser || null);
        setLoggedIn(!!loggedInUser);
      } catch (error) {
        console.error('Error checking login status:', error);
      }
    };

    checkLoggedInStatus();
  }, []);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    if (!user) {
      setError('Error: User not logged in.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const chat = await createChat(user.user_id);

      if (chat) {
        await createMessage(chat.chat_id, user.user_id, message);
        setMessage('');
        router.push(`/chat/${chat.chat_id}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full h-full flex justify-center items-center">
      {loggedIn ? (
        <div className="w-[70vw]">
          <h3 className="mb-8">Welcome Back</h3>
          <Textarea
            placeholder="Enter message"
            className="w-full h-[9rem] rounded-md mb-4"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <Button
            className="bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800 rounded-md px-4 py-2"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Sending..." : "Submit"}
          </Button>
        </div>
      ) : (
        <p>Please log in</p>
      )}
    </section>
  );
};

export default Home;