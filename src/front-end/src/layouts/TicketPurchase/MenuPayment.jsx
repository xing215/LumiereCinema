import TicketDetail from '@components/UI/TicketDetail';
import NextNaviButton, { BackNaviButton } from '@components/buttons/NaviButton';
import CustomDropdown from '@components/UI/CustomDropdown.jsx';
import { useState } from 'react';

const PaymentButton = ({ text, onClick }) => (
    <button 
        className="relative h-auto w-[80vw] rounded-xl md:w-[35vw] lg:w-[30vw]"
        onClick={onClick}
    >
        <div className="absolute top-0 left-0 h-full w-full rounded-xl bg-zinc-300/60 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />
        <div className="relative py-3 text-center font-['Unbounded'] text-base font-black text-white">{text}</div>
    </button>
);

const DiscountDropdown = ({ className = '', labelClass = '', direction = 'up', value, onChange }) => (
    <div className={`h-auto w-[80vw] min-w-0 flex-row items-center justify-center gap-2 md:max-w-[350px] md:min-w-[250px] ${className}`}>
        <div className={`h-auto w-auto justify-start font-['Unbounded'] font-bold text-white ${labelClass}`}>DISCOUNT:</div>
        <div className="z-3 h-auto flex-1">
            <CustomDropdown
                name="discount"
                placeholder=""
                value={value}
                onChange={onChange}
                bgColor="indigo-700 backdrop-blur-[10px]"
                inputBgColor="zinc-300"
                hoverColor="white"
                borderColor="white"
                textColor="black"
                dropdownTextColor="white"
                height="h-10"
                inputTextSize="text-md"
                optionTextSize="text-sm"
                openDirection={direction}
                allowOtherInput={true}
                textAlign="left"
                options={[
                    { value: 'DDAY', label: 'Ngày đôi' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' },
                ]}
            />
        </div>
    </div>
);

const MenuPayment = ({ onNext, onBack, movieTicketData, snackTicketData }) => {
    const [discountValue, setDiscountValue] = useState('');

    const handleDiscountChange = (e) => {
        setDiscountValue(e.target.value);
    };

    // Calculate total amount
    const calculateGrandTotal = () => {
        const movieTotal = movieTicketData.total || 0;
        const snackTotal = snackTicketData.total || 0;
        return movieTotal + snackTotal;
    };

    // Format currency for display
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const handlePayment = async () => {
        try {
            // Process payment logic here
            console.log('Processing payment for:');
            console.log('Movie Ticket:', movieTicketData);
            console.log('Snack Ticket:', snackTicketData);
            console.log('Total Amount:', calculateGrandTotal());
            
            // Call the payment completion handler
            onNext();
        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment failed. Please try again.');
        }
    };

    return (
        <div className="relative flex w-screen items-center justify-center pt-3 md:pt-7">
            <div className="relative flex h-full w-full flex-row justify-start rounded-xl md:min-h-[470px] md:w-screen lg:h-auto lg:w-[75vw]">
                {/* Background layer */}
                <div className="pointer-events-none absolute inset-0 z-0 rounded-xl bg-zinc-300/30 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />

                {/* Poster */}
                <div className="hidden md:block">
                    <TicketDetail />
                </div>

                {/* Main content */}
                <div className="relative flex min-w-[55vw] flex-1 flex-col items-center justify-between">
                    <div className="block pt-5 md:hidden">
                        <TicketDetail />
                    </div>
                    <div className="relative flex flex-col items-center justify-start gap-4">
                        <div className="w-auto pt-8 text-center font-['Unbounded'] text-base font-black text-white md:text-lg xl:text-2xl">PAYMENT OPTION</div>
                        
                        {/* Order Summary */}
                        <div className="w-[80vw] rounded-lg bg-zinc-800/50 p-4 md:w-[35vw] lg:w-[30vw]">
                            <h3 className="mb-3 font-['Unbounded'] text-sm font-bold text-white">Order Summary</h3>
                            {movieTicketData.seats && movieTicketData.seats.length > 0 && (
                                <div className="mb-2 flex justify-between text-white">
                                    <span className="text-xs">Movie Tickets ({movieTicketData.seats.length} seats)</span>
                                    <span className="text-xs">{formatCurrency(movieTicketData.total || 0)}</span>
                                </div>
                            )}
                            {snackTicketData.snackList && snackTicketData.snackList.length > 0 && (
                                <div className="mb-2 flex justify-between text-white">
                                    <span className="text-xs">Snacks ({snackTicketData.snackList.length} items)</span>
                                    <span className="text-xs">{formatCurrency(snackTicketData.total || 0)}</span>
                                </div>
                            )}
                            <div className="border-t border-white/20 pt-2 mt-2">
                                <div className="flex justify-between font-bold text-white">
                                    <span className="text-sm">Total</span>
                                    <span className="text-sm">{formatCurrency(calculateGrandTotal())}</span>
                                </div>
                            </div>
                        </div>

                        <DiscountDropdown className="flex md:hidden" labelClass="text-sm" direction="down" value={discountValue} onChange={handleDiscountChange} />
                        <PaymentButton text="MOMO" onClick={handlePayment} />
                        <PaymentButton text="ZALOPAY" onClick={handlePayment} />
                    </div>

                    <div className="flex w-[80vw] flex-col items-center justify-center gap-2 px-4 pt-8 pb-10.5 sm:px-8 md:w-[35vw] md:px-10 md:pb-6 lg:w-[30vw] lg:px-12">
                        <DiscountDropdown className="hidden md:flex" labelClass="text-base" direction="up" value={discountValue} onChange={handleDiscountChange} />
                        <div className="flex w-full flex-row items-center justify-center gap-2">
                            <BackNaviButton onClick={onBack} />
                            <NextNaviButton text="COMPLETE" onClick={handlePayment} showTextOnMobile={true} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MenuPayment;
