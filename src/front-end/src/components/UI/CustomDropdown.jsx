/*
    HOW TO USE THIS COMPONENT:
    
    Example usage in a form:

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

*/

import React, { useState } from 'react';

const CustomDropdown = ({ 
    value, 
    onChange, 
    options, 
    placeholder, 
    name = 'dropdown',
    bgColor = 'indigo-900', 
    hoverColor = 'indigo-800', 
    borderColor = 'indigo-700', 
    textColor = 'white', 
    bgOpacity = '' 
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (selectedValue) => {
        onChange({ target: { name, value: selectedValue } });
        setIsOpen(false);
    };

    const backgroundClass = bgOpacity ? `bg-${bgColor} ${bgOpacity}` : `bg-${bgColor}`;
    const dropdownBackgroundClass = bgOpacity ? `bg-${bgColor} ${bgOpacity}` : `bg-${bgColor}`;

    return (
        <div className="relative">
            {/* Dropdown Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full lg:h-12 md:h-11 h-8 px-4 rounded-lg ${backgroundClass} text-${textColor} font-['Unbounded'] text-left focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow duration-200`}
            >
                <span className="lg:text-base md:text-sm text-xs">
                    {value || placeholder}
                </span>
                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="currentColor"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Options */}
            {isOpen && (
                <div className={`absolute top-full left-0 right-0 mt-1 ${dropdownBackgroundClass} rounded-lg shadow-xl z-20 overflow-hidden border border-${borderColor}`}>
                    {options.map((option, index) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => handleSelect(option.value)}
                            className={`w-full px-4 py-3 text-left text-${textColor} font-['Unbounded'] lg:text-base md:text-sm text-xs hover:bg-${hoverColor} transition-colors
                                ${index !== options.length - 1 ? `border-b border-${borderColor}` : ''}`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;
