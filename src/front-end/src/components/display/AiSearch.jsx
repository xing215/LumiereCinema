import ChatbotIcon from '../../assets/img/Chatbot-Icon.svg';

const Icon = () => {
    return (
        <div className="absolute top-1/2 right-1.5 -translate-y-1/2 sm:right-2 md:right-3 lg:right-5 xl:right-10">
            <img src={ChatbotIcon} alt="Chatbot" className="h-3 w-3 sm:h-5 sm:w-5 md:h-7 md:w-7 lg:h-8 lg:w-8 xl:h-12 xl:w-12" />
        </div>
    );
};
const AiSearch = () => {
    return (
        <div className="relative z-10 w-screen items-center pt-7 md:pt-15 lg:pt-20 xl:pt-30">
            <button className="absolute top-1/2 left-1/2 h-[20px] w-[300px] -translate-1/2 transform rounded-2xl bg-gray-300/70 md:h-[35px] md:w-[580px] lg:h-[50px] lg:w-[850px] xl:h-[66px] xl:w-[1350px]">
                <Icon />
            </button>
        </div>
    );
};

export default AiSearch;
