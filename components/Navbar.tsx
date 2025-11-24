import React, { useState, useMemo } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import type { Notification } from '../types';

const ThemeToggleButton: React.FC = () => {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        if (theme === 'system') setTheme('light');
        else if (theme === 'light') setTheme('dark');
        else setTheme('system');
    };
    
    const iconMap = {
        light: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 14.95l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM5 11a1 1 0 100-2H4a1 1 0 100 2h1zM4.54 5.46l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414z" clipRule="evenodd" />
            </svg>
        ),
        dark: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
        ),
        system: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 4a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2H5zm0 2h10v6H5V6z" clipRule="evenodd" />
              <path d="M4 14a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" />
            </svg>
        ),
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title={`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`}
        >
            {iconMap[theme]}
        </button>
    );
};

const NotificationBell: React.FC = () => {
    const { currentUser, markNotificationsAsRead } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const unreadCount = useMemo(() => {
        return currentUser?.notifications?.filter(n => !n.read).length || 0;
    }, [currentUser?.notifications]);

    const handleToggle = () => {
      setIsOpen(!isOpen);
      if (!isOpen && unreadCount > 0) {
        markNotificationsAsRead();
      }
    };

    return (
        <div className="relative">
            <button
                onClick={handleToggle}
                className="p-2 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"></span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-xl border dark:border-slate-700 overflow-hidden">
                    <div className="py-2 px-4 font-semibold text-slate-800 dark:text-slate-200">Notifications</div>
                    <div className="max-h-96 overflow-y-auto">
                        {currentUser?.notifications && currentUser.notifications.length > 0 ? (
                            [...currentUser.notifications].reverse().map((notif: Notification) => (
                                <div key={notif.id} className={`p-4 border-t dark:border-slate-700 ${!notif.read ? 'bg-slate-50 dark:bg-slate-700/50' : ''}`}>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">{notif.message}</p>
                                    <span className="text-xs text-slate-400">{new Date(notif.timestamp).toLocaleString()}</span>
                                </div>
                            ))
                        ) : (
                            <p className="p-4 text-sm text-slate-500">No new notifications.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout } = useAuth();

  const linkClasses = "px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-brand-navy/10 dark:hover:bg-brand-navy/20 hover:text-brand-navy dark:hover:text-brand-navy";
  const activeLinkClasses = "bg-brand-navy/10 dark:bg-brand-navy/20 text-brand-navy";

  const getLinkClass = ({ isActive }: { isActive: boolean }) => 
    isActive ? `${linkClasses} ${activeLinkClasses}` : linkClasses;

  return (
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <NavLink to="/" className="flex-shrink-0 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" style={{ color: '#bf092f' }} viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 22H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1ZM5 20h14V4H5v16Z"/><path d="M8 6h8v2H8V6Zm0 4h8v2H8v-2Zm0 4h5v2H8v-2Z"/>
              </svg>
              <span className="font-bold text-xl text-slate-800 dark:text-slate-200">Living Library 2.0</span>
            </NavLink>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-2">
              <NavLink to="/" className={getLinkClass}>Home</NavLink>
              <NavLink to="/library" className={getLinkClass}>Library</NavLink>
              <NavLink to="/assistant" className={getLinkClass}>AI Assistant</NavLink>
              <NavLink to="/about" className={getLinkClass}>About Us</NavLink>
              {currentUser ? (
                <>
                  <NavLink to="/add-story" className={getLinkClass}>Add Story</NavLink>
                  <NavLink to="/profile" className={getLinkClass}>My Profile</NavLink>
                  <button onClick={logout} className={`${linkClasses} bg-red-500/10 text-red-600 hover:text-red-700 hover:bg-red-500/20`}>Logout</button>
                  <NotificationBell />
                </>
              ) : (
                  <Link to="/auth" className={`${linkClasses} bg-brand-navy/10 text-brand-navy`}>
                  Sign In
                </Link>
               )}
               <ThemeToggleButton />
            </div>
          </div>
          <div className="-mr-2 flex md:hidden items-center gap-2">
             <ThemeToggleButton />
             {currentUser && <NotificationBell />}
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-gray-100 dark:bg-slate-800 inline-flex items-center justify-center p-2 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-brand-navy"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink to="/" className={getLinkClass} onClick={() => setIsOpen(false)}>Home</NavLink>
            <NavLink to="/library" className={getLinkClass} onClick={() => setIsOpen(false)}>Library</NavLink>
            <NavLink to="/assistant" className={getLinkClass} onClick={() => setIsOpen(false)}>AI Assistant</NavLink>
            <NavLink to="/about" className={getLinkClass} onClick={() => setIsOpen(false)}>About Us</NavLink>
             {currentUser ? (
                 <>
                    <NavLink to="/add-story" className={getLinkClass} onClick={() => setIsOpen(false)}>Add Story</NavLink>
                    <NavLink to="/profile" className={getLinkClass} onClick={() => setIsOpen(false)}>My Profile</NavLink>
                    <button onClick={() => { logout(); setIsOpen(false); }} className={`${linkClasses} w-full text-left bg-red-500/10 text-red-600`}>Logout</button>
                 </>
               ) : (
                  <Link to="/auth" className={`${linkClasses} bg-brand-navy/10 text-brand-navy`} onClick={() => setIsOpen(false)}>
                    Sign In
                  </Link>
               )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;