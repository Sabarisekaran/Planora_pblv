import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QrCode, MapPin, User, CalendarDays, Download, Copy, CheckCircle } from "lucide-react";
import { usePrograms } from "@/contexts/ProgramContext";
import { useState } from "react";
import { getQRURL } from "@/utils/baseUrl";

const QRCodesPage = () => {
  const navigate = useNavigate();
  const { programs } = usePrograms();
  const [copied, setCopied] = useState(null);
  const qrPrograms = programs.filter((program) => program.automation?.autoGenerateQR);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">QR Codes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Event cards from created programs with QR code automation enabled.
          </p>
        </div>
        <Button onClick={() => navigate("/create-program")}>Create Program</Button>
      </div>

      {qrPrograms.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No QR-enabled programs found. Enable QR code automation in a program to see it here.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {qrPrograms.map((program) => (
            <Card key={program.id} className="p-6 border border-gray-200 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-purple-600">
                    {program.eventType}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-foreground">
                    {program.eventName || "Untitled Event"}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {program.programCategory || "General Event"}
                  </p>
                </div>
                <div className="rounded-2xl bg-purple-50 p-2 text-purple-600 flex items-center justify-center">
                  {program.eventLogo ? (
                    <img
                      src={program.eventLogo}
                      alt={`${program.eventName || "Event"} logo`}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <QrCode className="w-6 h-6" />
                  )}
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm text-gray-600">
                {program.organizerName && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{program.organizerName}</span>
                  </div>
                )}
                {program.venueName && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{program.venueName}</span>
                  </div>
                )}
                {program.startDate && (
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    <span>{program.startDate}</span>
                  </div>
                )}
                {program.subEvents?.length ? (
                  <div className="text-sm text-gray-500">
                    {program.subEvents.length > 1
                      ? `${program.subEvents.length} sub-events included`
                      : `Event: ${program.subEvents[0]?.name || "Unnamed"}`}
                  </div>
                ) : null}
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                    QR Enabled
                  </span>
                  <span className="text-xs text-gray-500">({program.subEvents?.length || 0} sub-events)</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => navigate(`/programs/${program.id}/qr`)} className="flex-1">
                    View QR Codes
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    const registrationUrl = getQRURL(`/register/${program.id}`);
                    navigator.clipboard.writeText(registrationUrl);
                    setCopied(`reg-${program.id}`);
                    setTimeout(() => setCopied(null), 2000);
                  }}>
                    {copied === `reg-${program.id}` ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default QRCodesPage;
