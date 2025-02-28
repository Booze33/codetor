'use client';

import { useState, useCallback, createContext, useContext, useMemo, ReactNode } from 'react';

// Create context
const SidebarContext = createContext({
  isOpen: false,
  toggleSidebar: () => {},
  openSidebar: () => {},
  closeSidebar: () => {}
});

// Create provider component
export const SidebarProvider = ({ children, initialState = false }: { children: ReactNode, initialState?: boolean }) => {
  const [isOpen, setIsOpen] = useState(initialState);

  const toggleSidebar = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const openSidebar = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    isOpen,
    toggleSidebar,
    openSidebar,
    closeSidebar
  }), [isOpen, toggleSidebar, openSidebar, closeSidebar]);

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};

// Hook to use the sidebar context
export const useSidebarToggle = () => {
  const context = useContext(SidebarContext);
  
  if (context === undefined) {
    throw new Error('useSidebarToggle must be used within a SidebarProvider');
  }
  
  return context;
};