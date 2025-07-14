import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ShowIcon from '../../assets/icons/show.svg';
import HideIcon from '../../assets/icons/hide.svg';

const LoginForm = ({ isCustomer = true }) => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showRetypePassword, setShowRetypePassword] = useState(false);

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

        // Real-time validation
        const error = validateField(name, value);
        setErrors((prev) => ({
            ...prev,
            [name]: error,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate all fields before submit
        const newErrors = {};
        Object.keys(formData).forEach((key) => {
            const error = validateField(key, formData[key]);
            if (error) newErrors[key] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Handle login logic here
        console.log('Login data:', formData);
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
                {/* Email */}
                <div>
                    <label className="mb-2 block font-['Libre_Franklin'] text-sm font-bold text-white sm:text-base md:text-lg lg:text-xl">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`bg-opacity-70 h-10 w-full rounded-lg bg-zinc-300 px-3 text-black placeholder-gray-600 focus:ring-2 focus:outline-none sm:h-11 sm:px-4 md:h-12 lg:h-13 xl:h-14 ${errors.email ? 'ring-2 ring-red-500 focus:ring-red-500' : 'focus:ring-purple-500'} focus:bg-opacity-90 font-['Unbounded'] text-sm sm:text-base md:text-lg`}
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
                            className={`bg-opacity-70 h-10 w-full rounded-lg bg-zinc-300 px-3 pr-10 text-black placeholder-gray-600 focus:ring-2 focus:outline-none sm:h-11 sm:px-4 sm:pr-12 md:h-12 lg:h-13 xl:h-14 ${errors.password ? 'ring-2 ring-red-500 focus:ring-red-500' : 'focus:ring-purple-500'} focus:bg-opacity-90 font-['Unbounded'] text-sm sm:text-base md:text-lg`}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute top-1/2 right-2 flex h-5 w-5 -translate-y-1/2 transform items-center justify-center text-gray-600 hover:text-gray-800 sm:right-3 sm:h-6 sm:w-6"
                        >
                            <img src={showPassword ? HideIcon : ShowIcon} alt={showPassword ? 'Hide password' : 'Show password'} className="h-full w-full filter" />
                        </button>
                    </div>
                    {errors.password && <p className="mt-1 font-['Libre_Franklin'] text-xs text-red-400 sm:text-sm">{errors.password}</p>}

                    {/* Forget Password Link */}
                    <div className="mt-2 text-right">
                        <span
                            onClick={() => navigate(isCustomer ? '/reset-password' : '/staff/reset-password')}
                            className="cursor-pointer font-['Libre_Franklin'] text-sm font-normal text-white hover:text-purple-300 sm:text-base md:text-lg"
                        >
                            Forget password?
                        </span>
                    </div>
                </div>

                {/* Login Button */}
                <div className="flex justify-center pt-4 sm:pt-6">
                    <button
                        type="submit"
                        className="flex h-10 w-full max-w-xs items-center justify-center rounded-md bg-pink-400 font-['Unbounded'] text-sm font-bold text-white shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] transition-all duration-300 hover:cursor-pointer hover:shadow-[inset_0px_0px_60px_5px_rgba(155,47,255,1.00)] sm:h-11 sm:max-w-sm sm:rounded-lg sm:text-base md:h-12 md:max-w-md md:rounded-xl md:text-lg lg:h-13 lg:text-xl"
                    >
                        LOGIN
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LoginForm;
