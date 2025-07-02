import botIcon from "../../assets/img/ChatbotPurple.svg";

const ChatBot = () => {
    return (
        <div className="fixed z-100
        lg:right-15 sm:right-8 right-5
        lg:bottom-15 sm:bottom-8 bottom-5">
            <img src={botIcon} alt="Chabot"
                 className="lg:h-15 md:h-12 h-10
                 lg:w-15 md:w-12 w-10"/>
        </div>
    );
}

export default ChatBot;