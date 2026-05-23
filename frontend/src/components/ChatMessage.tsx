import React from "react";

interface ChatMessageProps {
  text: string;
  isUser: boolean;
  timestamp?: Date;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ text, isUser, timestamp }) => {
  const formatTime = (date?: Date) => {
    if (!date) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}>
      <div
        className={`max-w-[70%] px-4 py-3 rounded-xl ${
          isUser
            ? "bg-gradient-to-r from-purple-600 to-indigo-500 text-white rounded-br-none"
            : "bg-gray-100 text-gray-900 rounded-bl-none"
        }`}
      >
        <p className="text-sm leading-relaxed">{text}</p>
        {timestamp && (
          <p className={`text-xs mt-1 ${isUser ? "text-purple-100" : "text-gray-600"}`}>
            {formatTime(timestamp)}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
