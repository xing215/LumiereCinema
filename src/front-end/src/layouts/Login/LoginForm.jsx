import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ShowIcon from '../../assets/icons/show.svg';
import HideIcon from '../../assets/icons/hide.svg';

const LoginForm = ({ isCustomer = true }) => {
    const navigate = useNavigate();
        
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showRetypePassword, setShowRetypePassword] = useState(false);

    // Validation patterns
    const patterns = {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
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
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Real-time validation
        const error = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate all fields before submit
        const newErrors = {};
        Object.keys(formData).forEach(key => {
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
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl px-4 sm:px-0">
            {/* Title */}
            <h1 className="text-center text-white font-['Unbounded'] font-bold
            text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl mb-4 sm:mb-6">
                LOGIN
            </h1>
            
            {/* Register Link */}
            {isCustomer && (
                <p className="text-white text-center text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 font-['Libre_Franklin']">
                    Don't have an account? 
                    <span
                        onClick={() => navigate('/register')}
                        className="text-purple-400 hover:text-purple-300 cursor-pointer ml-1 font-['Libre_Franklin']"
                    >
                        Register
                    </span>
                </p>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
                {/* Email */}
                <div>
                    <label className="block text-white font-bold mb-2 font-['Libre_Franklin'] text-sm sm:text-base md:text-lg lg:text-xl">
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full h-10 sm:h-11 md:h-12 lg:h-13 xl:h-14 px-3 sm:px-4 rounded-lg bg-zinc-300 bg-opacity-70 text-black placeholder-gray-600 focus:outline-none focus:ring-2 ${errors.email ? 'focus:ring-red-500 ring-2 ring-red-500' : 'focus:ring-purple-500'} focus:bg-opacity-90 font-['Unbounded'] text-sm sm:text-base md:text-lg`}
                        required
                    />
                    {errors.email && (
                        <p className="text-red-400 text-xs sm:text-sm mt-1 font-['Libre_Franklin']">{errors.email}</p>
                    )}
                </div>

                {/* Password */}
                <div>
                    <label className="block text-white font-bold mb-2 font-['Libre_Franklin'] text-sm sm:text-base md:text-lg lg:text-xl">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className={`w-full h-10 sm:h-11 md:h-12 lg:h-13 xl:h-14 px-3 sm:px-4 pr-10 sm:pr-12 rounded-lg bg-zinc-300 bg-opacity-70 text-black placeholder-gray-600 focus:outline-none focus:ring-2 ${errors.password ? 'focus:ring-red-500 ring-2 ring-red-500' : 'focus:ring-purple-500'} focus:bg-opacity-90 font-['Unbounded'] text-sm sm:text-base md:text-lg`}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center"
                        >
                            <img 
                                src={showPassword ? HideIcon : ShowIcon} 
                                alt={showPassword ? "Hide password" : "Show password"}
                                className="w-full h-full filter"
                            />
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-red-400 text-xs sm:text-sm mt-1 font-['Libre_Franklin']">{errors.password}</p>
                    )}
                    
                    {/* Forget Password Link */}
                    <div className="text-right mt-2">
                        <span className="text-white hover:text-purple-300 cursor-pointer font-['Libre_Franklin'] font-normal text-sm sm:text-base md:text-lg">
                            Forget password?
                        </span>
                    </div>
                </div>

                {/* Login Button */}
                <div className="pt-4 sm:pt-6 flex justify-center">
                    <button
                        type="submit"
                        className="w-full max-w-xs sm:max-w-sm md:max-w-md
                        h-10 sm:h-11 md:h-12 lg:h-13
                        bg-pink-400
                        rounded-md sm:rounded-lg md:rounded-xl
                        shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)]
                        text-white font-bold font-['Unbounded']
                        flex items-center justify-center
                        text-sm sm:text-base md:text-lg lg:text-xl
                        hover:shadow-[inset_0px_0px_60px_5px_rgba(155,47,255,1.00)]
                        transition-all duration-300"
                    >
                        LOGIN
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LoginForm;
