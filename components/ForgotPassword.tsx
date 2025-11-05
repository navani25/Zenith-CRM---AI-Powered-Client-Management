
import React, { useEffect, useState } from 'react';
import { AuthView } from './Auth';

interface ForgotPasswordProps {
    setView: (view: AuthView) => void;
}

const inputClasses = "pl-10 pr-4 py-2 w-full rounded-md bg-secondary dark:bg-dark-secondary border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground dark:text-dark-foreground text-sm";

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ setView }) => {
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        // @ts-ignore
        if (window.lucide) {
            // @ts-ignore
            window.lucide.createIcons();
        }
    }, [submitted]);

    const handleReset = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would trigger an email.
        setSubmitted(true);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background dark:bg-dark-background font-sans">
            <div className="w-full max-w-sm p-8 space-y-6 bg-card dark:bg-dark-card rounded-2xl border border-border dark:border-dark-border">
                <div className="flex flex-col items-center text-center">
                    <div className="p-2 bg-primary/10 rounded-lg mb-4">
                        <i data-lucide="key-round" className="w-8 h-8 text-primary"></i>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground dark:text-dark-foreground">Forgot Password?</h1>
                    {!submitted ? (
                        <p className="text-muted-foreground dark:text-dark-muted-foreground mt-2 text-sm">No problem. Enter your email and we'll send you a reset link.</p>
                    ) : (
                        <p className="text-muted-foreground dark:text-dark-muted-foreground mt-2 text-sm">If an account with that email exists, a reset link has been sent.</p>
                    )}
                </div>

                {!submitted ? (
                    <form className="mt-8 space-y-6" onSubmit={handleReset}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="sr-only">Email address</label>
                                <div className="mt-1 relative">
                                    <i data-lucide="mail" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-dark-muted-foreground"></i>
                                    <input id="email" name="email" type="email" autoComplete="email" required className={inputClasses} placeholder="you@example.com" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <button type="submit" className="w-full flex justify-center py-2.5 px-4 text-sm font-semibold rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                                Send Reset Link
                            </button>
                        </div>
                    </form>
                ) : null}

                <p className="text-center text-sm text-muted-foreground dark:text-dark-muted-foreground">
                    <a href="#" onClick={(e) => { e.preventDefault(); setView('login'); }} className="font-medium text-primary hover:underline">
                        Return to Sign in
                    </a>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;