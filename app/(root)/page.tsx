'use client';

import { getLoggedInUser } from '@/lib/actions/user.action';
import { createChat, sendMessage, sendAIMessage, writeTitle } from '@/lib/actions/chat.action';
import React, { useState, useEffect, useCallback } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

const Home = () => {
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    getLoggedInUser()
      .then(setUser)
      .catch ((error) => console.error('Error checking login status:', error));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!message.trim() || !user) {
      setError('Error: User not logged in.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const chat = await createChat(user.user_id);

      if (!chat) throw new Error('Chat creation failed');

      await sendMessage(chat.chat_id, user.user_id, message);

      Promise.allSettled([
        sendAIMessage(chat.chat_id, user.user_id, message),
        chat.title === "New Chat" ? writeTitle(chat.chat_id, message) : null,
      ]);

      setMessage('');
      router.push(`/chat/${chat.chat_id}`);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [message, user, router]);

  return (
    <section className="w-full h-full flex justify-center items-center">
      {user ? (
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