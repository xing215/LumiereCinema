import React, { useState } from 'react';
import CustomDropdown from '../../components/UI/CustomDropdown.jsx';
import ShowIcon from '../../assets/icons/show.svg';
import HideIcon from '../../assets/icons/hide.svg';

const LoginForm = ({ showRegisterLink = true }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

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
        <div className="flex flex-col items-center justify-center min-h-screen lg:pt-20 md:pt-16 sm:pt-14 pt-12 lg:px-8 md:px-6 sm:px-5 px-4">
            <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-lg xl:max-w-xl">
                {/* Title */}
                <h1 className="text-center text-white font-['Unbounded'] font-bold
                xl:text-5xl lg:text-4xl md:text-2xl sm:text-lg text-sm mb-4">
                    LOGIN
                </h1>
                
                {/* Register Link - Conditionally rendered */}
                {showRegisterLink && (
                    <p className="text-white text-center lg:text-lg md:text-base sm:text-sm text-xs mb-8 font-['Mina']">
                        Don't have an account? 
                        <span className="text-purple-400 hover:text-purple-300 cursor-pointer ml-1 font-['Mina']">
                            Register
                        </span>
                    </p>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5 lg:space-y-6">
                    {/* Email */}
                    <div>
                        <label className="block text-white font-bold mb-2 font-['Mina'] lg:text-xl md:text-lg sm:text-base text-sm">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`w-full lg:h-12 md:h-11 sm:h-9 h-8 px-4 rounded-lg bg-zinc-300 bg-opacity-70 text-black placeholder-gray-600 focus:outline-none focus:ring-2 ${errors.email ? 'focus:ring-red-500 ring-2 ring-red-500' : 'focus:ring-purple-500'} focus:bg-opacity-90 font-['Unbounded'] lg:text-base md:text-sm sm:text-xs text-xs`}
                            required
                        />
                        {errors.email && (
                            <p className="text-red-400 text-sm mt-1 font-['Mina']">{errors.email}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-white font-bold mb-2 font-['Mina'] lg:text-xl md:text-lg sm:text-base text-sm">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className={`w-full lg:h-12 md:h-11 sm:h-9 h-8 px-4 pr-12 rounded-lg bg-zinc-300 bg-opacity-70 text-black placeholder-gray-600 focus:outline-none focus:ring-2 ${errors.password ? 'focus:ring-red-500 ring-2 ring-red-500' : 'focus:ring-purple-500'} focus:bg-opacity-90 font-['Unbounded'] lg:text-base md:text-sm sm:text-xs text-xs`}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex items-center justify-center"
                            >
                                <img 
                                    src={showPassword ? HideIcon : ShowIcon} 
                                    alt={showPassword ? "Hide password" : "Show password"}
                                    className="w-full h-full filter"
                                />
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-red-400 text-sm mt-1 font-['Mina']">{errors.password}</p>
                        )}
                    </div>

                    {/* Login Button */}
                    <div className="pt-4 flex justify-center">
                        <button
                            type="submit"
                            className="lg:w-64 md:w-56 sm:w-46 w-32
                            lg:h-9 md:h-8 sm:h-7 h-6
                            bg-pink-400
                            lg:rounded-xl md:rounded-lg sm:rounded-lg rounded-md
                            shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)]
                            text-white font-bold font-['Unbounded']
                            flex items-center justify-center
                            lg:text-lg md:text-base sm:text-sm text-xs
                            hover:shadow-[inset_0px_0px_60px_5px_rgba(155,47,255,1.00)]
                            transition-all duration-300"
                        >
                            LOGIN
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;
