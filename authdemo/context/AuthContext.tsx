'use client';

import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/firebase/firebaseconfig";
import { onAuthStateChanged, User } from "firebase/auth";

type AuthContextType = {
    user: User | null;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(typeof window === 'undefined') {
            //server side is redering, no need to check auth state
            setLoading(false);
            return;
        }

        if(!auth) {
            //auth is not initialized, no need to check auth state
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );

}

export function useAuth() {
    return useContext(AuthContext);
}

