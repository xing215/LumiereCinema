/*
    PROMOTION DROPDOWN COMPONENT
    
    A specialized dropdown component for promotion codes that combines:
    - Text input for manual entry
    - Dropdown options from API
    - Real-time filtering
    
    Features:
    - Fetches promotion codes from API on mount
    - Allows typing custom codes
    - Filters suggestions based on input
    - Supports both banner promotions and loyalty codes (SILVER, GOLD, PLATINUM)
    - Uses CustomDropdown for consistent styling
*/

import React, { useState, useRef, useEffect, use } from 'react';
import { useGetPublicPromotions } from '@hooks/useTicket';
import { useGetPromotions } from '@hooks/useAdmin';
import CustomDropdown from './CustomDropdown';
import { useUser } from '@contexts/UserContext';

const PromotionDropdown = ({
    value,
    onChange,
    onBlur,
    onKeyDown,
    onSelect, // Add onSelect prop for when dropdown option is clicked
    className = '',
    promotion = null,
    placeholder = 'Enter promotion code',
    productType = 'All', // 'Movie', 'Snack', or 'All'
}) => {
    const { fetchPublicPromotions, promotions: publicPromotions, loading } = useGetPublicPromotions();
    const { getPromotions, promotions: allPromotion, loading: allLoading, error } = useGetPromotions();
    const { user } = useUser();
    const [promotions, setPromotions] = useState([]);

    // Fetch promotions on component mount
    useEffect(() => {
        if (user && user.roles.includes('cashier')) {
            getPromotions();
        } else {
            fetchPublicPromotions();
        }
    }, []);
    useEffect(() => {
        setPromotions([...publicPromotions, ...allPromotion]);
    }, [publicPromotions, allPromotion]);

    // Filter promotions based on product type
    const filteredPromotions = promotions.filter((promo) => {
        // If productType is 'All', show all promotions
        if (productType === 'All') {
            return true;
        }
        // Otherwise, show promotions that match the product type or are for 'All' products
        return promo.appliedProduct === productType || promo.appliedProduct === 'All';
    });

    // Transform filtered promotions to dropdown options for CustomDropdown
    const promotionOptions = filteredPromotions.map((promo) => {
        return {
            value: promo.promotionCode,
            label: `${promo.name}`,
        };
    });

    // Handle change - need to extract just the promotion code from the selected value
    const handleChange = (e) => {
        let finalValue = e.target.value;
        let isDropdownSelection = false;

        // If the value matches one of our options, extract just the promotion code
        const matchedOption = promotionOptions.find((option) => option.value === finalValue);
        if (matchedOption) {
            finalValue = matchedOption.value;
            isDropdownSelection = true;
        }

        // Create a new event with the clean promotion code
        const syntheticEvent = {
            target: {
                value: finalValue,
            },
        };

        onChange(syntheticEvent);

        // If this was a dropdown selection, also trigger the onSelect callback
        if (isDropdownSelection && onSelect) {
            setTimeout(() => {
                onSelect(syntheticEvent);
            }, 100); // Small delay to ensure state is updated
        }
    };

    // Handle blur/enter - trigger the promotion validation
    const handleBlurOrEnter = (e) => {
        // Add a small delay to allow dropdown selection to complete
        setTimeout(() => {
            if (onBlur) {
                onBlur(e);
            }
        }, 200); // Increased delay to ensure dropdown selection completes
    };

    // If no promotions available, render as simple input field
    if (!(loading || allLoading) && filteredPromotions.length === 0) {
        return (
            <div className={className}>
                <input
                    type="text"
                    value={value || ''}
                    onChange={onChange}
                    onBlur={handleBlurOrEnter}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleBlurOrEnter(e);
                        }
                        if (onKeyDown) onKeyDown(e);
                    }}
                    placeholder={placeholder}
                    className={`h-10 w-full rounded-lg border bg-zinc-300 px-3 pr-4 text-black ${promotion ? 'border-green-500' : 'border-white'} text-left font-['Unbounded'] text-sm shadow-sm ring-0 transition-shadow duration-200 hover:shadow-md focus:ring-2 focus:ring-purple-500 focus:outline-none`}
                />
            </div>
        );
    }

    return (
        <div className={`${className} `}>
            <CustomDropdown
                value={value}
                onChange={handleChange}
                onBlur={handleBlurOrEnter}
                onKeyDown={onKeyDown}
                onSelect={onSelect} // Pass through onSelect to CustomDropdown
                options={promotionOptions}
                placeholder={loading || allLoading ? 'Loading promotions...' : placeholder}
                name="promotionCode"
                bgColor="zinc-300"
                inputBgColor="zinc-300"
                hoverColor="zinc-200"
                borderColor={promotion ? 'green-500' : 'white'}
                textColor="black"
                dropdownTextColor="black"
                bgOpacity=""
                openDirection="up"
                height="h-10"
                textAlign="left"
                inputTextSize="text-sm font-['Unbounded']"
                optionTextSize="text-sm font-['Unbounded']"
                allowOtherInput={true}
                forceFillLabel={false}
                width="w-full"
                hideNoOptionMessage={true}
            />
        </div>
    );
};

export default PromotionDropdown;
