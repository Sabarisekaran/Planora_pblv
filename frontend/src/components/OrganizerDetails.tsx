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
import { X } from "lucide-react";
import subOrganizerApi from "@/lib/subOrganizerApi";
import { toast } from "@/components/ui/use-toast";

export interface OrganizerDetailsData {
  name: string;
  email: string;
  phone: string;
  subOrganizerId?: string;
}

interface OrganizerDetailsProps {
  data: OrganizerDetailsData;
  onSave: (data: OrganizerDetailsData) => void;
  onCancel: () => void;
  title?: string;
  isLoading?: boolean;
  showAutoFillHint?: boolean;
}

const OrganizerDetails: React.FC<OrganizerDetailsProps> = ({
  data,
  onSave,
  onCancel,
  title = "Organizer Details",
  isLoading = false,
  showAutoFillHint = true,
}) => {
  const [formData, setFormData] = useState<OrganizerDetailsData>(data);
  const [subOrganizers, setSubOrganizers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFromDropdown, setSelectedFromDropdown] = useState<boolean>(
    !!data.subOrganizerId
  );
  const [dropdownValue, setDropdownValue] = useState<string>(
    data.subOrganizerId || ""
  );
  const [filteredOrganizers, setFilteredOrganizers] = useState<any[]>([]);
  const [searchInput, setSearchInput] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  // Fetch sub-organizers on mount
  useEffect(() => {
    const fetchSubOrganizers = async () => {
      try {
        setLoading(true);
        const response = await subOrganizerApi.getAllSubOrganizers();

        if (response.data.success && response.data.data) {
          setSubOrganizers(response.data.data);
          setFilteredOrganizers(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch sub-organizers:", error);
        toast({
          title: "Warning",
          description: "Could not load organizer list. You can enter manually.",
          variant: "default",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubOrganizers();
  }, []);

  // Handle name input change
  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      subOrganizerId: undefined, // Clear subOrganizerId when manually typing
    }));
    setSelectedFromDropdown(false);
    setDropdownValue("");
    setSearchInput(value);

    // Filter organizers based on search input
    if (value.trim()) {
      const filtered = subOrganizers.filter((org) =>
        org.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredOrganizers(filtered);
      setShowDropdown(true);
    } else {
      setFilteredOrganizers(subOrganizers);
      setShowDropdown(false);
    }
  };

  // Handle dropdown selection
  const handleSelectOrganizer = (organizerId: string) => {
    const selected = subOrganizers.find((o) => o._id === organizerId);

    if (!selected) return;

    const updatedData: OrganizerDetailsData = {
      name: selected.name,
      email: selected.email || "",
      phone: selected.phone || "",
      subOrganizerId: selected._id,
    };

    setFormData(updatedData);
    setSelectedFromDropdown(true);
    setDropdownValue(organizerId);
    setSearchInput(selected.name);
    setShowDropdown(false);
  };

  // Handle email change
  const handleEmailChange = (value: string) => {
    if (selectedFromDropdown) {
      // If selected from dropdown, disable email editing
      return;
    }
    setFormData((prev) => ({
      ...prev,
      email: value,
    }));
  };

  // Handle phone change
  const handlePhoneChange = (value: string) => {
    if (selectedFromDropdown) {
      // If selected from dropdown, disable phone editing
      return;
    }
    setFormData((prev) => ({
      ...prev,
      phone: value,
    }));
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Organizer name is required",
        variant: "destructive",
      });
      return false;
    }

    // Check email format if provided
    if (formData.email.trim() && !isValidEmail(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }

    // Check phone format if provided (basic validation)
    if (formData.phone.trim() && formData.phone.length < 10) {
      toast({
        title: "Validation Error",
        description: "Phone number should be at least 10 digits",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
      toast({
        title: "Success",
        description: "Organizer details saved",
        variant: "default",
      });
    }
  };

  return (
    <Card className="p-6 bg-white border border-gray-200">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">
          Add or select an organizer for this event
        </p>
      </div>

      <div className="space-y-5">
        {/* Organizer Name Field with Dropdown Support */}
        <div className="space-y-2">
          <Label htmlFor="organizerName" className="text-sm font-semibold text-gray-700">
            Organizer Name *
          </Label>
          <div className="relative">
            <Input
              id="organizerName"
              type="text"
              value={searchInput}
              onChange={(e) => handleNameChange(e.target.value)}
              onFocus={() => {
                if (filteredOrganizers.length > 0 && !selectedFromDropdown) {
                  setShowDropdown(true);
                }
              }}
              placeholder={
                subOrganizers.length > 0
                  ? "Type to search or select from list"
                  : "Enter organizer name"
              }
              disabled={isLoading}
              className="h-10 text-sm"
            />

            {/* Dropdown Suggestions */}
            {showDropdown &&
              filteredOrganizers.length > 0 &&
              !selectedFromDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                  {filteredOrganizers.map((org) => (
                    <div
                      key={org._id}
                      onClick={() => handleSelectOrganizer(org._id)}
                      className="px-4 py-3 hover:bg-purple-50 cursor-pointer border-b last:border-b-0 transition-colors"
                    >
                      <div className="font-medium text-sm text-gray-900">
                        {org.name}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {org.email && <span>{org.email}</span>}
                        {org.email && org.phone && <span> • </span>}
                        {org.phone && <span>{org.phone}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            {/* No organizers message */}
            {showDropdown &&
              filteredOrganizers.length === 0 &&
              !selectedFromDropdown &&
              searchInput.trim() && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4">
                  <p className="text-sm text-gray-600 text-center">
                    No organizers found. Continue with manual entry.
                  </p>
                </div>
              )}

            {/* Clear selection button */}
            {selectedFromDropdown && (
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    name: "",
                    email: "",
                    phone: "",
                    subOrganizerId: undefined,
                  }));
                  setSelectedFromDropdown(false);
                  setDropdownValue("");
                  setSearchInput("");
                  setShowDropdown(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {showAutoFillHint && selectedFromDropdown && (
            <p className="text-xs text-green-600 flex items-center gap-1 mt-2">
              ✓ Auto-filled from organizer list
            </p>
          )}
        </div>

        {/* Contact Email */}
        <div className="space-y-2">
          <Label htmlFor="contactEmail" className="text-sm font-semibold text-gray-700">
            Contact Email
          </Label>
          <Input
            id="contactEmail"
            type="email"
            value={formData.email}
            onChange={(e) => handleEmailChange(e.target.value)}
            disabled={selectedFromDropdown || isLoading}
            placeholder="organizer@example.com"
            className="h-10 text-sm"
          />
          {selectedFromDropdown && (
            <p className="text-xs text-gray-500">Auto-filled from organizer record</p>
          )}
        </div>

        {/* Contact Phone */}
        <div className="space-y-2">
          <Label htmlFor="contactPhone" className="text-sm font-semibold text-gray-700">
            Contact Phone
          </Label>
          <Input
            id="contactPhone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            disabled={selectedFromDropdown || isLoading}
            placeholder="10-digit phone number"
            maxLength={15}
            className="h-10 text-sm"
          />
          {selectedFromDropdown && (
            <p className="text-xs text-gray-500">Auto-filled from organizer record</p>
          )}
        </div>

        {/* Selected Organizer Info */}
        {selectedFromDropdown && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs font-semibold text-green-900">
              ✓ Selected from organizer list
            </p>
            <p className="text-xs text-green-800 mt-1">
              Email and phone fields are auto-filled and cannot be edited. Clear the
              selection to enter manually.
            </p>
          </div>
        )}

        {/* Save and Cancel Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="h-9 px-6"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="h-9 px-6 bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default OrganizerDetails;
