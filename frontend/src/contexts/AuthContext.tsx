import React, { useContext, createContext, useState, ReactNode, useEffect } from "react";
import useUser from "../hooks/useUser";

type AuthContextType = {
    isAuthenticated: boolean;
    setIsAuthenticated: (authenticated: boolean) => void;
    isLoadingAuthStatus: boolean;
    userId: number | undefined;
    setUserId: (userId: number | undefined) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoadingAuthStatus, setIsLoadingAuthStatus] = useState<boolean>(true);
    const [userId, setUserId] = useState<number | undefined>(undefined);
    const { user, isLoading, isError } = useUser();
    
    useEffect(() => {
        const token = localStorage.getItem("accessToken");

        if (token) {
            setIsAuthenticated(true);
        }

        setIsLoadingAuthStatus(false);
    }, []);

    useEffect(() => {
        if (user) {
            setUserId(user);
            setIsLoadingAuthStatus(false);
        } else if (!isLoading && !isError) {
            setUserId(undefined);
            setIsLoadingAuthStatus(false);
        }
    }, [user, isLoading, isError]);
 
    return (
        <AuthContext.Provider value={{ 
                isAuthenticated, 
                setIsAuthenticated, 
                isLoadingAuthStatus,
                userId,
                setUserId 
            }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    
    return context;
};