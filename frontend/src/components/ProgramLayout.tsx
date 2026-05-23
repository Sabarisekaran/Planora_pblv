import React from "react";

interface ProgramLayoutProps {
  children: React.ReactNode;
}

const ProgramLayout: React.FC<ProgramLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-gray-50 animate-fade-in">
      {children}
    </div>
  );
};

export default ProgramLayout;
