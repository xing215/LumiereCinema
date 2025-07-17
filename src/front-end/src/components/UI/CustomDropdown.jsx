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
        allowOtherInput={false} // Allow custom text input (default: false)
        options={[
            { value: 'Male', label: 'Male' },
            { value: 'Female', label: 'Female' },
            { value: 'Other', label: 'Other' }
        ]}
    />

*/

import React, { useState, useRef, useEffect } from 'react';

const CustomDropdown = ({
    value,
    onChange,
    options,
    placeholder,
    name = 'dropdown',
    bgColor = 'indigo-900',
    inputBgColor, // New prop for input background color
    hoverColor = 'indigo-800',
    borderColor = 'indigo-700',
    textColor = 'white',
    dropdownTextColor, // New prop for dropdown text color
    bgOpacity = '',
    openDirection = 'down',
    variant,
    height = 'h-10 sm:h-11 md:h-12 lg:h-13 xl:h-11',
    textAlign = 'center', // 'left', 'center', 'right'
    inputTextSize = 'text-sm sm:text-base md:text-lg', // Custom text size for input
    optionTextSize = 'text-sm sm:text-base md:text-lg', // Custom text size for options
    allowOtherInput = false, // Allow custom text input
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const dropdownRef = useRef(null);

    // Filter options based on search input
    const filteredOptions = options.filter((option) => {
        if (!value || !allowOtherInput) return true;
        const searchTerm = value.toLowerCase();
        return option.value.toLowerCase().includes(searchTerm) || option.label.toLowerCase().includes(searchTerm);
    });

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (selectedValue) => {
        onChange({ target: { name, value: selectedValue } });
        setIsOpen(false);
        setIsTyping(false);
    };

    const handleInputChange = (e) => {
        if (allowOtherInput) {
            onChange({ target: { name, value: e.target.value } });
            setIsTyping(true);
            setIsOpen(true); // Keep dropdown open while typing to show filtered results
        }
    };

    const handleInputKeyDown = (e) => {
        if (e.key === 'Enter' && allowOtherInput) {
            setIsOpen(false);
            setIsTyping(false);
        }
    };

    const backgroundClass = bgOpacity ? `bg-${bgColor} ${bgOpacity}` : `bg-${bgColor}`;
    const dropdownBackgroundClass = bgOpacity ? `bg-${bgColor} ${bgOpacity}` : `bg-${bgColor}`;

    // New: Separate background class for input
    const inputBackgroundClass = inputBgColor ? (bgOpacity ? `bg-${inputBgColor} ${bgOpacity}` : `bg-${inputBgColor}`) : backgroundClass; // Default to same as bgColor when inputBgColor is not specified

    // Dropdown text color - if dropdownTextColor is provided, use it; otherwise use textColor
    const dropdownTextColorClass = dropdownTextColor || textColor;

    const isFigmaVariant = variant === 'figma';

    // Text alignment classes
    const getTextAlignClass = (align) => {
        switch (align) {
            case 'center':
                return 'text-center';
            case 'right':
                return 'text-right';
            default:
                return 'text-left';
        }
    };

    const getJustifyClass = (align) => {
        switch (align) {
            case 'center':
                return 'justify-center';
            case 'right':
                return 'justify-end';
            default:
                return 'justify-between';
        }
    };

    const getSpanClass = (align) => {
        switch (align) {
            case 'center':
                return 'flex-1 text-center';
            case 'right':
                return 'text-right';
            default:
                return 'text-left';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {allowOtherInput ? (
                <div className="relative">
                    <input
                        type="text"
                        value={value || ''}
                        onChange={handleInputChange}
                        onKeyDown={handleInputKeyDown}
                        onFocus={() => setIsOpen(true)}
                        placeholder={placeholder}
                        className={` ${height} w-full rounded-lg px-3 pr-10 sm:px-4 ${inputBackgroundClass} text-${textColor} border border-${borderColor} font-['Unbounded'] ${inputTextSize} ${getTextAlignClass(textAlign)} transition-shadow duration-200 hover:shadow-md focus:ring-2 focus:ring-purple-500 focus:outline-none ${isFigmaVariant ? 'font-bold shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)]' : 'shadow-sm'} `}
                    />
                    <button type="button" onClick={() => setIsOpen(!isOpen)} className="absolute top-1/2 right-3 -translate-y-1/2 transform">
                        <svg
                            className={`h-4 w-4 transition-transform text-${textColor} ${openDirection === 'up' ? (isOpen ? '' : 'rotate-180') : isOpen ? 'rotate-180' : ''}`}
                            fill="currentColor"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={` ${height} w-full rounded-lg px-3 sm:px-4 ${inputBackgroundClass} text-${textColor} border border-${borderColor} flex items-center ${getJustifyClass(textAlign)} font-['Unbounded'] transition-shadow duration-200 hover:shadow-md focus:ring-2 focus:ring-purple-500 focus:outline-none ${isFigmaVariant ? 'font-bold shadow-[inset_0px_0px_50px_3px_rgba(155,47,255,1.00)]' : 'shadow-sm'} `}
                >
                    <span className={`${inputTextSize} ${getSpanClass(textAlign)}`}>{value || placeholder}</span>
                    {textAlign !== 'right' && (
                        <svg
                            className={`h-4 w-4 transition-transform ${openDirection === 'up' ? (isOpen ? '' : 'rotate-180') : isOpen ? 'rotate-180' : ''}`}
                            fill="currentColor"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    )}
                </button>
            )}

            {isOpen && (
                <div
                    className={`absolute ${openDirection === 'up' ? 'bottom-full' : 'top-full'} right-0 left-0 mt-1 ${dropdownBackgroundClass} z-20 overflow-hidden rounded-lg border shadow-xl border-${borderColor}`}
                >
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option, index) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSelect(option.value)}
                                className={`w-full px-3 py-3 ${getTextAlignClass(textAlign)} sm:px-4 text-${dropdownTextColorClass} font-['Unbounded'] ${optionTextSize} hover:bg-${hoverColor} transition-colors ${index !== filteredOptions.length - 1 ? `border-b border-${borderColor}` : ''} hover:cursor-pointer`}
                            >
                                {option.label}
                            </button>
                        ))
                    ) : (
                        <div className={`w-full px-3 py-3 ${getTextAlignClass(textAlign)} sm:px-4 text-${dropdownTextColorClass} font-['Unbounded'] ${optionTextSize} opacity-60`}>
                            No options found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;
