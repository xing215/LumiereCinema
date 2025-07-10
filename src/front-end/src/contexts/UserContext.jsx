import React, { createContext, useContext, useState } from 'react';

// Create User Context
const UserContext = createContext();

// Custom hook to use user context
export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

// User Provider Component
export const UserProvider = ({ children }) => {
    // EDIT USER MANAGEMENT HERE
    const [userRoles, setUserRoles] = useState(['all']); // Default roles
    const [userName, setUserName] = useState('Vương Ngũ Tín Thành'); // Default user name
    
    return (
        <UserContext.Provider value={{ 
            userRoles, 
            setUserRoles, 
            userName, 
            setUserName 
        }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;
