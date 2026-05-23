import { Award, Upload, FileText, Send, CheckCircle } from "lucide-react";

const steps = [
  {
    step: 1,
    title: "Upload Template",
    description: "Upload your certificate design template (PNG, PDF, or SVG)",
    icon: Upload,
    status: "completed" as const,
  },
  {
    step: 2,
    title: "Map Fields",
    description: "Map participant data fields to certificate placeholders",
    icon: FileText,
    status: "active" as const,
  },
  {
    step: 3,
    title: "Generate & Send",
    description: "Generate certificates and email them to participants",
    icon: Send,
    status: "pending" as const,
  },
];

const certificates = [
  { name: "Tech Summit Certificate", generated: 245, pending: 12, template: "Modern Blue" },
  { name: "Workshop Completion", generated: 89, pending: 0, template: "Classic Gold" },
  { name: "Speaker Certificate", generated: 15, pending: 3, template: "Elegant Purple" },
];

const CertificateModule = () => {
  const statusStyles = {
    completed: "bg-green-50 text-green-700 border-green-200",
    active: "bg-orange-50 text-orange-700 border-orange-200",
    pending: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Certificates</h2>
          <p className="text-sm text-muted-foreground mt-1">Design and distribute event certificates</p>
        </div>
        <button className="ef-btn-primary flex items-center gap-2 text-sm py-2.5">
          <Award className="w-4 h-4" /> New Certificate
        </button>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((s) => (
          <div key={s.step} className={`ef-card border ${statusStyles[s.status]} space-y-3`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.status === "completed" ? "bg-success/10" : s.status === "active" ? "bg-primary/10" : "bg-muted"}`}>
                {s.status === "completed" ? (
                  <CheckCircle className="w-5 h-5 text-success" />
                ) : (
                  <s.icon className={`w-5 h-5 ${s.status === "active" ? "text-primary" : "text-muted-foreground"}`} />
                )}
              </div>
              <span className="text-xs font-medium text-muted-foreground">Step {s.step}</span>
            </div>
            <h3 className="font-semibold text-foreground">{s.title}</h3>
            <p className="text-sm text-muted-foreground">{s.description}</p>
          </div>
        ))}
      </div>

      {/* Certificate List */}
      <div className="ef-card">
        <h3 className="font-display font-semibold text-foreground mb-4">Recent Certificates</h3>
        <div className="space-y-3">
          {certificates.map((cert, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground text-sm">{cert.name}</p>
                  <p className="text-xs text-muted-foreground">Template: {cert.template}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="font-semibold text-foreground">{cert.generated}</p>
                  <p className="text-xs text-muted-foreground">Generated</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-warning">{cert.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
                <button className="ef-btn-secondary text-xs px-3 py-1.5">View</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CertificateModule;
