'use client';

import { cn } from '@/lib/utils';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { SidebarProvider, useSidebarToggle } from '@/hooks/useSidebarToggle';

const PanelLayoutContent = ({ children }: { children: React.ReactNode }) => {
  const { isOpen } = useSidebarToggle();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-grow">
        <Sidebar />
        <main
          className={cn(
            "flex-grow transition-all ease-in-out duration-300 bg-zinc-50 dark:bg-zinc-900 min-h-[calc(100vh-3rem)]",
            isOpen ? "ml-48" : "ml-0"
          )}
        >
          <div className="p-4 h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const PanelLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider initialState={false}>
      <PanelLayoutContent>{children}</PanelLayoutContent>
    </SidebarProvider>
  );
};

export default PanelLayout;