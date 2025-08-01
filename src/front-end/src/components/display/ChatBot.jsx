// src/components/ChatBot.jsx

import { useState } from 'react';
import ChatWindow from '@layouts/Chatbot/ChatWindow'; // Đảm bảo đường dẫn đúng
import botIcon from '@assets/img/ChatbotPurple.svg'; // Đảm bảo đường dẫn đúng

const ChatBot = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Hàm để bật/tắt cửa sổ chat
    const toggleChatWindow = () => {
        setIsChatOpen(prevState => !prevState);
    };

    return (
        <div className="fixed right-5 bottom-10 z-[1000]">
            {/* Nếu chat đang mở, hiển thị cửa sổ chat và truyền hàm để thu nhỏ nó */}
            {isChatOpen && <ChatWindow onMinimize={toggleChatWindow} />}

            {/* Nếu chat đang đóng, hiển thị icon chatbot */}
            {!isChatOpen && (
                <button
                    onClick={toggleChatWindow}
                    className="p-2 bg-purple-600 rounded-full shadow-lg hover:bg-purple-700 focus:outline-none"
                    aria-label="Mở Chat"
                >
                    <img src={botIcon} alt="Chatbot" className="h-12 w-12" />
                </button>
            )}
        </div>
    );
};

export default ChatBot;