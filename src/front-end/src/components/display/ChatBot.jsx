import botIcon from '../../assets/img/ChatbotPurple.svg';

const ChatBot = () => {
    return (
        <div className="fixed right-5 bottom-25 z-100 sm:right-8 md:bottom-30 lg:right-15 lg:bottom-15">
            <img src={botIcon} alt="Chatbot" className="h-10 w-10 sm:h-12 sm:w-12 md:h-15 md:w-15" />
        </div>
    );
};

export default ChatBot;
