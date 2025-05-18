import * as SecureStore from 'expo-secure-store';
import { createContext, ReactNode, useContext, useState } from 'react';

interface AuthContextType {
    user: any;
    login: (token: string, userData: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode}) => {
    const [user, setUser] = useState<any>(null);

    const login = async(token: string, userData: string) => {
        await SecureStore.setItemAsync('token', token );
        await SecureStore.setItemAsync('userData', JSON.stringify(userData));

        setUser(userData);
    }

    const logout = async() => {
        await SecureStore.deleteItemAsync('token');
        setUser(null);
    }

    return(
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );

}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if(!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
}