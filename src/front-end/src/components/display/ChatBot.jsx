import botIcon from "../../assets/img/ChatbotPurple.svg";

const ChatBot = () => {
    return (
        <div className="fixed z-100
        lg:right-15  sm:right-8 right-5
        lg:bottom-15 md:bottom-30 bottom-25">
            <img src={botIcon} alt="Chatbot"
                 className="md:h-15 sm:h-12 h-10
                 md:w-15 sm:w-12 w-10"/>
        </div>
    );
}

export default ChatBot;