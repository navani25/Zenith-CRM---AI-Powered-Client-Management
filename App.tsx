import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Contacts from './components/Contacts';
import Leads from './components/Leads';
import Deals from './components/Deals';
import Tasks from './components/Tasks';
import Calendar from './components/Calendar';
import Emails from './components/Emails';
import Proposals from './components/Proposals';
import AIAssistant from './components/AIAssistant';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import Profile from './components/Profile';
import { Page, Contact, Deal, Task, Activity, ActivityType, Proposal } from './types';
import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';

export type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Centralized State
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    const { data: contactsData, error: contactsError } = await supabase.from('contacts').select('*');
    const { data: dealsData, error: dealsError } = await supabase.from('deals').select('*');
    const { data: tasksData, error: tasksError } = await supabase.from('tasks').select('*');
    const { data: proposalsData, error: proposalsError } = await supabase.from('proposals').select('*');
    
    if (contactsError) console.error('Error fetching contacts:', contactsError.message);
    else setContacts(contactsData || []);

    if (dealsError) console.error('Error fetching deals:', dealsError.message);
    else setDeals(dealsData || []);

    if (tasksError) console.error('Error fetching tasks:', tasksError.message);
    else setTasks(tasksData || []);

    if (proposalsError) console.error('Error fetching proposals:', proposalsError.message);
    else setProposals(proposalsData || []);

    await getActivities();
    setIsLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchData();
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchData();
      } else {
        setContacts([]);
        setDeals([]);
        setTasks([]);
        setActivity([]);
        setProposals([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    // @ts-ignore
    if (window.lucide) {
      // @ts-ignore
      window.lucide.createIcons();
    }
  }, [currentPage, isSidebarOpen]);
  
  const getActivities = async () => {
    const { data, error } = await supabase.from('activity').select('*').order('timestamp', { ascending: false }).limit(10);
    if (error) console.error("Error fetching activities:", error.message);
    else {
      const formattedData = data.map(item => ({
        id: item.id,
        type: item.type as ActivityType,
        details: item.details,
        timestamp: item.timestamp,
        user: { name: item.user_name, avatarUrl: item.user_avatar_url }
      }));
      setActivity(formattedData);
    }
  };

  const addActivity = async (type: ActivityType, details: string) => {
    if (!session) return;
    const newActivityData = {
      type: type,
      user_name: session.user.user_metadata?.full_name || session.user.email,
      user_avatar_url: session.user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${session.user.email}`,
      details: details,
      user_id: session.user.id
    };
    const { error } = await supabase.from('activity').insert([newActivityData]);
    if (error) console.error("Error adding activity:", error.message);
    await getActivities();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

const refreshSession = async () => {
    const { data: { session: newSession } } = await supabase.auth.refreshSession();
    setSession(newSession);
    // Re-fetch all data to ensure UI is consistent
    if (newSession) {
        fetchData();
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'Dashboard':
        return <Dashboard setCurrentPage={setCurrentPage} contacts={contacts} deals={deals} tasks={tasks} activity={activity} />;
      case 'Leads':
        return <Leads session={session} contacts={contacts} setContacts={setContacts} addActivity={addActivity} />;
      case 'Deals':
        return <Deals session={session} deals={deals} setDeals={setDeals} contacts={contacts} addActivity={addActivity} />;
      case 'Contacts':
        return <Contacts session={session} contacts={contacts} setContacts={setContacts} addActivity={addActivity} />;
      case 'Tasks':
        return <Tasks session={session} tasks={tasks} setTasks={setTasks} addActivity={addActivity} />;
      case 'Calendar':
        return <Calendar session={session} tasks={tasks} setTasks={setTasks} />;
      case 'Emails':
        return <Emails />;
      case 'Proposals':
        return <Proposals session={session} proposals={proposals} setProposals={setProposals} addActivity={addActivity} contacts={contacts} />;
      case 'AI Assistant':
        return <AIAssistant contacts={contacts} deals={deals} tasks={tasks} />;
      case 'Analytics':
        return <Analytics deals={deals} contacts={contacts} />;
      case 'Settings':
        return <Settings theme={theme} setTheme={setTheme} />;
      case 'Profile':
        return <Profile 
                  twoFactorEnabled={twoFactorEnabled} 
                  setTwoFactorEnabled={setTwoFactorEnabled} 
                  session={session}
                  refreshSession={refreshSession} 
               />;
      default:
        return <Dashboard setCurrentPage={setCurrentPage} contacts={contacts} deals={deals} tasks={tasks} activity={activity} />;
    }
  };

  if (!session) {
    return <Auth onLogin={() => {}} />;
  }

  return (
    <div className="flex h-full bg-background text-foreground dark:bg-dark-background dark:text-dark-foreground font-sans">
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          session={session}
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          onLogout={handleLogout}
          twoFactorEnabled={twoFactorEnabled}
        />
        <main className="flex-1 overflow-hidden">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;