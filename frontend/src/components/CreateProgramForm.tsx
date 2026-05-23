import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Palette, Upload, Plus, Trash2, CalendarDays, Layers, Search, Edit2, Save, X, CheckCircle2, Copy, Calendar } from "lucide-react";
import { EventProgram, SubEvent, usePrograms } from "@/contexts/ProgramContext";
import subOrganizerApi from "@/lib/subOrganizerApi";
import OrganizerSelector, { Organizer } from "@/components/OrganizerSelector";
import { v4 as uuidv4 } from "uuid";

interface CreateProgramFormProps {
  onFormChange: (program: Partial<EventProgram>) => void;
  formData: Partial<EventProgram>;
  isStructureLocked?: boolean;
  sections?: "structure-only" | "basic-info" | "organizer-registration" | "theme-only" | "all";
  coordinatorHeads?: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
  }>;
  selectedCoordinatorId?: string;
  onCoordinatorChange?: (id: string) => void;
  onLogoSelect?: (file: File | null) => void;
}

const CreateProgramForm: React.FC<CreateProgramFormProps> = ({ onFormChange, formData, isStructureLocked = false, sections = "all", coordinatorHeads = [], selectedCoordinatorId = "", onCoordinatorChange, onLogoSelect }) => {
  const { programs } = usePrograms();

  // Tracks which sub-event's name field has the autocomplete dropdown open
  const [activeSuggestId, setActiveSuggestId] = useState<string | null>(null);
  
  // Edit mode state
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<EventProgram>>({});
  const [showPreEventOverlay, setShowPreEventOverlay] = useState(false);
  
  // Sub-organizers state
  const [subOrganizers, setSubOrganizers] = useState<Array<{ id: string; name: string; email: string; phone: string }>>([]);
  const [loadingSubOrganizers, setLoadingSubOrganizers] = useState(false);

  // Collect all event names from every previously saved program's sub-events
  const existingEventNames = useMemo(() => {
    const names = new Set<string>();
    programs.forEach((p) => {
      p.subEvents?.forEach((e) => {
        if (e.name?.trim()) names.add(e.name.trim());
      });
    });
    return Array.from(names);
  }, [programs]);

  // Fetch sub-organizers when selectedCoordinatorId changes
  useEffect(() => {
    const fetchSubOrganizers = async () => {
      if (!selectedCoordinatorId) {
        setSubOrganizers([]);
        return;
      }

      try {
        setLoadingSubOrganizers(true);
        const response = await subOrganizerApi.getSubOrganizersByCoordinator(selectedCoordinatorId);
        
        if (response.data.success && response.data.data) {
          const organizers = response.data.data.map((org: any) => ({
            id: org._id,
            name: org.name,
            email: org.email,
            phone: org.phone,
          }));
          setSubOrganizers(organizers);
        } else {
          setSubOrganizers([]);
        }
      } catch (error) {
        console.error('Failed to fetch sub-organizers:', error);
        setSubOrganizers([]);
      } finally {
        setLoadingSubOrganizers(false);
      }
    };

    fetchSubOrganizers();
  }, [selectedCoordinatorId]);

  const getSuggestions = (query: string) => {
    if (!query.trim()) return existingEventNames;
    return existingEventNames.filter((n) =>
      n.toLowerCase().includes(query.toLowerCase()) && n !== query
    );
  };

  // Get color suggestions and gradients based on event type
  const getColorSuggestions = (eventType?: string) => {
    const colorMap: Record<string, { suggestedColors: string[]; gradients: Array<{ name: string; start: string; end: string; gradient: string }> }> = {
      symposium: {
        suggestedColors: ["#1E40AF", "#0369A1", "#4B5563", "#2D3748", "#5B21B6"],
        gradients: [
          { name: "Academic Blue", start: "#1E40AF", end: "#0369A1", gradient: "from-blue-800 to-cyan-600" },
          { name: "Professional Purple", start: "#5B21B6", end: "#1E40AF", gradient: "from-purple-700 to-blue-800" },
          { name: "Steel Gray", start: "#4B5563", end: "#2D3748", gradient: "from-gray-600 to-gray-800" },
          { name: "Navy Slate", start: "#001F3F", end: "#4B5563", gradient: "from-blue-900 to-gray-600" },
        ],
      },
      workshop: {
        suggestedColors: ["#F97316", "#D97706", "#10B981", "#8B5CF6", "#EC4899"],
        gradients: [
          { name: "Warm Orange", start: "#F97316", end: "#D97706", gradient: "from-orange-500 to-amber-600" },
          { name: "Nature Green", start: "#10B981", end: "#6EE7B7", gradient: "from-emerald-500 to-emerald-300" },
          { name: "Creative Purple", start: "#8B5CF6", end: "#EC4899", gradient: "from-violet-500 to-pink-500" },
          { name: "Energetic Mix", start: "#F97316", end: "#8B5CF6", gradient: "from-orange-500 to-violet-500" },
        ],
      },
      hackathon: {
        suggestedColors: ["#DC2626", "#EC4899", "#7C3AED", "#2563EB", "#19E3F8"],
        gradients: [
          { name: "Electric Red", start: "#DC2626", end: "#EF4444", gradient: "from-red-600 to-red-500" },
          { name: "Neon Pink", start: "#EC4899", end: "#F43F5E", gradient: "from-pink-500 to-rose-500" },
          { name: "Cyber Purple", start: "#7C3AED", end: "#A855F7", gradient: "from-violet-600 to-violet-500" },
          { name: "Lightning Bolt", start: "#DC2626", end: "#7C3AED", gradient: "from-red-600 to-violet-600" },
        ],
      },
      webinar: {
        suggestedColors: ["#0EA5E9", "#06B6D4", "#3B82F6", "#0369A1", "#00D9FF"],
        gradients: [
          { name: "Sky Blue", start: "#0EA5E9", end: "#06B6D4", gradient: "from-sky-500 to-cyan-500" },
          { name: "Ocean Flow", start: "#0369A1", end: "#00D9FF", gradient: "from-cyan-800 to-cyan-300" },
          { name: "Digital Blue", start: "#3B82F6", end: "#0EA5E9", gradient: "from-blue-500 to-sky-500" },
          { name: "Tech Cyan", start: "#06B6D4", end: "#10B981", gradient: "from-cyan-500 to-emerald-500" },
        ],
      },
      conference: {
        suggestedColors: ["#1F2937", "#4B5563", "#6B7280", "#1E3A8A", "#4C1D95"],
        gradients: [
          { name: "Corporate Slate", start: "#1F2937", end: "#4B5563", gradient: "from-gray-800 to-gray-600" },
          { name: "Executive Blue", start: "#1E3A8A", end: "#1F2937", gradient: "from-blue-900 to-gray-800" },
          { name: "Elegant Purple", start: "#4C1D95", end: "#1E3A8A", gradient: "from-purple-900 to-blue-900" },
          { name: "Formal Charcoal", start: "#111827", end: "#374151", gradient: "from-gray-900 to-gray-600" },
        ],
      },
      meetup: {
        suggestedColors: ["#EF4444", "#F97316", "#FBBF24", "#10B981", "#14B8A6"],
        gradients: [
          { name: "Warm Sunset", start: "#EF4444", end: "#F97316", gradient: "from-red-500 to-orange-500" },
          { name: "Golden Hour", start: "#FBBF24", end: "#F59E0B", gradient: "from-amber-300 to-amber-500" },
          { name: "Fresh Green", start: "#10B981", end: "#14B8A6", gradient: "from-emerald-500 to-teal-500" },
          { name: "Vibrant Social", start: "#EC4899", end: "#F97316", gradient: "from-pink-500 to-orange-500" },
        ],
      },
      training: {
        suggestedColors: ["#6366F1", "#8B5CF6", "#3B82F6", "#10B981", "#F59E0B"],
        gradients: [
          { name: "Learning Indigo", start: "#6366F1", end: "#8B5CF6", gradient: "from-indigo-500 to-violet-500" },
          { name: "Growth Green", start: "#10B981", end: "#34D399", gradient: "from-emerald-500 to-emerald-400" },
          { name: "Productive Blue", start: "#3B82F6", end: "#6366F1", gradient: "from-blue-500 to-indigo-500" },
          { name: "Achievement Gold", start: "#F59E0B", end: "#FBBF24", gradient: "from-amber-500 to-amber-300" },
        ],
      },
      seminar: {
        suggestedColors: ["#4B5563", "#6B7280", "#2563EB", "#7C3AED", "#8B5CF6"],
        gradients: [
          { name: "Academic Gray", start: "#4B5563", end: "#6B7280", gradient: "from-gray-600 to-gray-500" },
          { name: "Knowledge Blue", start: "#2563EB", end: "#3B82F6", gradient: "from-blue-600 to-blue-500" },
          { name: "Intellectual Purple", start: "#7C3AED", end: "#8B5CF6", gradient: "from-violet-600 to-violet-500" },
          { name: "Classic Blue-Gray", start: "#2563EB", end: "#4B5563", gradient: "from-blue-600 to-gray-600" },
        ],
      },
    };

    return colorMap[eventType || ""] || colorMap.conference;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.currentTarget;
    onFormChange({
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    onFormChange({ [name]: value });
  };

  const handleToggle = (name: string, checked: boolean) => {
    onFormChange({ [name]: checked });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Call onLogoSelect callback to pass the File object to parent component
      if (onLogoSelect) {
        onLogoSelect(file);
      }
      
      // Convert to base64 for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        onFormChange({ eventLogo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSubEvent = () => {
    const current: SubEvent[] = formData.subEvents || [];
    onFormChange({
      subEvents: [
        ...current,
        { 
          id: uuidv4(), 
          name: "", 
          date: formData.startDate || "", 
          endDate: formData.endDate || "", 
          time: "09:00",
          venueName: formData.venueName || "",
          location: formData.location || "",
          organizerName: formData.organizerName || "",
          organizers: [{ name: "", email: "", phone: "" }], // Initialize with empty organizer
        },
      ],
    });
  };

  const handleRemoveSubEvent = (id: string) => {
    onFormChange({
      subEvents: (formData.subEvents || []).filter((s) => s.id !== id),
    });
  };

  const handleDuplicateSubEvent = (id: string) => {
    const subEventToDuplicate = (formData.subEvents || []).find((s) => s.id === id);
    if (!subEventToDuplicate) return;

    const duplicatedSubEvent: SubEvent = {
      id: uuidv4(),
      name: subEventToDuplicate.name,
      date: subEventToDuplicate.date,
      endDate: subEventToDuplicate.endDate,
      time: subEventToDuplicate.time,
      venueName: subEventToDuplicate.venueName,
      location: subEventToDuplicate.location,
      organizerName: subEventToDuplicate.organizerName,
      organizers: subEventToDuplicate.organizers?.map((org) => ({ ...org })) || [{ name: "", email: "", phone: "" }],
    };

    onFormChange({
      subEvents: [...(formData.subEvents || []), duplicatedSubEvent],
    });
  };

  const handleSubEventChange = (id: string, field: keyof SubEvent, value: string | Organizer[]) => {
    onFormChange({
      subEvents: (formData.subEvents || []).map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      ),
    });
  };

  // When user picks a suggestion, pre-fill name (and any saved details for that name)
  const handleSuggestionSelect = (subEventId: string, selectedName: string) => {
    // Find the most recent matching sub-event from saved programs to pre-fill details
    let match: SubEvent | undefined;
    for (const prog of programs) {
      const found = prog.subEvents?.find((e) => e.name === selectedName);
      if (found) match = found;
    }
    onFormChange({
      subEvents: (formData.subEvents || []).map((s) =>
        s.id === subEventId
          ? {
              ...s,
              name: selectedName,
              venueName: match?.venueName || s.venueName,
              location: match?.location || s.location,
              organizerName: match?.organizerName || s.organizerName,
            }
          : s
      ),
    });
    setActiveSuggestId(null);
  };

  // Edit mode handlers
  const handleEditSection = (section: string) => {
    setEditData({
      eventName: formData.eventName,
      eventType: formData.eventType,
      programCategory: formData.programCategory,
      organizerName: formData.organizerName,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      startDate: formData.startDate,
      endDate: formData.endDate,
      time: formData.time,
      venueName: formData.venueName,
      location: formData.location,
    });
    setEditingSection(section);
  };

  const handleSaveEdit = () => {
    onFormChange(editData);
    setEditingSection(null);
  };

  const handleCancelEdit = () => {
    setEditData({});
    setEditingSection(null);
  };

  const handleEditChange = (field: string, value: string) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const createDefaultSubEvent = () => ({
    id: uuidv4(),
    name: "",
    date: formData.startDate || "",
    endDate: "",
    time: "09:00",
    venueName: formData.defaultVenueName || "",
    organizerName: formData.organizerName || "",
    organizers: [{ name: "", email: "", phone: "" }], // Initialize with empty organizer
    location: formData.defaultLocation || "",
  });

  const handleUseDefaultVenueToggle = (enabled: boolean) => {
    const updatedSubEvents = enabled
      ? (formData.subEvents || []).map((event) => ({
          ...event,
          venueName: formData.defaultVenueName || event.venueName,
          location: formData.defaultLocation || event.location,
        }))
      : formData.subEvents;

    onFormChange({
      useDefaultVenueLocation: enabled,
      subEvents: updatedSubEvents,
    });
  };

  const handleDefaultVenueValueChange = (field: "defaultVenueName" | "defaultLocation", value: string) => {
    const changes: Partial<EventProgram> = { [field]: value };
    if (formData.useDefaultVenueLocation) {
      changes.subEvents = (formData.subEvents || []).map((event) => ({
        ...event,
        [field === "defaultVenueName" ? "venueName" : "location"]: value,
      }));
    }
    onFormChange(changes);
  };

  const applyCoordinatorSelection = (id: string) => {
    if (!id) {
      onFormChange({ selectedCoordinatorId: "", organizerName: "", contactEmail: "", contactPhone: "" });
      return;
    }
    const selected = coordinatorHeads.find((head) => head.id === id);
    if (!selected) return;
    onFormChange({
      selectedCoordinatorId: id,
      organizerName: selected.name,
      contactEmail: selected.email,
      contactPhone: selected.phone,
    });
    if (onCoordinatorChange) onCoordinatorChange(id);
  };

  return (
    <>
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {/* Event Structure — hidden when structure was pre-selected at step 1 */}
      {!isStructureLocked && (sections === "structure-only" || sections === "all") && (
          <Card className="p-6 bg-white rounded-2xl border border-gray-200 shadow-md">
          <h3 className="font-semibold text-lg mb-1 text-gray-900">Event Structure</h3>
          <p className="text-xs text-gray-500 mb-4">Choose whether this is a standalone event or contains multiple sub-events under one program.</p>
          <div className="grid grid-cols-2 gap-4">
            {/* Single Event Option */}
            <button
              type="button"
              onClick={() => onFormChange({ eventStructure: "single", subEvents: [createDefaultSubEvent()] })}
              className={`relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all text-left ${
                (formData.eventStructure || "single") === "single"
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 bg-gray-50 hover:border-gray-300"
              }`}
            >
              <div className={`p-3 rounded-full ${(formData.eventStructure || "single") === "single" ? "bg-purple-100" : "bg-gray-100"}`}>
                <CalendarDays className={`w-5 h-5 ${(formData.eventStructure || "single") === "single" ? "text-purple-600" : "text-gray-500"}`} />
              </div>
              <div className="text-center">
                <p className={`font-semibold text-sm ${(formData.eventStructure || "single") === "single" ? "text-purple-700" : "text-gray-700"}`}>
                  Single Event
                </p>
                <p className="text-xs text-gray-500 mt-0.5">One standalone event</p>
              </div>
              {(formData.eventStructure || "single") === "single" && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-purple-500" />
              )}
            </button>

            {/* Multi Event Option */}
            <button
              type="button"
              onClick={() => onFormChange({ eventStructure: "multi", subEvents: formData.subEvents?.length ? formData.subEvents : [] })}
              className={`relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all text-left ${
                formData.eventStructure === "multi"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-gray-50 hover:border-gray-300"
              }`}
            >
              <div className={`p-3 rounded-full ${formData.eventStructure === "multi" ? "bg-blue-100" : "bg-gray-100"}`}>
                <Layers className={`w-5 h-5 ${formData.eventStructure === "multi" ? "text-blue-600" : "text-gray-500"}`} />
              </div>
              <div className="text-center">
                <p className={`font-semibold text-sm ${formData.eventStructure === "multi" ? "text-blue-700" : "text-gray-700"}`}>
                  Multi Event
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Sub-events under one program</p>
              </div>
              {formData.eventStructure === "multi" && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-blue-500" />
              )}
            </button>
          </div>
        </Card>
      )}

      {/* Sub Events Settings — shown after Event Structure is selected, but NOT for single events */}
      {formData.eventStructure && formData.eventStructure !== "single" && (sections === "structure-only" || sections === "all") && (
        <Card className="p-6 bg-white rounded-2xl border border-gray-200 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg text-gray-900">Sub Events</h3>
              <p className="text-xs text-gray-500 mt-0.5">Enable sub-events to add individual events under this program</p>
            </div>
            <div className="flex items-center gap-3">
              <Label className="text-sm font-medium text-gray-700">Enable Sub Events</Label>
              <Switch
                checked={formData.enableSubEvents || false}
                onCheckedChange={(checked) => onFormChange({ enableSubEvents: checked })}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Basic Information */}
      {(sections === "basic-info" || sections === "all") && (
        <Card className={`pt-2 px-4 pb-6 bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-300 relative z-10 mb-4`}>
          <div className={`space-y-4 transition-all duration-300 ${
            (formData.subEvents?.length ?? 0) <= 2 ? 'pb-32' : 'pb-0'
          }`}>
            {/* Header with Event Count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-base text-gray-900">Basic Information</h3>
                {formData.subEvents && formData.subEvents.length > 0 && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                    {formData.subEvents.length} Events
                  </span>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                {editingSection !== "basic" && (
                  <Button
                    onClick={() => handleEditSection("basic")}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 h-8 text-xs"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </Button>
                )}
                {formData.eventStructure === "multi" && (
                  <Button
                    onClick={() => {
                      if (!formData.enableSubEvents) {
                        onFormChange({
                          enableSubEvents: true,
                          subEvents: formData.subEvents && formData.subEvents.length > 0 ? formData.subEvents : [createDefaultSubEvent()],
                        });
                      }
                      setShowPreEventOverlay(true);
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-xs text-slate-600 hover:text-slate-900"
                  >
                    Pre-Event Settings
                  </Button>
                )}
              </div>
            </div>

            {editingSection === "basic" ? (
              <div className="space-y-3 pb-4 border-b border-gray-200">
                <div>
                  <Label className="text-xs font-medium text-gray-700">Event Name *</Label>
                  <Input
                    placeholder="Enter event name"
                    value={editData.eventName || ""}
                    onChange={(e) => handleEditChange("eventName", e.target.value)}
                    className="mt-1 text-sm h-8"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium text-gray-700">Event Type *</Label>
                    {editData.eventType && formData.eventStructure ? (
                      <div className="mt-1 h-8 text-sm px-3 py-2 border border-gray-200 rounded-md bg-gray-50 flex items-center capitalize font-semibold text-gray-900">
                        {editData.eventType}
                      </div>
                    ) : (
                      <Select value={editData.eventType || ""} onValueChange={(v) => handleEditChange("eventType", v)}>
                        <SelectTrigger className="mt-1 h-8 text-sm">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="symposium">Symposium</SelectItem>
                          <SelectItem value="workshop">Workshop</SelectItem>
                          <SelectItem value="hackathon">Hackathon</SelectItem>
                          <SelectItem value="seminar">Seminar</SelectItem>
                          <SelectItem value="conference">Conference</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-gray-700">Category *</Label>
                    <Input
                      placeholder="e.g., Technology"
                      value={editData.programCategory || ""}
                      onChange={(e) => handleEditChange("programCategory", e.target.value)}
                      className="mt-1 text-sm h-8"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button onClick={handleCancelEdit} variant="outline" className="flex items-center gap-1 h-8 text-xs">
                    <X className="w-3 h-3" />
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit} className="flex items-center gap-1 h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white">
                    <Save className="w-3 h-3" />
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 pb-4 border-b border-gray-200">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Event Name</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{formData.eventName || "—"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 font-medium">Event Type</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5 capitalize">{formData.eventType || "—"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-600 font-medium">Category</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{formData.programCategory || "—"}</p>
                </div>
              </div>
            )}

            {/* Sub Events Section - Show for both single and multi-event programs */}
            {formData.eventStructure && (
              <>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-sm text-gray-900">Sub Events ({formData.subEvents?.length || 0})</h4>
                  {formData.eventStructure === "multi" && (
                    <Button
                      type="button"
                      onClick={handleAddSubEvent}
                      className="flex items-center gap-2 h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="w-3 h-3" />
                      Add Event
                    </Button>
                  )}
                </div>

                {formData.subEvents && formData.subEvents.length > 0 ? (
                  <div className="overflow-y-auto max-h-[470px] mt-2 pr-2">
                    <div className="space-y-4">
                    {formData.subEvents.map((subEvent, index) => (
                      <div key={subEvent.id}>
                        {/* Edit Mode - Full Form */}
                        {editingSection === `event-${subEvent.id}` ? (
                          <div className="p-2 rounded-lg border border-blue-300 bg-blue-50 space-y-1.5 shadow-sm">
                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-blue-200">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-bold">
                                  {index + 1}
                                </span>
                                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Edit Event</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleDuplicateSubEvent(subEvent.id)}
                                  className="p-1 text-blue-400 hover:text-blue-600 hover:bg-blue-100 rounded transition"
                                  title="Duplicate this event"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSubEvent(subEvent.id)}
                                  className="p-1 text-red-400 hover:text-red-600 hover:bg-red-100 rounded transition"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 gap-1.5 pt-1 border-t border-blue-200">
                              <div className="relative">
                                <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Event Name</Label>
                                <div className="relative mt-1">
                                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                                  <Input
                                    placeholder="Type to search..."
                                    value={subEvent.name}
                                    onChange={(e) => {
                                      handleSubEventChange(subEvent.id, "name", e.target.value);
                                      setActiveSuggestId(subEvent.id);
                                    }}
                                    onFocus={() => setActiveSuggestId(subEvent.id)}
                                    onBlur={() => setTimeout(() => setActiveSuggestId(null), 160)}
                                    className="text-sm h-8 pl-8 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                                  />
                                </div>
                                {activeSuggestId === subEvent.id && getSuggestions(subEvent.name).length > 0 && (
                                  <div className="absolute left-0 right-0 top-full z-20 mt-1 bg-white rounded border border-gray-200 shadow-md max-h-32 overflow-y-auto">
                                    {getSuggestions(subEvent.name).map((name) => (
                                      <button
                                        key={name}
                                        type="button"
                                        onMouseDown={() => handleSuggestionSelect(subEvent.id, name)}
                                        className="w-full text-left px-2.5 py-1.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0"
                                      >
                                        <span className="font-medium">{name}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="grid grid-cols-4 gap-1">
                                <div>
                                  <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Date From</Label>
                                  <Input
                                    type="date"
                                    value={subEvent.date}
                                    onChange={(e) => handleSubEventChange(subEvent.id, "date", e.target.value)}
                                    className="mt-1 h-8 text-sm border-blue-200 focus:border-blue-500"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Date To</Label>
                                  <Input
                                    type="date"
                                    value={subEvent.endDate || ""}
                                    onChange={(e) => handleSubEventChange(subEvent.id, "endDate", e.target.value)}
                                    className="mt-1 h-8 text-sm border-blue-200 focus:border-blue-500"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Time</Label>
                                  <Input
                                    type="time"
                                    value={subEvent.time}
                                    onChange={(e) => handleSubEventChange(subEvent.id, "time", e.target.value)}
                                    className="mt-1 h-8 text-sm border-blue-200 focus:border-blue-500"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Venue</Label>
                                  <Input
                                    placeholder="Venue name"
                                    value={subEvent.venueName || ""}
                                    onChange={(e) => handleSubEventChange(subEvent.id, "venueName", e.target.value)}
                                    disabled={formData.useDefaultVenueLocation || false}
                                    onDoubleClick={() => {
                                      if (formData.useDefaultVenueLocation) {
                                        onFormChange({ useDefaultVenueLocation: false });
                                      }
                                    }}
                                    className="mt-1 h-8 text-sm border-blue-200 focus:border-blue-500"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-1">
                                <div>
                                  <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Location</Label>
                                  <Input
                                    placeholder="City, Country"
                                    value={subEvent.location || ""}
                                    onChange={(e) => handleSubEventChange(subEvent.id, "location", e.target.value)}
                                    disabled={formData.useDefaultVenueLocation || false}
                                    onDoubleClick={() => {
                                      if (formData.useDefaultVenueLocation) {
                                        onFormChange({ useDefaultVenueLocation: false });
                                      }
                                    }}
                                    className="mt-1 h-8 text-sm border-blue-200 focus:border-blue-500"
                                  />
                                </div>
                              </div>

                              {/* Organizers Section */}
                              <div className="mt-2 pt-2 border-t border-blue-200">
                                <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Event Organizers</Label>
                                <div className="mt-1.5">
                                  <OrganizerSelector
                                    organizers={subEvent.organizers || []}
                                    onOrganizersChange={(orgs) =>
                                      handleSubEventChange(subEvent.id, "organizers", orgs)
                                    }
                                    label=""
                                    showAddButton={true}
                                    maxOrganizers={5}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-1 justify-end pt-1 border-t border-blue-200 mt-1">
                              <Button onClick={() => setEditingSection(null)} variant="outline" className="flex items-center gap-1 h-7 px-2 text-xs">
                                <X className="w-3 h-3" />
                                Cancel
                              </Button>
                              <Button onClick={() => setEditingSection(null)} className="flex items-center gap-1 h-7 px-2 text-xs bg-blue-600 hover:bg-blue-700 text-white">
                                <Save className="w-3 h-3" />
                                Done
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => setEditingSection(`event-${subEvent.id}`)}
                            className="p-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-blue-300 cursor-pointer transition-all group shadow-xs"
                          >
                            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-bold">
                                  {index + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="text-base font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                    {subEvent.name || `Event ${index + 1}`}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDuplicateSubEvent(subEvent.id);
                                  }}
                                  className="p-1 text-blue-400 hover:text-blue-600 hover:bg-blue-100 rounded opacity-0 group-hover:opacity-100 transition-all"
                                  title="Duplicate this event"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveSubEvent(subEvent.id);
                                  }}
                                  className="p-1 text-red-400 hover:text-red-600 hover:bg-red-100 rounded opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="p-1.5 rounded bg-gray-50">
                                <p className="text-gray-500 font-semibold uppercase tracking-wide text-xs mb-1">Date</p>
                                <p className="text-gray-900 font-semibold">{subEvent.date || '—'}</p>
                                {subEvent.endDate && subEvent.endDate !== subEvent.date && (
                                  <p className="text-gray-700 text-sm">to {subEvent.endDate}</p>
                                )}
                                {subEvent.time && <p className="text-gray-700 text-sm">{subEvent.time}</p>}
                              </div>
                              <div className="p-1.5 rounded bg-gray-50">
                                <p className="text-gray-500 font-semibold uppercase tracking-wide text-xs mb-1">Venue</p>
                                <p className="text-gray-900 font-semibold truncate">{subEvent.venueName || '—'}</p>
                              </div>
                              <div className="p-1.5 rounded bg-gray-50">
                                <p className="text-gray-500 font-semibold uppercase tracking-wide text-xs mb-1">Location</p>
                                <p className="text-gray-900 font-semibold truncate">{subEvent.location || '—'}</p>
                              </div>
                              <div className="p-1.5 rounded bg-gray-50">
                                <p className="text-gray-500 font-semibold uppercase tracking-wide text-xs mb-1">Organizers</p>
                                {subEvent.organizers && subEvent.organizers.length > 0 ? (
                                  <div className="space-y-0.5">
                                    {subEvent.organizers.map((org, orgIdx) => (
                                      <p key={orgIdx} className="text-xs font-semibold text-gray-700 truncate">
                                        {org.name || "—"}
                                      </p>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-gray-900 font-semibold truncate">{subEvent.organizerName || '—'}</p>
                                )}
                              </div>
                            </div>

                            <p className="text-xs text-gray-400 mt-3 group-hover:text-blue-500 transition-colors">Click to edit</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                ) : (
                  <div className="py-4 text-center">
                    <Layers className="w-5 h-5 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">No events added yet</p>
                    <p className="text-xs text-gray-400 mt-1">Click "Add Event" to get started</p>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      )}

      {/* Removed embedded Per-Event settings from Basic Information section */}

      {formData.enableSubEvents && (sections === "structure-only" || sections === "all") && formData.subEvents && formData.subEvents.length > 0 && (
        <Card className="bg-transparent rounded-lg border border-gray-200 shadow-none overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-transparent border-b border-gray-200">
            <div>
              <h3 className="font-semibold text-base text-gray-900">Event Summary</h3>
              <p className="text-xs text-gray-500 mt-0.5">Manage individual events under this program</p>
            </div>
          </div>

          <div className="pt-4">
            <div className="overflow-x-auto">
              <div className="flex gap-3 min-w-min">
                {(formData.subEvents || []).map((subEvent, index) => (
                  <div
                    key={subEvent.id}
                    className="flex-shrink-0 w-[150px] p-2 rounded-lg border border-blue-100 bg-blue-50 hover:bg-blue-100 transition"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <p className="text-xs font-semibold text-blue-900 truncate">
                        Event {index + 1}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-blue-900 truncate">
                        {subEvent.name.trim() || `Event ${index + 1}`}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">• TBD</p>
                    </div>
                  </div>
                ))}

                {/* Add Event Button */}
                <button className="flex-shrink-0 w-[150px] p-2 rounded-lg border-2 border-dashed border-gray-300 bg-white hover:border-purple-500 hover:bg-purple-50 transition flex flex-col items-center justify-center gap-1 group">
                  <Plus className="w-4 h-4 text-gray-400 group-hover:text-purple-500" />
                  <p className="text-xs font-semibold text-gray-600 group-hover:text-purple-600">Add Event</p>
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {(sections === "organizer-registration" || sections === "all") && (
        <Card className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="space-y-4">
            {/* ═══ COORDINATOR DROPDOWN & ORGANIZER DETAILS ═══ */}
            {/* Header with Event Count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-base text-gray-900">Organizer Details</h3>
                {formData.subEvents && formData.subEvents.length > 0 && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                    {formData.subEvents.length} Events
                  </span>
                )}
              </div>
              {editingSection !== "organizer" && (
                <Button
                  onClick={() => handleEditSection("organizer")}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 h-8 text-xs"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </Button>
              )}
            </div>

            <div className="space-y-3 pb-4 border-b border-gray-200">
              {editingSection === "organizer" ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium text-gray-700">Organizer Name *</Label>
                    <Input
                      placeholder="Enter organizer name"
                      value={editData.organizerName || ""}
                      onChange={(e) => handleEditChange("organizerName", e.target.value)}
                      className="mt-1 text-sm h-8"
                    />
                  </div>

                <div>
                  <Label className="text-xs font-medium text-gray-700">Contact Email *</Label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={editData.contactEmail || ""}
                    onChange={(e) => handleEditChange("contactEmail", e.target.value)}
                    className="mt-1 text-sm h-8"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button onClick={handleCancelEdit} variant="outline" className="flex items-center gap-1 h-8 text-xs">
                    <X className="w-3 h-3" />
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit} className="flex items-center gap-1 h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white">
                    <Save className="w-3 h-3" />
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 pb-4 border-b border-gray-200">
                <div>
                  <p className="text-xs text-gray-600 font-medium">Organizer Name</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{formData.organizerName || "—"}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-600 font-medium">Email</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5 truncate">{formData.contactEmail || "—"}</p>
                </div>
              </div>
            )}
            </div>

            {/* Event Organizers Section */}
            {formData.enableSubEvents && (formData.subEvents && formData.subEvents.length > 0) && (
              <>
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-sm text-gray-900 mb-3">Event Organizers ({formData.subEvents.length})</h4>
                  <div className={`${formData.subEvents.length > 3 ? 'max-h-48 overflow-y-auto scrollbar-hide' : ''}`}>
                    <div className="space-y-2">
                      {(formData.subEvents || []).map((subEvent, index) => (
                        <div key={subEvent.id} className="p-2.5 rounded border border-gray-200 bg-gray-50">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-600 font-medium">Event {index + 1}</p>
                              {subEvent.organizers && subEvent.organizers.length > 0 ? (
                                <div className="mt-1 space-y-1">
                                  {subEvent.organizers.map((org, orgIdx) => (
                                    <p key={orgIdx} className="text-xs font-semibold text-gray-700 truncate">
                                      {org.name || "—"}
                                    </p>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm font-semibold text-gray-900 mt-0.5 truncate">{subEvent.organizerName || "—"}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Registration Settings - Dynamic with Sub Events */}
      {(sections === "organizer-registration" || sections === "all") && (
        <Card className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="space-y-4">
            {/* ═══ DEFAULT VENUE/LOCATION & REGISTRATION SETTINGS ═══ */}
            {/* Header with Event Count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-base text-gray-900">Registration Settings</h3>
                {formData.subEvents && formData.subEvents.length > 0 && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                    {formData.subEvents.length} Events
                  </span>
                )}
              </div>
              {editingSection !== "registration" && (
                <Button
                  onClick={() => handleEditSection("registration")}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 h-8 text-xs"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </Button>
              )}
            </div>

            {editingSection === "registration" ? (
              <div className="space-y-3 pb-4 border-b border-gray-200">
                <div>
                  <Label className="text-xs font-medium text-gray-700">Start Date</Label>
                  <Input
                    type="date"
                    value={editData.startDate || ""}
                    onChange={(e) => handleEditChange("startDate", e.target.value)}
                    className="mt-1 text-sm h-8"
                  />
                </div>

                <div>
                  <Label className="text-xs font-medium text-gray-700">End Date</Label>
                  <Input
                    type="date"
                    value={editData.endDate || ""}
                    onChange={(e) => handleEditChange("endDate", e.target.value)}
                    className="mt-1 text-sm h-8"
                  />
                </div>

                <div>
                  <Label className="text-xs font-medium text-gray-700">Start Time</Label>
                  <Input
                    type="time"
                    value={editData.time || "09:00"}
                    onChange={(e) => handleEditChange("time", e.target.value)}
                    className="mt-1 text-sm h-8"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <div>
                    <Label className="text-xs font-medium text-gray-700">Use default venue + location</Label>
                    <p className="text-xs text-gray-500">Enable shared venue and location for all sub-events.</p>
                  </div>
                  <Switch
                    checked={formData.useDefaultVenueLocation || false}
                    onCheckedChange={(checked) => handleUseDefaultVenueToggle(checked)}
                  />
                </div>

                {formData.useDefaultVenueLocation && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-medium text-gray-700">Default Venue Name</Label>
                      <Input
                        placeholder="Default venue"
                        value={formData.defaultVenueName || ""}
                        onChange={(e) => handleDefaultVenueValueChange("defaultVenueName", e.target.value)}
                        className="mt-1 text-sm h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-gray-700">Default Location</Label>
                      <Input
                        placeholder="Default location"
                        value={formData.defaultLocation || ""}
                        onChange={(e) => handleDefaultVenueValueChange("defaultLocation", e.target.value)}
                        className="mt-1 text-sm h-8"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 justify-end pt-2">
                  <Button onClick={handleCancelEdit} variant="outline" className="flex items-center gap-1 h-8 text-xs">
                    <X className="w-3 h-3" />
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit} className="flex items-center gap-1 h-8 text-xs bg-orange-600 hover:bg-orange-700">
                    <Save className="w-3 h-3" />
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 pb-4 border-b border-gray-200">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Start Date</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{formData.startDate || "—"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 font-medium">End Date</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{formData.endDate || "—"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Start Time</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{formData.time || "—"}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 font-medium">Default Venue</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{formData.defaultVenueName || "—"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-600 font-medium">Default Location</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{formData.defaultLocation || "—"}</p>
                </div>
                {formData.useDefaultVenueLocation && (
                  <div className="rounded-xl border border-green-100 bg-green-50 p-3 text-sm text-green-700">
                    Default venue and location are applied to all sub-events.
                  </div>
                )}
              </div>
            )}

            {/* Sub Events Registration Summary - If Multiple Events */}
            {formData.enableSubEvents && (formData.subEvents && formData.subEvents.length > 1) && (
              <div className="space-y-3 pt-2">
                <h4 className="font-medium text-sm text-gray-900">Event Registration Schedule</h4>
                <div className="space-y-2">
                  {(formData.subEvents || []).map((subEvent, index) => (
                    <div key={subEvent.id} className="p-3 rounded-lg border border-orange-100 bg-orange-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-600">Event {index + 1}</p>
                          <p className="text-sm font-semibold text-gray-900 mt-0.5">{subEvent.name || "—"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-600 font-medium">Date & Venue</p>
                          <p className="text-xs font-mono text-gray-900 mt-0.5">{subEvent.date || "—"} @ {subEvent.venueName || "TBD"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

        {/* Removed embedded Per-Event settings from organizer registration section */}
          </div>
        </Card>
      )}

      {/* Event Theme */}
      {(sections === "theme-only" || sections === "all") && (
        <Card className="p-6 bg-white rounded-2xl border border-gray-200 shadow-md">
          <h3 className="font-semibold text-lg mb-4 text-gray-900">Event Theme</h3>
        
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-300 rounded-lg p-4 mb-6">
          <p className="text-sm font-semibold text-gray-900">Choose Your Theme Style</p>
        </div>

        {/* Two-Column Layout - Static and Gradient Side by Side */}
        <div className="grid grid-cols-2 gap-6">
          {/* Static Color Section */}
          <div className={`space-y-4 p-5 rounded-xl border-2 transition-all ${
            ((formData as any).themeType || "static") === "static"
              ? "bg-purple-50 border-purple-400 ring-2 ring-purple-200 shadow-md"
              : "bg-gray-50 border-gray-200"
          }`}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Palette className="w-4 h-4" /> Static Color
                </Label>
                {((formData as any).themeType || "static") === "static" && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-200 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-purple-600" />
                    <span className="text-xs font-semibold text-purple-600">Selected</span>
                  </div>
                )}
              </div>
              
              {/* Suggested Colors Grid */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-600 mb-2">Suggestions for {formData.eventType || "your event"}</p>
                <div className="grid grid-cols-3 gap-2">
                  {getColorSuggestions(formData.eventType).suggestedColors.map((color) => (
                    <button
                      key={`static-${color}`}
                      onClick={() => onFormChange({ themeColor: color, themeType: "static" })}
                      className={`h-10 rounded-lg border-2 transition-all ${
                        formData.themeColor === color && ((formData as any).themeType || "static") === "static"
                          ? "border-gray-900 shadow-md ring-2 ring-offset-1 ring-purple-500 scale-105"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Custom Color Picker */}
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={formData.themeColor || "#6D28D9"}
                  onChange={(e) => onFormChange({ themeColor: e.target.value, themeType: "static" })}
                  className="w-14 h-10 rounded-lg cursor-pointer border-2 border-gray-300"
                />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-600">Custom</p>
                  <p className="text-xs text-gray-700 font-mono">{formData.themeColor || "#6D28D9"}</p>
                </div>
              </div>

              {/* Color Preview */}
              <div
                className="w-full h-16 rounded-lg border-2 border-gray-300 shadow-md mt-3"
                style={{ backgroundColor: formData.themeColor || "#6D28D9" }}
              />
            </div>
          </div>

          {/* Gradient Color Section */}
          <div className={`space-y-4 p-5 rounded-xl border-2 transition-all ${
            (formData as any).themeType === "gradient"
              ? "bg-blue-50 border-blue-400 ring-2 ring-blue-200 shadow-md"
              : "bg-gray-50 border-gray-200"
          }`}>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Palette className="w-4 h-4" /> Gradient Color
              </Label>
              {(formData as any).themeType === "gradient" && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-200 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-600">Selected</span>
                </div>
              )}
            </div>
            
            {/* Gradient Type Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => onFormChange({ gradientType: "linear", themeType: "gradient" })}
                className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-lg border-2 transition-all ${
                  (formData as any).gradientType !== "radial"
                    ? "border-purple-500 bg-purple-50 text-purple-700 shadow-md"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                Linear
              </button>
              <button
                onClick={() => onFormChange({ gradientType: "radial", themeType: "gradient" })}
                className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-lg border-2 transition-all ${
                  (formData as any).gradientType === "radial"
                    ? "border-purple-500 bg-purple-50 text-purple-700 shadow-md"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                Radial
              </button>
            </div>

            {/* Angle Slider */}
            {(formData as any).gradientType !== "radial" && (
              <div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-gray-700 min-w-10">Angle:</label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={(formData as any).gradientAngle || 90}
                    onChange={(e) => onFormChange({ gradientAngle: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-xs font-semibold text-gray-700 min-w-8">
                    {(formData as any).gradientAngle || 90}°
                  </span>
                </div>
              </div>
            )}

            {/* Color Stops Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Start Color */}
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">Start</p>
                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  {getColorSuggestions(formData.eventType).suggestedColors.slice(0, 4).map((color) => (
                    <button
                      key={`start-${color}`}
                      onClick={() => onFormChange({ gradientStartColor: color, themeType: "gradient" })}
                      className={`h-8 rounded-lg border-2 transition-all ${
                        (formData as any).gradientStartColor === color
                          ? "border-gray-900 shadow-md ring-1 ring-blue-500"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={(formData as any).gradientStartColor || "#1E40AF"}
                  onChange={(e) => onFormChange({ gradientStartColor: e.target.value, themeType: "gradient" })}
                  className="w-full h-7 rounded cursor-pointer border-2 border-gray-300"
                />
              </div>

              {/* End Color */}
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">End</p>
                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  {getColorSuggestions(formData.eventType).suggestedColors.slice(1, 5).map((color) => (
                    <button
                      key={`end-${color}`}
                      onClick={() => onFormChange({ gradientEndColor: color, themeType: "gradient" })}
                      className={`h-8 rounded-lg border-2 transition-all ${
                        (formData as any).gradientEndColor === color
                          ? "border-gray-900 shadow-md ring-1 ring-purple-500"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={(formData as any).gradientEndColor || "#5B21B6"}
                  onChange={(e) => onFormChange({ gradientEndColor: e.target.value, themeType: "gradient" })}
                  className="w-full h-7 rounded cursor-pointer border-2 border-gray-300"
                />
              </div>
            </div>

            {/* Gradient Preview */}
            <div
              className="w-full h-16 rounded-lg border-2 border-gray-300 shadow-md mt-3"
              style={{
                background:
                  (formData as any).gradientType === "radial"
                    ? `radial-gradient(circle, ${(formData as any).gradientStartColor || "#1E40AF"}, ${(formData as any).gradientEndColor || "#5B21B6"})`
                    : `linear-gradient(${(formData as any).gradientAngle || 90}deg, ${(formData as any).gradientStartColor || "#1E40AF"}, ${(formData as any).gradientEndColor || "#5B21B6"})`
              }}
            />
          </div>
        </div>

        {/* Event Logo */}
        <div className="mt-6">
          <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Upload className="w-4 h-4" /> Event Logo
          </Label>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="mt-2 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
          />
          {formData.eventLogo && (
            <div className="relative mt-3 inline-block">
              <img src={formData.eventLogo} alt="Event Logo" className="h-12 rounded-lg" />
              <button
                type="button"
                onClick={() => {
                  onFormChange({ eventLogo: null });
                  if (onLogoSelect) {
                    onLogoSelect(null);
                  }
                }}
                className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 shadow-sm hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Event Date Input */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Event Date
            </Label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onFormChange({ isMultiDay: false, endDate: formData.startDate || "" })}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border-2 transition-all ${
                  !formData.isMultiDay
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
              >
                Single Day
              </button>
              <button
                type="button"
                onClick={() => onFormChange({ isMultiDay: true })}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border-2 transition-all ${
                  formData.isMultiDay
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
              >
                Multiple Days
              </button>
            </div>
          </div>

          {/* Single Day Mode */}
          {!formData.isMultiDay ? (
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Event Date</p>
              <input
                type="date"
                value={formData.startDate || ""}
                onChange={(e) => onFormChange({ startDate: e.target.value, endDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ) : (
            /* Multiple Days Mode */
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">Start Date</p>
                <input
                  type="date"
                  value={formData.startDate || ""}
                  onChange={(e) => onFormChange({ startDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">End Date</p>
                <input
                  type="date"
                  value={formData.endDate || ""}
                  onChange={(e) => onFormChange({ endDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
          <p className="text-xs text-gray-600 mt-2">
            {formData.isMultiDay 
              ? "Date range will be displayed in the event preview" 
              : "This single date will be displayed in the event preview"}
          </p>
        </div>

        {/* Save Theme Section */}
      </Card>
      )}

      {showPreEventOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-5">
              <div>
                <h3 className="text-lg font-semibold text-purple-900">Pre-Event Settings</h3>
                <p className="text-sm text-purple-600">Enable pre-event details and update venue, organizer, and registration defaults.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPreEventOverlay(false)}
                className="rounded-full border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-5 p-5 overflow-y-auto">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-purple-900">Enable Sub Events</p>
                    <Switch
                      checked={formData.enableSubEvents || false}
                      onCheckedChange={(checked) => onFormChange({ enableSubEvents: checked })}
                    />
                  </div>
                  <p className="text-xs text-purple-600 mt-2">Toggle pre-event mode so you can manage sub-event venue and organizer details.</p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-purple-900">Use Default Venue + Location</p>
                    <Switch
                      checked={formData.useDefaultVenueLocation || false}
                      onCheckedChange={(checked) => handleUseDefaultVenueToggle(checked)}
                    />
                  </div>
                  <p className="text-xs text-purple-600 mt-2">Apply the same venue and location to all sub-events.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs font-medium text-gray-700">Default Venue Name</Label>
                  <Input
                    value={formData.defaultVenueName || ""}
                    onChange={(e) => handleDefaultVenueValueChange("defaultVenueName", e.target.value)}
                    className="mt-1 text-sm h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-700">Default Location</Label>
                  <Input
                    value={formData.defaultLocation || ""}
                    onChange={(e) => handleDefaultVenueValueChange("defaultLocation", e.target.value)}
                    className="mt-1 text-sm h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs font-medium text-gray-700">Organizer Name</Label>
                  <Input
                    value={formData.organizerName || ""}
                    onChange={(e) => onFormChange({ organizerName: e.target.value })}
                    className="mt-1 text-sm h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-700">Contact Email</Label>
                  <Input
                    type="email"
                    value={formData.contactEmail || ""}
                    onChange={(e) => onFormChange({ contactEmail: e.target.value })}
                    className="mt-1 text-sm h-9"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={() => setShowPreEventOverlay(false)}
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  className="h-9 bg-purple-600 text-white hover:bg-purple-700"
                  onClick={() => setShowPreEventOverlay(false)}
                >
                  Save Pre-Event Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateProgramForm;
