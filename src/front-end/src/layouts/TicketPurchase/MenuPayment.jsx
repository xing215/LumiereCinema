import TicketDetail from '@components/UI/TicketDetail';
import NextNaviButton, { BackNaviButton } from '@components/buttons/NaviButton';
import CustomDropdown from '@components/UI/CustomDropdown.jsx';
import { useState } from 'react';

const PaymentButton = ({ text, selected, onSelect }) => (
    <button 
        className={`relative h-auto w-[80vw] rounded-xl md:w-[35vw] lg:w-[30vw] ${selected ? 'ring-2 ring-white' : ''}`}
        type="button"
        onClick={onSelect}
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
    const [selectedPayment, setSelectedPayment] = useState('');

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

    const handleSelectPayment = (method) => {
        setSelectedPayment(method);
    };

    const handlePayment = async () => {
        if (!selectedPayment) {
            alert('Please select a payment method before continuing.');
            return;
        }
        try {
            // Call the payment completion handler
            onNext();
        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment failed. Please try again.');
        }
    };

    return (
        <div className="relative flex w-screen items-center justify-center pt-3 md:pt-7">
            <div className="relative flex h-full min-h-auto w-full flex-row justify-start rounded-xl md:min-h-[470px] md:w-screen lg:h-auto lg:w-[75vw]">
                {/* Background layer */}
                <div className="pointer-events-none absolute inset-0 z-0 rounded-xl bg-zinc-300/30 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />

                {/* Poster */}
                <div className="hidden md:block md:h-auto md:w-auto md:max-w-[300px] md:min-w-[200px]">
                    <TicketDetail movieTicketData={movieTicketData} snackTicketData={snackTicketData} />
                </div>

                {/* Main content */}
                <div className="relative flex min-w-[55vw] flex-1 flex-col items-center justify-between">
                    <div className="block pt-5 md:hidden ">
                        <TicketDetail 
                            movieTicketData={movieTicketData}
                            snackTicketData={snackTicketData}
                        />
                    </div>
                    <div className="relative flex flex-col items-center justify-start gap-4">
                        <div className="w-auto pt-8 text-center font-['Unbounded'] text-base font-black text-white md:text-lg xl:text-2xl">PAYMENT OPTION</div>
                        <DiscountDropdown className="flex md:hidden" labelClass="text-sm" direction="down" value={discountValue} onChange={handleDiscountChange} />
                        <PaymentButton text="MOMO" selected={selectedPayment === 'MOMO'} onSelect={() => handleSelectPayment('MOMO')} />
                        <PaymentButton text="ZALOPAY" selected={selectedPayment === 'ZALOPAY'} onSelect={() => handleSelectPayment('ZALOPAY')} />
                    </div>

                    <div className="flex w-[80vw] flex-col items-center justify-center gap-2 px-4 pt-8 pb-10.5 sm:px-8 md:w-[35vw] md:px-10 md:pb-6 lg:w-[30vw] lg:px-12">
                        <DiscountDropdown className="hidden md:flex" labelClass="text-base" direction="up" value={discountValue} onChange={handleDiscountChange} />
                        <div className="flex w-full flex-row items-center justify-center gap-2">
                            <BackNaviButton onClick={onBack} />
                            <NextNaviButton 
                                text="COMPLETE" 
                                onClick={handlePayment} 
                                showTextOnMobile={true} 
                                disabled={!selectedPayment}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MenuPayment;
