import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Download, Trash2, Edit2, Save, X, CheckCircle2, ArrowLeft } from "lucide-react";
import ProgramHeader from "@/components/ProgramHeader";
import OrganizerSelector, { Organizer } from "@/components/OrganizerSelector";
import { usePrograms } from "@/contexts/ProgramContext";
import programApi from "@/lib/programApi";
import coordinatorApi from "@/lib/coordinatorApi";
import subOrganizerApi from "@/lib/subOrganizerApi";
import { toast } from "@/components/ui/use-toast";

const ProgramDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { programs, deleteProgram, setCurrentProgram, currentProgram, updateProgram } = usePrograms();
  const [fetchedProgram, setFetchedProgram] = useState<any>(null);
  const [isLoadingProgram, setIsLoadingProgram] = useState(false);
  
  // Coordinator and sub-organizers state
  const [coordinators, setCoordinators] = useState<Array<{ id: string; name: string; email: string; phone: string }>>([]);
  const [subOrganizers, setSubOrganizers] = useState<Array<{ id: string; name: string; email: string; phone: string }>>([]);
  const [loadingSubOrganizers, setLoadingSubOrganizers] = useState(false);

  const state = location.state as { programId?: string };
  const program = fetchedProgram || currentProgram || programs.find((p) => p.id === state?.programId);

  const handleGoBack = () => {
    // Navigate back to Programs page instead of browser history
    navigate("/programs");
  };

  // Fetch program by ID to ensure all data including subEvents are loaded
  useEffect(() => {
    if (state?.programId) {
      setIsLoadingProgram(true);
      programApi
        .getProgramById(state.programId)
        .then((response) => {
          if (response.data.success && response.data.data) {
            console.log('✅ Program fetched with subEvents:', response.data.data.subEvents);
            setFetchedProgram(response.data.data);
            setCurrentProgram(response.data.data);
          }
        })
        .catch((error) => {
          console.error('❌ Error fetching program:', error);
          toast({
            title: "Error",
            description: "Failed to load program details",
            variant: "destructive",
          });
        })
        .finally(() => setIsLoadingProgram(false));
    }
  }, [state?.programId, setCurrentProgram]);

  useEffect(() => {
    if (program) {
      setCurrentProgram(program);
    }
  }, [program, setCurrentProgram]);

  // Fetch coordinators for dropdown
  useEffect(() => {
    const fetchCoordinators = async () => {
      try {
        const response = await coordinatorApi.getAllCoordinators();
        if (response.data.success && response.data.coordinators) {
          const coords = response.data.coordinators.map((coordinator: any) => ({
            id: coordinator._id,
            name: coordinator.name,
            email: coordinator.email,
            phone: coordinator.phone,
          }));
          setCoordinators(coords);
        }
      } catch (error) {
        console.error('Failed to load coordinators:', error);
      }
    };

    fetchCoordinators();
  }, []);

  // Fetch sub-organizers when selectedCoordinatorId changes
  useEffect(() => {
    const fetchSubOrganizers = async () => {
      if (!program?.selectedCoordinatorId) {
        setSubOrganizers([]);
        return;
      }

      try {
        setLoadingSubOrganizers(true);
        const response = await subOrganizerApi.getSubOrganizersByCoordinator(program.selectedCoordinatorId);
        
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
  }, [program?.selectedCoordinatorId]);

  const handleFormKeyDown = (e: React.KeyboardEvent<any>, callback?: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault();
      
      // Get all focusable form elements
      const allFocusable = Array.from(
        document.querySelectorAll(
          'input:not([type="hidden"]), textarea, [role="combobox"], button[type="button"]:not(.cancel-btn)'
        )
      ) as HTMLElement[];

      const currentElement = e.currentTarget as HTMLElement;
      const currentIndex = allFocusable.findIndex(el => el === currentElement || el.contains(currentElement));

      if (currentIndex !== -1 && currentIndex < allFocusable.length - 1) {
        const nextElement = allFocusable[currentIndex + 1] as HTMLElement;
        nextElement.focus();
      } else if (currentIndex === allFocusable.length - 1 && callback) {
        callback();
      }
    }
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
        ],
      },
      workshop: {
        suggestedColors: ["#F97316", "#D97706", "#10B981", "#8B5CF6", "#EC4899"],
        gradients: [
          { name: "Warm Orange", start: "#F97316", end: "#D97706", gradient: "from-orange-500 to-amber-600" },
          { name: "Nature Green", start: "#10B981", end: "#6EE7B7", gradient: "from-emerald-500 to-emerald-300" },
          { name: "Creative Purple", start: "#8B5CF6", end: "#EC4899", gradient: "from-violet-500 to-pink-500" },
        ],
      },
      hackathon: {
        suggestedColors: ["#DC2626", "#EC4899", "#7C3AED", "#2563EB", "#19E3F8"],
        gradients: [
          { name: "Electric Red", start: "#DC2626", end: "#EF4444", gradient: "from-red-600 to-red-500" },
          { name: "Neon Pink", start: "#EC4899", end: "#F43F5E", gradient: "from-pink-500 to-rose-500" },
          { name: "Cyber Purple", start: "#7C3AED", end: "#A855F7", gradient: "from-violet-600 to-violet-500" },
        ],
      },
      webinar: {
        suggestedColors: ["#0EA5E9", "#06B6D4", "#3B82F6", "#0369A1", "#00D9FF"],
        gradients: [
          { name: "Sky Blue", start: "#0EA5E9", end: "#06B6D4", gradient: "from-sky-500 to-cyan-500" },
          { name: "Ocean Flow", start: "#0369A1", end: "#00D9FF", gradient: "from-cyan-800 to-cyan-300" },
          { name: "Digital Blue", start: "#3B82F6", end: "#0EA5E9", gradient: "from-blue-500 to-sky-500" },
        ],
      },
      conference: {
        suggestedColors: ["#1F2937", "#4B5563", "#6B7280", "#1E3A8A", "#4C1D95"],
        gradients: [
          { name: "Corporate Slate", start: "#1F2937", end: "#4B5563", gradient: "from-gray-800 to-gray-600" },
          { name: "Executive Blue", start: "#1E3A8A", end: "#1F2937", gradient: "from-blue-900 to-gray-800" },
          { name: "Elegant Purple", start: "#4C1D95", end: "#1E3A8A", gradient: "from-purple-900 to-blue-900" },
        ],
      },
      meetup: {
        suggestedColors: ["#EF4444", "#F97316", "#FBBF24", "#10B981", "#14B8A6"],
        gradients: [
          { name: "Warm Sunset", start: "#EF4444", end: "#F97316", gradient: "from-red-500 to-orange-500" },
          { name: "Golden Hour", start: "#FBBF24", end: "#F59E0B", gradient: "from-amber-300 to-amber-500" },
          { name: "Fresh Green", start: "#10B981", end: "#14B8A6", gradient: "from-emerald-500 to-teal-500" },
        ],
      },
      training: {
        suggestedColors: ["#6366F1", "#8B5CF6", "#3B82F6", "#10B981", "#F59E0B"],
        gradients: [
          { name: "Learning Indigo", start: "#6366F1", end: "#8B5CF6", gradient: "from-indigo-500 to-violet-500" },
          { name: "Growth Green", start: "#10B981", end: "#34D399", gradient: "from-emerald-500 to-emerald-400" },
          { name: "Productive Blue", start: "#3B82F6", end: "#6366F1", gradient: "from-blue-500 to-indigo-500" },
        ],
      },
      seminar: {
        suggestedColors: ["#4B5563", "#6B7280", "#2563EB", "#7C3AED", "#8B5CF6"],
        gradients: [
          { name: "Academic Gray", start: "#4B5563", end: "#6B7280", gradient: "from-gray-600 to-gray-500" },
          { name: "Knowledge Blue", start: "#2563EB", end: "#3B82F6", gradient: "from-blue-600 to-blue-500" },
          { name: "Intellectual Purple", start: "#7C3AED", end: "#8B5CF6", gradient: "from-violet-600 to-violet-500" },
        ],
      },
    };

    return colorMap[eventType || ""] || colorMap.conference;
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingSubEventId, setEditingSubEventId] = useState<string | null>(null);
  const [editSubEventData, setEditSubEventData] = useState({
    name: "",
    date: "",
    endDate: "",
    time: "",
    venueName: "",
    location: "",
    organizerName: "",
    organizers: [] as Organizer[],
  });

  const [editData, setEditData] = useState({
    eventType: program?.eventType || "",
    programCategory: program?.programCategory || "",
    organizerName: program?.organizerName || "",
    department: program?.department || "",
    contactPhone: program?.contactPhone || "",
    contactEmail: program?.contactEmail || "",
    themeColor: program?.themeColor || "#6D28D9",
    eventLogo: program?.eventLogo || "",
    registrationDeadline: program?.automation?.registrationDeadline || "",
    maxParticipants: program?.automation?.maxParticipants?.toString() || "",
    autoCloseRegistration: program?.automation?.autoCloseRegistration || false,
    gradientType: (program as any)?.gradientType || "linear",
    gradientStartColor: (program as any)?.gradientStartColor || "#1E40AF",
    gradientEndColor: (program as any)?.gradientEndColor || "#5B21B6",
    gradientAngle: (program as any)?.gradientAngle || 90,
  } as any);

  // Sync editData whenever program changes or when switching edit sections
  useEffect(() => {
    if (program) {
      setEditData({
        eventType: program.eventType || "",
        programCategory: program.programCategory || "",
        organizerName: program.organizerName || "",
        department: program.department || "",
        contactPhone: program.contactPhone || "",
        contactEmail: program.contactEmail || "",
        themeColor: program.themeColor || "#6D28D9",
        eventLogo: program.eventLogo || "",
        registrationDeadline: program.automation?.registrationDeadline || "",
        maxParticipants: program.automation?.maxParticipants?.toString() || "",
        autoCloseRegistration: program.automation?.autoCloseRegistration || false,
        gradientType: (program as any)?.gradientType || "linear",
        gradientStartColor: (program as any)?.gradientStartColor || "#1E40AF",
        gradientEndColor: (program as any)?.gradientEndColor || "#5B21B6",
        gradientAngle: (program as any)?.gradientAngle || 90,
      } as any);
    }
  }, [program, editingSection]);

  const handleEditChange = (field: string, value: string) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveEdit = async () => {
    if (program) {
      const updates: any = {
        eventType: editData.eventType as "symposium" | "workshop" | "hackathon" | "hackathon" | "seminar" | "conference",
        programCategory: editData.programCategory,
        organizerName: editData.organizerName,
        department: editData.department,
        contactPhone: editData.contactPhone,
        contactEmail: editData.contactEmail,
        themeColor: editData.themeColor,
      };
      
      // If editing registration settings, update automation object
      if (editingSection === "registration") {
        updates.automation = {
          ...program.automation,
          registrationDeadline: editData.registrationDeadline,
          maxParticipants: parseInt(editData.maxParticipants) || 0,
          autoCloseRegistration: editData.autoCloseRegistration,
        };
      }
      
      try {
        await updateProgram(program.id, updates);
        setEditingSection(null);
        toast({
          title: "Success",
          description: "Program details updated successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update program details",
          variant: "destructive",
        });
      }
    }
  };

  const handleCancelEdit = () => {
    setEditData({
      eventType: program?.eventType || "",
      programCategory: program?.programCategory || "",
      organizerName: program?.organizerName || "",
      department: program?.department || "",
      contactPhone: program?.contactPhone || "",
      contactEmail: program?.contactEmail || "",
      themeColor: program?.themeColor || "#6D28D9",
      eventLogo: program?.eventLogo || "",
      registrationDeadline: program?.automation?.registrationDeadline || "",
      maxParticipants: program?.automation?.maxParticipants?.toString() || "",
      autoCloseRegistration: program?.automation?.autoCloseRegistration || false,
    });
    setEditingSection(null);
  };

  const handleEditSubEvent = (subEvent: any) => {
    setEditSubEventData({
      name: subEvent.name || "",
      date: subEvent.date || "",
      endDate: subEvent.endDate || "",
      time: subEvent.time || "",
      venueName: subEvent.venueName || "",
      location: subEvent.location || "",
      organizerName: subEvent.organizerName || "",
      organizers: subEvent.organizers || [{ name: "", email: "", phone: "" }],
    });
    setEditingSubEventId(subEvent.id);
  };

  const handleSaveSubEvent = async () => {
    if (program && editingSubEventId) {
      const updatedSubEvents = program.subEvents.map((subEvent) =>
        subEvent.id === editingSubEventId
          ? { ...subEvent, ...editSubEventData }
          : subEvent
      );
      
      try {
        await updateProgram(program.id, { subEvents: updatedSubEvents });
        setEditingSubEventId(null);
        toast({
          title: "Success",
          description: "Sub Event updated successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update sub event",
          variant: "destructive",
        });
      }
    }
  };

  const handleCancelSubEventEdit = () => {
    setEditingSubEventId(null);
    setEditSubEventData({
      name: "",
      date: "",
      endDate: "",
      time: "",
      venueName: "",
      location: "",
      organizerName: "",
    });
  };

  if (isLoadingProgram) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 text-center">
          <p className="text-lg font-semibold text-gray-900">Loading program details...</p>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 text-center">
          <p className="text-lg font-semibold text-gray-900">Program not found</p>
          <Button onClick={() => navigate("/programs")}>Back to Programs</Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const statusColors = {
    active: "bg-orange-50 text-orange-700 border-orange-200",
    draft: "bg-amber-50 text-amber-700 border-amber-200",
    completed: "bg-green-50 text-green-700 border-green-200",
  };

  const handleStatusChange = async (newStatus: "draft" | "active" | "completed") => {
    try {
      await updateProgram(program.id, { status: newStatus });
      toast({
        title: "Success",
        description: `Program marked as ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update program status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this program?")) {
      try {
        await deleteProgram(program.id);
        toast({
          title: "Success",
          description: "Program deleted successfully",
        });
        navigate("/programs");
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete program",
          variant: "destructive",
        });
      }
    }
  };

  const handleEdit = () => {
    navigate("/create-program", { state: { programId: program.id } });
  };

  return (
    <>
      <div className="mb-4">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Programs</span>
        </button>
      </div>
      <ProgramHeader
        title={program.eventName}
        subtitle={program.programCategory}
        showBackButton={true}
        rightContent={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`px-4 py-2 rounded-full border ${statusColors[program.status]}`}>
                <span className="text-sm font-semibold capitalize">{program.status}</span>
              </div>
              {program.status !== "completed" && (
                <Button
                  onClick={() => handleStatusChange("completed")}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm py-2 h-auto"
                  title="Mark as completed"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark Complete
                </Button>
              )}
            </div>
            <Button
              onClick={handleEdit}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Edit2 className="w-4 h-4" />
              Edit Program
            </Button>
          </div>
        }
      />

      <div className="px-8 py-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Information */}
          <Card className="p-6 bg-white rounded-2xl border border-gray-200 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Event Information</h2>
              {editingSection !== "event" && (
                <Button
                  onClick={() => setEditingSection("event")}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
              )}
            </div>

            {editingSection === "event" ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Event Type</Label>
                  <Select value={editData.eventType} onValueChange={(value) => handleEditChange("eventType", value)}>
                    <SelectTrigger 
                      className="mt-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          (e.currentTarget as HTMLElement).click();
                        }
                      }}
                    >
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
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Program Category</Label>
                  <Input
                    value={editData.programCategory}
                    onChange={(e) => handleEditChange("programCategory", e.target.value)}
                    onKeyDown={(e) => handleFormKeyDown(e)}
                    placeholder="e.g., Technology"
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <Button onClick={handleCancelEdit} variant="outline" className="flex items-center gap-2 cancel-btn">
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4" />
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Event Type</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1 capitalize">
                      {program.eventType}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 font-medium">Category</p>
                    <p className="text-lg font-semibold text-gray-900 mt-1">{program.programCategory}</p>
                  </div>
                </div>

                {/* Sub Events Display Section */}
                {program.subEvents && program.subEvents.length > 0 && (
                  <div className="border-t pt-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Sub Events</h3>
                    <div className="space-y-3">
                      {program.subEvents.map((subEvent, index) => (
                        <div key={subEvent.id} className="p-4 rounded-lg border border-blue-100 bg-blue-50">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                              {index + 1}
                            </span>
                            <h4 className="text-sm font-semibold text-gray-900">{subEvent.name}</h4>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            {subEvent.date && (
                              <div>
                                <p className="text-gray-600 font-medium">Date From</p>
                                <p className="text-gray-900 font-semibold mt-0.5">{formatDate(subEvent.date)}</p>
                              </div>
                            )}
                            {subEvent.endDate && (
                              <div>
                                <p className="text-gray-600 font-medium">Date To</p>
                                <p className="text-gray-900 font-semibold mt-0.5">{formatDate(subEvent.endDate)}</p>
                              </div>
                            )}
                            {subEvent.time && (
                              <div>
                                <p className="text-gray-600 font-medium">Time</p>
                                <p className="text-gray-900 font-semibold mt-0.5">{subEvent.time}</p>
                              </div>
                            )}
                            {subEvent.venueName && (
                              <div>
                                <p className="text-gray-600 font-medium">Venue</p>
                                <p className="text-gray-900 font-semibold mt-0.5">{subEvent.venueName}</p>
                              </div>
                            )}
                            {subEvent.location && (
                              <div>
                                <p className="text-gray-600 font-medium">Location</p>
                                <p className="text-gray-900 font-semibold mt-0.5">{subEvent.location}</p>
                              </div>
                            )}
                            {subEvent.organizerName && (
                              <div>
                                <p className="text-gray-600 font-medium">Organizer</p>
                                <p className="text-gray-900 font-semibold mt-0.5">{subEvent.organizerName}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Organizer Details */}
          <Card className="p-6 bg-white rounded-2xl border border-gray-200 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Organizer Details</h2>
              {editingSection !== "organizer" && (
                <Button
                  onClick={() => setEditingSection("organizer")}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
              )}
            </div>

            {editingSection === "organizer" ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Head Coordinator</Label>
                  <Select
                    value={editData.selectedCoordinatorId || ""}
                    onValueChange={(value) => {
                      const selected = coordinators.find((coord) => coord.id === value);
                      if (selected) {
                        handleEditChange("selectedCoordinatorId", value);
                      }
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select head coordinator" />
                    </SelectTrigger>
                    <SelectContent>
                      {coordinators.map((coord) => (
                        <SelectItem key={coord.id} value={coord.id}>
                          {coord.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Organizer Name *</Label>
                  <Select
                    value={editData.organizerName || ""}
                    onValueChange={(value) => {
                      const selected = subOrganizers.find((org) => org.name === value);
                      if (selected) {
                        handleEditChange("organizerName", value);
                        handleEditChange("contactEmail", selected.email);
                        handleEditChange("contactPhone", selected.phone);
                      }
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select organizer" />
                    </SelectTrigger>
                    <SelectContent>
                      {subOrganizers.map((org) => (
                        <SelectItem key={org.id} value={org.name}>
                          <div className="flex flex-col">
                            <span className="font-semibold">{org.name}</span>
                            <span className="text-xs text-gray-500">{org.email}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Department</Label>
                  <Input
                    value={editData.department}
                    onChange={(e) => handleEditChange("department", e.target.value)}
                    onKeyDown={(e) => handleFormKeyDown(e)}
                    placeholder="Enter department"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Contact Email *</Label>
                  <Input
                    type="email"
                    value={editData.contactEmail}
                    onChange={(e) => handleEditChange("contactEmail", e.target.value)}
                    onKeyDown={(e) => handleFormKeyDown(e)}
                    placeholder="Enter contact email"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Contact Phone</Label>
                  <Input
                    type="tel"
                    value={editData.contactPhone}
                    onChange={(e) => handleEditChange("contactPhone", e.target.value)}
                    onKeyDown={(e) => handleFormKeyDown(e, handleSaveEdit)}
                    placeholder="Enter contact phone"
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <Button onClick={handleCancelEdit} variant="outline" className="flex items-center gap-2 cancel-btn">
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4" />
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Organizer Name</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{program.organizerName}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-medium">Department</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{program.department || "N/A"}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-medium">Contact Email</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{program.contactEmail}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-medium">Contact Phone</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{program.contactPhone}</p>
                </div>
              </div>
            )}
          </Card>

          {/* Registration Settings */}
          <Card className="p-6 bg-white rounded-2xl border border-gray-200 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Registration Settings</h2>
              {editingSection !== "registration" && (
                <Button
                  onClick={() => setEditingSection("registration")}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
              )}
            </div>

            {editingSection === "registration" ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Registration Deadline</Label>
                  <Input
                    type="datetime-local"
                    value={editData.registrationDeadline}
                    onChange={(e) => setEditData((prev) => ({ ...prev, registrationDeadline: e.target.value }))}
                    onKeyDown={(e) => handleFormKeyDown(e)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Max Participants</Label>
                  <Input
                    type="number"
                    value={editData.maxParticipants}
                    onChange={(e) => setEditData((prev) => ({ ...prev, maxParticipants: e.target.value }))}
                    onKeyDown={(e) => handleFormKeyDown(e)}
                    placeholder="Enter max participants"
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    checked={editData.autoCloseRegistration}
                    onCheckedChange={(checked) => setEditData((prev) => ({ ...prev, autoCloseRegistration: checked }))}
                  />
                  <Label className="text-sm font-medium text-gray-700 cursor-pointer">Auto Close Registration at Deadline</Label>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <Button onClick={handleCancelEdit} variant="outline" className="flex items-center gap-2 cancel-btn">
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4" />
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Registration Deadline</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {program.automation?.registrationDeadline
                      ? new Date(program.automation.registrationDeadline).toLocaleString()
                      : "Not set"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-medium">Max Participants</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {program.automation?.maxParticipants || "Unlimited"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-medium">Auto Close Registration</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {program.automation?.autoCloseRegistration ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        Enabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 text-gray-700 border border-gray-200">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        Disabled
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* Sub Events */}
          {program.subEvents && program.subEvents.length > 0 && (
            <Card className="p-6 bg-white rounded-2xl border border-gray-200 shadow-md">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">Sub Events</h2>

              <div className="space-y-4">
                {program.subEvents.map((subEvent, index) => (
                  <div key={subEvent.id} className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                    {editingSubEventId === subEvent.id ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2.5 mb-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                            {index + 1}
                          </span>
                          <input
                            type="text"
                            value={editSubEventData.name}
                            onChange={(e) => setEditSubEventData((prev) => ({ ...prev, name: e.target.value }))}
                            className="px-3 py-2 border border-blue-200 rounded-lg text-sm font-semibold flex-1"
                            placeholder="Event name"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <Label className="text-xs font-medium text-gray-700">Date From</Label>
                            <input
                              type="date"
                              value={editSubEventData.date}
                              onChange={(e) => setEditSubEventData((prev) => ({ ...prev, date: e.target.value }))}
                              className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-700">Date To</Label>
                            <input
                              type="date"
                              value={editSubEventData.endDate}
                              onChange={(e) => setEditSubEventData((prev) => ({ ...prev, endDate: e.target.value }))}
                              className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-700">Time</Label>
                            <input
                              type="time"
                              value={editSubEventData.time}
                              onChange={(e) => setEditSubEventData((prev) => ({ ...prev, time: e.target.value }))}
                              className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-700">Venue</Label>
                            <input
                              type="text"
                              value={editSubEventData.venueName}
                              onChange={(e) => setEditSubEventData((prev) => ({ ...prev, venueName: e.target.value }))}
                              className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm mt-1"
                              placeholder="Venue name"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs font-medium text-gray-700">Location</Label>
                            <input
                              type="text"
                              value={editSubEventData.location}
                              onChange={(e) => setEditSubEventData((prev) => ({ ...prev, location: e.target.value }))}
                              className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm mt-1"
                              placeholder="Location"
                            />
                          </div>
                          
                          {/* Organizers Section */}
                          <div className="col-span-2">
                            <Label className="text-xs font-medium text-gray-700 mb-2 block">Event Organizers</Label>
                            <OrganizerSelector
                              organizers={editSubEventData.organizers}
                              onOrganizersChange={(orgs) =>
                                setEditSubEventData((prev) => ({ ...prev, organizers: orgs }))
                              }
                              label=""
                              showAddButton={true}
                              maxOrganizers={5}
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end pt-3">
                          <Button onClick={handleCancelSubEventEdit} variant="outline" size="sm" className="cancel-btn">
                            <X className="w-4 h-4" />
                          </Button>
                          <Button onClick={handleSaveSubEvent} size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <Save className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between gap-2.5 mb-3">
                          <div className="flex items-center gap-2.5">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                              {index + 1}
                            </span>
                            <p className="font-semibold text-sm text-gray-900">{subEvent.name}</p>
                          </div>
                          <Button
                            onClick={() => handleEditSubEvent(subEvent)}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {subEvent.date && (
                            <div>
                              <p className="text-gray-600 font-medium">Date From</p>
                              <p className="text-gray-900 font-semibold mt-0.5">{formatDate(subEvent.date)}</p>
                            </div>
                          )}
                          {subEvent.endDate && (
                            <div>
                              <p className="text-gray-600 font-medium">Date To</p>
                              <p className="text-gray-900 font-semibold mt-0.5">{formatDate(subEvent.endDate)}</p>
                            </div>
                          )}
                          {subEvent.time && (
                            <div>
                              <p className="text-gray-600 font-medium">Time</p>
                              <p className="text-gray-900 font-semibold mt-0.5">{subEvent.time}</p>
                            </div>
                          )}
                          {subEvent.venueName && (
                            <div>
                              <p className="text-gray-600 font-medium">Venue</p>
                              <p className="text-gray-900 font-semibold mt-0.5">{subEvent.venueName}</p>
                            </div>
                          )}
                          {subEvent.location && (
                            <div>
                              <p className="text-gray-600 font-medium">Location</p>
                              <p className="text-gray-900 font-semibold mt-0.5">{subEvent.location}</p>
                            </div>
                          )}
                          {subEvent.organizers && subEvent.organizers.length > 0 ? (
                            <div className="col-span-2">
                              <p className="text-gray-600 font-medium mb-2">Organizers</p>
                              <div className="space-y-1">
                                {subEvent.organizers.map((org: any, idx: number) => (
                                  <div key={idx} className="text-sm">
                                    <p className="text-gray-900 font-semibold">{org.name}</p>
                                    {org.email && <p className="text-gray-600 text-xs">{org.email}</p>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : subEvent.organizerName ? (
                            <div>
                              <p className="text-gray-600 font-medium">Organizer</p>
                              <p className="text-gray-900 font-semibold mt-0.5">{subEvent.organizerName}</p>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Automation Summary */}
          <Card className="p-6 bg-white rounded-2xl border border-gray-200 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Automation Settings</h3>
              {editingSection !== "automation" && (
                <Button
                  onClick={() => setEditingSection("automation")}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            {editingSection === "automation" ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-3">Current automation settings:</p>
                <div className="space-y-2 text-sm">
                  {program.automation?.autoGenerateQR && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span className="text-gray-700">QR Code Generation</span>
                    </div>
                  )}
                  {program.automation?.autoCreateForm && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span className="text-gray-700">Registration Form</span>
                    </div>
                  )}
                  {program.automation?.autoCreateCertificate && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span className="text-gray-700">Certificate Creation</span>
                    </div>
                  )}
                  {program.automation?.autoGeneratePoster && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span className="text-gray-700">Poster Generation</span>
                    </div>
                  )}
                  {program.automation?.autoGenerateProposal && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span className="text-gray-700">Proposal Generation</span>
                    </div>
                  )}
                  {program.automation?.enableAttendanceTracking && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span className="text-gray-700">Attendance Tracking</span>
                    </div>
                  )}
                  {program.automation && !Object.values(program.automation).some((v) => typeof v === "boolean" && v) && (
                    <p className="text-gray-600 italic">No automations enabled</p>
                  )}
                </div>

                <div className="flex gap-2 justify-end pt-3">
                  <Button onClick={handleCancelEdit} variant="outline" size="sm" className="cancel-btn">
                    <X className="w-4 h-4" />
                  </Button>
                  <Button onClick={handleSaveEdit} size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {program.automation?.autoGenerateQR && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-sm text-gray-700">QR Code Generation</span>
                  </div>
                )}

                {program.automation?.autoCreateForm && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-sm text-gray-700">Registration Form</span>
                  </div>
                )}

                {program.automation?.autoCreateCertificate && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-sm text-gray-700">Certificate Creation</span>
                  </div>
                )}

                {program.automation?.autoGeneratePoster && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-sm text-gray-700">Poster Generation</span>
                  </div>
                )}

                {program.automation?.autoGenerateProposal && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-sm text-gray-700">Proposal Generation</span>
                  </div>
                )}

                {program.automation?.enableAttendanceTracking && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-sm text-gray-700">Attendance Tracking</span>
                  </div>
                )}

                {program.automation && !Object.values(program.automation).some((v) => typeof v === "boolean" && v) && (
                  <p className="text-sm text-gray-600 italic">No automations enabled</p>
                )}
              </div>
            )}
          </Card>

          {/* QR Code Management */}
          {program.automation?.autoGenerateQR && (
            <Card className="p-6 bg-white rounded-2xl border border-green-200 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-900">QR Codes</h3>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                QR code generation is enabled for this program. {program.subEvents?.length || 0} QR codes available.
              </p>
              <Button
                onClick={() => navigate(`/programs/${program.id}/qr`)}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Manage QR Codes
              </Button>
            </Card>
          )}

          {/* Theme */}
          {program.themeColor && (
            <Card className="p-6 bg-white rounded-2xl border border-gray-200 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Theme</h3>
                {editingSection !== "theme" && (
                  <Button
                    onClick={() => setEditingSection("theme")}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              {editingSection === "theme" ? (
                <div className="space-y-4">
                  {/* Prominent Info */}
                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-900">Configure Your Event Theme</p>
                  </div>

                  {/* Two-Column Layout - Static and Gradient Side by Side */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Static Color Section */}
                    <div className={`space-y-3 p-4 rounded-lg border-2 transition-all ${
                      ((editData as any).themeType || "static") === "static"
                        ? "bg-purple-50 border-purple-400 ring-2 ring-purple-200"
                        : "bg-gray-50 border-gray-200"
                    }`}>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">Static Color</p>
                        {((editData as any).themeType || "static") === "static" && (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-200 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-purple-600" />
                            <span className="text-xs font-semibold text-purple-600">Selected</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-2">Suggestions</p>
                        <div className="grid grid-cols-3 gap-1.5">
                          {getColorSuggestions(program?.eventType).suggestedColors.map((color) => (
                            <button
                              key={`static-${color}`}
                              onClick={() => setEditData({ ...editData, themeColor: color, themeType: "static" })}
                              className={`h-8 rounded-lg border-2 transition-all ${
                                editData.themeColor === color && ((editData as any).themeType || "static") === "static"
                                  ? "border-gray-900 shadow-md ring-1 ring-blue-500 scale-105"
                                  : "border-gray-300 hover:border-gray-400"
                              }`}
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={editData.themeColor || "#6D28D9"}
                          onChange={(e) => setEditData({ ...editData, themeColor: e.target.value, themeType: "static" })}
                          className="w-12 h-8 rounded-lg cursor-pointer border-2 border-gray-300"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-600">Custom</p>
                          <p className="text-xs text-gray-700 font-mono truncate">{editData.themeColor || "#6D28D9"}</p>
                        </div>
                      </div>
                      <div
                        className="w-full h-14 rounded-lg border-2 border-gray-300 shadow-md"
                        style={{ backgroundColor: editData.themeColor || "#6D28D9" }}
                      />
                    </div>

                    {/* Gradient Color Section */}
                    <div className={`space-y-3 p-4 rounded-lg border-2 transition-all ${
                      (editData as any).themeType === "gradient"
                        ? "bg-blue-50 border-blue-400 ring-2 ring-blue-200"
                        : "bg-gray-50 border-gray-200"
                    }`}>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">Gradient Color</p>
                        {(editData as any).themeType === "gradient" && (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-200 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-blue-600" />
                            <span className="text-xs font-semibold text-blue-600">Selected</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Gradient Type Toggle */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditData({ ...editData, gradientType: "linear", themeType: "gradient" })}
                          className={`flex-1 px-2 py-1 text-xs font-semibold rounded-lg border-2 transition-all ${
                            editData.gradientType !== "radial"
                              ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                              : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          Linear
                        </button>
                        <button
                          onClick={() => setEditData({ ...editData, gradientType: "radial", themeType: "gradient" })}
                          className={`flex-1 px-2 py-1 text-xs font-semibold rounded-lg border-2 transition-all ${
                            editData.gradientType === "radial"
                              ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                              : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          Radial
                        </button>
                      </div>

                      {/* Angle Slider */}
                      {editData.gradientType !== "radial" && (
                        <div>
                          <div className="flex items-center gap-2">
                            <label className="text-xs font-semibold text-gray-700 min-w-9">Angle:</label>
                            <input
                              type="range"
                              min="0"
                              max="360"
                              value={editData.gradientAngle || 90}
                              onChange={(e) => setEditData({ ...editData, gradientAngle: parseInt(e.target.value) })}
                              className="flex-1"
                            />
                            <span className="text-xs font-semibold text-gray-700 min-w-8">
                              {editData.gradientAngle || 90}°
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Color Stops */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Start Color */}
                        <div>
                          <p className="text-xs font-semibold text-gray-700 mb-1">Start</p>
                          <div className="grid grid-cols-2 gap-1 mb-1.5">
                            {getColorSuggestions(program?.eventType).suggestedColors.slice(0, 4).map((color) => (
                              <button
                                key={`start-${color}`}
                                onClick={() => setEditData({ ...editData, gradientStartColor: color, themeType: "gradient" })}
                                className={`h-7 rounded-lg border-2 transition-all ${
                                  editData.gradientStartColor === color
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
                            value={editData.gradientStartColor || "#1E40AF"}
                            onChange={(e) => setEditData({ ...editData, gradientStartColor: e.target.value, themeType: "gradient" })}
                            className="w-full h-6 rounded cursor-pointer border-2 border-gray-300"
                          />
                        </div>

                        {/* End Color */}
                        <div>
                          <p className="text-xs font-semibold text-gray-700 mb-1">End</p>
                          <div className="grid grid-cols-2 gap-1 mb-1.5">
                            {getColorSuggestions(program?.eventType).suggestedColors.slice(1, 5).map((color) => (
                              <button
                                key={`end-${color}`}
                                onClick={() => setEditData({ ...editData, gradientEndColor: color, themeType: "gradient" })}
                                className={`h-7 rounded-lg border-2 transition-all ${
                                  editData.gradientEndColor === color
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
                            value={editData.gradientEndColor || "#5B21B6"}
                            onChange={(e) => setEditData({ ...editData, gradientEndColor: e.target.value, themeType: "gradient" })}
                            className="w-full h-6 rounded cursor-pointer border-2 border-gray-300"
                          />
                        </div>
                      </div>

                      {/* Gradient Preview */}
                      <div
                        className="w-full h-14 rounded-lg border-2 border-gray-300 shadow-md"
                        style={{
                          background:
                            editData.gradientType === "radial"
                              ? `radial-gradient(circle, ${editData.gradientStartColor || "#1E40AF"}, ${editData.gradientEndColor || "#5B21B6"})`
                              : `linear-gradient(${editData.gradientAngle || 90}deg, ${editData.gradientStartColor || "#1E40AF"}, ${editData.gradientEndColor || "#5B21B6"})`
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-2 justify-end pt-3 border-t border-gray-200 mt-4">
                      <Button onClick={handleCancelEdit} variant="outline" size="sm" className="cancel-btn">
                        <X className="w-4 h-4" />
                      </Button>
                      <Button onClick={handleSaveEdit} size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Save className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Theme Selection Caption */}
                    <div className="text-right pr-1">
                      <p className="text-xs text-gray-600 font-medium">
                        Selected Theme: <span className="font-semibold text-gray-900">
                          {(editData as any).themeType === "gradient" ? "Gradient Color" : "Static Color"}
                        </span>
                      </p>
                      {(editData as any).themeType === "gradient" && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {(editData as any).gradientType === "radial" ? "Radial" : "Linear"} Gradient • {(editData as any).gradientAngle || 90}°
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    background:
                      (program as any).gradientType === "radial"
                        ? `radial-gradient(circle, ${(program as any).gradientStartColor || "#1E40AF"}, ${(program as any).gradientEndColor || "#5B21B6"})`
                        : `linear-gradient(${(program as any).gradientAngle || 90}deg, ${(program as any).gradientStartColor || "#1E40AF"}, ${(program as any).gradientEndColor || "#5B21B6"})`
                  }}
                />
              )}
            </Card>
          )}

          {/* Logo */}
          {program.eventLogo && (
            <Card className="p-6 bg-white rounded-2xl border border-gray-200 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Event Logo</h3>
                {editingSection !== "logo" && (
                  <Button
                    onClick={() => setEditingSection("logo")}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              {editingSection === "logo" ? (
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          handleEditChange("eventLogo", reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 w-full"
                  />
                  {editData.eventLogo && typeof editData.eventLogo === 'string' && editData.eventLogo.length > 0 && (
                    <img 
                      src={editData.eventLogo} 
                      alt="Preview" 
                      className="h-16 rounded-lg object-contain"
                      onError={(e) => {
                        console.warn("Failed to load edit logo preview:", e);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}

                  <div className="flex gap-2 justify-end pt-2">
                    <Button onClick={handleCancelEdit} variant="outline" size="sm" className="cancel-btn">
                      <X className="w-4 h-4" />
                    </Button>
                    <Button onClick={handleSaveEdit} size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <img
                  src={program.eventLogo}
                  alt="Event Logo"
                  className="w-full h-32 object-contain rounded-lg border border-gray-200"
                />
              )}
            </Card>
          )}

          {/* Actions */}
          <Card className="p-6 bg-white rounded-2xl border border-gray-200 shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Actions</h3>
            <div className="space-y-3">
              <Button className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900">
                <Download className="w-4 h-4" />
                Export Program
              </Button>

              <Button
                onClick={handleDelete}
                className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Delete Program
              </Button>
            </div>
          </Card>
        </div>
        </div>
      </div>
    </>
  );
};

export default ProgramDetailsPage;
