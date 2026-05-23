import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import subOrganizerApi from "@/lib/subOrganizerApi";
import { toast } from "@/components/ui/use-toast";

export interface Organizer {
  name: string;
  email: string;
  phone: string;
  subOrganizerId?: string; // Optional - only present if selected from dropdown
}

interface OrganizerSelectorProps {
  organizers: Organizer[];
  onOrganizersChange: (organizers: Organizer[]) => void;
  label?: string;
  showAddButton?: boolean;
  maxOrganizers?: number;
}

const OrganizerSelector: React.FC<OrganizerSelectorProps> = ({
  organizers,
  onOrganizersChange,
  label = "Event Organizers",
  showAddButton = true,
  maxOrganizers = 10,
}) => {
  const [subOrganizers, setSubOrganizers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDropdowns, setSelectedDropdowns] = useState<string[]>(
    organizers.map((o) => o.subOrganizerId || "")
  );

  // Fetch available sub-organizers on component mount
  useEffect(() => {
    const fetchSubOrganizers = async () => {
      try {
        setLoading(true);
        const response = await subOrganizerApi.getAllSubOrganizers();

        if (response.data.success && response.data.data) {
          setSubOrganizers(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch sub-organizers:", error);
        // Don't show error toast as user can still enter organizers manually
      } finally {
        setLoading(false);
      }
    };

    fetchSubOrganizers();
  }, []);

  // Handle dropdown selection
  const handleSelect = (organizerId: string, index: number) => {
    const selected = subOrganizers.find((o) => o._id === organizerId);

    if (!selected) return;

    const updated = [...organizers];
    updated[index] = {
      name: selected.name,
      email: selected.email,
      phone: selected.phone,
      subOrganizerId: selected._id,
    };

    const dropdownsUpdated = [...selectedDropdowns];
    dropdownsUpdated[index] = organizerId;
    setSelectedDropdowns(dropdownsUpdated);

    onOrganizersChange(updated);
  };

  // Handle manual input change
  const handleInputChange = (
    index: number,
    field: "name" | "email" | "phone",
    value: string
  ) => {
    const updated = [...organizers];
    updated[index] = {
      ...updated[index],
      [field]: value,
      // If user manually enters data, remove subOrganizerId to treat as manual entry
      subOrganizerId: undefined,
    };

    const dropdownsUpdated = [...selectedDropdowns];
    dropdownsUpdated[index] = "";
    setSelectedDropdowns(dropdownsUpdated);

    onOrganizersChange(updated);
  };

  // Add new organizer slot
  const handleAddOrganizer = () => {
    if (organizers.length >= maxOrganizers) {
      toast({
        title: "Maximum organizers reached",
        description: `Cannot add more than ${maxOrganizers} organizers`,
        variant: "destructive",
      });
      return;
    }

    const newOrganizers = [
      ...organizers,
      { name: "", email: "", phone: "", subOrganizerId: undefined },
    ];
    const newDropdowns = [...selectedDropdowns, ""];

    setSelectedDropdowns(newDropdowns);
    onOrganizersChange(newOrganizers);
  };

  // Remove organizer
  const handleRemoveOrganizer = (index: number) => {
    const updated = organizers.filter((_, i) => i !== index);
    const dropdownsUpdated = selectedDropdowns.filter((_, i) => i !== index);

    setSelectedDropdowns(dropdownsUpdated);
    onOrganizersChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">{label}</Label>
        {showAddButton && organizers.length < maxOrganizers && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddOrganizer}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Organizer
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {organizers.map((organizer, index) => (
          <Card key={index} className="p-4 space-y-3 bg-slate-50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                {/* Dropdown or Name Input */}
                <div className="space-y-1">
                  <Label className="text-sm">Name / Select from List</Label>
                  {!selectedDropdowns[index] ? (
                    // Manual name input
                    <Input
                      placeholder="Enter organizer name"
                      value={organizer.name}
                      onChange={(e) =>
                        handleInputChange(index, "name", e.target.value)
                      }
                      className="h-9"
                    />
                  ) : (
                    // Selected from dropdown - show as text
                    <div className="h-9 flex items-center px-3 bg-white border rounded-md text-sm">
                      {organizer.name}
                    </div>
                  )}

                  {/* Dropdown for selection */}
                  {subOrganizers.length > 0 && (
                    <Select
                      value={selectedDropdowns[index]}
                      onValueChange={(value) =>
                        handleSelect(value, index)
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Or select from existing" />
                      </SelectTrigger>
                      <SelectContent>
                        {subOrganizers.map((org) => (
                          <SelectItem key={org._id} value={org._id}>
                            {org.name} ({org.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Email Input */}
                <div className="space-y-1">
                  <Label className="text-sm">Email (Optional)</Label>
                  <Input
                    type="email"
                    placeholder="organizer@example.com"
                    value={organizer.email}
                    onChange={(e) =>
                      handleInputChange(index, "email", e.target.value)
                    }
                    disabled={!!selectedDropdowns[index]}
                    className="h-9"
                  />
                </div>

                {/* Phone Input */}
                <div className="space-y-1">
                  <Label className="text-sm">Phone (Optional)</Label>
                  <Input
                    type="tel"
                    placeholder="10-digit phone"
                    value={organizer.phone}
                    onChange={(e) =>
                      handleInputChange(index, "phone", e.target.value)
                    }
                    disabled={!!selectedDropdowns[index]}
                    maxLength={10}
                    className="h-9"
                  />
                </div>
              </div>

              {/* Remove button */}
              {organizers.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveOrganizer(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-6"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {organizers.length === 0 && (
        <Card className="p-4 text-center text-slate-500 bg-slate-50">
          <p className="text-sm">
            No organizers added yet.{" "}
            {showAddButton && (
              <button
                onClick={handleAddOrganizer}
                className="text-blue-600 hover:underline"
              >
                Add one now
              </button>
            )}
          </p>
        </Card>
      )}

      {loading && (
        <div className="text-center text-sm text-slate-500">
          Loading available organizers...
        </div>
      )}
    </div>
  );
};

export default OrganizerSelector;
