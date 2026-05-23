import { Type, Image, Square, Circle, Minus, Undo2, Redo2, Download, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";

const templates = [
  { name: "Tech Conference", color: "bg-primary/10" },
  { name: "Workshop", color: "bg-accent/10" },
  { name: "Seminar", color: "bg-success/10" },
  { name: "Meetup", color: "bg-warning/10" },
  { name: "Hackathon", color: "bg-destructive/10" },
  { name: "Webinar", color: "bg-secondary/10" },
];

const tools = [
  { icon: Type, label: "Text" },
  { icon: Image, label: "Image" },
  { icon: Square, label: "Rectangle" },
  { icon: Circle, label: "Circle" },
  { icon: Minus, label: "Line" },
];

const PosterDesigner = () => {
  const [selectedTool, setSelectedTool] = useState("Text");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Poster Designer</h2>
          <p className="text-sm text-muted-foreground mt-1">Create stunning event posters and banners</p>
        </div>
        <div className="flex gap-2">
          <button className="ef-btn-secondary flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="ef-btn-primary text-sm py-2.5">Save Design</button>
        </div>
      </div>

      <div className="grid grid-cols-[220px_1fr_280px] gap-6 min-h-[600px]">
        {/* Templates Panel */}
        <div className="ef-card space-y-4 p-4">
          <h3 className="font-semibold text-sm text-foreground">Templates</h3>
          <div className="space-y-2">
            {templates.map((t) => (
              <div
                key={t.name}
                className="p-3 rounded-xl border border-border hover:border-primary/40 cursor-pointer transition-all hover:bg-muted/50"
              >
                <div className={`w-full h-16 rounded-lg ${t.color} mb-2`} />
                <p className="text-xs font-medium text-foreground">{t.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="ef-card p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
            {tools.map((tool) => (
              <button
                key={tool.label}
                onClick={() => setSelectedTool(tool.label)}
                className={`p-2.5 rounded-lg transition-colors ${
                  selectedTool === tool.label
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                title={tool.label}
              >
                <tool.icon className="w-4 h-4" />
              </button>
            ))}
            <div className="w-px h-6 bg-border mx-1" />
            <button className="p-2.5 rounded-lg text-muted-foreground hover:bg-muted"><Undo2 className="w-4 h-4" /></button>
            <button className="p-2.5 rounded-lg text-muted-foreground hover:bg-muted"><Redo2 className="w-4 h-4" /></button>
            <div className="ml-auto flex items-center gap-1">
              <button className="p-2 rounded-lg text-muted-foreground hover:bg-muted"><ZoomOut className="w-4 h-4" /></button>
              <span className="text-xs text-muted-foreground font-medium px-2">100%</span>
              <button className="p-2 rounded-lg text-muted-foreground hover:bg-muted"><ZoomIn className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="flex-1 bg-muted rounded-xl flex items-center justify-center">
            <div className="text-center space-y-2">
              <Image className="w-12 h-12 text-muted-foreground/40 mx-auto" />
              <p className="text-sm text-muted-foreground">Select a template or start from scratch</p>
              <p className="text-xs text-muted-foreground">Canvas: 1080 × 1080px</p>
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        <div className="ef-card space-y-5 p-4">
          <h3 className="font-semibold text-sm text-foreground">Properties</h3>
          <div className="space-y-4">
            <div>
              <label className="ef-label">Font Family</label>
              <select className="ef-input text-sm py-2">
                <option>Plus Jakarta Sans</option>
                <option>Inter</option>
                <option>Poppins</option>
              </select>
            </div>
            <div>
              <label className="ef-label">Font Size</label>
              <input type="number" defaultValue={24} className="ef-input text-sm py-2" />
            </div>
            <div>
              <label className="ef-label">Color</label>
              <div className="flex gap-2">
                {["bg-foreground", "bg-primary", "bg-accent", "bg-success", "bg-warning", "bg-destructive"].map((c, i) => (
                  <button key={i} className={`w-8 h-8 rounded-lg ${c} border border-border`} />
                ))}
              </div>
            </div>
            <div>
              <label className="ef-label">Opacity</label>
              <input type="range" min={0} max={100} defaultValue={100} className="w-full accent-primary" />
            </div>
            <div>
              <label className="ef-label">Position</label>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="X" className="ef-input text-sm py-2" />
                <input type="number" placeholder="Y" className="ef-input text-sm py-2" />
              </div>
            </div>
            <div>
              <label className="ef-label">Size</label>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="W" className="ef-input text-sm py-2" />
                <input type="number" placeholder="H" className="ef-input text-sm py-2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PosterDesigner;
