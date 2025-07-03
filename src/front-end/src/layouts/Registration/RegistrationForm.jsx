import React, { useState } from 'react';
import CustomDropdown from '../../components/UI/CustomDropdown.jsx';

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle registration logic here
        console.log('Registration data:', formData);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen lg:pt-20 md:pt-16 pt-12 lg:px-8 md:px-6 px-4">
            <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
                {/* Title */}
                <h1 className="text-center text-white font-['Unbounded'] font-bold
                xl:text-5xl lg:text-4xl md:text-2xl text-sm mb-4">
                    REGISTER
                </h1>
                
                {/* Login Link */}
                <p className="text-white text-center lg:text-lg md:text-base text-sm mb-8">
                    Already have an account? 
                    <span className="text-purple-400 hover:text-purple-300 cursor-pointer ml-1 font-semibold">
                        Login
                    </span>
                </p>

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
                    {/* Name */}
                    <div>
                        <label className="block text-white font-bold mb-2 font-['Mina'] lg:text-xl md:text-lg text-base">
                            Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full lg:h-12 md:h-11 h-8 px-4 rounded-lg bg-zinc-300 bg-opacity-70 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-opacity-90 font-['Unbounded'] lg:text-base md:text-sm text-xs"
                            required
                        />
                    </div>

                    {/* Birthday and Gender Row */}
                    <div className="flex lg:gap-6 md:gap-4 gap-3">
                        <div className="flex-1">
                            <label className="block text-white font-bold mb-2 font-['Mina'] lg:text-xl md:text-lg text-base">
                                Birthday
                            </label>
                            <input
                                type="date"
                                name="birthday"
                                value={formData.birthday}
                                onChange={handleInputChange}
                                className="w-full lg:h-12 md:h-11 h-8 px-4 rounded-lg bg-zinc-300 bg-opacity-70 text-black focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-opacity-90 font-['Unbounded'] lg:text-base md:text-sm text-xs"
                                required
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-white font-bold mb-2 font-['Mina'] lg:text-xl md:text-lg text-base">
                                Gender
                            </label>
                            <CustomDropdown
                                value={formData.gender}
                                onChange={handleInputChange}
                                name="gender"
                                placeholder="Select"
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
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-white font-bold mb-2 font-['Mina'] lg:text-xl md:text-lg text-base">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full lg:h-12 md:h-11 h-8 px-4 rounded-lg bg-zinc-300 bg-opacity-70 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-opacity-90 font-['Unbounded'] lg:text-base md:text-sm text-xs"
                            required
                        />
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block text-white font-bold mb-2 font-['Mina'] lg:text-xl md:text-lg text-base">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            className="w-full lg:h-12 md:h-11 h-8 px-4 rounded-lg bg-zinc-300 bg-opacity-70 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-opacity-90 font-['Unbounded'] lg:text-base md:text-sm text-xs"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-white font-bold mb-2 font-['Mina'] lg:text-xl md:text-lg text-base">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full lg:h-12 md:h-11 h-8 px-4 rounded-lg bg-zinc-300 bg-opacity-70 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-opacity-90 font-['Unbounded'] lg:text-base md:text-sm text-xs"
                            required
                        />
                    </div>

                    {/* Retype Password */}
                    <div>
                        <label className="block text-white font-bold mb-2 font-['Mina'] lg:text-xl md:text-lg text-base">
                            Retype Password
                        </label>
                        <input
                            type="password"
                            name="retypePassword"
                            value={formData.retypePassword}
                            onChange={handleInputChange}
                            className="w-full lg:h-12 md:h-11 h-8 px-4 rounded-lg bg-zinc-300 bg-opacity-70 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-opacity-90 font-['Unbounded'] lg:text-base md:text-sm text-xs"
                            required
                        />
                    </div>

                    {/* Register Button */}
                    <div className="pt-4 flex justify-center">
                        <button
                            type="submit"
                            className="lg:w-64 sm:w-46 w-32
                            lg:h-9 sm:h-7 h-6
                            bg-pink-400
                            lg:rounded-xl sm:rounded-lg rounded-md
                            shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)]
                            text-white font-bold font-['Unbounded']
                            flex items-center justify-center
                            lg:text-lg md:text-sm text-xs
                            hover:shadow-[inset_0px_0px_60px_5px_rgba(155,47,255,1.00)]
                            transition-all duration-300"
                        >
                            REGISTER
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegistrationForm;
