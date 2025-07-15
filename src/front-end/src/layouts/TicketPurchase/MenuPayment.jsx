import TicketDetail from "../../components/UI/TicketDetail";
import NextNaviButton, { BackNaviButton } from "../../components/buttons/NaviButton";
import CustomDropdown from "../../components/UI/customdropdown";
import { useState } from "react";

const PaymentButton = ({ text }) => (
    <div className="h-auto w-[80vw] lg:w-[30vw] md:w-[35vw] relative rounded-xl">
        <div className="w-full h-full left-0 top-0 absolute mix-blend-color-dodge bg-zinc-300/60 rounded-xl" />
        <div className="relative text-center text-white text-base font-black font-['Unbounded'] py-3">
            {text}
        </div>
    </div>
);

const DiscountDropdown = ({ className = "", labelClass = "", direction="up", value, onChange }) => (
    <div className={`md:max-w-[350px] min-w-0 md:min-w-[250px] w-[80vw] flex-row gap-2 justify-center items-center h-auto ${className}`}>
        <div className={`w-auto h-auto justify-start text-white font-bold font-['Unbounded'] ${labelClass}`}>
            DISCOUNT:
        </div>
        <div className="flex-1 h-auto z-3">
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
                    { value: 'Other', label: 'Other' }
                ]}
            />
        </div>
    </div>
);

const MenuPayment = ({ onNext, onBack }) => {
    const [discountValue, setDiscountValue] = useState('');

    const handleDiscountChange = (e) => {
        setDiscountValue(e.target.value);
    };

    return (
        <div className="relative flex items-center justify-center w-screen pt-3 md:pt-7">
            <div className="relative flex flex-row justify-start w-full h-full md:min-h-[470px] md:w-screen lg:w-[75vw] lg:h-auto rounded-xl">
                {/* Background layer */}
                <div className="absolute inset-0 mix-blend-color-dodge bg-zinc-300/30 rounded-xl pointer-events-none z-0" />

                {/* Poster */}
                <div className="hidden md:block">
                    <TicketDetail />
                </div>

                {/* Main content */}
                <div className="relative flex flex-col justify-between items-center flex-1 min-w-[55vw]">
                    <div className="block md:hidden pt-5">
                        <TicketDetail />
                    </div>
                    <div className="relative flex flex-col justify-start items-center gap-4">
                        <div className="w-auto text-center text-white text-base md:text-lg xl:text-2xl font-black font-['Unbounded'] pt-8">
                            PAYMENT OPTION
                        </div>
                        <DiscountDropdown 
                            className="flex md:hidden" 
                            labelClass="text-sm" 
                            direction="down"
                            value={discountValue}
                            onChange={handleDiscountChange}
                        />
                        <PaymentButton text="MOMO" />
                        <PaymentButton text="ZALOPAY" />
                    </div>

                    <div className="w-[80vw] lg:w-[30vw] md:w-[35vw] flex flex-col justify-center items-center px-4 sm:px-8 md:px-10 lg:px-12 pb-10.5 md:pb-6 pt-8 gap-2">
                        <DiscountDropdown 
                            className="hidden md:flex" 
                            labelClass="text-base" 
                            direction="up"
                            value={discountValue}
                            onChange={handleDiscountChange}
                        />
                        <div className="flex flex-row justify-center items-center w-full gap-2">
                            <BackNaviButton onClick={onBack} />
                            <NextNaviButton text="COMPLETE" onClick={onNext} showTextOnMobile={true} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MenuPayment;
