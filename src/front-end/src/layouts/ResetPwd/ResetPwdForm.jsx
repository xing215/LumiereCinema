import React, { useState } from 'react';

const ResetPwdForm = () => {
    const [formData, setFormData] = useState({
        email: '',
    });

    const [errors, setErrors] = useState({});

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

        // Handle reset password logic here
        console.log('Reset password data:', formData);
    };

    return (
        <div className="w-full max-w-xs px-4 sm:max-w-sm sm:px-0 md:max-w-md lg:max-w-lg xl:max-w-xl">
            <div className="relative mb-4 flex items-center justify-center sm:mb-6">
                {/* Title */}
                <h1 className="text-center font-['Unbounded'] text-xl font-bold text-white sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">RESET PASSWORD</h1>
            </div>

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

                {/* Reset Button */}
                <div className="flex justify-center pt-4 sm:pt-6">
                    <button
                        type="submit"
                        className="flex h-10 w-full max-w-xs items-center justify-center rounded-md bg-pink-400 font-['Unbounded'] text-sm font-bold text-white shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] transition-all duration-300 hover:shadow-[inset_0px_0px_60px_5px_rgba(155,47,255,1.00)] sm:h-11 sm:max-w-sm sm:rounded-lg sm:text-base md:h-12 md:max-w-md md:rounded-xl md:text-lg lg:h-13 lg:text-xl hover:cursor-pointer"
                    >
                        SEND EMAIL
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ResetPwdForm;
