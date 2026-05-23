import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, Eye, EyeOff, User, Plus, X, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getApiURL } from "@/utils/baseUrl";

const API_BASE_URL = getApiURL();

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Sign up state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Security Questions State
  const [presetQuestions, setPresetQuestions] = useState<string[]>([]);
  const [securityQuestionsForm, setSecurityQuestionsForm] = useState([
    { question: "", answer: "", isPreset: true }
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) form.requestSubmit();
    }
  };

  // Fetch preset questions
  useEffect(() => {
    const fetchPresetQuestions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/preset-questions`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.questions)) {
            setPresetQuestions(data.questions);
          }
        }
      } catch (error) {
        console.error("Error fetching preset questions:", error);
      }
    };
    fetchPresetQuestions();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.message || "Login failed",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Store auth state and token
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userName", `${data.user.firstName} ${data.user.lastName}`);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("userRole", "admin");
      localStorage.setItem("loginMethod", "admin");

      // Clear any coordinator tokens
      localStorage.removeItem("coordinatorToken");
      localStorage.removeItem("coordinatorEmail");
      localStorage.removeItem("coordinatorName");
      localStorage.removeItem("coordinatorId");

      toast({
        title: "Success",
        description: "Login successful! Welcome back.",
      });

      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 100);
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "Failed to connect to server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate basic fields
    if (!firstName || !signUpEmail || !signUpPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (signUpPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (signUpPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    // Validate security questions
    const filledQuestions = securityQuestionsForm.filter(q => q.question && q.answer);
    if (filledQuestions.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one security question",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email: signUpEmail,
          password: signUpPassword,
          confirmPassword,
          questions: filledQuestions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.message || "Failed to create account",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Store auth state and token
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userName", `${data.user.firstName} ${data.user.lastName}`);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("userRole", "admin");
      localStorage.setItem("loginMethod", "admin");

      // Clear any coordinator tokens
      localStorage.removeItem("coordinatorToken");
      localStorage.removeItem("coordinatorEmail");
      localStorage.removeItem("coordinatorName");
      localStorage.removeItem("coordinatorId");

      toast({
        title: "Success",
        description: "Account created successfully! Welcome to Planora.",
      });

      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 100);
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Error",
        description: "Failed to connect to server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Back to Home - Top Left */}
      <div className="absolute top-6 left-6 z-50">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-white hover:text-gray-200 transition-colors"
        >
          <span>← Back to Home</span>
        </Link>
      </div>

      {/* Left Side - Enhanced Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-900 via-purple-800 to-violet-900 flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-pulse"></div>
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-600 rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-pulse"></div>
          <div className="absolute top-1/3 -right-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-30"></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{backgroundImage: 'linear-gradient(90deg, white 1px, transparent 1px), linear-gradient(white 1px, transparent 1px)', backgroundSize: '50px 50px'}}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-12 max-w-md">
          {/* Logo & Branding */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center shadow-2xl border border-white/20 transform hover:scale-105 transition-transform">
                <span className="text-4xl font-black bg-gradient-to-br from-purple-300 to-violet-300 bg-clip-text text-transparent">P</span>
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-black text-white">Planora</h1>
                <p className="text-sm text-purple-200 font-medium">Event Management Platform</p>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="space-y-4">
            {/* Feature 1 */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all">
                  <span className="text-lg">🎯</span>
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">Smart Planning</p>
                  <p className="text-xs text-purple-200">Manage events efficiently</p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:shadow-lg group-hover:shadow-pink-500/50 transition-all">
                  <span className="text-lg">👥</span>
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">Team Collaboration</p>
                  <p className="text-xs text-purple-200">Work together seamlessly</p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:shadow-lg group-hover:shadow-orange-500/50 transition-all">
                  <span className="text-lg">📊</span>
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">Real-time Analytics</p>
                  <p className="text-xs text-purple-200">Track metrics & insights</p>
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:shadow-lg group-hover:shadow-green-500/50 transition-all">
                  <span className="text-lg">🔒</span>
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">Secure & Reliable</p>
                  <p className="text-xs text-purple-200">Enterprise-grade security</p>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">500+</p>
              <p className="text-xs text-purple-200">Events Managed</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">10K+</p>
              <p className="text-xs text-purple-200">Users</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white">99%</p>
              <p className="text-xs text-purple-200">Uptime</p>
            </div>
          </div>

          {/* Tagline */}
          <p className="text-center text-sm text-purple-200 font-medium">
            The ultimate platform for seamless event management and coordination
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-8 bg-background relative overflow-y-auto">
        <div className="w-full max-w-2xl">
          {/* Form Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isSignUp ? "Create Account" : "Login"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isSignUp
                ? "Create an account to access Planora and manage your events."
                : "Login to access your Planora dashboard and manage programs and events."}
            </p>
          </div>

          {/* Don't Have Account Section - Above Login Form */}
          {!isSignUp && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-bold">Don't have an account?</span>
                <span className="ml-3">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className="font-bold text-blue-600 hover:text-blue-700 underline transition"
                  >
                    Create Account
                  </button>
                </span>
              </p>
            </div>
          )}

          {/* LOGIN FORM */}
          {!isSignUp && (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e)}
                    className="pl-10 h-9 text-sm border-2 border-input focus:border-blue-500 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e)}
                    className="pl-10 pr-10 h-9 text-sm border-2 border-input focus:border-blue-500 focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label htmlFor="remember" className="text-xs text-muted-foreground cursor-pointer">
                    Remember me
                  </label>
                </div>
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  Forgot password?
                </Link>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-9 text-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          )}

          {/* SIGN UP FORM - SINGLE PAGE */}
          {isSignUp && (
            <form onSubmit={handleSignUp} className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {/* Account Info Section */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-600" />
                  Account Information
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {/* First Name */}
                  <div>
                    <label className="text-xs font-medium text-foreground">First Name *</label>
                    <Input
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e)}
                      className="h-8 text-xs border-2 border-input focus:border-blue-500 focus:outline-none transition"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="text-xs font-medium text-foreground">Last Name</label>
                    <Input
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e)}
                      className="h-8 text-xs border-2 border-input focus:border-blue-500 focus:outline-none transition"
                    />
                  </div>

                  {/* Email */}
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-foreground">Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e)}
                        className="pl-10 h-8 text-xs border-2 border-input focus:border-blue-500 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-foreground">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type={showSignUpPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e)}
                        className="pl-10 pr-10 h-8 text-xs border-2 border-input focus:border-blue-500 focus:outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                      >
                        {showSignUpPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Min 6 characters</p>
                  </div>

                  {/* Confirm Password */}
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-foreground">Confirm Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e)}
                        className="pl-10 pr-10 h-8 text-xs border-2 border-input focus:border-blue-500 focus:outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Questions Section */}
              <div className="border-t border-border pt-3">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-600" />
                  Security Questions *
                </h3>
                <p className="text-xs text-muted-foreground mb-2">Add 1-3 security questions for account protection.</p>

                <div className="space-y-2">
                  {securityQuestionsForm.slice(0, 3).map((q, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-muted/30 border border-border/50 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-foreground">Q{idx + 1}</label>
                        {securityQuestionsForm.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setSecurityQuestionsForm(securityQuestionsForm.filter((_, i) => i !== idx));
                            }}
                            className="p-0.5 hover:bg-destructive/10 rounded text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <select
                        value={q.question}
                        onChange={(e) => {
                          const newForm = [...securityQuestionsForm];
                          newForm[idx].question = e.target.value;
                          newForm[idx].isPreset = presetQuestions.includes(e.target.value);
                          setSecurityQuestionsForm(newForm);
                        }}
                        className="w-full px-2 h-7 rounded border-2 border-input bg-background text-foreground text-xs focus:border-blue-500 focus:outline-none transition"
                      >
                        <option value="">Select question</option>
                        {presetQuestions.map((pq) => (
                          <option key={pq} value={pq}>
                            {pq}
                          </option>
                        ))}
                      </select>

                      {!presetQuestions.includes(q.question) && q.question && (
                        <Input
                          type="text"
                          value={q.question}
                          onChange={(e) => {
                            const newForm = [...securityQuestionsForm];
                            newForm[idx].question = e.target.value;
                            newForm[idx].isPreset = false;
                            setSecurityQuestionsForm(newForm);
                          }}
                          placeholder="Custom question"
                          className="h-7 text-xs border-2 border-input focus:border-blue-500 focus:outline-none transition"
                        />
                      )}

                      <Input
                        type="text"
                        value={q.answer}
                        onChange={(e) => {
                          const newForm = [...securityQuestionsForm];
                          newForm[idx].answer = e.target.value;
                          setSecurityQuestionsForm(newForm);
                        }}
                        placeholder="Answer"
                        className="h-7 text-xs border-2 border-input focus:border-blue-500 focus:outline-none transition"
                      />
                    </div>
                  ))}
                </div>

                {securityQuestionsForm.length < 3 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSecurityQuestionsForm([...securityQuestionsForm, { question: "", answer: "", isPreset: true }]);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded border border-dashed border-purple-400 text-purple-600 hover:bg-purple-50 transition text-xs mt-2"
                  >
                    <Plus className="w-3 h-3" />
                    Add Question
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-9 text-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
