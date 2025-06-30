import ChatbotIcon from "../../assets/img/Chatbot-Icon.svg";

const Icon = () => {
    return (
        <div className="absolute right-100 top-1/2 -translate-y-1/2">
            <img src={ChatbotIcon} alt="Chatbot" className="w-13 h-13"/>
        </div>
    );
}
const AiSearch = () =>{
    return (
        <div className="absolute w-screen h-[100px] top-353 z-10">
            <div className="relative w-[1830px] h-[90px] rounded-2xl bg-gray-300/70 left-1/2 top-1/2
            transform -translate-1/2"/>
            <Icon/>
        </div>
    );
}

export default AiSearch;