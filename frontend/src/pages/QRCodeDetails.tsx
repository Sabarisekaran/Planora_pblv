import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Image, ArrowLeft } from "lucide-react";
import { usePrograms } from "@/contexts/ProgramContext";

const QRCodeDetailsPage = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const { programs } = usePrograms();
  const program = programs.find((p) => p.id === programId);

  if (!program) {
    return (
      <div className="animate-fade-in space-y-6">
        <Card className="p-6 rounded-2xl border border-gray-200 shadow-sm text-center">
          <h1 className="text-xl font-semibold text-gray-900">QR Type</h1>
          <p className="text-sm text-gray-600 mt-3">Program not found. Please return to the QR list and select a valid program.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/qr-codes")}>Back to QR List</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">QR Type</h1>
          <p className="text-sm text-muted-foreground mt-1">Choose which QR flow to manage for this program.</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/qr-codes")}> 
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      <Card className="p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-purple-600">{program.eventType}</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">{program.eventName || "Untitled Event"}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{program.programCategory || "General Event"}</p>
          </div>
          {program.eventLogo ? (
            <img src={program.eventLogo} alt="Event Logo" className="h-16 w-16 rounded-lg object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <QrCode className="w-6 h-6" />
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <QrCode className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="text-base font-semibold text-gray-900">Registration QR</h3>
              <p className="text-sm text-gray-600">Use this QR for attendee registration and check-in workflows.</p>
            </div>
          </div>
          <Button className="w-full" onClick={() => navigate(`/qr-codes/${program.id}?type=registration`)}>
            Open Registration QR
          </Button>
        </Card>

        <Card className="p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Image className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="text-base font-semibold text-gray-900">Poster QR</h3>
              <p className="text-sm text-gray-600">Use this QR for event posters and promotional design.</p>
            </div>
          </div>
          <Button className="w-full" onClick={() => navigate(`/qr-codes/${program.id}?type=poster`)}>
            Open Poster QR
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default QRCodeDetailsPage;
