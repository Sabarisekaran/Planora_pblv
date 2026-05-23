import React, { useState, useEffect } from "react";
import { Plus, Copy, Trash2, ChevronDown, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import mainEventApi from "@/lib/mainEventApi";

interface MainEvent {
  id: string;
  name: string;
  eventName?: string;
  eventType?: string;
  subEvents?: any[];
  [key: string]: any;
}

interface MainEventManagerProps {
  programId: string;
  mainEvents: MainEvent[];
  activeMainEventId: string | null;
  onMainEventSelect: (mainEventId: string) => void;
  onMainEventUpdate: (mainEvents: MainEvent[], activeId: string | null) => void;
  isLoading?: boolean;
}

const MainEventManager: React.FC<MainEventManagerProps> = ({
  programId,
  mainEvents,
  activeMainEventId,
  onMainEventSelect,
  onMainEventUpdate,
  isLoading = false
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newEventName, setNewEventName] = useState("");
  const [contextMenu, setContextMenu] = useState<{ mainEventId: string; x: number; y: number } | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renamingValue, setRenamingValue] = useState("");

  const handleAddMainEvent = async () => {
    if (!newEventName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a main event name",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await mainEventApi.addMainEvent(programId, newEventName.trim());
      if (response.data.success) {
        const updatedMainEvents = response.data.data.mainEvents || [];
        const activeId = response.data.data.activeMainEventId;
        onMainEventUpdate(updatedMainEvents, activeId);
        
        toast({
          title: "Success",
          description: "Main event created successfully"
        });
        
        setNewEventName("");
        setIsAddingNew(false);
        // Auto-select the new event
        if (response.data.mainEvent?.id) {
          onMainEventSelect(response.data.mainEvent.id);
        }
      }
    } catch (error: any) {
      console.error("Error adding main event:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create main event",
        variant: "destructive"
      });
    }
  };

  const handleDuplicateMainEvent = async (mainEventId: string) => {
    try {
      const response = await mainEventApi.duplicateMainEvent(programId, mainEventId);
      if (response.data.success) {
        const updatedMainEvents = response.data.data.mainEvents || [];
        const activeId = response.data.data.activeMainEventId;
        onMainEventUpdate(updatedMainEvents, activeId);
        
        toast({
          title: "Success",
          description: "Main event duplicated successfully"
        });
        
        // Auto-select the new duplicated event
        if (response.data.mainEvent?.id) {
          onMainEventSelect(response.data.mainEvent.id);
        }
      }
      setContextMenu(null);
    } catch (error: any) {
      console.error("Error duplicating main event:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to duplicate main event",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMainEvent = async (mainEventId: string) => {
    if (mainEvents.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "You must have at least one main event",
        variant: "destructive"
      });
      return;
    }

    if (confirm("Are you sure you want to delete this main event?")) {
      try {
        const response = await mainEventApi.deleteMainEvent(programId, mainEventId);
        if (response.data.success) {
          const updatedMainEvents = response.data.data.mainEvents || [];
          const activeId = response.data.data.activeMainEventId;
          onMainEventUpdate(updatedMainEvents, activeId);
          
          toast({
            title: "Success",
            description: "Main event deleted successfully"
          });
        }
        setContextMenu(null);
      } catch (error: any) {
        console.error("Error deleting main event:", error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to delete main event",
          variant: "destructive"
        });
      }
    }
  };

  const handleSelectMainEvent = async (mainEventId: string) => {
    try {
      const response = await mainEventApi.setActiveMainEvent(programId, mainEventId);
      if (response.data.success) {
        onMainEventSelect(mainEventId);
      }
    } catch (error: any) {
      console.error("Error selecting main event:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to select main event",
        variant: "destructive"
      });
    }
  };

  const handleRenameMainEvent = async (mainEventId: string) => {
    if (!renamingValue.trim()) {
      setRenaming(null);
      return;
    }

    try {
      const updatedMainEvent = mainEvents.find(e => e.id === mainEventId);
      if (updatedMainEvent) {
        const response = await mainEventApi.updateMainEvent(programId, mainEventId, {
          name: renamingValue.trim()
        });
        if (response.data.success) {
          const updatedMainEvents = response.data.data.mainEvents || [];
          const activeId = response.data.data.activeMainEventId;
          onMainEventUpdate(updatedMainEvents, activeId);
          
          toast({
            title: "Success",
            description: "Main event renamed successfully"
          });
        }
      }
    } catch (error: any) {
      console.error("Error renaming main event:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to rename main event",
        variant: "destructive"
      });
    }
    setRenaming(null);
  };

  return (
    <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
          <span className="text-lg">📄</span> Main Events ({mainEvents.length})
        </h3>
      </div>

      {/* Main Events Tabs */}
      <div className="flex items-center gap-2 pb-3 overflow-x-auto border-b border-gray-200">
        {mainEvents.map((mainEvent) => (
          <div
            key={mainEvent.id}
            className="relative flex-shrink-0"
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({ mainEventId: mainEvent.id, x: e.clientX, y: e.clientY });
            }}
          >
            {renaming === mainEvent.id ? (
              <div className="flex items-center gap-1">
                <Input
                  autoFocus
                  type="text"
                  value={renamingValue}
                  onChange={(e) => setRenamingValue(e.target.value)}
                  onBlur={() => handleRenameMainEvent(mainEvent.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleRenameMainEvent(mainEvent.id);
                    } else if (e.key === "Escape") {
                      setRenaming(null);
                    }
                  }}
                  className="h-8 text-xs w-24"
                />
              </div>
            ) : (
              <button
                onClick={() => handleSelectMainEvent(mainEvent.id)}
                className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeMainEventId === mainEvent.id
                    ? "bg-white border-2 border-b-white border-blue-500 text-blue-700 shadow-sm"
                    : "bg-gray-100 border-2 border-transparent text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span className="truncate max-w-[120px]">{mainEvent.name}</span>
                {mainEvents.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setContextMenu({ mainEventId: mainEvent.id, x: e.clientX, y: e.clientY });
                    }}
                    className="opacity-0 hover:opacity-100 transition-opacity p-0.5"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                )}
              </button>
            )}

            {/* Context Menu */}
            {contextMenu?.mainEventId === mainEvent.id && (
              <div
                className="absolute top-full left-0 z-50 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[150px]"
                onMouseLeave={() => setContextMenu(null)}
              >
                <button
                  onClick={() => {
                    setRenaming(mainEvent.id);
                    setRenamingValue(mainEvent.name);
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  ✏️ Rename
                </button>
                <button
                  onClick={() => handleDuplicateMainEvent(mainEvent.id)}
                  className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <Copy className="w-3 h-3" /> Duplicate
                </button>
                {mainEvents.length > 1 && (
                  <button
                    onClick={() => handleDeleteMainEvent(mainEvent.id)}
                    className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Add New Tab */}
        {!isAddingNew ? (
          <button
            onClick={() => setIsAddingNew(true)}
            className="flex-shrink-0 px-3 py-2 rounded-t-lg text-sm font-medium bg-gray-50 border-2 border-dashed border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-all flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Sheet
          </button>
        ) : (
          <div className="flex-shrink-0 flex items-center gap-1">
            <Input
              autoFocus
              type="text"
              placeholder="Event name..."
              value={newEventName}
              onChange={(e) => setNewEventName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddMainEvent();
                } else if (e.key === "Escape") {
                  setIsAddingNew(false);
                  setNewEventName("");
                }
              }}
              className="h-8 text-xs w-32"
            />
            <button
              onClick={handleAddMainEvent}
              disabled={isLoading}
              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Create
            </button>
            <button
              onClick={() => {
                setIsAddingNew(false);
                setNewEventName("");
              }}
              className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {mainEvents.length === 0 && (
        <div className="text-center py-6 text-gray-500 text-sm">
          No main events. Create one to get started.
        </div>
      )}
    </div>
  );
};

export default MainEventManager;
