import React, { useContext, createContext, useState, ReactNode, useEffect } from "react";

type AuthContextType = {
    isAuthenticated: boolean;
    setIsAuthenticated: (authenticated: boolean) => void;
    isLoadingAuthStatus: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoadingAuthStatus, setIsLoadingAuthStatus] = useState<boolean>(true);
    
    useEffect(() => {
        const token = localStorage.getItem("accessToken");

        if (token) {
            setIsAuthenticated(true);
        }

        setIsLoadingAuthStatus(false);
    }, []);
 
    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, isLoadingAuthStatus }}>
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