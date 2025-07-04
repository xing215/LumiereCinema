import ChatbotIcon from "../../assets/img/Chatbot-Icon.svg";

const Icon = () => {
    return (
        <div className="absolute xl:right-10 lg:right-5 md:right-3 sm:right-2 right-1.5 top-1/2 -translate-y-1/2">
            <img src={ChatbotIcon} alt="Chatbot" className="xl:w-12 lg:w-8 md:w-7 sm:w-5 w-3
                                                            xl:h-12 lg:h-8 md:h-7 sm:h-5 h-3"/>
        </div>
    );
}
const AiSearch = () =>{
    return (
        <div className="relative items-center w-screen z-10 xl:pt-30 lg:pt-20 md:pt-15 pt-7">
            <button className="absolute rounded-2xl bg-gray-300/70 left-1/2 top-1/2 transform -translate-1/2
            xl:w-[1350px] lg:w-[850px] md:w-[580px] w-[300px]
            xl:h-[66px] lg:h-[50px] md:h-[35px] h-[20px]">
                <Icon/>
            </button>
        </div>
    );
}

export default AiSearch;
