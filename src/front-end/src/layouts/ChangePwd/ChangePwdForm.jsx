import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ShowIcon from '../../assets/icons/show.svg';
import HideIcon from '../../assets/icons/hide.svg';

const ChangePwdForm = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        retypeNewPassword: '',
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

        // Special case: validate retypeNewPassword when newPassword changes
        if (name === 'newPassword' && formData.retypeNewPassword) {
            const retypeError = validateField('retypeNewPassword', formData.retypeNewPassword);
            setErrors((prev) => ({
                ...prev,
                retypeNewPassword: retypeError,
            }));
        }

        // Special case: validate newPassword when currentPassword changes
        if (name === 'currentPassword' && formData.newPassword) {
            const newPasswordError = validateField('newPassword', formData.newPassword);
            setErrors((prev) => ({
                ...prev,
                newPassword: newPasswordError,
            }));
        }
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

        // Handle password change logic here
        console.log('Password change data:', formData);
    };

    return (
        <div className="w-full max-w-sm px-4 sm:max-w-md sm:px-0 md:max-w-lg lg:max-w-xl xl:max-w-2xl">
            {/* Title */}
            <h1 className="mb-4 text-center font-['Unbounded'] text-xl font-bold text-white sm:mb-6 sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">CHANGE PASSWORD</h1>

            {/* Change Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
                {/* Current Password */}
                <div>
                    <label className="mb-2 block font-['Libre_Franklin'] text-sm font-bold text-white sm:text-base md:text-lg lg:text-xl">Current password</label>
                    <div className="relative">
                        <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            className={`bg-opacity-70 h-10 w-full rounded-lg bg-zinc-300 px-3 pr-10 text-black placeholder-gray-600 focus:ring-2 focus:outline-none sm:h-11 sm:px-4 sm:pr-12 md:h-12 lg:h-13 xl:h-14 ${errors.currentPassword ? 'ring-2 ring-red-500 focus:ring-red-500' : 'focus:ring-purple-500'} focus:bg-opacity-90 font-['Unbounded'] text-sm sm:text-base md:text-lg`}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute top-1/2 right-2 flex h-5 w-5 -translate-y-1/2 transform items-center justify-center text-gray-600 hover:text-gray-800 sm:right-3 sm:h-6 sm:w-6"
                        >
                            <img src={showCurrentPassword ? HideIcon : ShowIcon} alt={showCurrentPassword ? 'Hide password' : 'Show password'} className="h-full w-full filter" />
                        </button>
                    </div>
                    {errors.currentPassword && <p className="mt-1 font-['Libre_Franklin'] text-xs text-red-400 sm:text-sm">{errors.currentPassword}</p>}
                </div>

                {/* New Password */}
                <div>
                    <label className="mb-2 block font-['Libre_Franklin'] text-sm font-bold text-white sm:text-base md:text-lg lg:text-xl">New password</label>
                    <div className="relative">
                        <input
                            type={showNewPassword ? 'text' : 'password'}
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            className={`bg-opacity-70 h-10 w-full rounded-lg bg-zinc-300 px-3 pr-10 text-black placeholder-gray-600 focus:ring-2 focus:outline-none sm:h-11 sm:px-4 sm:pr-12 md:h-12 lg:h-13 xl:h-14 ${errors.newPassword ? 'ring-2 ring-red-500 focus:ring-red-500' : 'focus:ring-purple-500'} focus:bg-opacity-90 font-['Unbounded'] text-sm sm:text-base md:text-lg`}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute top-1/2 right-2 flex h-5 w-5 -translate-y-1/2 transform items-center justify-center text-gray-600 hover:text-gray-800 sm:right-3 sm:h-6 sm:w-6"
                        >
                            <img src={showNewPassword ? HideIcon : ShowIcon} alt={showNewPassword ? 'Hide password' : 'Show password'} className="h-full w-full filter" />
                        </button>
                    </div>
                    {errors.newPassword && <p className="mt-1 font-['Libre_Franklin'] text-xs text-red-400 sm:text-sm">{errors.newPassword}</p>}
                </div>

                {/* Re-type New Password */}
                <div>
                    <label className="mb-2 block font-['Libre_Franklin'] text-sm font-bold text-white sm:text-base md:text-lg lg:text-xl">Re-type new password</label>
                    <div className="relative">
                        <input
                            type={showRetypeNewPassword ? 'text' : 'password'}
                            name="retypeNewPassword"
                            value={formData.retypeNewPassword}
                            onChange={handleInputChange}
                            className={`bg-opacity-70 h-10 w-full rounded-lg bg-zinc-300 px-3 pr-10 text-black placeholder-gray-600 focus:ring-2 focus:outline-none sm:h-11 sm:px-4 sm:pr-12 md:h-12 lg:h-13 xl:h-14 ${errors.retypeNewPassword ? 'ring-2 ring-red-500 focus:ring-red-500' : 'focus:ring-purple-500'} focus:bg-opacity-90 font-['Unbounded'] text-sm sm:text-base md:text-lg`}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowRetypeNewPassword(!showRetypeNewPassword)}
                            className="absolute top-1/2 right-2 flex h-5 w-5 -translate-y-1/2 transform items-center justify-center text-gray-600 hover:text-gray-800 sm:right-3 sm:h-6 sm:w-6"
                        >
                            <img src={showRetypeNewPassword ? HideIcon : ShowIcon} alt={showRetypeNewPassword ? 'Hide password' : 'Show password'} className="h-full w-full filter" />
                        </button>
                    </div>
                    {errors.retypeNewPassword && <p className="mt-1 font-['Libre_Franklin'] text-xs text-red-400 sm:text-sm">{errors.retypeNewPassword}</p>}
                </div>

                {/* Change Password Button */}
                <div className="flex justify-center pt-4 sm:pt-6">
                    <button
                        type="submit"
                        className="flex h-10 w-full max-w-xs items-center justify-center rounded-md bg-pink-400 font-['Unbounded'] text-sm font-bold text-white shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] transition-all duration-300 hover:cursor-pointer hover:shadow-[inset_0px_0px_60px_5px_rgba(155,47,255,1.00)] sm:h-11 sm:max-w-sm sm:rounded-lg sm:text-base md:h-12 md:max-w-md md:rounded-xl md:text-lg lg:h-13 lg:text-xl"
                    >
                        CONFIRM
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChangePwdForm;
