import React, { useState } from "react";
import { Calendar, Users, ArrowRight, MoreVertical, Trash2, CheckCircle, XCircle, CalendarDays, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePrograms } from "@/contexts/ProgramContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProgramCardProps {
  id: string;
  title: string;
  date: string;
  events: number;
  registrations: number;
  status: "active" | "draft" | "completed";
  progress: number;
  eventStructure?: "single" | "multi";
  isOverdue?: boolean;
}

const ProgramCard = ({ id, title, date, events, registrations, status, progress, eventStructure = "single", isOverdue = false }: ProgramCardProps) => {
  const navigate = useNavigate();
  const { updateProgram, deleteProgram } = usePrograms();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const statusStyles = {
    active: "bg-orange-50 text-orange-700 border border-orange-200",
    draft: "bg-warning/10 text-warning",
    completed: "bg-green-50 text-green-700 border border-green-200",
  };

  const handleDelete = () => {
    deleteProgram(id);
    setShowDeleteDialog(false);
  };

  const handleComplete = () => {
    updateProgram(id, { status: "completed" });
    setShowCompleteDialog(false);
    setShowMenu(false);
  };

  const handleCancel = () => {
    updateProgram(id, { status: "draft" });
    setShowCancelDialog(false);
    setShowMenu(false);
  };

  const handleOpenProgram = () => {
    console.log('🔗 Opening program:', id);
    navigate("/program-details", { state: { programId: id } });
  };

  return (
    <>
      <div className={`ef-card-hover space-y-4 relative ${isOverdue && status !== "completed" ? "border-l-4 border-warning" : ""}`}>
        {isOverdue && status !== "completed" && (
          <div className="absolute -top-3 -right-3 bg-warning text-white text-xs font-bold px-2 py-1 rounded-full">
            Overdue
          </div>
        )}

        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-nowrap">
              <h3 className="font-display font-semibold text-foreground truncate">{title}</h3>
              {/* Event Structure Badge */}
              {eventStructure === "multi" ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap shrink-0">
                  <Layers className="w-3 h-3" />
                  Multi {events > 0 && `(${events})`}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 whitespace-nowrap shrink-0">
                  <CalendarDays className="w-3 h-3" />
                  Single
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>{date}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[status]}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 hover:bg-muted rounded-md transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-lg z-50 w-48">
                  <button
                    onClick={() => {
                      setShowCompleteDialog(true);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-foreground transition-colors rounded-t-md"
                  >
                    <CheckCircle className="w-4 h-4 text-success" />
                    Complete Program
                  </button>
                  <button
                    onClick={() => {
                      setShowCancelDialog(true);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-foreground transition-colors border-t border-border"
                  >
                    <XCircle className="w-4 h-4 text-warning" />
                    Cancel Program
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteDialog(true);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-destructive/10 text-destructive transition-colors border-t border-border rounded-b-md"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Program
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>{events} events</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span>{registrations} registrations</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Readiness</span>
            <span className="font-medium text-foreground">{progress}%</span>
          </div>
          <div className="ef-progress-bar">
            <div className="ef-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <button 
          onClick={handleOpenProgram}
          className="ef-btn-primary w-full flex items-center justify-center gap-2 text-sm py-2.5"
        >
          Open Program <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Dialogs */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Program</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Complete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark "{title}" as completed? You can revert this action later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleComplete} className="bg-success text-white hover:bg-success/90">
              Complete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Program</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel "{title}"? It will be moved to draft status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-warning text-white hover:bg-warning/90">
              Cancel Program
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProgramCard;
