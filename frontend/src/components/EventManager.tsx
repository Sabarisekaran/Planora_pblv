import React, { useState } from "react";
import { Plus, Copy, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";

// Event structure type
export interface EventConfig {
  id: string;
  name: string;
  eventName: string;
  eventType: string;
  basicInfo: {
    name: string;
    date: string;
    time: string;
    venue: string;
    location: string;
  };
  preview: {
    color: string;
    theme: string;
    logo?: string;
  };
  automation: {
    autoGenerateQR: boolean;
    autoCreateCertificate: boolean;
    autoGeneratePoster: boolean;
    [key: string]: boolean;
  };
  [key: string]: any;
}

interface EventManagerProps {
  events: EventConfig[];
  activeEventId: string;
  onEventsChange: (events: EventConfig[]) => void;
  onActiveEventChange: (eventId: string) => void;
  onEventDataUpdate: (eventId: string, updates: Partial<EventConfig>) => void;
}

const EventManager: React.FC<EventManagerProps> = ({
  events,
  activeEventId,
  onEventsChange,
  onActiveEventChange,
  onEventDataUpdate,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [renamingEventId, setRenamingEventId] = useState<string | null>(null);
  const [renamingValue, setRenamingValue] = useState("");

  // Get active event
  const activeEvent = events.find((e) => e.id === activeEventId);

  // Create default event structure
  const createDefaultEvent = (index: number): EventConfig => ({
    id: uuidv4(),
    name: `Event ${index + 1}`,
    eventName: `Event ${index + 1}`,
    eventType: "conference",
    basicInfo: {
      name: `Event ${index + 1}`,
      date: "",
      time: "09:00",
      venue: "",
      location: "",
    },
    preview: {
      color: "#1E40AF",
      theme: "static",
    },
    automation: {
      autoGenerateQR: false,
      autoCreateCertificate: false,
      autoGeneratePoster: false,
      autoGenerateProposal: false,
      autoCreateForm: false,
      enableAttendanceTracking: false,
    },
  });

  // Add new event
  const handleAddEvent = () => {
    const newEvent = createDefaultEvent(events.length);
    const updatedEvents = [...events, newEvent];
    onEventsChange(updatedEvents);
    onActiveEventChange(newEvent.id);
    
    toast({
      title: "Event Added",
      description: `"${newEvent.name}" has been created`,
    });
  };

  // Duplicate event
  const handleDuplicateEvent = (eventId: string) => {
    const eventToDuplicate = events.find((e) => e.id === eventId);
    if (!eventToDuplicate) return;

    const duplicatedEvent: EventConfig = {
      ...JSON.parse(JSON.stringify(eventToDuplicate)),
      id: uuidv4(),
      name: `${eventToDuplicate.name} (Copy)`,
    };

    const updatedEvents = [...events, duplicatedEvent];
    onEventsChange(updatedEvents);
    onActiveEventChange(duplicatedEvent.id);

    toast({
      title: "Event Duplicated",
      description: `"${duplicatedEvent.name}" has been created`,
    });
  };

  // Delete event
  const handleDeleteEvent = (eventId: string) => {
    if (events.length === 1) {
      toast({
        title: "Cannot Delete",
        description: "You must have at least one event",
        variant: "destructive",
      });
      return;
    }

    setEventToDelete(eventId);
    setShowDeleteDialog(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (!eventToDelete) return;

    const eventName = events.find((e) => e.id === eventToDelete)?.name || "Event";
    const updatedEvents = events.filter((e) => e.id !== eventToDelete);

    // Switch to first remaining event if deleted event was active
    if (activeEventId === eventToDelete) {
      onActiveEventChange(updatedEvents[0]?.id || "");
    }

    onEventsChange(updatedEvents);
    setShowDeleteDialog(false);
    setEventToDelete(null);

    toast({
      title: "Event Deleted",
      description: `"${eventName}" has been removed`,
    });
  };

  // Rename event
  const handleRenameEvent = (eventId: string) => {
    if (!renamingValue.trim()) {
      setRenamingEventId(null);
      return;
    }

    const updatedEvents = events.map((e) =>
      e.id === eventId ? { ...e, name: renamingValue.trim() } : e
    );

    onEventsChange(updatedEvents);
    setRenamingEventId(null);
    setRenamingValue("");

    toast({
      title: "Event Renamed",
      description: `Event renamed to "${renamingValue.trim()}"`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Event Manager Header */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
        <div className="space-y-4">
          {/* Title and Description */}
          <div>
            <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
              <span className="text-2xl">⚙️</span> Event Manager
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Manage multiple events with individual configurations
            </p>
          </div>

          {/* Control Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleAddEvent}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <Plus className="w-4 h-4" />
              Add Event
            </Button>

            {activeEvent && (
              <>
                <Button
                  onClick={() => handleDuplicateEvent(activeEventId)}
                  variant="outline"
                  className="flex items-center gap-2"
                  size="sm"
                >
                  <Copy className="w-4 h-4" />
                  Duplicate Event
                </Button>

                {events.length > 1 && (
                  <Button
                    onClick={() => handleDeleteEvent(activeEventId)}
                    variant="destructive"
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Event
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Event Count Info */}
          <div className="text-xs text-gray-600 bg-white/50 rounded px-3 py-2 w-fit">
            Total Events: <span className="font-semibold">{events.length}</span>
          </div>
        </div>
      </Card>

      {/* Event Tabs/Switcher */}
      <div className="flex items-center gap-2 pb-3 border-b-2 border-gray-200 overflow-x-auto">
        {events.map((event, index) => (
          <div key={event.id} className="relative flex-shrink-0">
            {renamingEventId === event.id ? (
              <div className="flex items-center gap-1">
                <Input
                  autoFocus
                  type="text"
                  value={renamingValue}
                  onChange={(e) => setRenamingValue(e.target.value)}
                  onBlur={() => handleRenameEvent(event.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleRenameEvent(event.id);
                    } else if (e.key === "Escape") {
                      setRenamingEventId(null);
                    }
                  }}
                  className="h-8 text-xs w-24"
                />
              </div>
            ) : (
              <button
                onClick={() => onActiveEventChange(event.id)}
                onDoubleClick={() => {
                  setRenamingEventId(event.id);
                  setRenamingValue(event.name);
                }}
                className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeEventId === event.id
                    ? "bg-white border-2 border-b-white border-blue-500 text-blue-700 shadow-md"
                    : "bg-gray-100 border-2 border-transparent text-gray-700 hover:bg-gray-200"
                }`}
                title="Double-click to rename"
              >
                {event.name}
              </button>
            )}
          </div>
        ))}

        {/* Empty state message */}
        {events.length === 0 && (
          <div className="text-sm text-gray-500 py-2">
            No events. Click "Add Event" to create one.
          </div>
        )}
      </div>

      {/* Active Event Info */}
      {activeEvent && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm">
            <span className="font-semibold text-gray-900">Currently Editing: </span>
            <span className="text-blue-700">{activeEvent.name}</span>
          </p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Delete Event?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold">
              "{events.find((e) => e.id === eventToDelete)?.name}"
            </span>
            ? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EventManager;
