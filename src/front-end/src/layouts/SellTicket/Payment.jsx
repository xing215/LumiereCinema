// =============================================================================
// IMPORTS
// =============================================================================

import { useState, useEffect, useRef } from 'react';
import TicketDetail from '@components/UI/TicketDetail';
import { useApplyPromotion } from '@hooks/useTicket';
import PromotionDropdown from '@components/UI/PromotionDropdown';

// SweetAlert for popup notifications
import { showError, showWarning } from '@utils/sweetalert.js';

// =============================================================================
// PAYMENT BUTTON COMPONENT
// =============================================================================

const PaymentButton = ({ text, selected, onSelect }) => (
    <button className={`relative h-auto w-[80vw] cursor-pointer rounded-xl md:w-[35vw] lg:w-[30vw] ${selected ? 'ring-2 ring-white' : ''}`} type="button" onClick={onSelect}>
        <div className="absolute top-0 left-0 h-full w-full rounded-xl bg-zinc-300/60 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />
        <div className="relative py-3 text-center font-['Unbounded'] text-base font-black text-white">{text}</div>
    </button>
);

// =============================================================================
// TIMER COMPONENT
// =============================================================================

const Timer = ({ timeLeft, isExpired }) => {
    const formatTime = (seconds) => {
        if (seconds <= 0) return '00:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    if (timeLeft === null) return null;

    return (
        <div className={`relative w-[95%] rounded-xl px-4 py-2 text-center md:w-auto ${isExpired ? 'bg-red-600/80' : 'bg-zinc-300/80 mix-blend-color-dodge'}`}>
            <div className="bg-znc-300/20 absolute top-0 left-0 h-full w-full rounded-xl mix-blend-color-dodge" />
            <div className="relative flex flex-col items-center gap-1">
                <div className="font-['Unbounded'] text-xs font-bold tracking-wider text-white uppercase">SESSION EXPIRES IN</div>
                <div className={`font-['Unbounded'] text-xl font-black ${isExpired ? 'text-red-200' : 'text-white'}`}>{formatTime(timeLeft)}</div>
            </div>
        </div>
    );
};

// =============================================================================
// MAIN PAYMENT COMPONENT
// =============================================================================

const Payment = ({ createTicket, sessionExpiresAt, onExpire, movieTicketData, snackTicketData, updateSnackTicket = () => {}, updateMovieTicket = () => {} }) => {
    // =============================================================================
    // STATE MANAGEMENT
    // =============================================================================

    const safeMovieTicketData = movieTicketData || {};
    const safeSnackTicketData = snackTicketData || {};
    const [selectedPayment, setSelectedPayment] = useState('');
    const [timeLeft, setTimeLeft] = useState(null);
    const [isExpired, setIsExpired] = useState(false);
    const [customerPhone, setCustomerPhone] = useState(''); // Always store the phone number
    const [customerDisplayName, setCustomerDisplayName] = useState(''); // Store found user's name
    const [isShowingUserName, setIsShowingUserName] = useState(false); // Flag to show if displaying user name
    const [discountValue, setDiscountValue] = useState('');
    const [isApplyingPromotion, setIsApplyingPromotion] = useState(false); // Prevent duplicate calls
    const customerInputRef = useRef(null);
    const discountInputRef = useRef(null);

    // =============================================================================
    // UTILITY FUNCTIONS
    // =============================================================================
    
    // Helper function to extract customer information from various sources
    const getCustomerInfo = (userFromResponse = null) => {
        // Priority 1: User from backend response (promotion success/error)
        if (userFromResponse?.name) {
            console.log('Customer info found from backend response:', userFromResponse.name);
            return userFromResponse.name;
        }
        
        // Priority 2: Existing customer info in ticket data
        const movieCustomerInfo = safeMovieTicketData?.noLoginCustomerInfo;
        const snackCustomerInfo = safeSnackTicketData?.noLoginCustomerInfo;
        
        if (movieCustomerInfo?.name && movieCustomerInfo.name !== 'in-store customer') {
            console.log('Customer info found from movie ticket data:', movieCustomerInfo.name);
            return movieCustomerInfo.name;
        } else if (snackCustomerInfo?.name && snackCustomerInfo.name !== 'in-store customer') {
            console.log('Customer info found from snack ticket data:', snackCustomerInfo.name);
            return snackCustomerInfo.name;
        }
        
        if (customerDisplayName) {
            console.log('Customer phone found from movie ticket data:', customerDisplayName);
            return `${customerDisplayName}`;
        }
        
        console.log('No customer information found');
        return null;
    };

    // =============================================================================
    // HOOKS
    // =============================================================================

    const { applyPromotion, appliedPromotion, loading: promotionLoading, error } = useApplyPromotion();

    // =============================================================================
    // TIMER MANAGEMENT EFFECTS
    // =============================================================================

    useEffect(() => {
        if (!sessionExpiresAt) {
            setTimeLeft(null);
            setIsExpired(false);
            return;
        }

        let expiredCalled = false;
        const updateTimer = () => {
            const now = new Date().getTime();
            const expiresAt = new Date(sessionExpiresAt).getTime();
            const difference = Math.max(0, Math.floor((expiresAt - now) / 1000));
            setTimeLeft(difference);
            setIsExpired(difference === 0);
            if (difference === 0 && !expiredCalled) {
                expiredCalled = true;
                // Clear all selections when session expires
                clearAllSelections();
                if (typeof onExpire === 'function') onExpire();
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [sessionExpiresAt, onExpire]);

    // =============================================================================
    // PROMOTION MANAGEMENT EFFECTS
    // =============================================================================

    useEffect(() => {
        if (appliedPromotion) {
            console.log('Applying promotion:', appliedPromotion);
            const { snackDiscount: finalSnackDiscount, movieDiscount: finalMovieDiscount, user } = appliedPromotion;

            if (finalSnackDiscount !== 0) {
                updateSnackTicket({ promotion: appliedPromotion.promotion, discount: finalSnackDiscount });
            }
            if (finalMovieDiscount !== 0) {
                updateMovieTicket({ promotion: appliedPromotion.promotion, discount: finalMovieDiscount });
            }
            if (finalSnackDiscount === 0) {
                updateSnackTicket({ promotion: null, discount: 0 });
            }
            if (finalMovieDiscount === 0) {
                updateMovieTicket({ promotion: null, discount: 0 });
            }
            
            console.log(user);
            
            // Get customer name using the utility function
            const customerName = getCustomerInfo(user);
            
            if (customerName) {
                setCustomerDisplayName(customerName);
                setIsShowingUserName(true);
            } else {
                setCustomerDisplayName('No customer found');
                setIsShowingUserName(true);
            }
        }

        if (error) {
            console.error('Promotion application error:', error);
            
            // Get customer name using the utility function
            const customerName = getCustomerInfo(error?.user);
            
            if (customerName) {
                setCustomerDisplayName(customerName);
                setIsShowingUserName(true);
            } else {
                setCustomerDisplayName('No customer found');
                setIsShowingUserName(true);
            }
            
            showError('Promotion Error', `Error applying promotion: ${error?.message}`, 1000);
            setDiscountValue('');
            updateMovieTicket({ promotion: null, discount: 0 });
            updateSnackTicket({ promotion: null, discount: 0 });
        }
    }, [appliedPromotion, error]);

    // =============================================================================
    // EVENT HANDLERS
    // =============================================================================

    // Clear all selections when session expires
    const clearAllSelections = () => {
        // Clear movie ticket data
        updateMovieTicket({ 
            seats: [],
            selectedSeats: [],
            scheduleId: null,
            movieId: null,
            total: 0,
            promotion: null,
            discount: 0,
            noLoginCustomerInfo: null
        });

        // Clear snack ticket data
        updateSnackTicket({ 
            snacks: [],
            selectedSnacks: [],
            total: 0,
            promotion: null,
            discount: 0,
            noLoginCustomerInfo: null
        });

        // Clear local form state
        setCustomerPhone('');
        setCustomerDisplayName('');
        setIsShowingUserName(false);
        setDiscountValue('');
        setSelectedPayment('');

        console.log('All selections cleared due to session expiry');
    };

    const handleSelectPayment = async (method) => {
        if (isExpired) {
            showWarning('Session Expired', 'Session has expired. Please start over.', 1000);
            return;
        }
        await createTicket({
            movieTicketData: safeMovieTicketData,
            snackTicketData: safeSnackTicketData,
        });
    };

    const handleCustomerInfoChange = (e) => {
        const newValue = e.target.value;
        setCustomerPhone(newValue);
        
        // If user starts typing, hide the user name display
        if (isShowingUserName) {
            setIsShowingUserName(false);
            setCustomerDisplayName('');
        }
    };

    const handleCustomerInfoBlurOrEnter = async (e) => {
        // Always use the phone number for backend communication
        const phoneToUse = customerPhone.trim();
        if (phoneToUse) {
            const customerInfo = {
                phone: phoneToUse,
                name: 'in-store customer',
                email: null,
            };

            if (updateMovieTicket) {
                updateMovieTicket({ noLoginCustomerInfo: customerInfo });
            }

            if (snackTicketData) {
                updateSnackTicket({ noLoginCustomerInfo: customerInfo });
            }
        }
    };

    const handleDiscountChange = (e) => {
        const newValue = e.target.value;
        setDiscountValue(newValue);

        // If user clears the input, immediately clear promotions
        if (!newValue.trim()) {
            updateMovieTicket({ promotion: null, discount: 0 });
            updateSnackTicket({ promotion: null, discount: 0 });
            return;
        }

        // Only update the input value, don't send requests while typing
    };

    // Alternative handler for dropdown component
    const handleDropdownBlur = async () => {
        console.log('handleDropdownBlur called, discountValue:', discountValue);
        
        // Prevent duplicate calls
        if (isApplyingPromotion) {
            console.log('Already applying promotion, skipping...');
            return;
        }

        const currentValue = discountValue.trim();

        if (!currentValue) {
            console.log('No discount value, returning early');
            return;
        }

        console.log('Applying promotion code from dropdown:', currentValue);
        await applyPromotionCode(currentValue);
    };

    const handleDropdownSelect = async (e) => {
        console.log('handleDropdownSelect called, value:', e.target.value);
        
        if (isApplyingPromotion) {
            console.log('Already applying promotion, skipping selection...');
            return;
        }

        const selectedValue = e.target.value.trim();

        if (!selectedValue) {
            console.log('No discount value from selection, returning early');
            return;
        }

        // Update the discount value state first to reflect the selection
        setDiscountValue(selectedValue);
        
        console.log('Applying promotion code from selection:', selectedValue);
        // Use the selected value directly instead of discountValue state to avoid timing issues
        await applyPromotionCode(selectedValue);
    };

    const handleDropdownKeyDown = async (e) => {
        console.log('handleDropdownKeyDown called with key:', e.key);
    };

    const applyPromotionCode = async (code) => {
        if (!code || appliedPromotion?.promotion?.promotionCode === code) {
            console.log('Skipping promotion application - empty code or already applied');
            return; 
        }

        if (isApplyingPromotion) {
            console.log('Already applying promotion, skipping duplicate call...');
            return;
        }

        setIsApplyingPromotion(true);
        console.log('Setting isApplyingPromotion to true');

        customerInputRef.current?.blur();

        const customerInfoForPromotion = customerPhone.trim() ? {
            phone: customerPhone.trim(),
            name: 'in-store customer',
            email: null,
        } : (safeMovieTicketData?.noLoginCustomerInfo || safeSnackTicketData?.noLoginCustomerInfo);

        console.log('Applying promotion with data:', {
            promotionCode: code,
            snackTotal: safeSnackTicketData?.total,
            movieTotal: safeMovieTicketData?.total,
            noLoginCustomerInfo: customerInfoForPromotion,
            customerPhone: customerPhone, // Debug log
        });

        try {
            await applyPromotion({
                promotionCode: code,
                snackTotal: safeSnackTicketData?.total || 0,
                movieTotal: safeMovieTicketData?.total || 0,
                noLoginCustomerInfo: customerInfoForPromotion,
            });
        } catch (err) {
            console.error('Error in applyPromotionCode:', err);
        } finally {
            setTimeout(() => {
                setIsApplyingPromotion(false);
                console.log('Setting isApplyingPromotion to false');
            }, 500); // Small delay to prevent rapid re-triggers
        }
    };

    // =============================================================================
    // COMPONENT RENDER
    // =============================================================================

    return (
        <div className="flex h-full w-full flex-col items-center justify-center overflow-hidden">
            <div className="relative flex h-[80vh] w-[90%] items-start justify-center overflow-hidden rounded-xl">
                <div className="pointer-events-none absolute inset-0 h-full w-full bg-zinc-300/30 mix-blend-color-dodge" />

                <div className="flex h-full w-full flex-row">
                    <div className="h-full w-[50%]">
                        <TicketDetail movieTicketData={safeMovieTicketData} snackTicketData={safeSnackTicketData} isStaff={true} />
                    </div>

                    <div className="flex w-full flex-col items-center justify-center gap-3">
                        <div className="flex w-full justify-center pb-2">
                            <Timer timeLeft={timeLeft} isExpired={isExpired} />
                        </div>

                        <div className="flex w-[53%] flex-row items-center justify-center">
                            <div className="text-md mr-2 w-[35%] items-center justify-center text-right font-['Unbounded'] font-semibold text-white">CUSTOMER:</div>
                            <input
                                ref={customerInputRef}
                                type="text"
                                value={isShowingUserName ? customerDisplayName : customerPhone}
                                onChange={handleCustomerInfoChange}
                                onBlur={handleCustomerInfoBlurOrEnter}
                                placeholder="Enter phone number"
                                className={`mb-2 h-10 w-[65%] rounded-md border bg-zinc-300 px-2 font-['Unbounded'] text-black ${isShowingUserName ? 'border-green-500 border-2' : 'border-white'}`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        customerInputRef.current?.blur();
                                    }
                                }}
                            />
                        </div>

                        <div className="flex w-[53%] flex-row items-center justify-center">
                            <div className="text-md mr-2 w-[35%] items-center justify-center text-right font-['Unbounded'] font-semibold text-white">DISCOUNT:</div>
                            {/* <input
                                    ref={discountInputRef}
                                    type="text"
                                    value={discountValue}
                                    onChange={handleDiscountChange}
                                    onBlur={handleDiscountBlurOrEnter}
                                    className={`h-10 font-['Unbounded'] w-[65%] rounded-md border bg-zinc-300 px-2 text-black mb-2 ${safeMovieTicketData?.promotion || safeSnackTicketData?.promotion ? 'border-green-500 border-3' : 'border-white'}`}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            discountInputRef.current?.blur();
                                        }
                                    }}
                                /> */}
                            <PromotionDropdown
                                value={discountValue}
                                onChange={handleDiscountChange}
                                onBlur={handleDropdownBlur}
                                onKeyDown={handleDropdownKeyDown}
                                onSelect={handleDropdownSelect}
                                promotion={movieTicketData?.promotion || snackTicketData?.promotion}
                                productType={movieTicketData && snackTicketData ? 'All' : movieTicketData ? 'Movie' : 'Snack'}
                                className="h-10 w-[65%]"
                            />
                        </div>

                        <PaymentButton text="MOMO" selected={selectedPayment === 'MOMO'} onSelect={() => handleSelectPayment('MOMO')} />
                        <PaymentButton text="ZALOPAY" selected={selectedPayment === 'ZALOPAY'} onSelect={() => handleSelectPayment('ZALOPAY')} />
                        <PaymentButton text="VNPAY-QR" selected={selectedPayment === 'VNPAY-QR'} onSelect={() => handleSelectPayment('VNPAY-QR')} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
