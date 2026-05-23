import React from "react";
import { HelpCircle } from "lucide-react";

interface QuestionCardProps {
  question: string;
  onQuestionClick: (question: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onQuestionClick }) => {
  return (
    <button
      onClick={() => onQuestionClick(question)}
      className="w-full text-left bg-white border border-purple-200 hover:border-purple-400 hover:shadow-md text-gray-900 p-4 rounded-xl transition-all duration-200 hover:translate-y-[-2px] group"
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 text-purple-600 flex-shrink-0 group-hover:scale-110 transition-transform">
          <HelpCircle className="w-5 h-5" />
        </div>
        <span className="text-sm font-medium line-clamp-2 group-hover:text-purple-600 transition-colors">
          {question}
        </span>
      </div>
    </button>
  );
};

export default QuestionCard;
