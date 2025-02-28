'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { IoMoonSharp, IoSunny, IoDesktopSharp } from "react-icons/io5";

const Theme = ({ show }:{ show: boolean }) => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") ? localStorage.getItem("theme") : 'system');
  const element = document.documentElement;
  const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
  
  const options = [
    {
      icon: <IoSunny />,
      text: "light"
    },
    {
      icon: <IoMoonSharp />,
      text: "dark"
    },
    {
      icon: <IoDesktopSharp />,
      text: "system"
    }
  ];

  const onWindowMatch = () => {
    if (localStorage.theme === 'dark' || (!("theme" in localStorage) && darkQuery.matches)){
      element.classList.add("dark");
    } else {
      element.classList.remove("dark");
    }
  }

  onWindowMatch();

  useEffect(()=> {
    switch (theme) {
      case 'dark':
        element.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        break;
      case 'light':
        element.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        break;
      default:
        localStorage.removeItem('theme');
        onWindowMatch();
        break;
    }
  }, [theme]);

  darkQuery.addEventListener("change", (e) => {
    if(!("theme" in localStorage)) {
      if(e.matches){
        element.classList.add("dark");
      } else {
        element.classList.remove("dark");
      }
    }
  })

  return (
    <div  className={`z-20 ${show ? 'block' : 'hidden sm:block mr-[2rem]'}`}>
      <div className="z-10 duration-100 dark:bg-light bg-dark rounded-full md:mr-8">
        {
          options?.map(opt => (
            <Button
              key={opt.text}
              className={`leading-6 text-xl rounded-full mx-1 dark:text-[#030637] text-[#FFF0F5] ${theme === opt.text && "text-sky-600"}`}
              onClick={()=> setTheme(opt.text)}>
              {opt.icon}
            </Button>
          ))
        }
      </div>
    </div>
  );
}

export default Theme;