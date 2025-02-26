'use client';

import { getLoggedInUser } from '@/lib/actions/user.action';
import React, { useState, useEffect } from 'react';

const Home = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const user = await getLoggedInUser();
        setLoggedIn(!!user);
      } catch (error) {
        console.error('Error checking login status:', error);
        setLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <section className="home">
      {loggedIn ? (
        <p>Welcome back!</p>
      ) : (
        <p>Please log in</p>
      )}
    </section>
  );
};

export default Home;