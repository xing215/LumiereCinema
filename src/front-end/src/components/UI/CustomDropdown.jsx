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
        height="h-10 sm:h-11 md:h-12 lg:h-13 xl:h-14"
        textAlign="center" // 'left', 'center', 'right'
        inputTextSize="text-sm sm:text-base md:text-lg" // Custom text size for input
        optionTextSize="text-sm sm:text-base md:text-lg" // Custom text size for options
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
    bgOpacity = '',
    openDirection = 'down',
    variant,
    height = 'h-10 sm:h-11 md:h-12 lg:h-13 xl:h-11',
    textAlign = 'center', // 'left', 'center', 'right'
    inputTextSize = 'text-sm sm:text-base md:text-lg', // Custom text size for input
    optionTextSize = 'text-sm sm:text-base md:text-lg', // Custom text size for options
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (selectedValue) => {
        onChange({ target: { name, value: selectedValue } });
        setIsOpen(false);
    };

    const backgroundClass = bgOpacity ? `bg-${bgColor} ${bgOpacity}` : `bg-${bgColor}`;
    const dropdownBackgroundClass = bgOpacity ? `bg-${bgColor} ${bgOpacity}` : `bg-${bgColor}`;
    
    const isFigmaVariant = variant === 'figma';
    
    // Text alignment classes
    const getTextAlignClass = (align) => {
        switch (align) {
            case 'center': return 'text-center';
            case 'right': return 'text-right';
            default: return 'text-left';
        }
    };
    
    const getJustifyClass = (align) => {
        switch (align) {
            case 'center': return 'justify-center';
            case 'right': return 'justify-end';
            default: return 'justify-between';
        }
    };
    
    const getSpanClass = (align) => {
        switch (align) {
            case 'center': return 'flex-1 text-center';
            case 'right': return 'text-right';
            default: return 'text-left';
        }
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    ${height} w-full rounded-lg px-3 sm:px-4 
                    ${backgroundClass} text-${textColor} 
                    flex items-center ${getJustifyClass(textAlign)} font-['Unbounded'] 
                    transition-shadow duration-200 hover:shadow-md 
                    focus:ring-2 focus:ring-purple-500 focus:outline-none
                    ${isFigmaVariant ? 'font-bold shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)]' : 'shadow-sm'}
                `}
            >
                <span className={`${inputTextSize} ${getSpanClass(textAlign)}`}>{value || placeholder}</span>
                {textAlign !== 'right' && (
                    <svg className={`h-4 w-4 transition-transform ${
                        openDirection === 'up' 
                            ? (isOpen ? '' : 'rotate-180') 
                            : (isOpen ? 'rotate-180' : '')
                    }`} fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                )}
            </button>

            {isOpen && (
                <div
                    className={`absolute ${openDirection === 'up' ? 'bottom-full' : 'top-full'} right-0 left-0 mt-1 ${dropdownBackgroundClass} z-20 overflow-hidden rounded-lg border shadow-xl border-${borderColor}`}
                >
                    {options.map((option, index) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => handleSelect(option.value)}
                            className={`w-full px-3 py-3 ${getTextAlignClass(textAlign)} sm:px-4 text-${textColor} font-['Unbounded'] ${optionTextSize} hover:bg-${hoverColor} transition-colors ${index !== options.length - 1 ? `border-b border-${borderColor}` : ''} hover:cursor-pointer`}
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