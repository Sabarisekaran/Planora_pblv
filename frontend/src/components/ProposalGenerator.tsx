import { FileText, Sparkles, Download, Eye } from "lucide-react";

const proposalTypes = [
  { title: "Sponsorship Proposal", description: "Generate proposals for potential sponsors", icon: "💰", count: 12 },
  { title: "Event Budget", description: "Detailed cost breakdown and allocation", icon: "📊", count: 8 },
  { title: "Venue Proposal", description: "Venue comparison and recommendation", icon: "🏛️", count: 5 },
  { title: "Partnership Pitch", description: "Collaboration and partnership proposals", icon: "🤝", count: 3 },
];

const recentProposals = [
  { name: "TechCon 2026 Sponsorship", type: "Sponsorship", status: "sent", date: "Mar 5, 2026" },
  { name: "Annual Budget Q2", type: "Budget", status: "draft", date: "Mar 4, 2026" },
  { name: "Convention Center Eval", type: "Venue", status: "approved", date: "Mar 2, 2026" },
];

const ProposalGenerator = () => {
  const statusStyles: Record<string, string> = {
    sent: "bg-primary/10 text-primary",
    draft: "bg-warning/10 text-warning",
    approved: "bg-success/10 text-success",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Proposal Generator</h2>
          <p className="text-sm text-muted-foreground mt-1">AI-powered proposals for your events</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {proposalTypes.map((p) => (
          <div key={p.title} className="ef-card-hover flex flex-col items-center text-center space-y-3">
            <span className="text-4xl">{p.icon}</span>
            <h3 className="font-semibold text-foreground">{p.title}</h3>
            <p className="text-xs text-muted-foreground">{p.description}</p>
            <p className="text-sm font-medium text-muted-foreground">{p.count} generated</p>
            <button className="ef-btn-primary flex items-center gap-2 text-sm py-2 px-4">
              <Sparkles className="w-3.5 h-3.5" /> Generate
            </button>
          </div>
        ))}
      </div>

      <div className="ef-card">
        <h3 className="font-display font-semibold text-foreground mb-4">Recent Proposals</h3>
        <div className="space-y-3">
          {recentProposals.map((p, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground text-sm">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.type} • {p.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[p.status]}`}>
                  {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                </span>
                <button className="ef-btn-secondary p-2"><Eye className="w-4 h-4" /></button>
                <button className="ef-btn-secondary p-2"><Download className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProposalGenerator;
