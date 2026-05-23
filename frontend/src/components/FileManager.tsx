import { Folder, FileText, Image, Upload, Grid3X3, List, Search, MoreVertical } from "lucide-react";
import { useState } from "react";

const folders = [
  { name: "Tech Summit 2026", files: 24, size: "156 MB", icon: "📁" },
  { name: "Design Workshop", files: 12, size: "89 MB", icon: "📁" },
  { name: "Certificates", files: 245, size: "312 MB", icon: "📁" },
  { name: "Posters", files: 18, size: "67 MB", icon: "📁" },
];

const files = [
  { name: "event-poster-v2.png", type: "image", size: "4.2 MB", modified: "Mar 5, 2026" },
  { name: "sponsorship-proposal.pdf", type: "document", size: "1.8 MB", modified: "Mar 4, 2026" },
  { name: "attendee-list.xlsx", type: "document", size: "0.5 MB", modified: "Mar 3, 2026" },
  { name: "banner-design.svg", type: "image", size: "2.1 MB", modified: "Mar 2, 2026" },
  { name: "budget-report.pdf", type: "document", size: "0.9 MB", modified: "Mar 1, 2026" },
  { name: "speaker-photos.zip", type: "archive", size: "45 MB", modified: "Feb 28, 2026" },
];

const FileManager = () => {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">File Manager</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage all your event assets and documents</p>
        </div>
        <button className="ef-btn-primary flex items-center gap-2 text-sm py-2.5">
          <Upload className="w-4 h-4" /> Upload Files
        </button>
      </div>

      {/* Search & View */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search files..." className="ef-input pl-10 py-2.5 text-sm" />
        </div>
        <div className="flex border border-border rounded-xl overflow-hidden">
          <button
            onClick={() => setView("grid")}
            className={`p-2.5 transition-colors ${view === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-2.5 transition-colors ${view === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Folders */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Folders</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {folders.map((f) => (
            <div key={f.name} className="ef-card-hover flex items-center gap-3 p-4 cursor-pointer">
              <Folder className="w-10 h-10 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm truncate">{f.name}</p>
                <p className="text-xs text-muted-foreground">{f.files} files • {f.size}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Files */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Recent Files</h3>
        <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"}>
          {files.map((f, i) => (
            <div key={i} className={`ef-card-hover flex items-center gap-3 ${view === "grid" ? "p-4" : "p-3"}`}>
              {f.type === "image" ? (
                <Image className="w-8 h-8 text-accent shrink-0" />
              ) : (
                <FileText className="w-8 h-8 text-primary shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm truncate">{f.name}</p>
                <p className="text-xs text-muted-foreground">{f.size} • {f.modified}</p>
              </div>
              <button className="p-1.5 rounded-lg hover:bg-muted transition-colors shrink-0">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Drop Zone */}
      <div className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:bg-muted/50 cursor-pointer transition-colors">
        <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm font-medium text-foreground">Drag and drop files here</p>
        <p className="text-xs text-muted-foreground mt-1">or click to browse • Max 50MB per file</p>
      </div>
    </div>
  );
};

export default FileManager;
