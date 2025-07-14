import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomDropdown from '../../components/UI/CustomDropdown.jsx';
import ShowIcon from '../../assets/icons/show.svg';
import HideIcon from '../../assets/icons/hide.svg';

const RegistrationForm = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        birthday: '',
        gender: '',
        email: '',
        phoneNumber: '',
        password: '',
        retypePassword: '',
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showRetypePassword, setShowRetypePassword] = useState(false);

    // Validation patterns
    const patterns = {
        name: /^[a-zA-ZÀ-ỹ\s]{2,}\s+[a-zA-ZÀ-ỹ\s]{2,}$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phoneNumber: /^(?:\+84|0084|0)[235789][0-9]{1,2}[0-9]{7}$/,
        gender: /^(Male|Female|Other)$/,
    };

    const validateField = (name, value) => {
        let error = '';

        switch (name) {
            case 'name':
                if (!patterns.name.test(value.trim())) {
                    error = 'Name must contain at least two words (e.g., John Smith)';
                }
                break;
            case 'email':
                if (!patterns.email.test(value)) {
                    error = 'Please enter a valid email address';
                }
                break;
            case 'phoneNumber':
                if (!patterns.phoneNumber.test(value)) {
                    error = 'Please enter a valid Vietnamese phone number';
                }
                break;
            case 'birthday':
                if (value) {
                    const selectedDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0); // Reset time to compare only dates
                    if (selectedDate >= today) {
                        error = 'Birthday must be before today';
                    }
                }
                break;
            case 'gender':
                if (value && !patterns.gender.test(value)) {
                    error = 'Please select a valid gender option';
                }
                break;
            case 'password':
                if (value.length < 6) {
                    error = 'Password must be at least 6 characters long';
                }
                break;
            case 'retypePassword':
                if (value !== formData.password) {
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

        // Special case: validate retypePassword when password changes
        if (name === 'password' && formData.retypePassword) {
            const retypeError = validateField('retypePassword', formData.retypePassword);
            setErrors((prev) => ({
                ...prev,
                retypePassword: retypeError,
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

        // Handle registration logic here
        console.log('Registration data:', formData);
    };

    return (
        <div className="w-full max-w-xs px-4 sm:max-w-sm sm:px-0 md:max-w-md lg:max-w-lg xl:max-w-xl">
            {/* Title */}
            <h1 className="mb-4 text-center font-['Unbounded'] text-2xl font-bold text-white sm:mb-6 sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">REGISTER</h1>

            {/* Login Link */}
            <p className="mb-6 text-center font-['Libre_Franklin'] text-sm text-white sm:mb-8 sm:text-base md:text-lg lg:text-xl">
                Already have an account?
                <span onClick={() => navigate('/login')} className="ml-1 cursor-pointer font-['Libre_Franklin'] text-purple-400 hover:text-purple-300">
                    Login
                </span>
            </p>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
                {/* Name */}
                <div>
                    <label className="mb-2 block font-['Libre_Franklin'] text-sm font-bold text-white sm:text-base md:text-lg lg:text-xl">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`bg-opacity-70 h-10 w-full rounded-lg bg-zinc-300 px-3 text-black placeholder-gray-600 focus:ring-2 focus:outline-none sm:h-11 sm:px-4 md:h-12 lg:h-13 xl:h-14 ${errors.name ? 'ring-2 ring-red-500 focus:ring-red-500' : 'focus:ring-purple-500'} focus:bg-opacity-90 font-['Unbounded'] text-sm sm:text-base md:text-lg`}
                        required
                    />
                    {errors.name && <p className="mt-1 font-['Libre_Franklin'] text-xs text-red-400 sm:text-sm">{errors.name}</p>}
                </div>

                {/* Birthday and Gender Row - Stack on small screens */}
                <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
                    <div className="flex-1">
                        <label className="mb-2 block font-['Libre_Franklin'] text-sm font-bold text-white sm:text-base md:text-lg lg:text-xl">Birthday</label>
                        <input
                            type="date"
                            name="birthday"
                            value={formData.birthday}
                            onChange={handleInputChange}
                            className={`bg-opacity-70 h-10 w-full rounded-lg bg-zinc-300 px-3 text-black focus:ring-2 focus:outline-none sm:h-11 sm:px-4 md:h-12 lg:h-13 xl:h-14 ${errors.birthday ? 'ring-2 ring-red-500 focus:ring-red-500' : 'focus:ring-purple-500'} focus:bg-opacity-90 font-['Unbounded'] text-sm sm:text-base md:text-lg`}
                            required
                        />
                        {errors.birthday && <p className="mt-1 font-['Libre_Franklin'] text-xs text-red-400 sm:text-sm">{errors.birthday}</p>}
                    </div>
                    <div className="flex-1">
                        <label className="mb-2 block font-['Libre_Franklin'] text-sm font-bold text-white sm:text-base md:text-lg lg:text-xl">Gender</label>
                        <CustomDropdown
                            value={formData.gender}
                            onChange={handleInputChange}
                            name="gender"
                            placeholder="Select..."
                            bgColor="zinc-300"
                            hoverColor="zinc-200"
                            borderColor="zinc-400"
                            textColor="black"
                            bgOpacity="bg-opacity-70"
                            height="h-10 sm:h-11 md:h-12 lg:h-13 xl:h-14"
                            textAlign="left"
                            options={[
                                { value: 'Male', label: 'Male' },
                                { value: 'Female', label: 'Female' },
                                { value: 'Other', label: 'Other' },
                            ]}
                        />
                        {errors.gender && <p className="mt-1 font-['Libre_Franklin'] text-xs text-red-400 sm:text-sm">{errors.gender}</p>}
                    </div>
                </div>

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

                {/* Phone Number */}
                <div>
                    <label className="mb-2 block font-['Libre_Franklin'] text-sm font-bold text-white sm:text-base md:text-lg lg:text-xl">Phone Number</label>
                    <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className={`bg-opacity-70 h-10 w-full rounded-lg bg-zinc-300 px-3 text-black placeholder-gray-600 focus:ring-2 focus:outline-none sm:h-11 sm:px-4 md:h-12 lg:h-13 xl:h-14 ${errors.phoneNumber ? 'ring-2 ring-red-500 focus:ring-red-500' : 'focus:ring-purple-500'} focus:bg-opacity-90 font-['Unbounded'] text-sm sm:text-base md:text-lg`}
                        required
                    />
                    {errors.phoneNumber && <p className="mt-1 font-['Libre_Franklin'] text-xs text-red-400 sm:text-sm">{errors.phoneNumber}</p>}
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
                </div>

                {/* Retype Password */}
                <div>
                    <label className="mb-2 block font-['Libre_Franklin'] text-sm font-bold text-white sm:text-base md:text-lg lg:text-xl">Retype Password</label>
                    <div className="relative">
                        <input
                            type={showRetypePassword ? 'text' : 'password'}
                            name="retypePassword"
                            value={formData.retypePassword}
                            onChange={handleInputChange}
                            className={`bg-opacity-70 h-10 w-full rounded-lg bg-zinc-300 px-3 pr-10 text-black placeholder-gray-600 focus:ring-2 focus:outline-none sm:h-11 sm:px-4 sm:pr-12 md:h-12 lg:h-13 xl:h-14 ${errors.retypePassword ? 'ring-2 ring-red-500 focus:ring-red-500' : 'focus:ring-purple-500'} focus:bg-opacity-90 font-['Unbounded'] text-sm sm:text-base md:text-lg`}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowRetypePassword(!showRetypePassword)}
                            className="absolute top-1/2 right-2 flex h-5 w-5 -translate-y-1/2 transform items-center justify-center text-gray-600 hover:text-gray-800 sm:right-3 sm:h-6 sm:w-6"
                        >
                            <img src={showRetypePassword ? HideIcon : ShowIcon} alt={showRetypePassword ? 'Hide password' : 'Show password'} className="h-full w-full filter" />
                        </button>
                    </div>
                    {errors.retypePassword && <p className="mt-1 font-['Libre_Franklin'] text-xs text-red-400 sm:text-sm">{errors.retypePassword}</p>}
                </div>

                {/* Register Button */}
                <div className="flex justify-center pt-4 sm:pt-6">
                    <button
                        type="submit"
                        className="flex h-10 w-full max-w-xs items-center justify-center rounded-md bg-pink-400 font-['Unbounded'] text-sm font-bold text-white shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)] transition-all duration-300 hover:cursor-pointer hover:shadow-[inset_0px_0px_60px_5px_rgba(155,47,255,1.00)] sm:h-11 sm:max-w-sm sm:rounded-lg sm:text-base md:h-12 md:max-w-md md:rounded-xl md:text-lg lg:h-13 lg:text-xl"
                    >
                        REGISTER
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegistrationForm;
