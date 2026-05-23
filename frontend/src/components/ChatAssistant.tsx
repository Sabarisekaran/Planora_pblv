import React, { useState, useCallback } from "react";
import { MessageCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import ChatWindow, { Message } from "./ChatWindow";
import { v4 as uuidv4 } from "uuid";

// Bot response mapping
const botResponses: Record<string, string> = {
  "create program": `🎯 Creating a Program:

1. Go to the Programs section from the left sidebar
2. Click the "Create Program" button
3. Fill in event details (name, type, dates, venue)
4. Configure automation settings (QR codes, certificates, etc.)
5. Use the live preview to see how your event looks
6. Click "Create Program" to save

You can also use templates (Symposium, Workshop, Hackathon) for quick setup!`,

  "certificates": `🎖️ Generating Certificates:

1. Navigate to the Certificates module
2. When creating a program, enable "Auto Create Certificate"
3. Choose certificate type:
   • Participation Certificate
   • Winner Certificate
   • Both types
4. Optionally add QR code verification
5. Certificates generate automatically when the program is created
6. You can customize templates and download them

Did you know? Our system auto-generates certificates for all participants!`,

  "qr": `📱 QR Registration:

1. When creating a program, toggle "Auto Generate Registration QR"
2. The system generates a unique QR code for your event
3. Participants can scan the QR code to register
4. Enable "Enable Attendance Tracking" to track who scans
5. View registration analytics in your dashboard
6. QR codes are automatically included in:
   • Event posters
   • Registration emails
   • Certificates (if enabled)

This makes registration seamless and trackable!`,

  "posters": `🖼️ Designing Posters:

1. Enable "Auto Generate Event Poster" when creating a program
2. Choose a poster style:
   • Minimal - Clean and professional
   • Academic - Research-focused design
   • Creative - Eye-catching and vibrant
3. Your event theme color is applied automatically
4. Add your event logo for branding
5. Download the poster as PDF or image
6. Share on social media or print it

All posters are mobile-friendly and ready to share!`,

  "download": `💾 Download & Export:

1. Go to File Manager from the sidebar
2. View all generated files (certificates, posters, forms)
3. Select files you want to download
4. Click "Export" to download as:
   • PDF
   • PNG/Image
   • CSV (for data)
5. Or from Program details, click "Export Program"

You can download files individually or bulk export!`,


};

const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  // Pages that have action buttons in the bottom-right that the chat button should be transparent over
  const pagesWithActionButtons = ["/program-details"];
  const isOverlappingPage = pagesWithActionButtons.some((page) => location.pathname.includes(page));

  // Get bot response based on user input
  const getBotResponse = useCallback((userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Check for keywords in responses
    for (const [key, response] of Object.entries(botResponses)) {
      if (key === "default") continue;
      if (lowerMessage.includes(key)) {
        return response;
      }
    }

    return botResponses["default"];
  }, []);

  // Handle sending a message
  const handleSendMessage = useCallback(
    (message: string) => {
      if (!message.trim()) return;

      // Add user message
      const userMessage: Message = {
        id: uuidv4(),
        text: message,
        isUser: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      // Simulate bot thinking and respond
      setTimeout(() => {
        const botResponse = getBotResponse(message);
        const botMessage: Message = {
          id: uuidv4(),
          text: botResponse,
          isUser: false,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMessage]);
        setIsLoading(false);
      }, 600);
    },
    [getBotResponse]
  );

  // Handle opening the chat
  const handleOpenChat = () => {
    setIsOpen(true);
  };

  return (
    <>
      {/* Floating Chat Icon */}
      <button
        onClick={handleOpenChat}
        className={`fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-indigo-500 text-white rounded-full p-4 shadow-lg hover:scale-110 transition-all duration-200 z-50 ${
          isOverlappingPage ? "opacity-70 hover:opacity-100" : "opacity-100"
        }`}
        aria-label="Open chat assistant"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <ChatWindow
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        messages={messages}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </>
  );
};

export default ChatAssistant;
