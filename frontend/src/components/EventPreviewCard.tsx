import React from "react";
import { Card } from "@/components/ui/card";
import { Calendar, MapPin, Users, QrCode, FileText, Award, Image, FileCheck } from "lucide-react";
import { EventProgram } from "@/contexts/ProgramContext";

interface EventPreviewCardProps {
  formData: Partial<EventProgram>;
}

const EventPreviewCard: React.FC<EventPreviewCardProps> = ({ formData }) => {
  const [hasLogoError, setHasLogoError] = React.useState(false);

  React.useEffect(() => {
    setHasLogoError(false);
  }, [formData.eventLogo]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
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

  const calculateProgress = (): number => {
    const fields = [
      formData.eventName,
      formData.eventType,
      formData.startDate,
      formData.endDate,
      formData.venueName,
      formData.location,
      formData.organizerName,
      formData.contactEmail,
    ];
    const filledFields = fields.filter((f) => f && f !== "").length;
    return Math.round((filledFields / fields.length) * 100) || 0;
  };

  const progress = calculateProgress();

  const assetsList = [
    { icon: QrCode, label: "QR Code", key: "autoGenerateQR" },
    { icon: FileText, label: "Registration Form", key: "autoCreateForm" },
    { icon: Award, label: "Certificate", key: "autoCreateCertificate" },
    { icon: Image, label: "Poster", key: "autoGeneratePoster" },
    { icon: FileCheck, label: "Proposal", key: "autoGenerateProposal" },
  ];

  const activeAssets = assetsList.filter((asset) => formData.automation?.[asset.key as keyof typeof formData.automation]);

  return (
    <div className="space-y-6">
      {/* Preview Card */}
      <Card className="relative p-8 bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
        <div className="absolute top-4 right-4 w-36 rounded-2xl border border-white bg-white/95 p-2.5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500">Theme</p>
            <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-emerald-700 bg-emerald-100 rounded-full px-2 py-0.5">
              {((formData as any).themeType || "static").toUpperCase()}
            </span>
          </div>
          <div className="mt-2 h-8 rounded-xl border border-gray-200 overflow-hidden">
            <div
              className="h-full"
              style={
                (formData as any).themeType === "gradient"
                  ? {
                      background: (formData as any).gradientType === "radial"
                        ? `radial-gradient(circle, ${(formData as any).gradientStartColor || "#1E40AF"}, ${(formData as any).gradientEndColor || "#5B21B6"})`
                        : `linear-gradient(${(formData as any).gradientAngle || 90}deg, ${(formData as any).gradientStartColor || "#1E40AF"}, ${(formData as any).gradientEndColor || "#5B21B6"})`,
                    }
                  : { backgroundColor: formData.themeColor || "#6D28D9" }
              }
            />
          </div>
          <p className="mt-2 text-[10px] text-gray-500 truncate">
            {formData.eventLogo ? "Logo uploaded" : "Logo placeholder"}
          </p>
        </div>

        <div className="relative">
          <div className="flex items-start gap-4 mb-6">
            {formData.eventLogo && !hasLogoError ? (
              <div className="w-16 h-16 rounded-lg overflow-hidden border-4 border-white shadow-md flex-shrink-0">
                <img 
                  src={formData.eventLogo} 
                  alt="Event Logo" 
                  className="w-full h-full object-cover"
                  onError={() => {
                    setHasLogoError(true);
                  }}
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-200 border-4 border-white shadow-md flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-gray-500">Logo</span>
              </div>
            )}

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900" title={formData.eventName || "Event Name"}>
                {formData.eventName || "Event Name"}
              </h2>
              <p className="text-sm text-gray-600 mt-1">{formData.programCategory || "Category"}</p>
            </div>
          </div>

          <div className="space-y-3 border-t border-gray-200 pt-4">
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Calendar className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <span>
                {formData.startDate ? formatDate(formData.startDate) : "Start Date"}
                {formData.endDate && formData.endDate !== formData.startDate ? ` - ${formatDate(formData.endDate)}` : ""}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-700">
              <MapPin className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <span>{formData.venueName || "Venue Name"}</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Users className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <span>{formData.organizerName || "Organizer Name"}</span>
            </div>

            {formData.isOnline && (
              <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                <p className="text-xs font-medium text-blue-700">
                  Online Event {formData.meetingLink && `• ${formData.meetingLink.split("//")[1]?.split("/")[0]}`}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Readiness Progress */}
      <Card className="p-6 bg-white rounded-2xl border border-gray-200 shadow-md">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Event Setup Progress</h3>
            <span className="text-lg font-bold text-purple-600">{progress}%</span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-xs text-gray-600">
            {progress === 100
              ? "Event is fully configured!  ✓"
              : `${100 - progress}% to completion`}
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Generated Assets Preview */}
        <Card className="p-6 bg-white rounded-2xl border border-gray-200 shadow-md min-h-[22rem] h-full">
          <h3 className="font-semibold text-gray-900 mb-4 text-base">Generated Assets</h3>

          {activeAssets.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {activeAssets.map((asset) => {
                const Icon = asset.icon;
                return (
                  <div
                    key={asset.key}
                    className="flex items-center gap-3 p-3 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-100"
                  >
                    <Icon className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700">{asset.label}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-sm text-gray-600">
                Enable automation settings to generate assets
              </p>
            </div>
          )}
        </Card>

        {/* Resource Estimator */}
        <Card className="p-6 bg-white rounded-2xl border border-gray-200 shadow-md min-h-[22rem] h-full">
          <h3 className="font-semibold text-gray-900 mb-4 text-base">Resource Estimator</h3>

          <div className="grid gap-3 text-sm">
            {formData.automation?.autoGeneratePoster && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <span className="text-gray-700">Posters:</span>
                <span className="font-semibold text-gray-900">1</span>
              </div>
            )}

            {formData.automation?.autoGenerateQR && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <span className="text-gray-700">QR Codes:</span>
                <span className="font-semibold text-gray-900">1</span>
              </div>
            )}

            {formData.automation?.autoCreateCertificate && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <span className="text-gray-700">Certificates:</span>
                <span className="font-semibold text-gray-900">
                  {formData.automation.maxParticipants || "Unlimited"}
                </span>
              </div>
            )}

            {formData.automation?.autoGenerateProposal && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <span className="text-gray-700">Proposal Documents:</span>
                <span className="font-semibold text-gray-900">
                  {Object.values(formData.automation.proposalOptions || {}).filter(Boolean).length}
                </span>
              </div>
            )}

            {formData.automation?.autoCreateForm && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <span className="text-gray-700">Registration Forms:</span>
                <span className="font-semibold text-gray-900">1</span>
              </div>
            )}

            {!Object.values(formData.automation || {}).some((v) => v === true) && (
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <p className="text-sm text-gray-600">Enable automation to see resource estimates</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EventPreviewCard;
