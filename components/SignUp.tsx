import React, { useEffect, useState } from 'react';
import { AuthView } from './Auth';
import { supabase } from '../supabaseClient';

interface SignUpProps {
    setView: (view: AuthView) => void;
}

const inputClasses = "pl-10 pr-4 py-2 w-full rounded-md bg-secondary dark:bg-dark-secondary border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground dark:text-dark-foreground text-sm";

const SignUp: React.FC<SignUpProps> = ({ setView }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // @ts-ignore
        if (window.lucide) {
            // @ts-ignore
            window.lucide.createIcons();
        }
    }, []);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // --- NEW VALIDATION CHECK ---
        // Check if the email ends with @gmail.com
        if (!email.toLowerCase().endsWith('@gmail.com')) {
            alert('Error: Only Gmail accounts are allowed for sign-up.');
            setLoading(false); // Stop the loading spinner
            return; // Stop the function here
        }
        // --------------------------
        
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                }
            }
        });

        if (error) {
            alert(error.message);
        } else if (data.user) {
            alert('Sign up successful! You can now log in.');
            setView('login');
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
                    <h1 className="text-2xl font-bold text-foreground dark:text-dark-foreground">Create an Account</h1>
                    <p className="text-muted-foreground dark:text-dark-muted-foreground mt-2 text-sm">Join Zenith to manage your clients.</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="sr-only">Full Name</label>
                            <div className="mt-1 relative">
                                <i data-lucide="user" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-dark-muted-foreground"></i>
                                <input 
                                  id="name" 
                                  name="name" 
                                  type="text" 
                                  required 
                                  className={inputClasses} 
                                  placeholder="Full Name"
                                  value={fullName}
                                  onChange={(e) => setFullName(e.target.value)} 
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="sr-only">Email address</label>
                            <div className="mt-1 relative">
                                <i data-lucide="mail" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-dark-muted-foreground"></i>
                                <input 
                                  id="email" 
                                  name="email" 
                                  type="email" 
                                  autoComplete="email" 
                                  required 
                                  className={inputClasses} 
                                  placeholder="you@example.com"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)} 
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <div className="mt-1 relative">
                                <i data-lucide="lock" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-dark-muted-foreground"></i>
                                <input 
                                  id="password" 
                                  name="password" 
                                  type="password" 
                                  required 
                                  className={inputClasses} 
                                  placeholder="Password"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)} 
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <button 
                          type="submit"
                          disabled={loading}
                          className="w-full flex justify-center py-2.5 px-4 text-sm font-semibold rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                        >
                            {loading ? 'Signing up...' : 'Sign up'}
                        </button>
                    </div>
                </form>

                <p className="text-center text-sm text-muted-foreground dark:text-dark-muted-foreground">
                    Already have an account?{' '}
                    <a href="#" onClick={(e) => { e.preventDefault(); setView('login'); }} className="font-medium text-primary hover:underline">
                        Sign in
                    </a>
                </p>
            </div>
        </div>
    );
};

export default SignUp;