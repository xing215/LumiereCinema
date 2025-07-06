import React, { useState } from 'react';
import CustomDropdown from '../../components/UI/CustomDropdown.jsx';
import ShowIcon from '../../assets/icons/show.svg';
import HideIcon from '../../assets/icons/hide.svg';

const RegistrationForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        birthday: '',
        gender: '',
        email: '',
        phoneNumber: '',
        password: '',
        retypePassword: ''
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showRetypePassword, setShowRetypePassword] = useState(false);

    // Validation patterns
    const patterns = {
        name: /^[a-zA-ZÀ-ỹ\s]{2,}\s+[a-zA-ZÀ-ỹ\s]{2,}$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phoneNumber: /^(?:\+84|0084|0)[235789][0-9]{1,2}[0-9]{7}$/,
        gender: /^(Male|Female|Other)$/
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

        // Special case: validate retypePassword when password changes
        if (name === 'password' && formData.retypePassword) {
            const retypeError = validateField('retypePassword', formData.retypePassword);
            setErrors(prev => ({
                ...prev,
                retypePassword: retypeError
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

        // Handle registration logic here
        console.log('Registration data:', formData);
    };

    return (
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-lg xl:max-w-xl">
            {/* Title */}
            <h1 className="text-center text-white font-['Unbounded'] font-bold
            xl:text-5xl lg:text-4xl md:text-2xl sm:text-lg text-sm mb-4">
                REGISTER
            </h1>
            
            {/* Login Link */}
            <p className="text-white text-center lg:text-lg md:text-base sm:text-sm text-xs mb-8 font-['Libre_Franklin']">
                Already have an account? 
                <span className="text-purple-400 hover:text-purple-300 cursor-pointer ml-1 font-['Libre_Franklin']">
                    Login
                </span>
            </p>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5 lg:space-y-6">
                {/* Name */}
                <div>
                    <label className="block text-white font-bold mb-2 font-['Libre_Franklin'] lg:text-xl md:text-lg sm:text-base text-sm">
                        Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full lg:h-12 md:h-11 sm:h-9 h-8 px-4 rounded-lg bg-zinc-300 bg-opacity-70 text-black placeholder-gray-600 focus:outline-none focus:ring-2 ${errors.name ? 'focus:ring-red-500 ring-2 ring-red-500' : 'focus:ring-purple-500'} focus:bg-opacity-90 font-['Unbounded'] lg:text-base md:text-sm sm:text-xs text-xs`}
                        required
                    />
                    {errors.name && (
                        <p className="text-red-400 text-sm mt-1 font-['Libre_Franklin']">{errors.name}</p>
                    )}
                </div>

                {/* Birthday and Gender Row */}
                <div className="flex lg:gap-6 md:gap-4 sm:gap-3 gap-2">
                    <div className="flex-1">
                        <label className="block text-white font-bold mb-2 font-['Libre_Franklin'] lg:text-xl md:text-lg sm:text-base text-sm">
                            Birthday
                        </label>
                        <input
                            type="date"
                            name="birthday"
                            value={formData.birthday}
                            onChange={handleInputChange}
                            className={`w-full lg:h-12 md:h-11 sm:h-9 h-8 px-4 rounded-lg bg-zinc-300 bg-opacity-70 text-black focus:outline-none focus:ring-2 ${errors.birthday ? 'focus:ring-red-500 ring-2 ring-red-500' : 'focus:ring-purple-500'} focus:bg-opacity-90 font-['Unbounded'] lg:text-base md:text-sm sm:text-xs text-xs`}
                            required
                        />
                        {errors.birthday && (
                            <p className="text-red-400 text-sm mt-1 font-['Libre_Franklin']">{errors.birthday}</p>
                        )}
                    </div>
                    <div className="flex-1">
                        <label className="block text-white font-bold mb-2 font-['Libre_Franklin'] lg:text-xl md:text-lg sm:text-base text-sm">
                            Gender
                        </label>
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
                            options={[
                                { value: 'Male', label: 'Male' },
                                { value: 'Female', label: 'Female' },
                                { value: 'Other', label: 'Other' }
                            ]}
                        />
                        {errors.gender && (
                            <p className="text-red-400 text-sm mt-1 font-['Libre_Franklin']">{errors.gender}</p>
                        )}
                    </div>
                </div>

                {/* Email */}
                <div>
                    <label className="block text-white font-bold mb-2 font-['Libre_Franklin'] lg:text-xl md:text-lg sm:text-base text-sm">
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
                        <p className="text-red-400 text-sm mt-1 font-['Libre_Franklin']">{errors.email}</p>
                    )}
                </div>

                {/* Phone Number */}
                <div>
                    <label className="block text-white font-bold mb-2 font-['Libre_Franklin'] lg:text-xl md:text-lg sm:text-base text-sm">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className={`w-full lg:h-12 md:h-11 sm:h-9 h-8 px-4 rounded-lg bg-zinc-300 bg-opacity-70 text-black placeholder-gray-600 focus:outline-none focus:ring-2 ${errors.phoneNumber ? 'focus:ring-red-500 ring-2 ring-red-500' : 'focus:ring-purple-500'} focus:bg-opacity-90 font-['Unbounded'] lg:text-base md:text-sm sm:text-xs text-xs`}
                        required
                    />
                    {errors.phoneNumber && (
                        <p className="text-red-400 text-sm mt-1 font-['Libre_Franklin']">{errors.phoneNumber}</p>
                    )}
                </div>

                {/* Password */}
                <div>
                    <label className="block text-white font-bold mb-2 font-['Libre_Franklin'] lg:text-xl md:text-lg sm:text-base text-sm">
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
                        <p className="text-red-400 text-sm mt-1 font-['Libre_Franklin']">{errors.password}</p>
                    )}
                </div>

                {/* Retype Password */}
                <div>
                    <label className="block text-white font-bold mb-2 font-['Libre_Franklin'] lg:text-xl md:text-lg sm:text-base text-sm">
                        Retype Password
                    </label>
                    <div className="relative">
                        <input
                            type={showRetypePassword ? "text" : "password"}
                            name="retypePassword"
                            value={formData.retypePassword}
                            onChange={handleInputChange}
                            className={`w-full lg:h-12 md:h-11 sm:h-9 h-8 px-4 pr-12 rounded-lg bg-zinc-300 bg-opacity-70 text-black placeholder-gray-600 focus:outline-none focus:ring-2 ${errors.retypePassword ? 'focus:ring-red-500 ring-2 ring-red-500' : 'focus:ring-purple-500'} focus:bg-opacity-90 font-['Unbounded'] lg:text-base md:text-sm sm:text-xs text-xs`}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowRetypePassword(!showRetypePassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex items-center justify-center"
                        >
                            <img 
                                src={showRetypePassword ? HideIcon : ShowIcon} 
                                alt={showRetypePassword ? "Hide password" : "Show password"}
                                className="w-full h-full filter"
                            />
                        </button>
                    </div>
                    {errors.retypePassword && (
                        <p className="text-red-400 text-sm mt-1 font-['Libre_Franklin']">{errors.retypePassword}</p>
                    )}
                </div>

                {/* Register Button */}
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
                        REGISTER
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegistrationForm;
