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
    <button 
        className={`relative h-auto cursor-pointer w-[80vw] rounded-xl md:w-[35vw] lg:w-[30vw] ${selected ? 'ring-2 ring-white' : ''}`}
        type="button"
        onClick={onSelect}
    >
        <div className="absolute top-0 left-0 h-full w-full rounded-xl bg-zinc-300/60 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />
        <div className="relative py-3 text-center font-['Unbounded'] text-base font-black text-white">
            {text}
        </div>
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
        <div className={`relative w-[95%] md:w-auto rounded-xl px-4 py-2 text-center ${isExpired ? 'bg-red-600/80' : 'bg-zinc-300/80 mix-blend-color-dodge'}`}>
            <div className="absolute top-0 left-0 h-full w-full rounded-xl bg-znc-300/20 mix-blend-color-dodge" />
            <div className="relative flex flex-col items-center gap-1">
                <div className="font-['Unbounded'] text-xs font-bold text-white uppercase tracking-wider">
                    SESSION EXPIRES IN
                </div>
                <div className={`font-['Unbounded'] text-xl font-black ${isExpired ? 'text-red-200' : 'text-white'}`}>
                    {formatTime(timeLeft)}
                </div>
            </div>
        </div>
    );
};

// =============================================================================
// MAIN PAYMENT COMPONENT
// =============================================================================

const Payment = ({ 
    createTicket, 
    sessionExpiresAt, 
    onExpire, 
    movieTicketData, 
    snackTicketData, 
    updateSnackTicket = () => {}, 
    updateMovieTicket = () => {} 
}) => {
    // =============================================================================
    // STATE MANAGEMENT
    // =============================================================================

    const safeMovieTicketData = movieTicketData || {};
    const safeSnackTicketData = snackTicketData || {};
    const [selectedPayment, setSelectedPayment] = useState('');
    const [timeLeft, setTimeLeft] = useState(null);
    const [isExpired, setIsExpired] = useState(false);
    const [customerInfo, setCustomerInfo] = useState('');
    const [discountValue, setDiscountValue] = useState('');
    const [displayingName, setDisplayingName] = useState(false)
    const customerInputRef = useRef(null);
    const discountInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // =============================================================================
    // HOOKS
    // =============================================================================

    const { applyPromotion, appliedPromotion, loading: promotionLoading, error } = useApplyPromotion();

    // =============================================================================
    // CLEANUP EFFECTS
    // =============================================================================

    // Cleanup timeout on component unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);


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
            console.log(user)
            if(user?.name) {
                setDisplayingName(true)
                setCustomerInfo(user?.name)
            } else {
                setDisplayingName(true)
                setCustomerInfo('No user found')
            }
        }
        
        if (error) {
            console.error('Promotion application error:', error);
            if(error?.user?.name) {
                setDisplayingName(true)
                setCustomerInfo(error?.user?.name)
            } else {
                setDisplayingName(true)
                setCustomerInfo('No user found')
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

    const handleSelectPayment = async (method) => {
        if (isExpired) {
            showWarning('Session Expired', 'Session has expired. Please start over.', 1000);
            return;
        }
        await createTicket({
            movieTicketData: safeMovieTicketData,
            snackTicketData: safeSnackTicketData
        });
    };

    const handleCustomerInfoChange = (e) => {
        if (displayingName)
            setDisplayingName(false)
        setCustomerInfo(e.target.value);
    };

    const handleCustomerInfoBlurOrEnter = async (e) => {
        if(!displayingName){
        if (customerInfo.trim()) {
            if (updateMovieTicket) updateMovieTicket({ 
                noLoginCustomerInfo: {
                    phone: customerInfo.trim(),
                    name: 'in-store customer',
                    email: null
                }
            });
            
            if(snackTicketData) updateSnackTicket({ 
                noLoginCustomerInfo: {
                    phone: customerInfo.trim(),
                    name: 'in-store customer',
                    email: null
                }
            });
        }
    };}

    const handleDiscountChange = (e) => {
        const newValue = e.target.value;
        setDiscountValue(newValue);
        
        // Clear any existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        // If user clears the input, immediately clear promotions
        if (!newValue.trim()) {
            updateMovieTicket({ promotion: null, discount: 0 });
            updateSnackTicket({ promotion: null, discount: 0 });
            return;
        }
        
        // This is typing - debounce the API call
        typingTimeoutRef.current = setTimeout(() => {
            applyPromotionCode(newValue.trim());
        }, 1000); // Wait 1 second after user stops typing
    };

    const handleDiscountBlurOrEnter = async (e) => {
        // Clear any pending timeout since user has finished input
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        const currentValue = discountValue.trim();
        
        if (!currentValue) {
            return; // Already handled in onChange
        }
        
        // Apply immediately when user finishes input
        await applyPromotionCode(currentValue);
    };

    // Helper function to apply promotion code
    const applyPromotionCode = async (code) => {
        if (!code || appliedPromotion?.promotion?.promotionCode === code) {
            return; // Don't apply if empty or already applied
        }

        customerInputRef.current?.blur();

        console.log('Applying promotion with data:', {
            promotionCode: code,
            snackTotal: safeSnackTicketData?.total,
            movieTotal: safeMovieTicketData?.total,
            noLoginCustomerInfo: safeMovieTicketData?.noLoginCustomerInfo || safeSnackTicketData?.noLoginCustomerInfo,
            snackTicketData: safeSnackTicketData,
            movieTicketData: safeMovieTicketData
        });

        try {
            await applyPromotion({
                promotionCode: code,
                snackTotal: safeSnackTicketData?.total || 0,
                movieTotal: safeMovieTicketData?.total || 0,
                noLoginCustomerInfo: safeMovieTicketData?.noLoginCustomerInfo || safeSnackTicketData?.noLoginCustomerInfo
            });
        } catch (err) {
            console.error('Error in applyPromotionCode:', err);
        }
    };

    // =============================================================================
    // COMPONENT RENDER
    // =============================================================================

    return (
        <div className="flex flex-col items-center justify-center w-full h-full overflow-hidden">
            <div className="flex items-start justify-center h-[80vh] rounded-xl overflow-hidden w-[90%] relative">
                <div className="absolute pointer-events-none inset-0 w-full h-full bg-zinc-300/30 mix-blend-color-dodge"/>
                
                <div className="flex flex-row w-full h-full">
                    <div className="h-full w-[50%]">
                        <TicketDetail 
                            movieTicketData={safeMovieTicketData} 
                            snackTicketData={safeSnackTicketData} 
                            isStaff={true} 
                        />
                    </div>
                    
                    <div className="flex flex-col items-center justify-center gap-3 w-full">
                        <div className="flex w-full justify-center pb-2">
                            <Timer timeLeft={timeLeft} isExpired={isExpired} />
                        </div>
                        
                        <div className="flex flex-row w-[53%] justify-center items-center">
                            <div className="w-[35%] text-right mr-2 text-white font-['Unbounded'] text-md font-semibold justify-center items-center">
                                CUSTOMER:
                            </div>
                            <input
                                ref={customerInputRef}
                                type="text"
                                value={customerInfo}
                                onChange={handleCustomerInfoChange}
                                onBlur={handleCustomerInfoBlurOrEnter}
                                className="h-10 font-['Unbounded'] w-[65%] rounded-md border bg-zinc-300 px-2 text-black mb-2"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        customerInputRef.current?.blur();
                                    }
                                }}
                            />
                        </div>
                        
                        <div className="flex flex-row w-[53%] justify-center items-center">
                            <div className="w-[35%] text-right mr-2 text-white font-['Unbounded'] text-md font-semibold justify-center items-center">
                                DISCOUNT:
                            </div>
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
                            onBlur={handleDiscountBlurOrEnter}
                            promotion={movieTicketData?.promotion || snackTicketData?.promotion}
                            productType={movieTicketData && snackTicketData ? 'All' : movieTicketData ? 'Movie' : 'Snack'}
                            className='w-[65%] h-10'
                        />
                    </div>

                        <PaymentButton 
                            text="MOMO" 
                            selected={selectedPayment === 'MOMO'} 
                            onSelect={() => handleSelectPayment('MOMO')} 
                        />
                        <PaymentButton 
                            text="ZALOPAY" 
                            selected={selectedPayment === 'ZALOPAY'} 
                            onSelect={() => handleSelectPayment('ZALOPAY')} 
                        />
                        <PaymentButton 
                            text="VNPAY-QR" 
                            selected={selectedPayment === 'VNPAY-QR'} 
                            onSelect={() => handleSelectPayment('VNPAY-QR')} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;