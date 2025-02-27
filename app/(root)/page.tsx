'use client';

import { getLoggedInUser, logoutAccount } from '@/lib/actions/user.action';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

const Home = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const user = await getLoggedInUser();
        setLoggedIn(!!user);
        console.log(user)
      } catch (error) {
        console.error('Error checking login status:', error);
        setLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogOut = async () => {
      const loggedOut = await logoutAccount();
  
      if(loggedOut) router.push('/sign_in')
    }

  return (
    <section className="home">
      {loggedIn ? (
        <div>
          <p>Welcome Back</p>
          <Button onClick={handleLogOut}>Logout</Button>
        </div>
      ) : (
        <p>Please log in</p>
      )}
    </section>
  );
};

export default Home;