import React, { useState } from 'react';

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
            <div className="w-full max-w-md lg:max-w-lg">
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
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div>
                        <label className="block text-white font-bold mb-2" style={{fontFamily: 'Mina', fontSize: '20px', fontWeight: 700}}>
                            Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full lg:h-12 md:h-11 h-10 px-4 rounded-lg bg-gray-400 bg-opacity-70 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-opacity-90"
                            required
                        />
                    </div>

                    {/* Birthday and Gender Row */}
                    <div className="flex lg:gap-6 md:gap-4 gap-3">
                        <div className="flex-1">
                            <label className="block text-white font-bold mb-2" style={{fontFamily: 'Mina', fontSize: '20px', fontWeight: 700}}>
                                Birthday
                            </label>
                            <input
                                type="date"
                                name="birthday"
                                value={formData.birthday}
                                onChange={handleInputChange}
                                className="w-full lg:h-12 md:h-11 h-10 px-4 rounded-lg bg-gray-400 bg-opacity-70 text-black focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-opacity-90"
                                required
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-white font-bold mb-2" style={{fontFamily: 'Mina', fontSize: '20px', fontWeight: 700}}>
                                Gender
                            </label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                className="w-full lg:h-12 md:h-11 h-10 px-4 rounded-lg bg-gray-400 bg-opacity-70 text-black focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-opacity-90"
                                required
                            >
                                <option value="">Select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-white font-bold mb-2" style={{fontFamily: 'Mina', fontSize: '20px', fontWeight: 700}}>
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full lg:h-12 md:h-11 h-10 px-4 rounded-lg bg-gray-400 bg-opacity-70 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-opacity-90"
                            required
                        />
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block text-white font-bold mb-2" style={{fontFamily: 'Mina', fontSize: '20px', fontWeight: 700}}>
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            className="w-full lg:h-12 md:h-11 h-10 px-4 rounded-lg bg-gray-400 bg-opacity-70 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-opacity-90"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-white font-bold mb-2" style={{fontFamily: 'Mina', fontSize: '20px', fontWeight: 700}}>
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full lg:h-12 md:h-11 h-10 px-4 rounded-lg bg-gray-400 bg-opacity-70 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-opacity-90"
                            required
                        />
                    </div>

                    {/* Retype Password */}
                    <div>
                        <label className="block text-white font-bold mb-2" style={{fontFamily: 'Mina', fontSize: '20px', fontWeight: 700}}>
                            Retype Password
                        </label>
                        <input
                            type="password"
                            name="retypePassword"
                            value={formData.retypePassword}
                            onChange={handleInputChange}
                            className="w-full lg:h-12 md:h-11 h-10 px-4 rounded-lg bg-gray-400 bg-opacity-70 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-opacity-90"
                            required
                        />
                    </div>

                    {/* Register Button */}
                    <div className="pt-4 flex justify-center">
                        <button
                            type="submit"
                            className="lg:w-64 sm:w-46 w-25
                            lg:h-9 sm:h-7 h-4
                            bg-pink-400
                            lg:rounded-xl sm:rounded-lg rounded-md
                            shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)]
                            text-white font-bold font-['Unbounded']
                            flex items-center justify-center
                            lg:text-lg md:text-sm text-[8px]
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
