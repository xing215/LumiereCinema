import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ShowIcon from '../../assets/icons/show.svg';
import HideIcon from '../../assets/icons/hide.svg';

const ChangePwdForm = () => {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        retypeNewPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showRetypeNewPassword, setShowRetypeNewPassword] = useState(false);

    const validateField = (name, value) => {
        let error = '';
        
        switch (name) {
            case 'currentPassword':
                if (!value) {
                    error = 'Current password is required';
                }
                break;
            case 'newPassword':
                if (value.length < 6) {
                    error = 'Password must be at least 6 characters long';
                } else if (value === formData.currentPassword) {
                    error = 'New password must be different from current password';
                }
                break;
            case 'retypeNewPassword':
                if (value !== formData.newPassword) {
                    error = 'Passwords do not match';
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

        // Special case: validate retypeNewPassword when newPassword changes
        if (name === 'newPassword' && formData.retypeNewPassword) {
            const retypeError = validateField('retypeNewPassword', formData.retypeNewPassword);
            setErrors(prev => ({
                ...prev,
                retypeNewPassword: retypeError
            }));
        }

        // Special case: validate newPassword when currentPassword changes
        if (name === 'currentPassword' && formData.newPassword) {
            const newPasswordError = validateField('newPassword', formData.newPassword);
            setErrors(prev => ({
                ...prev,
                newPassword: newPasswordError
            }));
        }
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

        // Handle password change logic here
        console.log('Password change data:', formData);
    };

    return (
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl px-4 sm:px-0">
            {/* Title */}
            <h1 className="text-center text-white font-['Unbounded'] font-bold
            text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl mb-4 sm:mb-6">
                CHANGE PASSWORD
            </h1>

            {/* Change Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
                {/* Current Password */}
                <div>
                    <label className="block text-white font-bold mb-2 font-['Libre_Franklin'] text-sm sm:text-base md:text-lg lg:text-xl">
                        Current password
                    </label>
                    <div className="relative">
                        <input
                            type={showCurrentPassword ? "text" : "password"}
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            className={`w-full h-10 sm:h-11 md:h-12 lg:h-13 xl:h-14 px-3 sm:px-4 pr-10 sm:pr-12 rounded-lg bg-zinc-300 bg-opacity-70 text-black placeholder-gray-600 focus:outline-none focus:ring-2 ${errors.currentPassword ? 'focus:ring-red-500 ring-2 ring-red-500' : 'focus:ring-purple-500'} focus:bg-opacity-90 font-['Unbounded'] text-sm sm:text-base md:text-lg`}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center"
                        >
                            <img 
                                src={showCurrentPassword ? HideIcon : ShowIcon} 
                                alt={showCurrentPassword ? "Hide password" : "Show password"}
                                className="w-full h-full filter"
                            />
                        </button>
                    </div>
                    {errors.currentPassword && (
                        <p className="text-red-400 text-xs sm:text-sm mt-1 font-['Libre_Franklin']">{errors.currentPassword}</p>
                    )}
                </div>

                {/* New Password */}
                <div>
                    <label className="block text-white font-bold mb-2 font-['Libre_Franklin'] text-sm sm:text-base md:text-lg lg:text-xl">
                        New password
                    </label>
                    <div className="relative">
                        <input
                            type={showNewPassword ? "text" : "password"}
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            className={`w-full h-10 sm:h-11 md:h-12 lg:h-13 xl:h-14 px-3 sm:px-4 pr-10 sm:pr-12 rounded-lg bg-zinc-300 bg-opacity-70 text-black placeholder-gray-600 focus:outline-none focus:ring-2 ${errors.newPassword ? 'focus:ring-red-500 ring-2 ring-red-500' : 'focus:ring-purple-500'} focus:bg-opacity-90 font-['Unbounded'] text-sm sm:text-base md:text-lg`}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center"
                        >
                            <img 
                                src={showNewPassword ? HideIcon : ShowIcon} 
                                alt={showNewPassword ? "Hide password" : "Show password"}
                                className="w-full h-full filter"
                            />
                        </button>
                    </div>
                    {errors.newPassword && (
                        <p className="text-red-400 text-xs sm:text-sm mt-1 font-['Libre_Franklin']">{errors.newPassword}</p>
                    )}
                </div>

                {/* Re-type New Password */}
                <div>
                    <label className="block text-white font-bold mb-2 font-['Libre_Franklin'] text-sm sm:text-base md:text-lg lg:text-xl">
                        Re-type new password
                    </label>
                    <div className="relative">
                        <input
                            type={showRetypeNewPassword ? "text" : "password"}
                            name="retypeNewPassword"
                            value={formData.retypeNewPassword}
                            onChange={handleInputChange}
                            className={`w-full h-10 sm:h-11 md:h-12 lg:h-13 xl:h-14 px-3 sm:px-4 pr-10 sm:pr-12 rounded-lg bg-zinc-300 bg-opacity-70 text-black placeholder-gray-600 focus:outline-none focus:ring-2 ${errors.retypeNewPassword ? 'focus:ring-red-500 ring-2 ring-red-500' : 'focus:ring-purple-500'} focus:bg-opacity-90 font-['Unbounded'] text-sm sm:text-base md:text-lg`}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowRetypeNewPassword(!showRetypeNewPassword)}
                            className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center"
                        >
                            <img 
                                src={showRetypeNewPassword ? HideIcon : ShowIcon} 
                                alt={showRetypeNewPassword ? "Hide password" : "Show password"}
                                className="w-full h-full filter"
                            />
                        </button>
                    </div>
                    {errors.retypeNewPassword && (
                        <p className="text-red-400 text-xs sm:text-sm mt-1 font-['Libre_Franklin']">{errors.retypeNewPassword}</p>
                    )}
                </div>

                {/* Change Password Button */}
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
                        CONFIRM
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChangePwdForm;