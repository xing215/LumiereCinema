// components/display/ChatBot/ChatWindow/ChatWindow.jsx

import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  ConversationHeader,
  Avatar,
  TypingIndicator
} from '@chatscope/chat-ui-kit-react';
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
  const { messages, isLoading, sendMessage, sendQuickAction } = useChatbot();
  
  // Ref để tham chiếu đến message container
  const messagesEndRef = useRef(null);

  // Auto scroll xuống cuối khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    <div
      className="
        fixed bottom-4 right-4
        w-[90vw] max-w-[370px] h-[70vh] max-h-[500px]
        sm:w-[370px] sm:h-[500px]
        rounded-xl overflow-hidden
        shadow-2xl
        bg-zinc-300
        backdrop-blur-lg
        z-50
        flex flex-col
      "
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 bg-pink-400"
        style={{
          background: 'linear-gradient(135deg, rgb(251, 113, 133), rgb(147, 51, 234), rgb(79, 70, 229))',
          boxShadow: 'inset 0px 0px 60.654205322265625px 3.639252185821533px rgba(155,47,255,1.00)'
        }}
      >
        <div className="flex items-center gap-3">
          <img src={botIcon} alt="Bot" className="w-10 h-10" />
          <div>
            <div className="font-bold text-white">Lumiere Assistant</div>
            <div className="flex items-center gap-1 text-xs text-green-400">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
              Online
            </div>
          </div>
        </div>
        <button
          onClick={onMinimize}
          className="bg-transparent border-none text-gray-200 text-2xl cursor-pointer hover:text-white"
          aria-label="Thu nhỏ Chat"
        >
          —
        </button>
      </div>      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 text-white">
        {/* Hiển thị tin nhắn */}
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.direction === 'incoming' ? 'justify-start' : 'justify-end'}`}>
            {message.direction === 'incoming' ? (
              // Bot message - use MessageRenderer for rich content
              <div className="flex items-start gap-2 max-w-[85%]">
                <div className="flex-shrink-0">
                  <img 
                    src={botIcon} 
                    alt="Bot" 
                    className="w-6 h-6 rounded-full" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <MessageRenderer 
                    message={message} 
                    onQuickAction={handleQuickAction}
                  />
                </div>
              </div>
            ) : (
              // User message - simple text bubble, smaller and on the right
              <div className="max-w-[70%]">
                <div className="inline-block px-3 py-2 rounded-xl bg-orange-500 shadow-[inset_0px_0px_50px_3px_rgba(251,113,133,1.00)] text-white text-sm break-words">
                  {message.message}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Invisible element để scroll đến */}
        <div ref={messagesEndRef} />
      </div>      {/* Typing indicator */}
      {isLoading && (
        <div className="px-3 pb-2">
          <div className="flex items-start gap-2 max-w-[85%]">
            {/* Avatar chatbot */}
            <div className="flex-shrink-0">
              <img 
                src={botIcon} 
                alt="Bot typing" 
                className="w-6 h-6 rounded-full" 
              />
            </div>
            
            {/* Typing bubble */}
            <div className="inline-block bg-purple-600 rounded-xl px-3 py-2 shadow-[inset_0px_0px_50px_3px_rgba(42,182,247,1.00)]">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
          className="flex-1 px-3 py-2 bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-300 rounded-xl shadow-lg text-white placeholder:text-indigo-200 outline-none border-none"
          placeholder="Type a message..."
          disabled={isLoading}
        />
        <button
          type="submit"
          className="ml-2 px-4 py-2 bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-600 rounded-xl shadow-lg text-white font-semibold disabled:opacity-70"
          disabled={isLoading}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
