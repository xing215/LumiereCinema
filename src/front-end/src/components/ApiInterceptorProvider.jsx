import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@contexts/UserContext.jsx';
import { useError } from '@contexts/ErrorContext.jsx';
import { apiInterceptor } from '@services';

/**
 * ApiInterceptorProvider component that initializes the global API interceptor
 * This component should be used once in the App component to set up global API handling
 */
const ApiInterceptorProvider = ({ children }) => {
    const navigate = useNavigate();
    const userContext = useUser();
    const { showError } = useError();

    useEffect(() => {
        // Initialize the API interceptor with the required context
        apiInterceptor.initializeApiInterceptor(userContext, navigate, showError);

        // Cleanup function
        return () => {
            apiInterceptor.cleanupApiInterceptor();
        };
    }, [navigate, userContext, showError]);

    return children;
};

export default ApiInterceptorProvider;
