import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext.jsx';
import { authAPI } from '../../utils/auth.utils.js';
import ShowIcon from '../../assets/icons/show.svg';
import HideIcon from '../../assets/icons/hide.svg';

const LoginForm = ({ isCustomer = true }) => {
    const navigate = useNavigate();
    const { login } = useUser();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Validation patterns
    const patterns = {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    };

    const validateField = (name, value) => {
        let error = '';

        switch (name) {
            case 'email':
                if (!patterns.email.test(value)) {
                    error = 'Please enter a valid email address';
                }
                break;
            case 'password':
                if (!value.trim()) {
                    error = 'Password is required';
                }
                break;
            default:
                break;
        }

        return error;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear any previous error message
        setMessage('');

        // Real-time validation
        const error = validateField(name, value);
        setErrors((prev) => ({
            ...prev,
            [name]: error,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        // Validate all fields before submit
        const newErrors = {};
        Object.keys(formData).forEach((key) => {
            const error = validateField(key, formData[key]);
            if (error) newErrors[key] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsLoading(false);
            return;
        }

        try {
            const response = await authAPI.login(formData);
            
            // Save user data and token to context
            login(response.user, response.token);
            
            // Navigate based on user role
            const userRoles = response.user.roles || [];
            const hasStaffRole = userRoles.some(role => 
                ['cashier', 'checkincounter', 'branchmanager', 'administrator'].includes(role)
            );
            
            if (hasStaffRole) {
                navigate('/staff');
            } else {
                navigate('/');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            setMessage(error.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-xs px-4 sm:max-w-sm sm:px-0 md:max-w-md lg:max-w-lg xl:max-w-xl">
            {/* Title */}
            <h1 className="mb-4 text-center font-['Unbounded'] text-2xl font-bold text-white sm:mb-6 sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">LOGIN</h1>

            {/* Register Link */}
            {isCustomer && (
                <p className="mb-6 text-center font-['Libre_Franklin'] text-sm text-white sm:mb-8 sm:text-base md:text-lg lg:text-xl">
                    Don't have an account?
                    <span onClick={() => navigate('/register')} className="ml-1 cursor-pointer font-['Libre_Franklin'] text-purple-400 hover:text-purple-300">
                        Register
                    </span>
                </p>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
                {/* Error Message */}
                {message && (
                    <div className="rounded-md bg-red-100 p-3 text-center">
                        <p className="font-['Libre_Franklin'] text-sm text-red-800">{message}</p>
                    </div>
                )}

                {/* Email */}
                <div>
                    <label className="mb-2 block font-['Libre_Franklin'] text-sm font-bold text-white sm:text-base md:text-lg lg:text-xl">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className={`bg-opacity-70 h-10 w-full rounded-lg bg-zinc-300 px-3 text-black placeholder-gray-600 focus:ring-2 focus:outline-none sm:h-11 sm:px-4 md:h-12 lg:h-13 xl:h-14 ${errors.email ? 'ring-2 ring-red-500 focus:ring-red-500' : 'focus:ring-purple-500'} focus:bg-opacity-90 font-['Unbounded'] text-sm sm:text-base md:text-lg ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                        required
                    />
                    {errors.email && <p className="mt-1 font-['Libre_Franklin'] text-xs text-red-400 sm:text-sm">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                    <label className="mb-2 block font-['Libre_Franklin'] text-sm font-bold text-white sm:text-base md:text-lg lg:text-xl">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            className={`bg-opacity-70 h-10 w-full rounded-lg bg-zinc-300 px-3 pr-10 text-black placeholder-gray-600 focus:ring-2 focus:outline-none sm:h-11 sm:px-4 sm:pr-12 md:h-12 lg:h-13 xl:h-14 ${errors.password ? 'ring-2 ring-red-500 focus:ring-red-500' : 'focus:ring-purple-500'} focus:bg-opacity-90 font-['Unbounded'] text-sm sm:text-base md:text-lg ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                            className="absolute top-1/2 right-2 flex h-5 w-5 -translate-y-1/2 transform items-center justify-center text-gray-600 hover:text-gray-800 sm:right-3 sm:h-6 sm:w-6 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <img src={showPassword ? HideIcon : ShowIcon} alt={showPassword ? 'Hide password' : 'Show password'} className="h-full w-full filter" />
                        </button>
                    </div>
                    {errors.password && <p className="mt-1 font-['Libre_Franklin'] text-xs text-red-400 sm:text-sm">{errors.password}</p>}

                    {/* Forget Password Link */}
                    <div className="mt-2 text-right">
                        <span
                            onClick={() => !isLoading && navigate(isCustomer ? '/reset-password' : '/staff/reset-password')}
                            className={`font-['Libre_Franklin'] text-sm font-normal text-white hover:text-purple-300 sm:text-base md:text-lg ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                        >
                            Forget password?
                        </span>
                    </div>
                </div>

                {/* Login Button */}
                <div className="flex justify-center pt-4 sm:pt-6">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`flex h-10 w-full max-w-xs items-center justify-center rounded-md bg-pink-400 font-['Unbounded'] text-sm font-bold text-white shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] transition-all duration-300 hover:cursor-pointer hover:shadow-[inset_0px_0px_60px_5px_rgba(155,47,255,1.00)] sm:h-11 sm:max-w-sm sm:rounded-lg sm:text-base md:h-12 md:max-w-md md:rounded-xl md:text-lg lg:h-13 lg:text-xl ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                        {isLoading ? 'LOGGING IN...' : 'LOGIN'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LoginForm;
