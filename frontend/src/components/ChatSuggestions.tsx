import React from "react";

interface ChatSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
  "How do I create a program?",
  "How do I generate certificates?",
  "How does QR registration work?",
  "How can I design posters?",
  "How do I download certificates?",
];

const ChatSuggestions: React.FC<ChatSuggestionsProps> = ({ onSuggestionClick }) => {
  return (
    <div className="space-y-2 animate-fade-in">
      <p className="text-xs text-gray-600 font-medium">Quick questions:</p>
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="w-full text-left bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm px-3 py-2.5 rounded-lg transition-colors duration-200"
          >
            <span className="line-clamp-2">{suggestion}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatSuggestions;
