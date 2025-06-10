import * as SecureStore from 'expo-secure-store';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    checkLogin: () => void;
    isLoggedIn: boolean;
    user: any;
    login: (token: string, userData: string) => void;
    register: (token: string, userData: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);


    const checkLogin = async () => {
        const token = await SecureStore.getItemAsync("token");
        const userData = await SecureStore.getItemAsync("userData");

        if (token && userData) {
            setIsLoggedIn(true);
            setUser(JSON.parse(userData));
        } else {
            setIsLoggedIn(false);
            setUser(null);
        }
    };

    const login = async (token: string, userData: string) => {
        await SecureStore.setItemAsync('token', token);
        await SecureStore.setItemAsync('userData', JSON.stringify(userData));

        setUser(userData);
        checkLogin();
    }

    const register = async (token: string, userData: string) => {
        await SecureStore.setItemAsync('token', token);
        await SecureStore.setItemAsync('userData', JSON.stringify(userData));

        setUser(userData);
        checkLogin();
    }

    const logout = async () => {
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('userData')
        setUser(null);
        checkLogin();
    }

    useEffect(() => {
        checkLogin(); // run once on app start
    }, []);


    return (
        <AuthContext.Provider value={{ isLoggedIn, user, login, register, checkLogin, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );

}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
}