// ================================ IMPORTS ================================
import TicketDetail from '@components/UI/TicketDetail';
import NextNaviButton, { BackNaviButton } from '@components/buttons/NaviButton';
import CustomDropdown from '@components/UI/CustomDropdown.jsx';
import { useApplyPromotion } from '@hooks/useTicket';
import { useState, useEffect, useRef } from 'react';

// ================================ COMPONENTS ================================

const PaymentButton = ({ text, selected, onSelect }) => (
    <button 
        className={`relative h-auto cursor-pointer w-[80vw] rounded-xl md:w-[35vw] lg:w-[30vw] ${selected ? 'ring-2 ring-white' : ''}`}
        type="button"
        onClick={onSelect}
    >
        <div className="absolute top-0 left-0 h-full w-full rounded-xl bg-zinc-300/60 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />
        <div className="relative py-3 text-center font-['Unbounded'] text-base font-black text-white">{text}</div>
    </button>
);

const DiscountDropdown = ({ 
    className = '', 
    labelClass = '', 
    direction = 'up', 
    value, 
    onChange, 
    onBlur, 
    promotion 
}) => {
    const inputRef = useRef(null);
    
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && typeof onBlur === 'function') {
            inputRef.current && inputRef.current.blur();
        }
    };

    return (
        <div className={`h-auto w-[80vw] min-w-0 flex-row items-center justify-center gap-2 md:max-w-[350px] md:min-w-[250px] ${className}`}>
            <div className={`h-auto w-auto justify-start font-['Unbounded'] font-bold text-white ${labelClass}`}>
                DISCOUNT:
            </div>
            <div className="z-3 h-auto flex-1">
                <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    className={`h-10 font-['Unbounded'] w-full rounded-md border bg-zinc-300 px-2 text-black ${promotion ? 'border-green-500 border-3' : 'border-white'}`}
                    onBlur={onBlur}
                    onKeyDown={handleKeyDown}
                    ref={inputRef}
                />
            </div>
        </div>
    );
};

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

// ================================ MAIN COMPONENT ================================

const MenuPayment = ({ 
    onNext, 
    onBack, 
    movieTicketData, 
    snackTicketData, 
    updateSnackTicket = () => {}, 
    updateMovieTicket = () => {}, 
    sessionExpiresAt, 
    loading, 
    onExpire, 
    isSession, 
    ticketLoading = false
}) => {
    // ================================ STATE MANAGEMENT ================================
    
    const [discountValue, setDiscountValue] = useState('');
    const [selectedPayment, setSelectedPayment] = useState('');
    const [timeLeft, setTimeLeft] = useState(null);
    const [isExpired, setIsExpired] = useState(false);
    
    const { applyPromotion, appliedPromotion, loading: promotionLoading, error } = useApplyPromotion();

    // ================================ TIMER EFFECTS ================================

    useEffect(() => {
        if (!isSession || !sessionExpiresAt?.data?.expiresAt || loading) return;

        let expiredCalled = false;
        const updateTimer = () => {
            const now = new Date().getTime();
            const expiresAt = new Date(sessionExpiresAt.data.expiresAt).getTime();
            const difference = Math.max(0, Math.floor((expiresAt - now) / 1000));
            setTimeLeft(difference);
            setIsExpired(difference === 0);
            if (difference === 0 && !expiredCalled) {
                expiredCalled = true;
                if (onExpire) {
                    onExpire();
                }
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [sessionExpiresAt, loading, onExpire]);

    // ================================ PROMOTION EFFECTS ================================

    useEffect(() => {
        if (appliedPromotion) {
            console.log('Applying promotion:', appliedPromotion);
            const { snackDiscount: finalSnackDiscount, movieDiscount: finalMovieDiscount } = appliedPromotion;
            
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
        }
        
        if (error) {
            alert('Error applying promotion');
            setDiscountValue('');
            updateMovieTicket({ promotion: null, discount: 0 });
            updateSnackTicket({ promotion: null, discount: 0 });
        }
    }, [appliedPromotion, error]);

    // ================================ EVENT HANDLERS ================================

    const handleDiscountChange = (e) => {
        setDiscountValue(e.target.value);
    };

    const handleDiscountBlurOrEnter = async (e) => {
        if (!discountValue.trim()) {
            updateMovieTicket({ promotion: null, discount: 0 });
            updateSnackTicket({ promotion: null, discount: 0 });
            return;
        }
        
        await applyPromotion({
            promotionCode: discountValue.trim(),
            snackTotal: snackTicketData?.total,
            movieTotal: movieTicketData?.total,
            noLoginCustomerInfo: movieTicketData?.noLoginCustomerInfo || snackTicketData?.noLoginCustomerInfo
        });
    };

    const handleSelectPayment = (method) => {
        if (isExpired) {
            alert('Session has expired. Please start over.');
            return;
        }
        setSelectedPayment(method);
    };

    // ================================ NAVIGATION FUNCTIONS ================================

    const handlePayment = async () => {
        if (isExpired) {
            alert('Session has expired. Please start over.');
            return;
        }
        
        if (!selectedPayment) {
            alert('Please select a payment method before continuing.');
            return;
        }
        
        try {
            onNext();
        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment failed. Please try again.');
        }
    };

    // ================================ RENDER ================================

    return (
        <div className="relative flex w-screen items-center justify-center pt-3 md:pt-7">
            <div className="relative flex h-full min-h-auto w-full flex-row justify-start rounded-xl md:min-h-[470px] md:w-screen lg:h-auto lg:w-[75vw]">
                {/* Background layer */}
                <div className="pointer-events-none absolute inset-0 z-0 rounded-xl bg-zinc-300/30 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />

                {/* Desktop Ticket Detail */}
                <div className="hidden md:block md:h-auto md:w-[50%] md:max-w-[350px] md:min-w-[200px]">
                    <TicketDetail movieTicketData={movieTicketData} snackTicketData={snackTicketData} />
                </div>

                {/* Main content */}
                <div className="relative flex w-[50%] flex-1 flex-col items-center justify-between">
                    {/* Desktop Timer */}
                    <div className="hidden w-full md:flex justify-center pt-4 pb-2">
                        <Timer timeLeft={timeLeft} isExpired={isExpired} />
                    </div>

                    {/* Mobile Ticket Detail */}
                    <div className="block pt-5 md:hidden">
                        <TicketDetail 
                            movieTicketData={movieTicketData}
                            snackTicketData={snackTicketData}
                        />
                    </div>
                    
                    {/* Payment Options */}
                    <div className="relative flex flex-col items-center justify-start gap-4">
                        <div className="w-auto pt-5 md:pt-0 text-center font-['Unbounded'] text-base font-black text-white md:text-lg xl:text-2xl">
                            PAYMENT OPTION
                        </div>
                        
                        {/* Mobile Timer */}
                        <div className="flex w-full md:hidden justify-center pb-2">
                            <Timer timeLeft={timeLeft} isExpired={isExpired} />
                        </div>
                        
                        {/* Mobile Discount Input */}
                        <DiscountDropdown
                            className="flex md:hidden"
                            labelClass="text-sm"
                            direction="down"
                            value={discountValue}
                            onChange={handleDiscountChange}
                            onBlur={handleDiscountBlurOrEnter}
                        />
                        
                        {/* Payment Buttons */}
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

                    {/* Desktop Discount Input and Navigation */}
                    <div className="flex w-[80vw] flex-col items-center justify-center gap-2 px-4 pt-8 pb-10.5 sm:px-8 md:w-[35vw] md:px-10 md:pb-6 lg:w-[30vw] lg:px-12">
                        <DiscountDropdown
                            className="hidden md:flex"
                            labelClass="text-base"
                            direction="up"
                            value={discountValue}
                            onChange={handleDiscountChange}
                            onBlur={handleDiscountBlurOrEnter}
                            promotion={movieTicketData?.promotion || snackTicketData?.promotion}
                        />
                        
                        <div className="flex w-full flex-row items-center justify-center gap-2">
                            <BackNaviButton onClick={onBack} />
                            <NextNaviButton 
                                text={ticketLoading ? "• • •":"COMPLETE"} 
                                onClick={handlePayment} 
                                showTextOnMobile={true} 
                                disabled={!selectedPayment || isExpired || loading || ticketLoading}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MenuPayment;
