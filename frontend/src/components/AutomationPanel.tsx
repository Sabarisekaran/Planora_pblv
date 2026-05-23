import React from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { EventProgram, ProgramAutomation } from "@/contexts/ProgramContext";

interface AutomationPanelProps {
  automation: Partial<ProgramAutomation>;
  onAutomationChange: (automation: Partial<ProgramAutomation>) => void;
}

const AutomationPanel: React.FC<AutomationPanelProps> = ({ automation, onAutomationChange }) => {
  const handleToggle = (field: string, value: boolean) => {
    onAutomationChange({ [field]: value });
  };

  const handleSelectChange = (field: string, value: string) => {
    onAutomationChange({ [field]: value });
  };

  const handleInputChange = (field: string, value: string | number) => {
    onAutomationChange({ [field]: value });
  };

  const handleCheckboxChange = (field: string, value: boolean) => {
    const proposalOptions = automation.proposalOptions || {
      eventProposal: false,
      budgetPlan: false,
      sponsorLetter: false,
      permissionLetter: false,
    };
    onAutomationChange({
      proposalOptions: { ...proposalOptions, [field]: value },
    });
  };

  return (
    <div className="space-y-6">
      {/* Main Automation Features */}
      <Card className="p-6 bg-white rounded-2xl border border-gray-200 shadow-md">
        <h3 className="font-semibold text-lg mb-4 text-gray-900">Automation Features</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
            <Label className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
              Auto Generate Registration QR
            </Label>
            <Switch
              checked={automation.autoGenerateQR || false}
              onCheckedChange={(v) => handleToggle("autoGenerateQR", v)}
            />
          </div>

          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
            <Label className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
              Auto Create Registration Form
            </Label>
            <Switch
              checked={automation.autoCreateForm || false}
              onCheckedChange={(v) => handleToggle("autoCreateForm", v)}
            />
          </div>

          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
            <Label className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
              Auto Create Certificate
            </Label>
            <Switch
              checked={automation.autoCreateCertificate || false}
              onCheckedChange={(v) => handleToggle("autoCreateCertificate", v)}
            />
          </div>

          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
            <Label className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
              Auto Generate Event Poster
            </Label>
            <Switch
              checked={automation.autoGeneratePoster || false}
              onCheckedChange={(v) => handleToggle("autoGeneratePoster", v)}
            />
          </div>

          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
            <Label className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
              Auto Generate Event Proposal
            </Label>
            <Switch
              checked={automation.autoGenerateProposal || false}
              onCheckedChange={(v) => handleToggle("autoGenerateProposal", v)}
            />
          </div>

          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
            <Label className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
              Enable Attendance Tracking
            </Label>
            <Switch
              checked={automation.enableAttendanceTracking || false}
              onCheckedChange={(v) => handleToggle("enableAttendanceTracking", v)}
            />
          </div>
        </div>
      </Card>

      {/* Certificate Settings */}
      {automation.autoCreateCertificate && (
        <Card className="p-6 bg-white rounded-2xl border border-gray-200 shadow-md">
          <h3 className="font-semibold text-lg mb-4 text-gray-900">Certificate Settings</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Certificate Type</Label>
              <Select
                value={automation.certificateType || "participation"}
                onValueChange={(v) => handleSelectChange("certificateType", v)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="participation">Participation Certificate</SelectItem>
                  <SelectItem value="winner">Winner Certificate</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Checkbox
                id="includeQR"
                checked={automation.includeQRInCertificate || false}
                onCheckedChange={(v) => handleToggle("includeQRInCertificate", v as boolean)}
              />
              <Label htmlFor="includeQR" className="text-sm font-medium text-gray-700 cursor-pointer">
                Include QR Verification in Certificate
              </Label>
            </div>
          </div>
        </Card>
      )}

      {/* Registration Settings */}
      {automation.autoCreateForm && (
        <Card className="p-6 bg-white rounded-2xl border border-gray-200 shadow-md">
          <h3 className="font-semibold text-lg mb-4 text-gray-900">Registration Settings</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Form Template</Label>
              <Select
                value={automation.formTemplate || "detailed"}
                onValueChange={(v) => handleSelectChange("formTemplate", v)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">
                    <span className="font-medium">Basic Registration</span>
                  </SelectItem>
                  <SelectItem value="detailed">
                    <span className="font-medium">Detailed Registration</span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {automation.formTemplate === "basic" 
                  ? "Includes: Name, Email" 
                  : "Includes: Name, Email, Phone, Organization, Designation, Comments"}
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Maximum Participants</Label>
              <Input
                type="number"
                placeholder="Leave empty for unlimited"
                value={automation.maxParticipants || ""}
                onChange={(e) => handleInputChange("maxParticipants", parseInt(e.target.value) || 0)}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Registration Deadline</Label>
              <Input
                type="date"
                value={automation.registrationDeadline || ""}
                onChange={(e) => handleInputChange("registrationDeadline", e.target.value)}
                className="mt-2"
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Checkbox
                id="autoClose"
                checked={automation.autoCloseRegistration || false}
                onCheckedChange={(v) => handleToggle("autoCloseRegistration", v as boolean)}
              />
              <Label htmlFor="autoClose" className="text-sm font-medium text-gray-700 cursor-pointer">
                Auto Close Registration at Deadline
              </Label>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800">
                💡 <strong>Tip:</strong> You can customize your form after creation by visiting the Forms section. 
                Add custom fields, change field types, or create a completely custom form from scratch.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Poster Automation */}
      {automation.autoGeneratePoster && (
        <Card className="p-6 bg-white rounded-2xl border border-gray-200 shadow-md">
          <h3 className="font-semibold text-lg mb-4 text-gray-900">Poster Automation</h3>
          <div>
            <Label className="text-sm font-medium text-gray-700">Poster Style</Label>
            <Select
              value={automation.posterStyle || "minimal"}
              onValueChange={(v) => handleSelectChange("posterStyle", v)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minimal">Minimal Poster</SelectItem>
                <SelectItem value="academic">Academic Poster</SelectItem>
                <SelectItem value="creative">Creative Poster</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      )}

      {/* Proposal Generator */}
      {automation.autoGenerateProposal && (
        <Card className="p-6 bg-white rounded-2xl border border-gray-200 shadow-md">
          <h3 className="font-semibold text-lg mb-4 text-gray-900">Proposal Generator</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Checkbox
                id="eventProposal"
                checked={automation.proposalOptions?.eventProposal || false}
                onCheckedChange={(v) => handleCheckboxChange("eventProposal", v as boolean)}
              />
              <Label htmlFor="eventProposal" className="text-sm font-medium text-gray-700 cursor-pointer">
                Event Proposal
              </Label>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Checkbox
                id="budgetPlan"
                checked={automation.proposalOptions?.budgetPlan || false}
                onCheckedChange={(v) => handleCheckboxChange("budgetPlan", v as boolean)}
              />
              <Label htmlFor="budgetPlan" className="text-sm font-medium text-gray-700 cursor-pointer">
                Budget Plan
              </Label>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Checkbox
                id="sponsorLetter"
                checked={automation.proposalOptions?.sponsorLetter || false}
                onCheckedChange={(v) => handleCheckboxChange("sponsorLetter", v as boolean)}
              />
              <Label htmlFor="sponsorLetter" className="text-sm font-medium text-gray-700 cursor-pointer">
                Sponsor Letter
              </Label>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Checkbox
                id="permissionLetter"
                checked={automation.proposalOptions?.permissionLetter || false}
                onCheckedChange={(v) => handleCheckboxChange("permissionLetter", v as boolean)}
              />
              <Label htmlFor="permissionLetter" className="text-sm font-medium text-gray-700 cursor-pointer">
                Permission Letter
              </Label>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AutomationPanel;
