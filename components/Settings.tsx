
import React, { useEffect, useState } from 'react';
import { Theme } from '../App';

interface SettingsProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ToggleSwitch: React.FC<{ label: string; id: string; checked: boolean; onChange: () => void }> = ({ label, id, checked, onChange }) => {
    return (
        <div className="flex items-center justify-between">
            <label htmlFor={id} className="text-sm text-foreground dark:text-dark-foreground">{label}</label>
            <button
                id={id}
                role="switch"
                aria-checked={checked}
                onClick={onChange}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-muted dark:bg-dark-muted'}`}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
    );
}

const Settings: React.FC<SettingsProps> = ({ theme, setTheme }) => {
    const [notifications, setNotifications] = useState({ email: true, push: false, summary: true });
    const [apiKeys, setApiKeys] = useState(['zen-********************-prod']);

    useEffect(() => {
        // @ts-ignore
        if (window.lucide) {
            // @ts-ignore
            window.lucide.createIcons();
        }
    }, [apiKeys, theme]);
    
    const handleNotificationToggle = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };
    
    const handleGenerateKey = () => {
        const newKey = `zen-${[...Array(20)].map(() => Math.random().toString(36)[2]).join('')}-dev`;
        setApiKeys([...apiKeys, newKey]);
    };

    const handleDeleteKey = (keyToDelete: string) => {
        if(window.confirm('Are you sure you want to delete this key?')) {
            setApiKeys(apiKeys.filter(key => key !== keyToDelete));
        }
    };

    return (
        <div className="h-full overflow-y-auto p-4 md:p-6">
            <div className="max-w-4xl mx-auto space-y-10">
                <div>
                    <h1 className="text-3xl font-bold text-foreground dark:text-dark-foreground">Settings</h1>
                    <p className="text-muted-foreground dark:text-dark-muted-foreground mt-2">Manage your workspace preferences.</p>
                </div>

                {/* Notifications Section */}
                <section>
                    <h2 className="text-xl font-semibold text-foreground dark:text-dark-foreground">Notifications</h2>
                    <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground mt-1">Manage how you receive notifications.</p>
                    <div className="bg-card dark:bg-dark-card p-6 rounded-lg mt-4 border border-border dark:border-dark-border space-y-4">
                        <ToggleSwitch label="Email Notifications" id="email-notif" checked={notifications.email} onChange={() => handleNotificationToggle('email')} />
                        <ToggleSwitch label="Push Notifications" id="push-notif" checked={notifications.push} onChange={() => handleNotificationToggle('push')} />
                        <ToggleSwitch label="Weekly Summary Email" id="summary-notif" checked={notifications.summary} onChange={() => handleNotificationToggle('summary')} />
                    </div>
                </section>

                {/* Appearance Section */}
                <section>
                    <h2 className="text-xl font-semibold text-foreground dark:text-dark-foreground">Appearance</h2>
                    <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground mt-1">Customize the look and feel of the application.</p>
                    <div className="bg-card dark:bg-dark-card p-6 rounded-lg mt-4 border border-border dark:border-dark-border">
                        <label className="block text-sm font-medium text-foreground dark:text-dark-foreground mb-2">Theme</label>
                        <div className="flex space-x-2">
                                <button onClick={() => setTheme('light')} className={`flex-1 text-center py-4 rounded-md border-2 ${theme === 'light' ? 'border-primary bg-secondary dark:bg-dark-secondary' : 'border-border dark:border-dark-border bg-card dark:bg-dark-card hover:border-primary'}`}>
                                <i data-lucide="sun" className={`mx-auto w-6 h-6 mb-1 ${theme === 'light' ? 'text-primary' : 'text-muted-foreground dark:text-dark-muted-foreground'}`}></i>
                                <span className={`text-sm font-semibold ${theme === 'light' ? 'text-primary' : 'text-muted-foreground dark:text-dark-muted-foreground'}`}>Light</span>
                                </button>
                                <button onClick={() => setTheme('dark')} className={`flex-1 text-center py-4 rounded-md border-2 ${theme === 'dark' ? 'border-primary bg-secondary dark:bg-dark-secondary' : 'border-border dark:border-dark-border bg-card dark:bg-dark-card hover:border-primary'}`}>
                                <i data-lucide="moon" className={`mx-auto w-6 h-6 mb-1 ${theme === 'dark' ? 'text-primary' : 'text-muted-foreground dark:text-dark-muted-foreground'}`}></i>
                                <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-primary' : 'text-muted-foreground dark:text-dark-muted-foreground'}`}>Dark</span>
                                </button>
                        </div>
                    </div>
                </section>

                {/* API Keys Section */}
                <section>
                    <h2 className="text-xl font-semibold text-foreground dark:text-dark-foreground">API Keys</h2>
                    <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground mt-1">Manage API keys for integrations.</p>
                    <div className="bg-card dark:bg-dark-card p-6 rounded-lg mt-4 border border-border dark:border-dark-border">
                        <div className="space-y-3 mb-6">
                            {apiKeys.map(key => (
                                <div key={key} className="flex items-center justify-between p-3 bg-secondary dark:bg-dark-secondary rounded-md">
                                    <p className="font-mono text-sm text-muted-foreground dark:text-dark-muted-foreground truncate">{key}</p>
                                    <button onClick={() => handleDeleteKey(key)} className="p-1.5 text-muted-foreground dark:text-dark-muted-foreground hover:text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20">
                                        <i data-lucide="trash-2" className="w-4 h-4"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end">
                            <button onClick={handleGenerateKey} className="bg-card dark:bg-dark-card border border-border dark:border-dark-border px-4 py-2 rounded-md font-medium hover:bg-secondary dark:hover:bg-dark-secondary text-sm">Generate New Key</button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Settings;