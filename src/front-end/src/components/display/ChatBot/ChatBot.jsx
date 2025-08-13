// components/display/ChatBot/ChatBot.jsx

import { useState } from 'react';
import ChatWindow from './ChatWindow';
import botIcon from '@assets/img/ChatbotPurple.svg';

/**
 * ChatBot Component - Main chatbot display component
 *
 * Features:
 * - Toggle chat window visibility
 * - Floating action button in bottom-right corner
 * - Integrates with ChatWindow for full chat experience
 */
const ChatBot = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Hàm để bật/tắt cửa sổ chat
    const toggleChatWindow = () => {
        setIsChatOpen((prevState) => !prevState);
    };

    return (
        <div className="fixed right-5 bottom-10 z-[1000]">
            {/* Nếu chat đang mở, hiển thị cửa sổ chat và truyền hàm để thu nhỏ nó */}
            {isChatOpen && <ChatWindow onMinimize={toggleChatWindow} />}

            {/* Nếu chat đang đóng, hiển thị icon chatbot */}
            {!isChatOpen && (
                <button onClick={toggleChatWindow} className="rounded-full bg-purple-600 p-2 shadow-lg hover:bg-purple-700 focus:outline-none" aria-label="Mở Chat">
                    <img src={botIcon} alt="Chatbot" className="h-12 w-12" />
                </button>
            )}
        </div>
    );
};

export default ChatBot;
