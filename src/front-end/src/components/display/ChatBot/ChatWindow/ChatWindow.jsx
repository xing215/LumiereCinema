// components/display/ChatBot/ChatWindow/ChatWindow.jsx

import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, ConversationHeader, Avatar, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import botIcon from '@assets/img/ChatbotPurple.svg';
import useChatbot from '@hooks/useChatbot';
import MessageRenderer from '../MessageRenderer';
import { useEffect, useRef } from 'react';

/**
 * ChatWindow Component - Cửa sổ chat chính
 *
 * Kiến thức về @chatscope/chat-ui-kit-react:
 *
 * 1. MainContainer: Container chính chứa toàn bộ chat UI
 * 2. ChatContainer: Container cho khu vực chat (header + messages + input)
 * 3. ConversationHeader: Header hiển thị thông tin cuộc hội thoại
 * 4. MessageList: Container chứa danh sách tin nhắn
 * 5. Message: Component đại diện cho 1 tin nhắn cụ thể
 * 6. MessageInput: Input để người dùng nhập tin nhắn
 * 7. TypingIndicator: Hiệu ứng "đang gõ..." khi bot đang xử lý
 * 8. Avatar: Hiển thị avatar của người gửi tin nhắn
 */

// Component này nhận prop 'onMinimize' để xử lý sự kiện click
const ChatWindow = ({ onMinimize }) => {
    // Sử dụng hook chatbot để quản lý tin nhắn và logic
    const { messages, isLoading, sendMessage, sendQuickAction, sessionId } = useChatbot();

    // Ref để tham chiếu đến message container
    const messagesEndRef = useRef(null);

    // Auto scroll xuống cuối khi có tin nhắn mới
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Effect để scroll khi messages hoặc isLoading thay đổi
    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    /**
     * Xử lý khi người dùng gửi tin nhắn
     * @param {string} innerHtml - Nội dung tin nhắn (có thể chứa HTML)
     * @param {string} textContent - Nội dung tin nhắn dạng text thuần
     */
    const handleSendMessage = (innerHtml, textContent) => {
        sendMessage(textContent);
    };

    /**
     * Xử lý quick actions từ MessageRenderer
     * @param {string} actionText - Text để gửi như tin nhắn
     */
    const handleQuickAction = (actionText) => {
        sendQuickAction(actionText);
    };
    return (
        <div className="fixed right-4 bottom-4 z-50 flex h-[70vh] max-h-[500px] w-[90vw] max-w-[370px] flex-col overflow-hidden rounded-xl bg-zinc-300 shadow-2xl backdrop-blur-lg sm:h-[500px] sm:w-[370px]">
            {/* Header */}
            <div
                className="flex items-center justify-between bg-pink-400 px-4 py-3"
                style={{
                    background: 'linear-gradient(135deg, rgb(251, 113, 133), rgb(147, 51, 234), rgb(79, 70, 229))',
                    boxShadow: 'inset 0px 0px 60.654205322265625px 3.639252185821533px rgba(155,47,255,1.00)',
                }}
            >
                <div className="flex items-center gap-3">
                    <img src={botIcon} alt="Bot" className="h-10 w-10" />
                    <div>
                        <div className="font-bold text-white">Lumiere Assistant</div>
                        <div className="flex items-center gap-1 text-xs text-green-400">
                            <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
                            Online
                        </div>
                    </div>
                </div>
                <button onClick={onMinimize} className="cursor-pointer border-none bg-transparent text-2xl text-gray-200 hover:text-white" aria-label="Thu nhỏ Chat">
                    —
                </button>
            </div>{' '}
            {/* Message List */}
            <div className="flex-1 space-y-2 overflow-y-auto p-3 text-white">
                {/* Hiển thị tin nhắn */}
                {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.direction === 'incoming' ? 'justify-start' : 'justify-end'}`}>
                        {message.direction === 'incoming' ? (
                            // Bot message - use MessageRenderer for rich content
                            <div className="flex max-w-[85%] items-start gap-2">
                                <div className="flex-shrink-0">
                                    <img src={botIcon} alt="Bot" className="h-6 w-6 rounded-full" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    {' '}
                                    <MessageRenderer message={message} onQuickAction={handleQuickAction} sessionId={sessionId} />
                                </div>
                            </div>
                        ) : (
                            // User message - simple text bubble, smaller and on the right
                            <div className="max-w-[70%]">
                                <div className="inline-block rounded-xl bg-orange-500 px-3 py-2 text-sm break-words text-white shadow-[inset_0px_0px_50px_3px_rgba(251,113,133,1.00)]">
                                    {message.message}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {/* Invisible element để scroll đến */}
                <div ref={messagesEndRef} />
            </div>{' '}
            {/* Typing indicator */}
            {isLoading && (
                <div className="px-3 pb-2">
                    <div className="flex max-w-[85%] items-start gap-2">
                        {/* Avatar chatbot */}
                        <div className="flex-shrink-0">
                            <img src={botIcon} alt="Bot typing" className="h-6 w-6 rounded-full" />
                        </div>

                        {/* Typing bubble */}
                        <div className="inline-block rounded-xl bg-purple-600 px-3 py-2 shadow-[inset_0px_0px_50px_3px_rgba(42,182,247,1.00)]">
                            <div className="flex items-center gap-1">
                                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-white"></div>
                                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-white" style={{ animationDelay: '0.1s' }}></div>
                                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-white" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Input */}
            <form
                className="flex items-center border-t border-indigo-500 bg-zinc-300 px-3 py-2"
                onSubmit={(e) => {
                    e.preventDefault();
                    const input = e.target.querySelector('input');
                    if (input.value.trim()) {
                        sendMessage(input.value.trim());
                        input.value = '';
                    }
                }}
            >
                <input
                    className="flex-1 rounded-xl border-none bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-300 px-3 py-2 text-white shadow-lg outline-none placeholder:text-indigo-200"
                    placeholder="Type a message..."
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="ml-2 rounded-xl bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-600 px-4 py-2 font-semibold text-white shadow-lg disabled:opacity-70"
                    disabled={isLoading}
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;
