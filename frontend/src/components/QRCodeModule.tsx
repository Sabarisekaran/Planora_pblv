import { QrCode, Download, Share2, Copy, Plus } from "lucide-react";

const qrCodes = [
  { id: 1, name: "Tech Summit 2026", event: "Registration", scans: 1243, created: "Mar 1, 2026" },
  { id: 2, name: "Design Workshop", event: "Check-in", scans: 567, created: "Mar 3, 2026" },
  { id: 3, name: "Startup Pitch Night", event: "Feedback Form", scans: 891, created: "Mar 5, 2026" },
  { id: 4, name: "AI Conference", event: "Certificate", scans: 2100, created: "Mar 7, 2026" },
];

const QRCodeModule = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">QR Codes</h2>
          <p className="text-sm text-muted-foreground mt-1">Generate and manage QR codes for your events</p>
        </div>
        <button className="ef-btn-primary flex items-center gap-2 text-sm py-2.5">
          <Plus className="w-4 h-4" /> Generate QR
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {qrCodes.map((qr) => (
          <div key={qr.id} className="ef-card-hover flex flex-col items-center text-center space-y-4">
            <div className="w-32 h-32 bg-muted rounded-xl flex items-center justify-center">
              <QrCode className="w-20 h-20 text-foreground/20" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">{qr.name}</h3>
              <p className="text-xs text-muted-foreground">{qr.event}</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold font-display text-foreground">{qr.scans.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Scans</p>
            </div>
            <div className="flex gap-2">
              <button className="ef-btn-secondary p-2"><Download className="w-4 h-4" /></button>
              <button className="ef-btn-secondary p-2"><Share2 className="w-4 h-4" /></button>
              <button className="ef-btn-secondary p-2"><Copy className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QRCodeModule;
