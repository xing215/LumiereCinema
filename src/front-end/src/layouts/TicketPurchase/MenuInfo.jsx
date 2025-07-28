import TicketDetail from '@components/UI/TicketDetail';
import NextNaviButton, { BackNaviButton } from '@components/buttons/NaviButton';
import { useState } from 'react';

const InputField = ({ label, name, type = 'text', value, onChange, required = true }) => (
    <div>
        <label className="text-md mb-1 block font-['Libre_Franklin'] font-bold text-white md:text-base lg:text-lg">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className="bg-opacity-70 focus:bg-opacity-90 h-10 w-[80vw] rounded-lg bg-zinc-300 px-3 font-['Unbounded'] text-sm text-black placeholder-gray-600 focus:ring-2 focus:outline-none sm:text-base md:h-9 md:w-[35vw] md:text-lg lg:h-10 lg:w-[30vw]"
            required={required}
        />
    </div>
);

const MenuInfo = ({ onNext, onBack, movieTicketData, snackTicketData, updateMovieTicket, updateSnackTicket }) => {
    const [customerInfo, setCustomerInfo] = useState({
        name: (movieTicketData?.noLoginCustomerInfo?.name || snackTicketData?.noLoginCustomerInfo?.name) || '',
        phone: (movieTicketData?.noLoginCustomerInfo?.phone || snackTicketData?.noLoginCustomerInfo?.phone) || '',
        email: (movieTicketData?.noLoginCustomerInfo?.email || snackTicketData?.noLoginCustomerInfo?.email) || '',
    });

    const handleInputChange = (field, value) => {
        const newInfo = { ...customerInfo, [field]: value };
        setCustomerInfo(newInfo);
        
        // Update both ticket types with customer info
        updateMovieTicket({ noLoginCustomerInfo: newInfo });
        updateSnackTicket({ noLoginCustomerInfo: newInfo });
    };

    const canProceed = customerInfo.name && customerInfo.phone && customerInfo.email;

    const handleNext = () => {
        if (canProceed) {
            
            onNext();
        } else {
            alert('Please fill in all required customer information.');
        }
    };

    return (
        <div className="relative flex w-screen items-center justify-center pt-3 md:pt-7">
            <div className="relative flex h-full w-full min-h-auto flex-row justify-start rounded-xl md:min-h-[470px] md:w-screen lg:h-auto lg:w-[75vw] ">
                {/* Background layer */}
                <div className="pointer-events-none absolute inset-0 z-0 rounded-xl bg-zinc-300/30 mix-blend-color-dodge lg:[transform:translate3d(0,0,0)]" />

                {/* Poster - Now takes full height within container */}
                <div className="hidden md:block md:h-auto md:w-auto md:max-w-[300px] md:min-w-[200px">
                    <TicketDetail movieTicketData={movieTicketData} snackTicketData={snackTicketData} />
                </div>

                {/* Main content */}
                <div className="relative flex min-w-[55vw] flex-1 flex-col items-center justify-between">
                    <div className="block pt-5 md:hidden h-auto">
                        <TicketDetail movieTicketData={movieTicketData} snackTicketData={snackTicketData} />
                    </div>
                    <div className="relative flex flex-col items-center justify-start gap-4">
                        <div className="w-auto justify-start pt-8 text-center font-['Unbounded'] text-base font-black text-white md:text-lg xl:text-2xl">CUSTOMER INFORMATION</div>
                        <InputField 
                            label="Name" 
                            name="name" 
                            value={customerInfo.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                        />
                        <InputField 
                            label="Email" 
                            name="email" 
                            type="email"
                            value={customerInfo.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                        />
                        <InputField 
                            label="Phone Number" 
                            name="phone" 
                            value={customerInfo.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                        />
                    </div>

                    <div className="flex w-[80vw] flex-row items-center justify-center gap-2 px-4 pt-8 pb-10.5 sm:px-8 md:w-[35vw] md:px-10 md:pb-6 lg:w-[30vw] lg:px-12">
                        <BackNaviButton onClick={onBack} />
                        <NextNaviButton 
                            text="PAYMENT" 
                            onClick={handleNext} 
                            showTextOnMobile={true}
                            disabled={!canProceed}
                        />
                        <div className="absolute bottom-0 justify-start pb-4 text-center md:pb-0.5">
                            <span className="font-['Libre_Franklin'] text-[13px] font-normal text-white md:text-[12px] lg:text-[13px]">Join our lunar point system? </span>
                            <span className="font-['Libre_Franklin'] text-[13px] font-bold text-white md:text-[12px] lg:text-[13px]">Register an account.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MenuInfo;