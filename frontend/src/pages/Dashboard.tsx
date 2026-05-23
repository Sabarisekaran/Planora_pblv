import React, { useState, useEffect } from "react";
import StatCard from "@/components/StatCard";
import ProgramCard from "@/components/ProgramCard";
import { Users, Calendar, QrCode, Award, TrendingUp, ArrowRight, Plus, Search, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePrograms } from "@/contexts/ProgramContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [userName, setUserName] = useState("User");
  const { programs, loadPrograms } = usePrograms();

  useEffect(() => {
    // Get logged-in user name (admin or coordinator)
    const coordinatorName = localStorage.getItem("coordinatorName");
    const adminName = localStorage.getItem("userName");
    const userEmail = localStorage.getItem("userEmail");
    const userRole = localStorage.getItem("userRole");
    const coordinatorId = localStorage.getItem("coordinatorId");
    
    if (coordinatorName) {
      setUserName(coordinatorName);
      console.log('🎭 Coordinator logged in:', {
        name: coordinatorName,
        coordinatorId: coordinatorId,
      });
    } else if (adminName) {
      setUserName(adminName);
      console.log('👨‍💼 Admin logged in:', adminName);
    } else if (userEmail) {
      setUserName(userEmail.split("@")[0]);
    }

    // Reload programs when Dashboard loads to ensure we have the right coordinator's programs
    console.log('📊 Dashboard mounted - reloading programs for current user');
    console.log('   User role:', userRole);
    console.log('   Programs before load:', programs.length);
    loadPrograms();
  }, [loadPrograms]); // Include loadPrograms in deps to satisfy exhaustive-deps rule

  const handleNewProgram = () => {
    navigate("/create-program");
  };

  // Helper function to check if date has passed
  const isDatePassed = (dateString: string): boolean => {
    const programDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return programDate < today;
  };

  // Sort programs: overdue first, then by date
  const sortedPrograms = [...programs].sort((a, b) => {
    const aDatePassed = isDatePassed(a.startDate) && a.status !== "completed";
    const bDatePassed = isDatePassed(b.startDate) && b.status !== "completed";
    
    if (aDatePassed && !bDatePassed) return -1;
    if (!aDatePassed && bDatePassed) return 1;
    
    // If both are overdue or both are not, sort by date
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });

  // Calculate actual statistics from programs
  const totalPrograms = programs.length;
  const activePrograms = programs.filter(p => p.status === "active").length;
  const completedPrograms = programs.filter(p => p.status === "completed").length;
  const overdueProgramsCount = programs.filter(p => isDatePassed(p.startDate) && p.status !== "completed").length;
  const averageProgress = programs.length > 0 
    ? Math.round(programs.reduce((sum, p) => sum + (p.progress || 0), 0) / programs.length) 
    : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header with Search and New Program Button */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Welcome back, <span className="ef-gradient-text">{userName}</span> 👋
          </h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your events today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search programs, events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ef-input pl-10 w-80 py-2.5 text-sm"
            />
          </div>
          <Button 
            onClick={handleNewProgram} 
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            New Program
          </Button>
        </div>
      </div>

      {/* Stats - Total, Active, Completed Programs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Programs" value={totalPrograms} change={`${totalPrograms} created`} changeType="positive" icon={Calendar} />
        <StatCard title="Active Programs" value={activePrograms} change={`Currently running`} changeType="positive" icon={Users} iconBg="bg-accent/10" iconColor="text-accent" />
        <StatCard title="Completed Programs" value={completedPrograms} change={`${completedPrograms} finished`} changeType="positive" icon={Award} iconBg="bg-success/10" iconColor="text-success" />
      </div>

      {/* Programs & Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          {/* Overdue Notification */}
          {overdueProgramsCount > 0 && (
            <div className="ef-card bg-warning/10 border-l-4 border-warning flex items-start gap-3 p-4">
              <AlertCircle className="w-5 h-5 text-warning mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-foreground">Overdue Programs</p>
                <p className="text-sm text-muted-foreground">
                  {overdueProgramsCount} program(s) have passed their start date. Please review and complete them.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-semibold text-foreground">Programs</h2>
            {programs.length > 0 && (
              <button onClick={() => navigate("/programs")} className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {programs.length === 0 ? (
            <div className="ef-card flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-foreground font-medium mb-2">No programs yet</p>
              <p className="text-muted-foreground text-sm mb-6">Create your first program to get started</p>
              <Button onClick={handleNewProgram} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Program
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sortedPrograms.slice(0, 4).map((p) => (
                <ProgramCard 
                  key={p.id} 
                  id={p.id}
                  title={p.eventName}
                  date={new Date(p.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  events={p.subEvents?.length || 0}
                  registrations={0}
                  status={p.status}
                  progress={p.progress}
                  eventStructure={p.eventStructure}
                  isOverdue={isDatePassed(p.startDate)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Activity Feed / Empty State */}
        {programs.length > 0 && (
          <div className="ef-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-foreground">Overview</h3>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Program Status Distribution</p>
                {programs.map((p, i) => (
                  <div key={i} className="flex gap-3 mb-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <p className="text-sm text-foreground">{p.eventName}</p>
                      <p className="text-xs text-muted-foreground capitalize">{p.status} • {p.progress}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Readiness Circle */}
            <div className="pt-4 border-t border-border">
              <h4 className="text-sm font-medium text-foreground mb-4">Portfolio Completion</h4>
              <div className="flex justify-center">
                <div className="w-32 h-32 rounded-full flex items-center justify-center ef-btn-primary shadow-none">
                  <div className="text-center">
                    <p className="text-2xl font-bold font-display">{averageProgress}%</p>
                    <p className="text-xs opacity-80">Average</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
