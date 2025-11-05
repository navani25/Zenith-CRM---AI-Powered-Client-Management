import React, { useState, useEffect, useRef } from 'react';
import { Page } from '../types';
import { Session } from '@supabase/supabase-js';

interface HeaderProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    onMenuClick: () => void;
    onLogout: () => void;
    twoFactorEnabled: boolean;
    session: Session | null;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage, onMenuClick, onLogout, twoFactorEnabled, session }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const userEmail = session?.user?.email;
  const userName = session?.user?.user_metadata?.full_name || userEmail;
  const avatarPath = session?.user?.user_metadata?.avatar_url;
  const avatarUrl = avatarPath 
    ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${avatarPath}`
    : `https://ui-avatars.com/api/?name=${userName || 'A'}&background=random`;

  useEffect(() => {
    // @ts-ignore
    if (window.lucide) {
      // @ts-ignore
      window.lucide.createIcons();
    }
  }, [isNotificationsOpen, isProfileOpen, session]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between p-4 bg-card dark:bg-dark-card border-b border-border dark:border-dark-border flex-shrink-0 h-16">
      <div className="flex items-center">
        <button onClick={onMenuClick} className="md:hidden p-2 -ml-2 mr-2 rounded-md hover:bg-secondary dark:hover:bg-dark-secondary">
          <i data-lucide="menu" className="w-6 h-6 text-muted-foreground dark:text-dark-muted-foreground"></i>
        </button>
        <h1 className="text-lg md:text-xl font-bold text-foreground dark:text-dark-foreground">{currentPage}</h1>
      </div>
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* The global search bar has been removed from here */}
        
        <div className="relative" ref={notificationsRef}>
          <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="p-2 rounded-full hover:bg-secondary dark:hover:bg-dark-secondary">
            <i data-lucide="bell" className="w-5 h-5 text-muted-foreground dark:text-dark-muted-foreground"></i>
          </button>
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-card dark:bg-dark-card border border-border dark:border-dark-border rounded-lg shadow-lg z-10">
                <div className="p-3 font-semibold text-sm border-b border-border dark:border-dark-border">Notifications</div>
                <div className="p-4 text-center text-sm text-muted-foreground dark:text-dark-muted-foreground">
                    No new notifications.
                </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setIsProfileOpen(!isProfileOpen)}>
            <img
              src={avatarUrl}
              key={avatarUrl}
              alt="User avatar"
              className="w-9 h-9 rounded-full object-cover bg-secondary"
            />
            <div className="hidden md:block">
              <p className="font-semibold text-sm text-foreground dark:text-dark-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground dark:text-dark-muted-foreground">{userEmail}</p>
            </div>
            <button className="hidden md:block p-1 rounded-sm hover:bg-secondary dark:hover:bg-dark-secondary">
                  <i data-lucide="chevron-down" className="w-4 h-4 text-muted-foreground dark:text-dark-muted-foreground"></i>
            </button>
          </div>
          {isProfileOpen && (
             <div className="absolute right-0 mt-2 w-48 bg-card dark:bg-card border border-border dark:border-dark-border rounded-md shadow-lg z-10 py-1">
                <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('Profile'); setIsProfileOpen(false); }} className="flex items-center justify-between px-4 py-2 text-sm text-foreground dark:text-dark-foreground hover:bg-secondary dark:hover:bg-dark-secondary">
                    <span className="flex items-center">
                      <i data-lucide="user-circle" className="w-4 h-4 mr-2"></i>Profile
                    </span>
                    {twoFactorEnabled && <i data-lucide="shield-check" className="w-4 h-4 text-primary"></i>}
                </a>
                <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('Settings'); setIsProfileOpen(false); }} className="flex items-center px-4 py-2 text-sm text-foreground dark:text-dark-foreground hover:bg-secondary dark:hover:bg-dark-secondary">
                    <i data-lucide="settings" className="w-4 h-4 mr-2"></i>Settings
                </a>
                <div className="my-1 h-px bg-border dark:bg-dark-border"></div>
                <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }} className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <i data-lucide="log-out" className="w-4 h-4 mr-2"></i>Logout
                </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};