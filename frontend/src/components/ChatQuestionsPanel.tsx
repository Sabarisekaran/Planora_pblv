import React from "react";
import QuestionCard from "./QuestionCard";

interface ChatQuestionsPanelProps {
  onQuestionClick: (question: string) => void;
}

const questions = [
  "How do I create a program?",
  "How do I generate certificates?",
  "How does QR registration work?",
  "How can I design posters?",
  "How do I download certificates?",
];

const ChatQuestionsPanel: React.FC<ChatQuestionsPanelProps> = ({ onQuestionClick }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-3">
        <div className="text-center mb-6">
          <h4 className="text-gray-800 font-semibold text-sm">How can we help?</h4>
          <p className="text-gray-500 text-xs mt-1">Recently asked questions</p>
        </div>
        <div className="space-y-2.5">
          {questions.map((question, index) => (
            <QuestionCard
              key={index}
              question={question}
              onQuestionClick={onQuestionClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatQuestionsPanel;
