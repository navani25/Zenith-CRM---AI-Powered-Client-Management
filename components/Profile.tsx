import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Session } from '@supabase/supabase-js';

interface ProfileProps {
    twoFactorEnabled: boolean;
    setTwoFactorEnabled: (enabled: boolean) => void;
    session: Session | null;
    refreshSession: () => void; // Accept the new refresh function
}

const inputClasses = (icon?: string) => `w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2 rounded-md bg-secondary dark:bg-dark-secondary border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm`;

const InputField: React.FC<{ label: string; id: string; name: string; type: string; value: string; icon?: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string }> = ({ label, id, name, type, value, icon, onChange, placeholder }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-foreground dark:text-dark-foreground mb-1.5">{label}</label>
        <div className="relative">
            {icon && <i data-lucide={icon} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-dark-muted-foreground"></i>}
            <input
                type={type}
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={inputClasses(icon)}
            />
        </div>
    </div>
);

const Profile: React.FC<ProfileProps> = ({ twoFactorEnabled, setTwoFactorEnabled, session, refreshSession }) => {
    const [profile, setProfile] = useState({ fullName: '', email: '' });
    const [passwords, setPasswords] = useState({ new: '', confirm: '' });
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');
    const [passwordSaveStatus, setPasswordSaveStatus] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [is2faModalOpen, setIs2faModalOpen] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState('');

    const userId = session?.user?.id;

        useEffect(() => {
        if (session?.user) {
            const user = session.user;
            setProfile({
                fullName: user.user_metadata?.full_name || '',
                email: user.email || ''
            });
            if (user.user_metadata?.avatar_url) {
                // Construct the public URL directly from the path
                const url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${user.user_metadata.avatar_url}`;
                setAvatarUrl(url);
            } else {
                setAvatarUrl(null); // Clear avatar if none exists
            }
        }
    }, [session]); // This now runs whenever the session changes

    const downloadImage = async (path: string) => {
        try {
            const { data, error } = await supabase.storage.from('avatars').download(path);
            if (error) throw error;
            const url = URL.createObjectURL(data);
            setAvatarUrl(url);
        } catch (error) {
            console.error('Error downloading image: ', (error as Error).message);
        }
    };

    useEffect(() => {
        // @ts-ignore
        if (window.lucide) {
            // @ts-ignore
            window.lucide.createIcons();
        }
    }, [is2faModalOpen, twoFactorEnabled, avatarUrl]);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };
    
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

        const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaveStatus('Saving...');

        const { data, error } = await supabase.auth.updateUser({
            data: { full_name: profile.fullName }
        });

        if (error) {
            alert(error.message);
            setSaveStatus('Save Changes');
        } else {
            setSaveStatus('Saved!');
            if (data.user) {
                setProfile({ ...profile, fullName: data.user.user_metadata.full_name });
            }
            refreshSession(); // <-- THIS IS THE KEY CHANGE
            setTimeout(() => setSaveStatus(''), 2000);
        }
    };
    
     const handlePasswordSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if(passwords.new !== passwords.confirm) {
            alert("New passwords do not match.");
            return;
        }
        if(!passwords.new) {
            alert("Please enter a new password.");
            return;
        }
        setPasswordSaveStatus('Updating...');

        const { error } = await supabase.auth.updateUser({ password: passwords.new });

        if (error) {
            alert(error.message);
            setPasswordSaveStatus('Update Password');
        } else {
            setPasswordSaveStatus('Updated!');
            setPasswords({ new: '', confirm: '' });
            setTimeout(() => setPasswordSaveStatus(''), 2000);
        }
    };

        const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const userId = session?.user?.id;
        if (!userId) return;

        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const filePath = `${userId}.${fileExt}`; // Unique file path

        setUploading(true);

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, { upsert: true });

        if (uploadError) {
            alert(uploadError.message);
        } else {
            // Update user metadata with just the path
            const { error: updateError } = await supabase.auth.updateUser({
                data: { avatar_url: filePath }
            });
            if (updateError) {
                alert(updateError.message);
            } else {
                // Refresh the entire session to update the UI everywhere
                refreshSession();
            }
        }
        setUploading(false);
    };
    
    // ... (rest of the component remains the same)

    return (
        <div className="h-full overflow-y-auto p-4 md:p-6">
            <div className="max-w-4xl mx-auto space-y-10">
                <div>
                    <h1 className="text-3xl font-bold">Profile</h1>
                    <p className="text-muted-foreground mt-2">Manage your personal information and profile settings.</p>
                </div>

                <section>
                    <h2 className="text-xl font-semibold">Personal Information</h2>
                    <div className="bg-card p-6 rounded-lg mt-4 border">
                        <form onSubmit={handleProfileSave} className="space-y-6">
                             <div className="flex items-center space-x-6">
                                 <img 
                                  src={avatarUrl || `https://ui-avatars.com/api/?name=${profile.fullName || profile.email}&background=random`} 
                                  alt="User avatar" 
                                  className="w-24 h-24 rounded-full object-cover bg-secondary" 
                                  key={avatarUrl} // <-- ADD THIS
                                    />
                                <div className="flex gap-3">
                                    <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                                    <button onClick={() => fileInputRef.current?.click()} type="button" disabled={uploading} className="bg-card border px-4 py-2 rounded-md font-medium hover:bg-secondary text-sm disabled:opacity-50">
                                        {uploading ? 'Uploading...' : 'Change'}
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Full Name" id="fullName" name="fullName" type="text" value={profile.fullName} onChange={handleProfileChange} icon="user" />
                                <InputField label="Email Address" id="email" name="email" type="email" value={profile.email} onChange={handleProfileChange} icon="mail" />
                            </div>
                           
                            <div className="mt-6 flex justify-end">
                                <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 text-sm w-32 text-center">
                                    {saveStatus || 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
                
                <section>
                    <h2 className="text-xl font-semibold">Change Password</h2>
                    <div className="bg-card p-6 rounded-lg mt-4 border">
                        <form onSubmit={handlePasswordSave} className="space-y-4">
                            <InputField label="New Password" id="new" name="new" type="password" value={passwords.new} onChange={handlePasswordChange} icon="lock" placeholder="••••••••" />
                            <InputField label="Confirm New Password" id="confirm" name="confirm" type="password" value={passwords.confirm} onChange={handlePasswordChange} icon="lock" placeholder="••••••••" />
                            <div className="pt-2 flex justify-end">
                                <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 text-sm w-36 text-center">
                                     {passwordSaveStatus || 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
                
                 <section>
                    <h2 className="text-xl font-semibold">Two-Factor Authentication</h2>
                    <div className="bg-card p-6 rounded-lg mt-4 border">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center">
                                    <label htmlFor="2fa-toggle" className="text-sm font-medium">Enable Two-Factor Authentication</label>
                                    {twoFactorEnabled && (
                                        <span className="ml-3 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                            Enabled
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">You'll be asked for a code from your authenticator app when you sign in.</p>
                            </div>
                            <button
                                id="2fa-toggle"
                                role="switch"
                                aria-checked={twoFactorEnabled}
                                onClick={() => {
                                    if (!twoFactorEnabled) {
                                        setIs2faModalOpen(true);
                                    } else {
                                        setTwoFactorEnabled(false);
                                    }
                                }}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${twoFactorEnabled ? 'bg-primary' : 'bg-muted'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            {is2faModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-card dark:bg-dark-card rounded-lg shadow-xl w-full max-w-sm m-4 text-center">
                        <div className="p-6 border-b border-border dark:border-dark-border">
                            <h3 className="text-lg font-semibold">Set up Two-Factor Authentication</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground">Scan the QR code with your authenticator app.</p>
                            <img 
                                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/ZenithCRM:admin@zenith.com?secret=JBSWY3DPEHPK3PXP&issuer=ZenithCRM" 
                                alt="QR Code" 
                                className="mx-auto bg-white p-2 rounded-md"
                            />
                            <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground">Then enter the 6-digit code from your app below.</p>
                            <input 
                                type="text" 
                                value={twoFactorCode} 
                                onChange={(e) => setTwoFactorCode(e.target.value)}
                                placeholder="123456"
                                maxLength={6}
                                className="w-48 mx-auto text-center tracking-[0.5em] font-mono text-lg px-3 py-2 rounded-md bg-secondary dark:bg-dark-secondary border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                            />
                        </div>
                        <div className="p-4 bg-secondary/50 dark:bg-dark-secondary/50 rounded-b-lg flex justify-end space-x-3">
                            <button onClick={() => setIs2faModalOpen(false)} className="px-4 py-2 text-sm font-medium rounded-md bg-card dark:bg-dark-card border border-border dark:border-dark-border hover:bg-secondary dark:hover:bg-dark-secondary">Cancel</button>
                            <button onClick={() => { /* handleVerify2fa */ }} className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90">Verify & Enable</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;