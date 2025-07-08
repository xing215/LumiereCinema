import React, { useState } from 'react';

const ResetPwdForm = ({ isCustomer = true }) => {
        
    const [formData, setFormData] = useState({
        email: ''
    });

    const [errors, setErrors] = useState({});

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

        // Handle reset password logic here
        console.log('Reset password data:', formData);
    };

    return (
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl px-4 sm:px-0">
            <div className="relative flex items-center justify-center mb-4 sm:mb-6">
                {/* Title */}
                <h1 className="text-center text-white font-['Unbounded'] font-bold
                text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
                    RESET PASSWORD
                </h1>
            </div>

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

                {/* Reset Button */}
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
                        SEND EMAIL
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ResetPwdForm;
