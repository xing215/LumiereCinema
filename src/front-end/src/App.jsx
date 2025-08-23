import React from 'react';
import { UserProvider } from '@contexts/UserContext.jsx';
import { WishlistProvider } from '@contexts/WishlistContext.jsx';
import { ErrorProvider, useError } from '@contexts/ErrorContext.jsx';
import ErrorModal from '@layouts/Error.jsx';
import AppRoutes from '@routes/AppRoutes.jsx';

const ErrorModalWrapper = () => {
    const { error, clearError } = useError();
    if (!error) return null;
    return <ErrorModal errorCode={error.errorCode} errorMsg={error.errorMsg} onClose={clearError} />;
};

const App = () => {
    return (
        <ErrorProvider>
            <UserProvider>
                <WishlistProvider>
                    <ErrorModalWrapper />
                    <AppRoutes />
                </WishlistProvider>
            </UserProvider>
        </ErrorProvider>
    );
};

export default App;
