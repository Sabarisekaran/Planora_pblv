import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Save, CheckCircle, CalendarDays, Layers, ChevronDown, MapPin, User, Trash2, Plus, Copy, MoreVertical, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import ProgramHeader from "@/components/ProgramHeader";
import CreateProgramForm from "@/components/CreateProgramForm";
import AutomationPanel from "@/components/AutomationPanel";
import EventPreviewCard from "@/components/EventPreviewCard";
import { usePrograms, EventProgram, ProgramAutomation } from "@/contexts/ProgramContext";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/components/ui/use-toast";
import coordinatorApi from "@/lib/coordinatorApi";
import programApi from "@/lib/programApi";
import { getUserRole, isCoordinatorLoggedIn } from "@/lib/auth";

const CreateProgramPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = getUserRole();
  const isCoordinator = isCoordinatorLoggedIn();
  const { addProgram, updateProgram, programs, setCurrentProgram, hasDuplicateSubEventName, isLoading, error, loadPrograms } = usePrograms();

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editingEventName, setEditingEventName] = useState<string>("");
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showTemplateMenu, setShowTemplateMenu] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  interface HeadAccount {
    id: string;
    name: string;
    email: string;
    phone: string;
  }

  const [headAccounts, setHeadAccounts] = useState<HeadAccount[]>([]);
  const [selectedHeadId, setSelectedHeadId] = useState<string | null>(null);
  const [assignedHead, setAssignedHead] = useState<HeadAccount | null>(null);

  // Two-step flow: "details" for basic info, "advanced" for detailed form
  const [programStep, setProgramStep] = useState<"details" | "advanced">("details");

  // Currently-selected event in the top-left event dropdown (multi-event mode)
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [lastEnterPressTime, setLastEnterPressTime] = useState<number>(0);
  const [showThemeCard, setShowThemeCard] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  // Fetch head connections from API
  useEffect(() => {
    const loadHeadAccounts = async () => {
      try {
        const response = await coordinatorApi.getAllCoordinators();
        if (response.data.success && response.data.coordinators) {
          const coordinators = response.data.coordinators.map((coordinator: any) => ({
            id: coordinator._id,
            name: coordinator.name,
            email: coordinator.email,
            phone: coordinator.phone,
          }));
          setHeadAccounts(coordinators);
        }
      } catch (error) {
        console.error('Failed to load coordinators:', error);
        // Try loading from localStorage as fallback
        const stored = window.localStorage.getItem("headAccounts");
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as HeadAccount[];
            if (Array.isArray(parsed)) {
              setHeadAccounts(parsed);
            }
          } catch {
            setHeadAccounts([]);
          }
        }
      }
    };

    loadHeadAccounts();
  }, []);

  const selectedHead = headAccounts.find((head) => head.id === selectedHeadId) ?? null;
  const coordinatorHeads = headAccounts;

  const handleCoordinatorSelect = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedCoordinatorId: id,
    }));
  };

  const assignSelectedHead = () => {
    if (!selectedHead) {
      toast({
        title: "Select a head first",
        description: "Choose an available head connection before assigning.",
      });
      return;
    }
    setAssignedHead(selectedHead);
    // Update form data with only the coordinator ID
    console.log('✅ Assigning head connection:', {
      id: selectedHead.id,
      name: selectedHead.name,
    });
    handleFormChange({
      selectedCoordinatorId: selectedHead.id,
    });
    toast({
      title: "Assigned",
      description: `Event assigned to ${selectedHead.name}`,
    });
  };

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; eventId: string } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Initial form data template
  const getInitialFormData = (): Partial<EventProgram> => ({
    eventName: "",
    eventType: "conference",
    eventStructure: "single",
    subEvents: [
      {
        id: uuidv4(),
        name: "",
        date: "",
        endDate: "",
        time: "09:00",
        venueName: "",
        organizerName: "",
        location: "",
        enableDefaultVenue: false,
        defaultVenueName: "",
        defaultLocation: "",
      },
    ],
    programCategory: "",
    organizerName: "",
    contactEmail: "",
    contactPhone: "",
    selectedCoordinatorId: null,
    useDefaultVenueLocation: false,
    defaultVenueName: "",
    defaultLocation: "",
    automation: {
      autoGenerateQR: false,
      autoCreateCertificate: false,
      autoGeneratePoster: false,
      autoGenerateProposal: false,
      autoCreateForm: false,
      enableAttendanceTracking: false,
      certificateType: "participation",
      includeQRInCertificate: false,
      maxParticipants: 0,
      registrationDeadline: "",
      autoCloseRegistration: false,
      posterStyle: "minimal",
      proposalOptions: {
        eventProposal: false,
        budgetPlan: false,
        sponsorLetter: false,
        permissionLetter: false,
      },
    },
  });

  const [formData, setFormData] = useState<Partial<EventProgram>>(getInitialFormData());

  // ─── Helper Functions ───────────────────────────────────────────────────

  // Check if single or multi-event structure
  const isSingleEvent = formData.eventStructure === "single";
  const isMultiEvent = formData.eventStructure === "multi";

  // Update a single event field
  const updateEventField = (eventId: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      subEvents: (prev.subEvents || []).map((e) =>
        e.id === eventId ? { ...e, [field]: value } : e
      ),
    }));
  };

  // Add a new event
  const addEvent = () => {
    // Prevent adding events in single event mode
    if (formData.eventStructure === "single") {
      toast({
        title: "Cannot Add Events",
        description: "Single event mode only allows one event. Switch to multi-event mode to add more.",
        variant: "destructive",
      });
      return;
    }

    const newEvent = {
      id: uuidv4(),
      name: "",
      date: "",
      endDate: "",
      time: "09:00",
      venueName: "",
      organizerName: "",
      location: "",
      enableDefaultVenue: false,
      defaultVenueName: "",
      defaultLocation: "",
    };
    setFormData((prev) => ({
      ...prev,
      subEvents: [...(prev.subEvents || []), newEvent],
    }));
    setTimeout(() => setSelectedEventId(newEvent.id), 0);
    toast({
      title: "Success",
      description: "Event added successfully",
    });
  };

  // Delete an event
  const deleteEventById = (eventId: string) => {
    setFormData((prev) => ({
      ...prev,
      subEvents: (prev.subEvents || []).filter((e) => e.id !== eventId),
    }));
    if (selectedEventId === eventId) {
      // Auto-switch to first remaining event
      const remainingEvents = (formData.subEvents || []).filter((e) => e.id !== eventId);
      setSelectedEventId(remainingEvents.length > 0 ? remainingEvents[0].id : "");
    }
    toast({
      title: "Success",
      description: "Event deleted successfully",
    });
  };

  // Ensure at least one event exists (for single event mode)
  const ensureEventExists = () => {
    if (!formData.subEvents || formData.subEvents.length === 0) {
      const newEvent = {
        id: uuidv4(),
        name: "",
        date: "",
        endDate: "",
        time: "09:00",
        venueName: "",
        organizerName: "",
        location: "",
        enableDefaultVenue: false,
        defaultVenueName: "",
        defaultLocation: "",
      };
      setFormData((prev) => ({
        ...prev,
        subEvents: [newEvent],
      }));
      setSelectedEventId(newEvent.id);
    }
  };

  // Enable event name editing on double-click
  const enableEventNameEdit = (eventId: string, currentName: string) => {
    setEditingEventId(eventId);
    setEditingEventName(currentName || "");
    setTimeout(() => {
      const inputElement = document.getElementById(`event-name-input-${eventId}`) as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
        inputElement.select();
      }
    }, 0);
  };

  // Save event name changes
  const saveEventName = (eventId: string) => {
    if (!editingEventName.trim()) {
      toast({
        title: "Event name cannot be empty",
        description: "Please enter a valid event name.",
        variant: "destructive",
      });
      return;
    }
    updateEventField(eventId, "name", editingEventName);
    setEditingEventId(null);
    setEditingEventName("");
    toast({
      title: "Success",
      description: "Event name updated successfully",
    });
  };

  // Cancel event name editing
  const cancelEventNameEdit = () => {
    setEditingEventId(null);
    setEditingEventName("");
  };

  // ─────────────────────────────────────────────────────────────────────────

  // Auto-select first event if none selected and sync selectedEvent when formData changes
  useEffect(() => {
    if (formData.subEvents && formData.subEvents.length > 0) {
      // Auto-select first event if none selected yet
      if (!selectedEventId) {
        setSelectedEventId(formData.subEvents[0].id);
      } else {
        // Verify selected event still exists in subEvents
        const eventExists = formData.subEvents.some((e) => e.id === selectedEventId);
        if (!eventExists && formData.subEvents.length > 0) {
          setSelectedEventId(formData.subEvents[0].id);
        }
      }
    }
  }, [formData.subEvents?.length, selectedEventId]);

  // ─────────────────────────────────────────────────────────────────────────

  // Fetch program from backend API if not found in context
  const fetchAndLoadProgram = async (programId: string) => {
    try {
      console.log('🔄 Fetching program from API:', programId);
      const response = await programApi.getProgramById(programId);
      
      if (response.data.success && response.data.data) {
        let programData = response.data.data;
        console.log('✅ Program fetched successfully:', programData.eventName);
        
        // Ensure subEvents array exists - if empty, create a default for editing
        if (!programData.subEvents || programData.subEvents.length === 0) {
          console.log('⚠️ No subEvents found, creating default empty subEvent for editing');
          programData.subEvents = [{
            id: uuidv4(),
            name: "",
            date: "",
            endDate: "",
            time: "09:00",
            venueName: "",
            location: "",
            organizerName: "",
            enableDefaultVenue: false,
            defaultVenueName: "",
            defaultLocation: "",
          }];
        }
        
        setFormData(programData);
        setEditingId(programData.id);
        setIsEditing(true);
        setShowTemplateMenu(false);
        setProgramStep("details");
        
        // For multi-event programs, select the first event
        if (programData.eventStructure === "multi" && programData.subEvents && programData.subEvents.length > 0) {
          setSelectedEventId(programData.subEvents[0].id);
          console.log('✅ Multi-event program loaded from API, selected first event:', programData.subEvents[0].id);
        } else if (programData.eventStructure === "single" && programData.subEvents && programData.subEvents.length > 0) {
          setSelectedEventId(programData.subEvents[0].id);
        }
        
        toast({
          title: "Program Loaded",
          description: `Loaded "${programData.eventName}" for editing`,
        });
      } else {
        throw new Error("Program not found");
      }
    } catch (error: any) {
      console.error('❌ Error loading program:', error.message);
      const errorMsg = error.response?.data?.message || error.message || "Failed to load program data";
      
      toast({
        title: "Error Loading Program",
        description: errorMsg,
        variant: "destructive",
      });
      
      // Navigate back to programs list after short delay
      setTimeout(() => navigate("/programs"), 1500);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  // Load program data if editing
  useEffect(() => {
    const state = location.state as { programId?: string };
    if (state?.programId) {
      // First try to find in context
      const program = programs.find((p) => p.id === state.programId);
      if (program) {
        // Ensure subEvents array exists - if empty, create a default for editing
        let programData = { ...program };
        if (!programData.subEvents || programData.subEvents.length === 0) {
          console.log('⚠️ No subEvents found in context program, creating default empty subEvent for editing');
          programData.subEvents = [{
            id: uuidv4(),
            name: "",
            date: "",
            endDate: "",
            time: "09:00",
            venueName: "",
            location: "",
            organizerName: "",
            enableDefaultVenue: false,
            defaultVenueName: "",
            defaultLocation: "",
          }];
        }
        
        setFormData(programData);
        setEditingId(programData.id);
        setIsEditing(true);
        setShowTemplateMenu(false);
        setProgramStep("details");
        
        // For multi-event programs, select the first event
        if (programData.eventStructure === "multi" && programData.subEvents && programData.subEvents.length > 0) {
          setSelectedEventId(programData.subEvents[0].id);
          console.log('✅ Multi-event program loaded, selected first event:', programData.subEvents[0].id);
        } else if (programData.eventStructure === "single" && programData.subEvents && programData.subEvents.length > 0) {
          setSelectedEventId(programData.subEvents[0].id);
        }
      } else if (!isLoading) {
        // If not found in context, try to fetch from backend
        console.log('📥 Program not in context, fetching from API...', state.programId);
        fetchAndLoadProgram(state.programId);
      }
    } else {
      // Reset form to fresh state when creating a new program (no programId)
      setFormData(getInitialFormData());
      setEditingId(null);
      setIsEditing(false);
      setShowTemplateMenu(true);
      setProgramStep("details");
      setSelectedHeadId(null);
      setAssignedHead(null);
      setSelectedEventId("");
    }
  }, [location, programs, isLoading, navigate]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFormChange = (changes: Partial<EventProgram>) => {
    setFormData((prev) => {
      let newData = { ...prev, ...changes };

      // Auto-map programCategory to eventType based on category value
      if (changes.programCategory && !changes.eventType) {
        const categoryToTypeMap: Record<string, string> = {
          "Academic": "symposium",
          "Professional Development": "workshop",
          "Competition": "hackathon",
          "General": "conference",
          "Online": "webinar",
          "Networking": "meetup",
        };
        const mappedType = categoryToTypeMap[changes.programCategory];
        if (mappedType) {
          newData.eventType = mappedType;
        }
      }

      // When event structure changes, initialize sub-events properly
      if (changes.eventStructure) {
        if (changes.eventStructure === "single") {
          // Single event: create one default sub-event
          newData.subEvents = [
            {
              id: uuidv4(),
              name: "",
              date: newData.startDate || "",
              endDate: "",
              time: "09:00",
              venueName: "",
              location: "",
              organizerName: newData.organizerName || "",
              enableDefaultVenue: false,
              defaultVenueName: "",
              defaultLocation: "",
            },
          ];
          newData.enableSubEvents = false;
          // Skip template menu for single events
          setShowTemplateMenu(false);
        } else if (changes.eventStructure === "multi") {
          // Multi event: create one sub-event to start
          newData.subEvents = [
            {
              id: uuidv4(),
              name: "",
              date: newData.startDate || "",
              endDate: "",
              time: "09:00",
              venueName: "",
              location: "",
              organizerName: newData.organizerName || "",
              enableDefaultVenue: false,
              defaultVenueName: "",
              defaultLocation: "",
            },
          ];
          newData.enableSubEvents = true;
        }
      }

      return newData;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.currentTarget;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubEventChange = (id: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      subEvents: (prev.subEvents || []).map((e) =>
        e.id === id ? { ...e, [field]: value } : e
      ),
    }));
  };

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, callback?: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault();
      
      // Get all input-like elements (inputs, selects, textareas)
      const allInputs = Array.from(
        document.querySelectorAll(
          'input:not([type="hidden"]), select, textarea'
        )
      ) as HTMLInputElement[];

      // Find current input index
      const currentIndex = allInputs.indexOf(e.currentTarget);

      // Move to next input if it exists
      if (currentIndex !== -1 && currentIndex < allInputs.length - 1) {
        const nextInput = allInputs[currentIndex + 1] as HTMLInputElement;
        nextInput.focus();
      } else if (currentIndex === allInputs.length - 1 && callback) {
        // If at last input, call callback if provided
        callback();
      }
    }
  };

  const handleAutomationChange = (automation: Partial<ProgramAutomation>) => {
    setFormData((prev) => ({
      ...prev,
      automation: { ...prev.automation, ...automation },
    }));
  };

  const applyTemplate = (template: "symposium" | "workshop" | "hackathon") => {
    const templates = {
      symposium: {
        eventType: "symposium" as const,
        programCategory: "Academic",
        automation: {
          autoGenerateQR: true,
          autoCreateCertificate: true,
          autoGeneratePoster: true,
          autoGenerateProposal: true,
          autoCreateForm: false,
          enableAttendanceTracking: false,
          certificateType: "participation",
          includeQRInCertificate: false,
          maxParticipants: 0,
          registrationDeadline: "",
          autoCloseRegistration: false,
          posterStyle: "minimal",
          proposalOptions: {
            eventProposal: false,
            budgetPlan: false,
            sponsorLetter: false,
            permissionLetter: false,
          },
        },
      },
      workshop: {
        eventType: "workshop" as const,
        programCategory: "Professional Development",
        automation: {
          autoGenerateQR: true,
          autoCreateCertificate: true,
          autoGeneratePoster: true,
          autoGenerateProposal: false,
          autoCreateForm: false,
          enableAttendanceTracking: false,
          certificateType: "participation",
          includeQRInCertificate: false,
          maxParticipants: 0,
          registrationDeadline: "",
          autoCloseRegistration: false,
          posterStyle: "minimal",
          proposalOptions: {
            eventProposal: false,
            budgetPlan: false,
            sponsorLetter: false,
            permissionLetter: false,
          },
        },
      },
      hackathon: {
        eventType: "hackathon" as const,
        programCategory: "Competition",
        automation: {
          autoGenerateQR: true,
          autoCreateCertificate: true,
          autoGeneratePoster: true,
          autoGenerateProposal: true,
          autoCreateForm: false,
          enableAttendanceTracking: false,
          certificateType: "participation",
          includeQRInCertificate: false,
          maxParticipants: 0,
          registrationDeadline: "",
          autoCloseRegistration: false,
          posterStyle: "minimal",
          proposalOptions: {
            eventProposal: false,
            budgetPlan: false,
            sponsorLetter: false,
            permissionLetter: false,
          },
        },
      },
    };

    setFormData((prev) => ({
      ...prev,
      ...(templates[template] as Partial<EventProgram>),
    }));
  };

  const validateFormForSave = (): boolean => {
    const missingFields: string[] = [];

    if (!formData.eventName?.trim()) missingFields.push("Event Name");
    if (!formData.eventType) missingFields.push("Event Type");

    if (missingFields.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: `Please fill in: ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  // Clean up form data based on event structure (SINGLE vs MULTI)
  const cleanFormDataBeforeSave = (data: Partial<EventProgram>): Partial<EventProgram> => {
    const cleaned = { ...data };

    console.log('🧹 BEFORE CLEANING:');
    console.log('  eventName:', data.eventName);
    console.log('  eventType:', data.eventType);
    console.log('  eventStructure:', data.eventStructure);
    console.log('  subEvents count:', (data.subEvents || []).length);

    // Ensure all required fields have defaults
    if (!cleaned.eventName) cleaned.eventName = '';
    if (!cleaned.eventType) cleaned.eventType = '';
    if (!cleaned.eventStructure) cleaned.eventStructure = 'single';
    if (!cleaned.automation) cleaned.automation = {
      autoGenerateQR: false,
      autoCreateForm: false,
      autoCreateCertificate: false,
      autoGeneratePoster: false,
      autoGenerateProposal: false,
      enableAttendanceTracking: false,
    };

    // For SINGLE event: only send if has name AND date, otherwise empty array
    if (data.eventStructure === "single") {
      if (!cleaned.subEvents || cleaned.subEvents.length === 0) {
        // No events - send empty array, NOT empty event objects
        cleaned.subEvents = [];
      } else {
        // Keep only the first subevent for single events, but filter if empty
        const firstEvent = cleaned.subEvents[0];
        if (firstEvent.name?.trim() && firstEvent.date?.trim()) {
          // Has name and date - keep it with all required fields
          cleaned.subEvents = [{
            id: firstEvent.id || `event-${Date.now()}`,
            name: firstEvent.name.trim(),
            date: firstEvent.date.trim(),
            endDate: firstEvent.endDate || "",
            time: firstEvent.time || "09:00",
            venueName: firstEvent.venueName || "",
            location: firstEvent.location || "",
            organizerName: firstEvent.organizerName || "",
            enableDefaultVenue: firstEvent.enableDefaultVenue || false,
            defaultVenueName: firstEvent.defaultVenueName || "",
            defaultLocation: firstEvent.defaultLocation || "",
          }];
        } else {
          // Empty event - send empty array instead of empty object
          cleaned.subEvents = [];
        }
      }
      cleaned.enableSubEvents = false;
    } 
    // For MULTI event: only keep subEvents with name AND date
    else if (data.eventStructure === "multi") {
      const validSubEvents = (data.subEvents || [])
        .filter(e => e.name?.trim() && e.date?.trim())  // ← Filter BEFORE sending
        .map(e => ({
          id: e.id || `event-${Date.now()}-${Math.random()}`,
          name: e.name?.trim() || "",
          date: e.date?.trim() || "",
          endDate: e.endDate || "",
          time: e.time || "09:00",
          venueName: e.venueName || "",
          location: e.location || "",
          organizerName: e.organizerName || "",
          enableDefaultVenue: e.enableDefaultVenue || false,
          defaultVenueName: e.defaultVenueName || "",
          defaultLocation: e.defaultLocation || "",
        }));
      
      cleaned.subEvents = validSubEvents;
      // Only enable subEvents if we have valid ones
      cleaned.enableSubEvents = validSubEvents.length > 0;
    }

    console.log('✅ AFTER CLEANING:');
    console.log('  eventName:', cleaned.eventName);
    console.log('  eventType:', cleaned.eventType);
    console.log('  eventStructure:', cleaned.eventStructure);
    console.log('  subEvents count:', (cleaned.subEvents || []).length);
    if ((cleaned.subEvents || []).length > 0) {
      console.log('  First subEvent:', {
        id: cleaned.subEvents?.[0]?.id,
        name: cleaned.subEvents?.[0]?.name,
        date: cleaned.subEvents?.[0]?.date,
      });
    }
    console.log('  enableSubEvents:', cleaned.enableSubEvents);

    return cleaned;
  };

  const handleSaveDraft = async () => {
    if (isSaving) return; // Prevent duplicate saves
    
    // Validate required fields
    if (!validateFormForSave()) return;

    setIsSaving(true);
    try {
      const cleanedData = cleanFormDataBeforeSave(formData);
      
      if (editingId) {
        await updateProgram(editingId, {
          ...cleanedData,
          status: "active",
          progress: calculateProgress(),
        }, logoFile || undefined);
        toast({
          title: "Success",
          description: "Program saved successfully",
        });
      } else {
        const newProgram: EventProgram = {
          ...(cleanedData as EventProgram),
          id: '', // Will be assigned by backend
          status: "active",
          progress: calculateProgress(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const success = await addProgram(newProgram, logoFile || undefined);
        if (!success) {
          toast({
            title: "Error",
            description: "Failed to save program. Please try again.",
            variant: "destructive",
          });
          return;
        }
        toast({
          title: "Success",
          description: "Program created successfully",
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      navigate("/programs");
    } catch (err: any) {
      // Extract detailed error information
      const errorData = err.response?.data;
      let errorMsg = err.message || "Failed to save program";
      
      if (errorData?.message) {
        errorMsg = errorData.message;
      }
      
      // Log detailed validation errors if available
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        console.error('❌ Validation Errors:', errorData.errors);
        errorMsg = errorData.errors.join(', ');
      } else if (errorData?.details) {
        console.error('❌ Error Details:', errorData.details);
        errorMsg = errorData.details;
      }
      
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      console.error('Error saving program:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateProgram = async () => {
    if (isSaving) return; // Prevent duplicate saves
    
    // Validate required fields first
    if (!validateFormForSave()) return;

    setIsSaving(true);
    try {
      const cleanedData = cleanFormDataBeforeSave(formData);
      
      // Validate coordinator assignment if present
      if (cleanedData.selectedCoordinatorId) {
        console.log('📌 Program being assigned to coordinator:', cleanedData.selectedCoordinatorId);
      } else {
        console.log('ℹ️ No coordinator assigned to this program');
      }
      
      if (editingId) {
        await updateProgram(editingId, {
          ...cleanedData,
          status: "active",
          progress: 100,
        }, logoFile || undefined);
        toast({
          title: "Success",
          description: "Program updated successfully",
        });
      } else {
        const newProgram: EventProgram = {
          ...(cleanedData as EventProgram),
          id: '', // Will be assigned by backend
          status: "active",
          progress: 100,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        console.log('📤 CreateProgramPage: Calling addProgram with:', {
          programName: newProgram.eventName,
          coordinatorId: newProgram.selectedCoordinatorId || 'None',
          hasLogoFile: !!logoFile,
          logoFileName: logoFile?.name,
          logoSize: logoFile?.size,
        });
        const success = await addProgram(newProgram, logoFile || undefined);
        if (!success) {
          toast({
            title: "Error",
            description: "Failed to create program. Please try again.",
            variant: "destructive",
          });
          return;
        }
        toast({
          title: "Success",
          description: cleanedData.selectedCoordinatorId 
            ? "Program created and assigned successfully!" 
            : "Program created successfully!",
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      navigate("/programs");
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to save program";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      console.error('Error creating program:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const calculateProgress = (): number => {
    // ═══ BASIC PROGRAM DETAILS = UP TO 60% ═══
    const basicFields = [
      formData.eventName,
      formData.eventType,
      formData.organizerName,
      formData.startDate,
      formData.endDate,
      formData.subEvents && formData.subEvents.length > 0,
    ];
    
    const filledBasicFields = basicFields.filter((f) => f).length;
    const basicFieldsRatio = filledBasicFields / basicFields.length;
    
    // 60% for complete basic details
    const baseProgress = basicFieldsRatio >= 0.83 ? 60 : Math.round(basicFieldsRatio * 60);

    // ═══ AUTOMATION FEATURES = UP TO 40% ═══
    // Check which automation features are enabled
    const automation = formData.automation || {};
    const automationFeatures = [
      automation.autoGenerateQR,
      automation.autoCreateCertificate,
      automation.autoGeneratePoster,
      automation.autoCreateForm,
      automation.enableAttendanceTracking,
    ];
    
    // Count how many automation features are enabled
    const enabledFeatures = automationFeatures.filter((f) => f === true).length;
    
    // If no automation enabled, no additional progress
    if (enabledFeatures === 0) {
      return baseProgress;
    }
    
    // For each enabled automation feature, add progress towards 100%
    // 5 possible features, so each enabled feature = 8% (40% / 5)
    const automationProgress = Math.min(enabledFeatures * 8, 40);
    
    return Math.round(baseProgress + automationProgress);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const handleCancel = () => {
    setShowExitDialog(true);
  };

  const duplicateEvent = (eventId: string) => {
    const event = (formData.subEvents || []).find((e) => e.id === eventId);
    if (event) {
      const newEvent = { ...event, id: uuidv4() };
      setFormData((prev) => ({
        ...prev,
        subEvents: [...(prev.subEvents || []), newEvent],
      }));
      setTimeout(() => setSelectedEventId(newEvent.id), 0);
      toast({
        title: "Success",
        description: "Event duplicated successfully",
      });
    }
    setContextMenu(null);
  };

  const copyEvent = (eventId: string) => {
    const event = (formData.subEvents || []).find((e) => e.id === eventId);
    if (event) {
      localStorage.setItem("copiedEvent", JSON.stringify(event));
      toast({
        title: "Success",
        description: "Event copied to clipboard",
      });
    }
    setContextMenu(null);
  };

  const deleteEvent = (eventId: string) => {
    deleteEventById(eventId);
    setContextMenu(null);
  };

  const handleEnterNavigation = (currentField: string) => {
    const fieldOrder = ["eventName", "programCategory", "numEvents", "organizerName"];
    const currentIndex = fieldOrder.indexOf(currentField);
    
    if (currentIndex !== -1 && currentIndex < fieldOrder.length - 1) {
      // Move to next field
      const nextField = fieldOrder[currentIndex + 1];
      const nextElement = document.getElementById(nextField) as HTMLInputElement | null;
      if (nextElement) {
        setTimeout(() => nextElement.focus(), 0);
      }
    } else if (currentField === "organizerName") {
      // Double Enter detection
      const now = Date.now();
      if (now - lastEnterPressTime < 500) {
        // Double press detected, click the button
        nextButtonRef.current?.click();
        setLastEnterPressTime(0);
      } else {
        setLastEnterPressTime(now);
      }
    }
  };

  // The currently selected sub-event object (for the details panel)
  const selectedEvent = (formData.subEvents || []).find((e) => e.id === selectedEventId) ?? null;

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" />
            <p className="text-gray-900 font-semibold">Loading program data...</p>
          </div>
        </div>
      )}
      <ProgramHeader
        title={isEditing ? "Edit Program" : "Create New Program"}
        subtitle={
          isEditing
            ? "Update your event details and automation settings"
            : programStep === "details"
            ? "Fill in basic program information"
            : "Configure advanced settings and automation"
        }
        showBackButton={true}
        onBackClick={handleCancel}
      />

      {/* ── Step 1: Basic Program Details ── */}
      {programStep === "details" && (
        <div className="px-8 py-6">
          <Card className="p-5 bg-white rounded-2xl border border-gray-200 shadow-lg">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Program Details</h2>
                <p className="text-xs text-gray-500">Enter basic information about your program</p>
              </div>

              {/* Event Name Row */}
              <div className="grid grid-cols-1 gap-4">
                {/* Event Name */}
                <div className="space-y-2">
                  <Label htmlFor="eventName" className="text-xs font-semibold text-gray-700">
                    Event Name *
                  </Label>
                  <Input
                    id="eventName"
                    name="eventName"
                    value={formData.eventName || ""}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const categoryInput = document.getElementById("programCategory") as HTMLInputElement;
                        if (categoryInput) categoryInput.focus();
                      }
                    }}
                    placeholder="Enter event name"
                    className="rounded border-gray-300 focus:border-purple-500 focus:ring-purple-500 h-10 text-sm"
                  />
                </div>
              </div>

              {/* Category, Head Name and Venue Name Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Program Category */}
                <div className="space-y-2">
                  <Label htmlFor="programCategory" className="text-xs font-semibold text-gray-700">
                    Category
                  </Label>
                  <Input
                    id="programCategory"
                    name="programCategory"
                    value={formData.programCategory || ""}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const headNameInput = document.getElementById("organizerName") as HTMLInputElement;
                        if (headNameInput) headNameInput.focus();
                      }
                    }}
                    placeholder="e.g., Academic, Professional"
                    className="rounded border-gray-300 focus:border-purple-500 focus:ring-purple-500 h-10 text-sm"
                  />
                </div>

                {/* Head Name Text Input */}
                <div className="space-y-2">
                  <Label htmlFor="headName" className="text-xs font-semibold text-gray-700">
                    Head Name *
                  </Label>
                  <Input
                    id="headName"
                    name="organizerName"
                    value={formData.organizerName || ""}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const venueNameInput = document.getElementById("venueName") as HTMLInputElement;
                        if (venueNameInput) venueNameInput.focus();
                      }
                    }}
                    placeholder="Enter head coordinator name"
                    className="rounded border-gray-300 focus:border-purple-500 focus:ring-purple-500 h-10 text-sm"
                  />
                </div>

                {/* Venue Name */}
                <div className="space-y-2">
                  <Label htmlFor="venueName" className="text-xs font-semibold text-gray-700">
                    Venue Name
                  </Label>
                  <Input
                    id="venueName"
                    name="venueName"
                    value={formData.venueName || ""}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        nextButtonRef.current?.click();
                      }
                    }}
                    placeholder="e.g., Main Hall"
                    className="rounded border-gray-300 focus:border-purple-500 focus:ring-purple-500 h-10 text-sm"
                  />
                </div>
              </div>

              {/* Event Structure Selection */}
              <div className="space-y-3 pt-2">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Event Structure</h3>
                  <p className="text-xs text-gray-600 mb-3">Choose whether this is a standalone event or contains multiple sub-events under one program.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Single Event Card */}
                  <div
                    onClick={() => handleFormChange({ eventStructure: "single" })}
                    className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.eventStructure === "single"
                        ? "border-purple-500 bg-purple-50 shadow-lg"
                        : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <CalendarDays className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Single Event</h4>
                        <p className="text-xs text-gray-600">One standalone event</p>
                      </div>
                    </div>
                  </div>

                  {/* Multi Event Card */}
                  <div
                    onClick={() => handleFormChange({ eventStructure: "multi" })}
                    className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.eventStructure === "multi"
                        ? "border-purple-500 bg-purple-50 shadow-lg"
                        : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Layers className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Multi Event</h4>
                        <p className="text-xs text-gray-600">Sub-events under one program</p>
                      </div>
                    </div>
                  </div>

                  {/* Sub Events Toggle Card - Only show for multi-event mode */}
                  {formData.eventStructure === "multi" && (
                    <div className="relative p-6 rounded-xl border-2 border-gray-200 bg-white flex flex-col justify-between">
                      <div className="flex flex-col items-center text-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Plus className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Enable Sub Events</h4>
                          <p className="text-xs text-gray-600">Add individual events</p>
                        </div>
                      </div>
                      <div className="flex justify-center pt-2">
                        <Switch
                          checked={formData.enableSubEvents || false}
                          onCheckedChange={(checked) => handleFormChange({ enableSubEvents: checked })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="px-4 py-2 text-xs font-medium h-9"
                >
                  Cancel
                </Button>

                <Button
                  ref={nextButtonRef}
                  onClick={() => setProgramStep("advanced")}
                  className="px-4 py-2 text-xs font-medium bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white h-9"
                >
                  Next
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── Step 2: Advanced Settings & Full Program Form ── */}
      {(programStep === "advanced") && (
        <div className="px-8 py-6 max-w-full min-h-screen">
          {/* Editing Mode Indicator */}
          {isEditing && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg w-fit mb-6">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Editing Mode</span>
            </div>
          )}

          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Program Configuration</h1>
            <p className="text-sm text-gray-600 mt-1">Set up your event details, automation, and organization settings</p>
          </div>

          {/* ═══ Dynamic Configuration Section ═══ */}
          <div className="space-y-4 pb-6 border-b-2 border-gray-200">
            {/* Template Selection */}
            {showTemplateMenu && (
              <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr]">
                <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-sm mb-3 text-gray-900">Quick Start with Templates</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {["symposium", "workshop", "hackathon"].map((template) => (
                      <Button
                        key={template}
                        onClick={() => applyTemplate(template as any)}
                        className="min-h-[110px] py-6 flex flex-col items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 text-sm shadow-sm"
                      >
                        <span className="font-semibold text-base capitalize">{template}</span>
                        <span className="text-sm text-gray-600">Template</span>
                      </Button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowTemplateMenu(false)}
                    className="mt-2 text-xs text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Skip templates →
                  </button>
                </Card>

                {!isCoordinator && (
                <Card className="p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-sm text-gray-900">Assign Event</h3>
                      <p className="text-xs text-gray-600">Choose an available head connection.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate("/settings?tab=connection")}
                      className="text-xs font-medium text-purple-600 hover:text-purple-700"
                    >
                      Head Connection
                    </button>
                  </div>

                  <Select
                    value={selectedHeadId ?? ""}
                    onValueChange={(value) => setSelectedHeadId(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select head connection" />
                    </SelectTrigger>
                    <SelectContent>
                      {headAccounts.length > 0 ? (
                        headAccounts.map((head) => (
                          <SelectItem key={head.id} value={head.id}>
                            {head.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-gray-500">
                          No head connections available
                        </div>
                      )}
                    </SelectContent>
                  </Select>

                  {selectedHead ? (
                    <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-3">
                      <p className="text-sm font-semibold text-gray-900">{selectedHead.name}</p>
                      <p className="text-xs text-gray-500">{selectedHead.email}</p>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                      Select a head connection to view details.
                    </div>
                  )}

                  <Button
                    onClick={assignSelectedHead}
                    disabled={!selectedHead}
                    className="w-full mt-4"
                  >
                    Assign Work
                  </Button>

                  {assignedHead && (
                    <div className="mt-3 rounded-xl bg-green-50 border border-green-100 p-3 text-sm text-green-700">
                      Assigned to <span className="font-semibold">{assignedHead.name}</span>.
                    </div>
                  )}
                </Card>
                )}
              </div>
            )}

            {showThemeCard && (
              <div
                className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 px-4 py-10"
                onClick={() => setShowThemeCard(false)}
              >
                <div
                  className="w-full max-w-xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Event Theme</h3>
                      <p className="text-sm text-gray-500">Upload a logo and choose a solid or gradient color theme.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowThemeCard(false)}
                      className="rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-500 hover:bg-gray-100"
                    >
                      Close
                    </button>
                  </div>
                  <div className="max-h-[75vh] overflow-y-auto px-5 py-4">
                    <CreateProgramForm
                      formData={formData}
                      onFormChange={handleFormChange}
                      sections="theme-only"
                      onLogoSelect={setLogoFile}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-gray-200 px-5 py-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowThemeCard(false)}
                      className="text-sm px-4 py-2"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        setShowThemeCard(false);
                        toast({
                          title: "Theme Saved",
                          description: "Your event theme has been saved.",
                        });
                      }}
                      className="text-sm px-4 py-2 bg-purple-600 text-white hover:bg-purple-700"
                    >
                      Save Theme
                    </Button>
                  </div>
                </div>
              </div>
            )}


          </div>

          {/* ═══ Program Configuration Grid ═══ */}
          {(formData.eventStructure === "single" || formData.eventStructure === "multi" || (formData.subEvents && formData.subEvents.length > 0)) ? (
            <div className="pt-6 space-y-6">
              {/* ─── Main Dashboard Grid: 3 Columns ─── */}
              {/* 
                FIX EXPLANATION:
                - Removed overflow-y-auto from grid column (creates stacking context)
                - Each card is now self-contained at the same stacking level
                - Cards don't overlap; scrolling happens within individual cards if needed
                - Responsive: 1 col (mobile) → 3 cols (desktop)
                - Basic Information is now a proper peer card, not nested in grid column
              */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Col 1: Program Details Card (Structure + Basic Info) */}
                <div className="space-y-4">
                  <CreateProgramForm 
                    formData={formData} 
                    onFormChange={handleFormChange}
                    sections="basic-info"
                    onLogoSelect={setLogoFile}
                  />
                </div>

                {/* Col 2: Event Preview Card */}
                <Card className="bg-white rounded-lg border border-gray-200 max-h-[52rem]">
                  <div className="p-4 h-full overflow-hidden">
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Event Preview</p>
                        <p className="text-xs text-gray-500">Preview the event name card and theme.</p>
                      </div>
                      <Button
                        className="text-xs px-3 py-2 bg-purple-600 text-white hover:bg-purple-700"
                        onClick={() => setShowThemeCard((prev) => !prev)}
                      >
                        {showThemeCard ? "Hide Theme" : "Customize Theme"}
                      </Button>
                    </div>
                    <EventPreviewCard formData={formData} />
                  </div>
                </Card>

                {/* Col 3: Automation Panel */}
                <Card className="bg-white rounded-lg border border-gray-200 max-h-[52rem] overflow-hidden relative z-0">
                  <div className="p-4 h-full overflow-y-auto">
                    <AutomationPanel
                      automation={formData.automation || {}}
                      onAutomationChange={handleAutomationChange}
                    />
                  </div>
                </Card>
              </div>

              
              <Card className="p-4 bg-white rounded-lg border border-gray-200">
                <CreateProgramForm 
                  formData={formData} 
                  onFormChange={handleFormChange}
                  sections="organizer-registration"
                  coordinatorHeads={coordinatorHeads}
                  selectedCoordinatorId={formData.selectedCoordinatorId || ""}
                  onCoordinatorChange={handleCoordinatorSelect}
                  onLogoSelect={setLogoFile}
                />
              </Card>
            </div>
          ) : null}

          {/* Bottom Action Buttons */}
          <div className="flex gap-3 justify-end pt-5 border-t border-gray-200 mt-5">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="px-6 py-2 text-xs font-medium h-9"
              disabled={isSaving}
            >
              Cancel
            </Button>

            <Button
              onClick={handleSaveDraft}
              variant="secondary"
              className="px-6 py-2 text-xs font-medium flex items-center gap-2 h-9"
              disabled={isSaving}
            >
              <Save className="w-3 h-3" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      )}

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Cancel Program Creation?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to leave? Any unsaved changes will be lost.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => navigate("/programs")}
              className="bg-red-600 hover:bg-red-700"
            >
              Leave
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CreateProgramPage;
