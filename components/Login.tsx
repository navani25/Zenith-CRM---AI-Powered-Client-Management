import React, { useEffect, useState } from 'react';
import { AuthView } from './Auth';
import { supabase } from '../supabaseClient'; // Import Supabase

interface LoginProps {
  onLogin: () => void;
  setView: (view: AuthView) => void;
}

const inputClasses = "pl-10 pr-4 py-2 w-full rounded-md bg-secondary dark:bg-dark-secondary border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground dark:text-dark-foreground text-sm";

const Login: React.FC<LoginProps> = ({ onLogin, setView }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        // @ts-ignore
        if (window.lucide) {
            // @ts-ignore
            window.lucide.createIcons();
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            alert(error.message);
        } else {
            // onLogin() will be called from the App component now
        }
        setLoading(false);
    };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background dark:bg-dark-background font-sans">
      <div className="w-full max-w-sm p-8 space-y-6 bg-card dark:bg-dark-card rounded-2xl border border-border dark:border-dark-border">
        <div className="flex flex-col items-center text-center">
          <div className="p-2 bg-primary/10 rounded-lg mb-4">
             <i data-lucide="leaf" className="w-8 h-8 text-primary"></i>
          </div>
          <h1 className="text-2xl font-bold text-foreground dark:text-dark-foreground">Welcome to Zenith</h1>
          <p className="text-muted-foreground dark:text-dark-muted-foreground mt-2 text-sm">Sign in to access your CRM dashboard.</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-foreground dark:text-dark-foreground sr-only">
                Email address
              </label>
              <div className="mt-1 relative">
                <i data-lucide="mail" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-dark-muted-foreground"></i>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClasses}
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password"className="text-sm font-medium text-foreground dark:text-dark-foreground sr-only">
                Password
              </label>
              <div className="mt-1 relative">
                 <i data-lucide="lock" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-dark-muted-foreground"></i>
                 <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClasses}
                  placeholder="Password"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-border dark:border-dark-border rounded" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-foreground dark:text-dark-foreground">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <a href="#" onClick={(e) => { e.preventDefault(); setView('forgot'); }} className="font-medium text-primary hover:underline">
                Forgot password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 text-sm font-semibold rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
         <p className="text-center text-sm text-muted-foreground dark:text-dark-muted-foreground">
            Don't have an account?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); setView('signup'); }} className="font-medium text-primary hover:underline">
                Sign up
            </a>
        </p>
      </div>
    </div>
  );
};

export default Login;