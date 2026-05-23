import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, QrCode, Users, Award, Newspaper } from "lucide-react";

const Landing = () => {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const steps = [
    {
      number: 1,
      title: "Create Program",
      description: "Set up event schedule, tracks, and sessions. Structure the event timeline easily.",
      icon: BookOpen,
    },
    {
      number: 2,
      title: "Add Events",
      description: "Add specific sessions, speakers, and details. Populate the program with content.",
      icon: Calendar,
    },
    {
      number: 3,
      title: "Generate QR",
      description: "Instantly generate unique QR codes for attendance. Track participation seamlessly.",
      icon: QrCode,
    },
    {
      number: 4,
      title: "Collect Registrations",
      description: "Open online registration with custom forms. Manage attendees and payments effortlessly.",
      icon: Users,
    },
    {
      number: 5,
      title: "Generate Certificates",
      description: "Automatically design and email digital certificates. Reward participants quickly and professionally.",
      icon: Award,
    },
  ];

  const features = [
    { icon: Users, title: "Smart Registration", description: "Seamless online form with custom fields" },
    { icon: QrCode, title: "QR Management", description: "Instant QR generation and tracking" },
    { icon: Award, title: "Certificates", description: "Auto-generated digital certificates" },
    { icon: Calendar, title: "Program Builder", description: "Easy event scheduling and management" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-sm border-b border-border z-50">
        <div className="w-full px-6 sm:px-8 lg:px-12 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded flex items-center justify-center text-white font-bold">
              P
            </div>
            <span className="text-xl font-bold text-foreground">Planora</span>
          </div>
          <div className="hidden md:flex gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition">
              Features
            </a>
            <a href="#workflow" className="text-muted-foreground hover:text-foreground transition">
              Workflow
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-4">
                  <span className="text-foreground">Launch Your Event in </span>
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Minutes
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  From Idea to Event — Design, Automate, and Manage in One Place.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/login">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full px-8 py-6 text-base">
                    Login →
                  </Button>
                </Link>
                <Link to="/coordinator-login">
                  <Button variant="outline" className="rounded-full px-8 py-6 text-base border-2">
                    Coordinator login
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Illustration */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl opacity-30 blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl p-8 border border-border shadow-xl">
                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Quick Setup</h3>
                      <p className="text-sm text-muted-foreground">Create programs in seconds</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <QrCode className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Smart Tracking</h3>
                      <p className="text-sm text-muted-foreground">QR code attendance tracking</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Registrations</h3>
                      <p className="text-sm text-muted-foreground">Manage attendees easily</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/50 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Effortless Pre-Event Management Workflow
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Five simple steps to launch your event successfully
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="relative group"
                  onMouseEnter={() => setHoveredStep(index)}
                  onMouseLeave={() => setHoveredStep(null)}
                >
                  <div
                    className={`h-full rounded-2xl border-2 p-6 transition-all duration-300 cursor-pointer ${
                      hoveredStep === index
                        ? "border-blue-500 bg-blue-50/50 shadow-lg"
                        : "border-blue-200 bg-white hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold transition-all ${
                        hoveredStep === index
                          ? "bg-gradient-to-br from-purple-600 to-blue-600"
                          : "bg-gradient-to-br from-blue-400 to-cyan-400"
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-2xl font-bold text-blue-600">{step.number}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>

                  {/* Arrow connector */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute -right-8 top-1/2 -translate-y-1/2">
                      <div className="w-8 h-1 bg-gradient-to-r from-blue-400 to-transparent"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage successful events
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="p-8 rounded-xl border border-border hover:border-blue-500 hover:shadow-lg transition-all group bg-card"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:from-purple-600 group-hover:to-blue-600 transition-all">
                    <Icon className="w-6 h-6 text-purple-600 group-hover:text-white transition-all" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-4 sm:px-6 lg:px-8 border-t border-slate-700">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm">&copy; 2026 Planora. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
