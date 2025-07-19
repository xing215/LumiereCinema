import React from 'react';
import { UserProvider } from '@contexts/UserContext.jsx';
import AppRoutes from '@routes/AppRoutes.jsx';

const App = () => {
    return (
        <UserProvider>
            <AppRoutes />
        </UserProvider>
    );
};

export default App;
