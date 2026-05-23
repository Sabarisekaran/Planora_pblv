import { LogOut, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { usePrograms } from "@/contexts/ProgramContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { clearPrograms } = usePrograms();
  const [userName, setUserName] = useState("");
  const [userInitial, setUserInitial] = useState("U");
  const [loginMethod, setLoginMethod] = useState("admin");

  useEffect(() => {
    // Check if coordinator or admin is logged in
    const coordinatorName = localStorage.getItem("coordinatorName");
    const coordinatorEmail = localStorage.getItem("coordinatorEmail");
    const userEmail = localStorage.getItem("userEmail");
    const method = localStorage.getItem("loginMethod") || "admin";
    
    setLoginMethod(method);
    
    if (coordinatorName) {
      setUserName(coordinatorName);
      setUserInitial(coordinatorName.charAt(0).toUpperCase());
    } else if (userEmail) {
      setUserName(userEmail);
      setUserInitial(userEmail.charAt(0).toUpperCase());
    }
  }, []);

  const handleLogout = () => {
    console.log('🔓 User logging out...');
    
    // Clear programs from cache BEFORE clearing auth
    clearPrograms();
    
    // Clear all auth data for both admin and coordinator
    localStorage.removeItem("authToken");
    localStorage.removeItem("coordinatorToken");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("coordinatorEmail");
    localStorage.removeItem("coordinatorName");
    localStorage.removeItem("coordinatorId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("loginMethod");
    
    console.log('✅ All data cleared');
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    
    navigate("/login");
  };

  const handleBack = () => {
    // Redirect to the appropriate login page based on how user logged in
    if (loginMethod === "coordinator") {
      navigate("/coordinator-login");
    } else {
      navigate("/login");
    }
  };

  return (
    <header className="flex items-center justify-between bg-card px-6 py-4 border-b border-border">
      <button
        onClick={handleBack}
        className="p-2.5 rounded-xl border border-border hover:bg-muted transition-colors group"
        title="Back to Login"
      >
        <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
      </button>
      
      <div className="text-right">
        <p className="text-sm font-medium text-foreground">{userName || "User"}</p>
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={handleLogout}
          className="p-2.5 rounded-xl border border-border hover:bg-muted transition-colors group"
          title="Logout"
        >
          <LogOut className="w-5 h-5 text-muted-foreground group-hover:text-destructive transition-colors" />
        </button>
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-xs font-bold text-primary">{userInitial}</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
