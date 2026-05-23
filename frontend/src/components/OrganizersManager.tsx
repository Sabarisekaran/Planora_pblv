import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit2, Save, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import OrganizerDetails, { OrganizerDetailsData } from "./OrganizerDetails";

export interface Organizer extends OrganizerDetailsData {
  id?: string; // Local ID for managing in list
}

interface OrganizersManagerProps {
  organizers: Organizer[];
  onOrganizersChange: (organizers: Organizer[]) => void;
  title?: string;
  maxOrganizers?: number;
  allowMultiple?: boolean;
  eventName?: string;
}

const OrganizersManager: React.FC<OrganizersManagerProps> = ({
  organizers,
  onOrganizersChange,
  title = "Event Organizers",
  maxOrganizers = 10,
  allowMultiple = true,
  eventName = "",
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [organizersWithIds, setOrganizersWithIds] = useState<Organizer[]>([]);

  // Initialize organizers with local IDs
  useEffect(() => {
    const withIds = organizers.map((org, idx) => ({
      ...org,
      id: org.id || `org-${idx}-${Date.now()}`,
    }));
    setOrganizersWithIds(withIds);
  }, []);

  const handleAddNew = () => {
    if (organizersWithIds.length >= maxOrganizers) {
      return;
    }
    setEditingIndex(organizersWithIds.length);
  };

  const handleSave = (data: OrganizerDetailsData) => {
    if (editingIndex !== null) {
      const updated = [...organizersWithIds];

      if (editingIndex === organizersWithIds.length) {
        // New organizer
        updated.push({
          ...data,
          id: `org-${updated.length}-${Date.now()}`,
        });
      } else {
        // Update existing
        updated[editingIndex] = {
          ...updated[editingIndex],
          ...data,
        };
      }

      setOrganizersWithIds(updated);
      const cleanedOrganizers = updated.map(({ id, ...rest }) => rest);
      onOrganizersChange(cleanedOrganizers);
      setEditingIndex(null);
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
  };

  const handleRemove = (index: number) => {
    const updated = organizersWithIds.filter((_, i) => i !== index);
    setOrganizersWithIds(updated);
    const cleanedOrganizers = updated.map(({ id, ...rest }) => rest);
    onOrganizersChange(cleanedOrganizers);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
  };

  // Show edit form
  if (editingIndex !== null) {
    const isNewOrganizer = editingIndex === organizersWithIds.length;
    const dataToEdit = isNewOrganizer
      ? { name: "", email: "", phone: "" }
      : organizersWithIds[editingIndex];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">
            {isNewOrganizer ? "Add New Organizer" : "Edit Organizer"}
          </h3>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <OrganizerDetails
          data={dataToEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          title={isNewOrganizer ? "Add New Organizer" : "Edit Organizer Details"}
        />
      </div>
    );
  }

  // Show list view
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {eventName && (
            <p className="text-sm text-gray-600 mt-1">Event: {eventName}</p>
          )}
        </div>
        {allowMultiple && organizersWithIds.length < maxOrganizers && (
          <Button
            type="button"
            onClick={handleAddNew}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Organizer
          </Button>
        )}
      </div>

      {organizersWithIds.length === 0 ? (
        <Card className="p-6 text-center bg-slate-50 border border-dashed border-gray-300">
          <p className="text-sm text-gray-600 mb-3">No organizers added yet</p>
          {allowMultiple && (
            <Button
              type="button"
              onClick={handleAddNew}
              variant="outline"
              size="sm"
            >
              Add First Organizer
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {organizersWithIds.map((organizer, index) => (
            <Card
              key={organizer.id}
              className="p-4 bg-white border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">
                      {organizer.name}
                    </h4>
                    {organizer.subOrganizerId && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                        From List
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    {organizer.email && (
                      <p>
                        <span className="font-medium">Email:</span>{" "}
                        {organizer.email}
                      </p>
                    )}
                    {organizer.phone && (
                      <p>
                        <span className="font-medium">Phone:</span>{" "}
                        {organizer.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(index)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  {organizersWithIds.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(index)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {organizersWithIds.length >= maxOrganizers && (
        <p className="text-xs text-gray-600 text-center bg-yellow-50 p-2 rounded">
          Maximum number of organizers ({maxOrganizers}) reached
        </p>
      )}
    </div>
  );
};

export default OrganizersManager;
