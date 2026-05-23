import React from "react";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ProgramHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  showMenu?: boolean;
  rightContent?: React.ReactNode;
  onBackClick?: () => void;
  onMenuClick?: () => void;
}

const ProgramHeader: React.FC<ProgramHeaderProps> = ({
  title,
  subtitle,
  showBackButton = true,
  showMenu = false,
  rightContent,
  onBackClick,
  onMenuClick,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="px-8 py-4">
        {/* Top Row - Logo and Right Content */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="font-display font-bold text-lg text-gray-900">Planora</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {rightContent}
            {showMenu && (
              <Button
                onClick={onMenuClick}
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-gray-100"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </Button>
            )}
          </div>
        </div>

        {/* Bottom Row - Title and Subtitle */}
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      </div>
    </header>
  );
};

export default ProgramHeader;
