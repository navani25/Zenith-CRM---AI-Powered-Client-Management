
import React, { useState } from 'react';
import Login from './Login';
import SignUp from './SignUp';
import ForgotPassword from './ForgotPassword';

export type AuthView = 'login' | 'signup' | 'forgot';

interface AuthProps {
    onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
    const [view, setView] = useState<AuthView>('login');

    const renderView = () => {
        switch (view) {
            case 'login':
                return <Login onLogin={onLogin} setView={setView} />;
            case 'signup':
                return <SignUp setView={setView} />;
            case 'forgot':
                return <ForgotPassword setView={setView} />;
            default:
                return <Login onLogin={onLogin} setView={setView} />;
        }
    };

    return <>{renderView()}</>;
};

export default Auth;