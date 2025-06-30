import botIcon from "../../assets/img/ChatbotPurple.svg";

const ChatBot = () => {
    return (
        <div className="fixed right-20 bottom-20 z-100">
            <img src={botIcon} alt="Chabot" className="h-20 w-20"/>
        </div>
    );
}

export default ChatBot;