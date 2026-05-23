import { useState, useCallback } from "react";
import { EventConfig } from "@/components/EventManager";
import { v4 as uuidv4 } from "uuid";

/**
 * Custom hook for managing multiple events with CRUD operations
 * @returns {Object} Event management state and methods
 */
export const useEventManager = (initialEvents?: EventConfig[]) => {
  // Initialize with at least one default event
  const getDefaultEvent = (): EventConfig => ({
    id: uuidv4(),
    name: "Event 1",
    eventName: "Event 1",
    eventType: "conference",
    basicInfo: {
      name: "Event 1",
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

  const [events, setEvents] = useState<EventConfig[]>(
    initialEvents && initialEvents.length > 0 ? initialEvents : [getDefaultEvent()]
  );

  const [activeEventId, setActiveEventId] = useState<string>(
    initialEvents && initialEvents.length > 0 ? initialEvents[0].id : events[0].id
  );

  // Get active event
  const activeEvent = events.find((e) => e.id === activeEventId);

  // Update entire events list
  const updateEvents = useCallback((newEvents: EventConfig[]) => {
    if (newEvents.length > 0) {
      setEvents(newEvents);
      // Ensure active event ID exists in new events
      if (!newEvents.find((e) => e.id === activeEventId)) {
        setActiveEventId(newEvents[0].id);
      }
    }
  }, [activeEventId]);

  // Update active event ID
  const selectEvent = useCallback((eventId: string) => {
    const eventExists = events.find((e) => e.id === eventId);
    if (eventExists) {
      setActiveEventId(eventId);
    }
  }, [events]);

  // Update specific event data
  const updateEventData = useCallback(
    (eventId: string, updates: Partial<EventConfig>) => {
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId ? { ...event, ...updates } : event
        )
      );
    },
    []
  );

  // Update active event data
  const updateActiveEventData = useCallback(
    (updates: Partial<EventConfig>) => {
      if (activeEventId) {
        updateEventData(activeEventId, updates);
      }
    },
    [activeEventId, updateEventData]
  );

  // Add new event
  const addEvent = useCallback(() => {
    const newEvent: EventConfig = {
      id: uuidv4(),
      name: `Event ${events.length + 1}`,
      eventName: `Event ${events.length + 1}`,
      eventType: "conference",
      basicInfo: {
        name: `Event ${events.length + 1}`,
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
    };

    setEvents((prev) => [...prev, newEvent]);
    setActiveEventId(newEvent.id);
    return newEvent;
  }, [events.length]);

  // Duplicate event
  const duplicateEvent = useCallback(
    (eventId: string) => {
      const eventToDuplicate = events.find((e) => e.id === eventId);
      if (!eventToDuplicate) return null;

      const duplicatedEvent: EventConfig = {
        ...JSON.parse(JSON.stringify(eventToDuplicate)),
        id: uuidv4(),
        name: `${eventToDuplicate.name} (Copy)`,
      };

      setEvents((prev) => [...prev, duplicatedEvent]);
      setActiveEventId(duplicatedEvent.id);
      return duplicatedEvent;
    },
    [events]
  );

  // Delete event
  const deleteEvent = useCallback(
    (eventId: string) => {
      if (events.length === 1) {
        return false; // Cannot delete only event
      }

      const updatedEvents = events.filter((e) => e.id !== eventId);
      setEvents(updatedEvents);

      // Switch to another event if deleted event was active
      if (activeEventId === eventId) {
        setActiveEventId(updatedEvents[0].id);
      }

      return true;
    },
    [events, activeEventId]
  );

  // Get all event data
  const getAllEvents = useCallback(() => events, [events]);

  // Get active event data
  const getActiveEvent = useCallback(() => activeEvent, [activeEvent]);

  // Export events for saving
  const exportEventsForSave = useCallback(
    () => events,
    [events]
  );

  return {
    // State
    events,
    activeEventId,
    activeEvent,

    // Methods
    updateEvents,
    selectEvent,
    updateEventData,
    updateActiveEventData,
    addEvent,
    duplicateEvent,
    deleteEvent,
    getAllEvents,
    getActiveEvent,
    exportEventsForSave,
  };
};

export default useEventManager;
