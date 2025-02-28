'use client';

import { getLoggedInUser, logoutAccount } from '@/lib/actions/user.action';
import { useSidebarToggle } from '@/hooks/useSidebarToggle';
import { useState, useEffect } from 'react';
import { PanelLeftOpen, PanelRightOpen, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState({});
  const [theme, setTheme] = useState('system');
  const { isOpen, toggleSidebar } = useSidebarToggle();
  const element = document.documentElement;

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
      setTheme(darkQuery.matches ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      element.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else if (theme === 'light') {
      element.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else if (theme === 'system') {
      const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
      if (darkQuery.matches) {
        element.classList.add("dark");
      } else {
        element.classList.remove("dark");
      }
      localStorage.setItem("theme", "system");

      const themeChangeHandler = (e) => {
        if (e.matches) {
          element.classList.add("dark");
        } else {
          element.classList.remove("dark");
        }
      };
      
      darkQuery.addEventListener("change", themeChangeHandler);
      return () => darkQuery.removeEventListener("change", themeChangeHandler);
    }
  }, [theme, element]);

  useEffect(() => {
    const checkLoggedInStatus = async () => {
      try {
        const loggedInUser = await getLoggedInUser();
        setLoggedIn(!!loggedInUser);
        setUser(loggedInUser || {});
      } catch (error) {
        setLoggedIn(false);
        console.error('Error checking login status:', error);
      }
    };

    checkLoggedInStatus();
  }, []);

  const handleLogout = async () => {
    const logOut = await logoutAccount();
    if(logOut) router.push('/sign_in');
  };

  const handleTheme = () => {
    setTheme(currentTheme => {
      if (currentTheme === 'light') return 'dark';
      if (currentTheme === 'dark') return 'system';
      return 'light';
    });
  };

  return (
    <div className="sticky top-0 w-full h-12 bg-gray-200 dark:bg-gray-800 text-black dark:text-white flex items-center justify-between border-2 border-b-gray-400 px-4">
      <div className="cursor-pointer" onClick={toggleSidebar}>
        {isOpen ? (
          <PanelLeftOpen size={24} />
        ) : (
          <PanelRightOpen size={24} />
        )}
      </div>
      <div className="flex items-center gap-4">
        {loggedIn ? (
          <div className="flex items-center gap-4">
            <div>Hello, {user.firstName || 'User'}</div>
            <Button onClick={handleLogout} className="bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800 rounded-md px-4 py-2">Logout</Button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link href='/sign_up' className="hover:underline">Sign Up</Link>
            <Link href='/sign_in' className="bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800 rounded-md px-4 py-2 hover:opacity-90">Log In</Link>
          </div>
        )}
        <Button onClick={handleTheme} variant="ghost" size="icon" className="rounded-full w-8 h-8 p-0">
          {theme === 'dark' ? (
            <Sun size={18} className="text-yellow-500" />
          ) : (
            <Moon size={18} className="text-gray-700 dark:text-gray-300" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default Navbar;