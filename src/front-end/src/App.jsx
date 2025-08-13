import React from 'react';
import { UserProvider } from '@contexts/UserContext.jsx';
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
                <ErrorModalWrapper />
                <AppRoutes />
            </UserProvider>
        </ErrorProvider>
    );
};

export default App;
