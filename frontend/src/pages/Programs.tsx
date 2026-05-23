import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import EventTabs from "@/components/EventTabs";
import { Plus, Search, Calendar, Users, ArrowRight, Edit2, Trash2, CalendarDays, Layers, Check } from "lucide-react";
import { usePrograms } from "@/contexts/ProgramContext";
import { toast } from "@/components/ui/use-toast";

const ProgramsPage = () => {
  const navigate = useNavigate();
  const { programs, deleteProgram, loadPrograms } = usePrograms();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSingleOnly, setShowSingleOnly] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [brokenLogos, setBrokenLogos] = useState<Record<string, boolean>>({});

  // Reload programs when this page mounts to ensure we have the latest data for the current admin
  useEffect(() => {
    console.log('📄 Programs page mounted - reloading programs');
    loadPrograms();
  }, []); // Empty dependency array - load programs only once on mount

  useEffect(() => {
    setBrokenLogos({});
  }, [programs]);

  const filteredPrograms = programs.filter((p) =>
    p.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.programCategory.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Apply "Single Program" structure filter on top of the text search filter
  const displayedPrograms = showSingleOnly
    ? filteredPrograms.filter((p) => p.eventStructure === "single")
    : filteredPrograms;

  const statusStyles = {
    active: "bg-orange-50 text-orange-700 border-orange-200",
    draft: "bg-amber-50 text-amber-700 border-amber-200",
    completed: "bg-green-50 text-green-700 border-green-200",
  };

  const formatDate = (dateString: string) => {
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

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedDeleteId(id);
    setDeleteConfirmed(false);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedDeleteId && deleteConfirmed) {
      deleteProgram(selectedDeleteId);
      setDeleteDialogOpen(false);
      setSelectedDeleteId(null);
      setDeleteConfirmed(false);
      toast({
        title: "Success",
        description: "Program deleted successfully",
      });
    }
  };

  const handleEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigate("/create-program", { state: { programId: id } });
  };

  const handleOpenProgram = (id: string) => {
    navigate("/program-details", { state: { programId: id } });
  };

  const renderProgramCard = (program: typeof programs[0]) => (
    <Card
      key={program.id}
      onClick={() => handleOpenProgram(program.id)}
      className="p-6 bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer group"
    >
      <div className="space-y-4">
        {/* Header with Logo */}
        <div className="flex items-start justify-between gap-3">
        {/* Logo Display */}
        <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
          {program.eventLogo && !brokenLogos[program.id] ? (
            <img 
              src={program.eventLogo} 
              alt={program.eventName}
              className="w-full h-full object-cover"
              onError={() => {
                setBrokenLogos((prev) => ({
                  ...prev,
                  [program.id]: true,
                }));
              }}
            />
          ) : (
            <img src="/favicon.svg" alt="Default" className="w-8 h-8" />
          )}
        </div>
          
          <div className="space-y-1 flex-1">
            <h3 className="font-display font-semibold text-lg text-gray-900 group-hover:text-purple-600 transition">
              {program.eventName}
            </h3>
            <p className="text-xs text-muted-foreground">{program.programCategory}</p>
            <div className="pt-0.5">
              {program.eventStructure === "multi" ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  <Layers className="w-3 h-3" />
                  Multi Event
                  {program.subEvents?.length > 0 && (
                    <span className="ml-1 bg-blue-200 text-blue-800 rounded-full px-1.5 py-0">{program.subEvents.length}</span>
                  )}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  <CalendarDays className="w-3 h-3" />
                  Single Event
                </span>
              )}
            </div>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${statusStyles[program.status]}`}>
            {program.status.charAt(0).toUpperCase() + program.status.slice(1)}
          </span>
        </div>

        {/* Date and Location */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Calendar className="w-4 h-4 text-purple-600 flex-shrink-0" />
            <span>{formatDate(program.startDate)}</span>
          </div>
          {program.location && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Users className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <span className="word-break">{program.location}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600">Setup Progress</span>
            <span className="font-semibold text-gray-900">{program.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${program.progress}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={(e) => handleEdit(e, program.id)}
            variant="outline"
            className="flex-1 flex items-center justify-center gap-2 text-sm py-2 h-auto"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit
          </Button>
          <Button
            onClick={(e) => handleDelete(e, program.id)}
            variant="outline"
            className="flex-1 flex items-center justify-center gap-2 text-sm py-2 h-auto text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenProgram(program.id);
            }}
            className="flex-1 flex items-center justify-center gap-2 text-sm py-2 h-auto bg-purple-600 hover:bg-purple-700 text-white"
          >
            Open <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Programs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {programs.length} {programs.length === 1 ? "program" : "programs"} created
          </p>
        </div>
        <Button
          onClick={() => navigate("/create-program")}
          className="flex items-center gap-2 text-sm py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
        >
          <Plus className="w-4 h-4" />
          Create Program
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search programs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
        />
      </div>

      {/* Programs Grid */}
      {programs.length === 0 ? (
        <Card className="p-12 bg-white rounded-2xl border border-gray-200 text-center">
          <div className="space-y-4">
            <p className="text-lg font-semibold text-gray-900">No programs yet</p>
            <p className="text-sm text-gray-600">Create your first program to get started with event automation</p>
            <Button
              onClick={() => navigate("/create-program")}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Create Your First Program
            </Button>
          </div>
        </Card>
      ) : (
        <EventTabs
          tabs={["All Programs", "Active", "Drafts", "Completed"]}
          rightContent={
            <button
              onClick={() => setShowSingleOnly(!showSingleOnly)}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                showSingleOnly
                  ? "bg-purple-100 text-purple-700 border-purple-300"
                  : "bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-600"
              }`}
            >
              <CalendarDays className="w-3 h-3" />
              Single Program
              {showSingleOnly && <span className="ml-1">✕</span>}
            </button>
          }
        >
          {/* All Programs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedPrograms.length > 0 ? (
              displayedPrograms.map((program) => renderProgramCard(program))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600">No programs match your search</p>
              </div>
            )}
          </div>

          {/* Active Programs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedPrograms.filter((p) => p.status === "active").length > 0 ? (
              displayedPrograms
                .filter((p) => p.status === "active")
                .map((program) => renderProgramCard(program))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600">No active programs</p>
              </div>
            )}
          </div>

          {/* Draft Programs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedPrograms.filter((p) => p.status === "draft").length > 0 ? (
              displayedPrograms
                .filter((p) => p.status === "draft")
                .map((program) => renderProgramCard(program))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600">No draft programs</p>
              </div>
            )}
          </div>

          {/* Completed Programs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedPrograms.filter((p) => p.status === "completed").length > 0 ? (
              displayedPrograms
                .filter((p) => p.status === "completed")
                .map((program) => renderProgramCard(program))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600">No completed programs</p>
              </div>
            )}
          </div>
        </EventTabs>
      )}

      {/* Delete Confirmation Dialog with Checkbox */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Delete Program</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the program and all its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg my-4">
            <input
              type="checkbox"
              id="deleteConfirm"
              checked={deleteConfirmed}
              onChange={(e) => setDeleteConfirmed(e.target.checked)}
              className="w-4 h-4 text-red-600 rounded focus:ring-2 focus:ring-red-500 cursor-pointer"
            />
            <label htmlFor="deleteConfirm" className="text-sm text-gray-700 cursor-pointer flex-1">
              I understand, delete this program permanently
            </label>
          </div>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel className="border-gray-200">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={!deleteConfirmed}
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete Permanently
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProgramsPage;
