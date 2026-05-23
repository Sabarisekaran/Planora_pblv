import { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { User, Shield, Globe, Edit3, Save, Trash2, Lock, Plus, X, Users } from "lucide-react";
import EventTabs from "@/components/EventTabs";
import { useToast } from "@/hooks/use-toast";
import { subOrganizerApi } from "@/lib/subOrganizerApi";

interface HeadAccount {
  id: string;
  name: string;
  phone: string;
  email: string;
  password: string;
}

interface SubOrganizerData {
  id: string;
  name: string;
  phone: string;
  email: string;
  coordinatorId: string;
}

interface CoordinatorData {
  id: string;
  name: string;
  phone: string;
  email: string;
  subOrganizers?: SubOrganizerData[];
}

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const SettingsPage = () => {
  const [headAccounts, setHeadAccounts] = useState<CoordinatorData[]>([]);
  const [selectedHeadId, setSelectedHeadId] = useState<string | null>(null);
  const [isEditingSelected, setIsEditingSelected] = useState(false);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [isLoadingCoordinators, setIsLoadingCoordinators] = useState(false);
  
  const [selectedHeadForm, setSelectedHeadForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });
  const [newHeadForm, setNewHeadForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Sub Organizer States
  // Sub Organizer States
  const [subOrganizers, setSubOrganizers] = useState<SubOrganizerData[]>([]);
  const [selectedSubOrganizerForView, setSelectedSubOrganizerForView] = useState<SubOrganizerData | null>(null);
  const [isEditingSubOrganizer, setIsEditingSubOrganizer] = useState(false);
  const [isLoadingSubOrganizers, setIsLoadingSubOrganizers] = useState(false);
  
  const [editFormData, setEditFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [newSubOrganizerForm, setNewSubOrganizerForm] = useState({
    name: "",
    phone: "",
    email: "",
  });
  
  // Head Coordinator Sub Organizers State
  const [selectedHeadSubOrganizerIds, setSelectedHeadSubOrganizerIds] = useState<string[]>([]);
  const [isSubOrganizersPanelOpen, setIsSubOrganizersPanelOpen] = useState(false);
  const [tempSelectedSubOrganizerIds, setTempSelectedSubOrganizerIds] = useState<string[]>([]);
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordChangeMethod, setPasswordChangeMethod] = useState<"password" | "questions">("password");
  const [passwordChangeSecurityAnswers, setPasswordChangeSecurityAnswers] = useState<{ [key: number]: string }>({});

  // Security Questions State
  const [presetQuestions, setPresetQuestions] = useState<string[]>([]);
  const [userSecurityQuestions, setUserSecurityQuestions] = useState<any[]>([]);
  const [hasSecurityQuestions, setHasSecurityQuestions] = useState(false);
  const [isSettingUpSecurityQuestions, setIsSettingUpSecurityQuestions] = useState(false);
  const [securitySetupForm, setSecuritySetupForm] = useState([
    { question: "", answer: "", isPreset: true }
  ]);
  const [securitySetupPassword, setSecuritySetupPassword] = useState("");
  const [isVerifyingSecurityAnswers, setIsVerifyingSecurityAnswers] = useState(false);
  const [securityAnswersForm, setSecurityAnswersForm] = useState<{ [key: number]: string }>({});
  const [securityAnswersVerified, setSecurityAnswersVerified] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Refs for new head form inputs (for Enter key navigation)
  const newHeadNameRef = useRef<HTMLInputElement>(null);
  const newHeadPhoneRef = useRef<HTMLInputElement>(null);
  const newHeadEmailRef = useRef<HTMLInputElement>(null);
  const newHeadPasswordRef = useRef<HTMLInputElement>(null);
  const newHeadConfirmPasswordRef = useRef<HTMLInputElement>(null);

  // Refs for selected head form inputs (for Enter key navigation)
  const selectedHeadNameRef = useRef<HTMLInputElement>(null);
  const selectedHeadPhoneRef = useRef<HTMLInputElement>(null);
  const selectedHeadEmailRef = useRef<HTMLInputElement>(null);
  const selectedHeadPasswordRef = useRef<HTMLInputElement>(null);

  // Refs for sub organizer forms
  const newSubOrganizerNameRef = useRef<HTMLInputElement>(null);
  const newSubOrganizerPhoneRef = useRef<HTMLInputElement>(null);
  const newSubOrganizerEmailRef = useRef<HTMLInputElement>(null);

  // Fetch coordinators from API
  const fetchCoordinators = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }

      setIsLoadingCoordinators(true);
      const response = await fetch("http://localhost:5000/api/coordinators", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch coordinators");
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.coordinators)) {
        // Transform API data to match HeadAccount interface
        const transformedData = data.coordinators.map((coord: any) => ({
          id: coord._id,
          name: coord.name,
          phone: coord.phone,
          email: coord.email,
          password: "", // Don't store password on frontend
        }));
        setHeadAccounts(transformedData);
      }
    } catch (error) {
      console.error("Error fetching coordinators:", error);
      toast({
        title: "Error",
        description: "Failed to load coordinators",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCoordinators(false);
    }
  };

  // Fetch all sub organizers
  const fetchSubOrganizers = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("❌ No auth token found");
        navigate("/login");
        return;
      }

      console.log('📋 Starting fetch sub-organizers...');
      setIsLoadingSubOrganizers(true);
      
      const response = await subOrganizerApi.getAllSubOrganizers();

      console.log('📦 Raw API Response:', response);
      console.log('   Status:', response.status);
      console.log('   Data:', response.data);

      if (response.data && response.data.success) {
        console.log('✅ API returned success: true');
        
        // Handle both response.data.data and response.data.subOrganizers
        const subOrganizersArray = response.data.data || response.data.subOrganizers || [];
        console.log('   Sub-organizers array:', subOrganizersArray);
        console.log('   Count:', subOrganizersArray.length);

        const transformedData = subOrganizersArray.map((sub: any) => {
          console.log(`   Processing: ${sub.name} (${sub.email}) - ID: ${sub._id}`);
          return {
            id: sub._id,
            name: sub.name,
            phone: sub.phone,
            email: sub.email,
            coordinatorId: sub.coordinatorId,
          };
        });

        console.log('✅ Transformed', transformedData.length, 'sub-organizers');
        console.log('   Transformed data:', transformedData);
        
        setSubOrganizers(transformedData);
        
        if (transformedData.length === 0) {
          console.log('⚠️  No sub-organizers in response');
        }
      } else {
        console.error('❌ API returned success: false');
        console.error('   Response:', response.data);
        setSubOrganizers([]);
        toast({
          title: "Error",
          description: response.data?.message || "Failed to fetch sub-organizers",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("❌ Error fetching sub-organizers:", error);
      console.error('   Error message:', error.message);
      console.error('   Response status:', error.response?.status);
      console.error('   Response data:', error.response?.data);
      
      setSubOrganizers([]);
      
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        "Failed to load sub-organizers";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoadingSubOrganizers(false);
      console.log('🏁 Fetch sub-organizers completed');
    }
  };

  const handleSelectSubOrganizerForView = (sub: SubOrganizerData) => {
    setSelectedSubOrganizerForView(sub);
    setEditFormData({ name: sub.name, phone: sub.phone, email: sub.email });
    setIsEditingSubOrganizer(false);
  };

  const handleEditSubOrganizerChange = (field: string, value: string) => {
    if (field === "phone") {
      const phoneDigits = value.replace(/\D/g, "").slice(0, 10);
      setEditFormData((prev) => ({ ...prev, [field]: phoneDigits }));
      return;
    }
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNewSubOrganizerChange = (field: string, value: string) => {
    if (field === "phone") {
      const phoneDigits = value.replace(/\D/g, "").slice(0, 10);
      setNewSubOrganizerForm((prev) => ({ ...prev, [field]: phoneDigits }));
      return;
    }
    setNewSubOrganizerForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSubOrganizerEdit = async () => {
    if (!selectedSubOrganizerForView) return;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }

      // Validate phone is exactly 10 digits
      const cleanPhone = formatPhoneForStorage(editFormData.phone);
      if (cleanPhone.length !== 10) {
        toast({
          title: "Error",
          description: "Phone number must be 10 digits",
          variant: "destructive",
        });
        return;
      }

      // Validate email
      if (!isEmailValid(editFormData.email)) {
        toast({
          title: "Error",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
        return;
      }

      const response = await subOrganizerApi.updateSubOrganizer(selectedSubOrganizerForView.id, {
        name: editFormData.name,
        email: editFormData.email,
        phone: cleanPhone,
      });

      if (!response.data.success) {
        toast({
          title: "Error",
          description: response.data.message || "Failed to update sub organizer",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Sub organizer updated successfully",
      });

      // Refresh the sub organizers list
      await fetchSubOrganizers();
      setSelectedSubOrganizerForView(null);
      setIsEditingSubOrganizer(false);
    } catch (error: any) {
      console.error("Error updating sub organizer:", error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0] ||
                          error.message || 
                          "An error occurred while updating sub organizer";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubOrganizerClick = async () => {
    if (!selectedSubOrganizerForView) return;

    if (!window.confirm(`Are you sure you want to delete ${selectedSubOrganizerForView.name}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await subOrganizerApi.deleteSubOrganizer(selectedSubOrganizerForView.id);

      if (!response.data.success) {
        toast({
          title: "Error",
          description: response.data.message || "Failed to delete sub organizer",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Sub organizer deleted successfully",
      });

      // Refresh the sub organizers list
      setSelectedSubOrganizerForView(null);
      await fetchSubOrganizers();
    } catch (error: any) {
      console.error("Error deleting sub organizer:", error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "An error occurred while deleting sub organizer";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Fetch current user data
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      if (data.success && data.user) {
        setUserData(data.user);
        setProfileForm({
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email,
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      });
    }
  };

  // Fetch preset security questions
  const fetchPresetQuestions = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/preset-questions");

      if (!response.ok) {
        throw new Error("Failed to fetch preset questions");
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.questions)) {
        setPresetQuestions(data.questions);
      }
    } catch (error) {
      console.error("Error fetching preset questions:", error);
    }
  };

  // Fetch user's security questions
  const fetchSecurityQuestions = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5000/api/auth/security-questions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch security questions");
      }

      const data = await response.json();
      if (data.success) {
        setUserSecurityQuestions(data.questions || []);
        setHasSecurityQuestions(data.hasSecurityQuestions || false);
      }
    } catch (error) {
      console.error("Error fetching security questions:", error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    console.log('🚀 Component mounted, fetching initial data...');
    fetchUserData();
    fetchCoordinators();
    fetchPresetQuestions();
    fetchSecurityQuestions();
    // Fetch sub-organizers on mount
    fetchSubOrganizers();
  }, [navigate, toast]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "connection") {
      setSelectedTabIndex(1);
    } else if (tab === "sub-organizers") {
      setSelectedTabIndex(2);
      fetchSubOrganizers(); // Fetch sub organizers when tab is accessed
    } else if (tab === "security") {
      setSelectedTabIndex(3);
    } else {
      setSelectedTabIndex(0);
    }
  }, [searchParams]);

  // Fetch sub-organizers when tab is changed to Sub Organizers
  useEffect(() => {
    if (selectedTabIndex === 2) {
      console.log('🔄 Sub Organizers tab activated, fetching data...');
      fetchSubOrganizers();
    }
  }, [selectedTabIndex]);

  const selectedHead = useMemo(
    () => headAccounts.find((head) => head.id === selectedHeadId) ?? null,
    [headAccounts, selectedHeadId]
  );

  useEffect(() => {
    if (selectedHead) {
      setSelectedHeadForm({
        name: selectedHead.name,
        phone: selectedHead.phone,
        email: selectedHead.email,
        password: "", // Don't show password
      });
      // Set selected sub organizers for this head
      setSelectedHeadSubOrganizerIds(
        (selectedHead.subOrganizers as any[])?.map((sub: any) => sub.id || sub._id) || []
      );
      setIsEditingSelected(false);
    } else {
      setSelectedHeadForm({
        name: "",
        phone: "",
        email: "",
        password: "",
      });
      setSelectedHeadSubOrganizerIds([]);
    }
  }, [selectedHead]);

  const handleSelectHead = (id: string) => {
    setSelectedHeadId(id);
    setIsEditingSelected(false);
  };

  const handleSelectedChange = (field: string, value: string) => {
    // Phone validation: only allow digits and limit to 10
    if (field === "phone") {
      const phoneDigits = value.replace(/\D/g, "").slice(0, 10);
      setSelectedHeadForm((prev) => ({ ...prev, [field]: phoneDigits }));
      return;
    }
    // Allow free typing for all other fields
    setSelectedHeadForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNewHeadChange = (field: string, value: string) => {
    // Phone validation: only allow digits and limit to 10
    if (field === "phone") {
      const phoneDigits = value.replace(/\D/g, "").slice(0, 10);
      setNewHeadForm((prev) => ({ ...prev, [field]: phoneDigits }));
      return;
    }
    // Allow free typing for all other fields
    setNewHeadForm((prev) => ({ ...prev, [field]: value }));
  };

  const isEmailValid = (email: string) => {
    if (!email) return false;
    const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
    return emailRegex.test(email);
  };

  const isPhoneValid = (phone: string) => {
    if (!phone) return false;
    return phone.length === 10;
  };

  // Format phone number for display: XXX-XXX-XXXX
  const formatPhoneForDisplay = (phone: string) => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "").slice(0, 10);
    if (cleaned.length === 0) return "";
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  };

  // Store only digits, but display formatted
  const formatPhoneForStorage = (phone: string) => {
    return phone.replace(/\D/g, "").slice(0, 10);
  };

  const canPreviewSelected = 
    selectedHeadForm.name && 
    isPhoneValid(selectedHeadForm.phone || "") && 
    isEmailValid(selectedHeadForm.email || "");
    
  const canPreviewNew = 
    newHeadForm.name && 
    isPhoneValid(newHeadForm.phone || "") && 
    isEmailValid(newHeadForm.email || "") && 
    newHeadForm.password &&
    newHeadForm.confirmPassword;

  // Handler to open sub-organizers panel
  const handleOpenSubOrganizersPanel = () => {
    if (selectedHead) {
      setTempSelectedSubOrganizerIds(selectedHeadSubOrganizerIds);
      setIsSubOrganizersPanelOpen(true);
    }
  };

  // Handler to save sub-organizers selection
  const handleSaveSubOrganizerSelection = async () => {
    if (!selectedHead) return;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`http://localhost:5000/api/coordinators/${selectedHead.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: selectedHeadForm.name,
          email: selectedHeadForm.email,
          phone: formatPhoneForStorage(selectedHeadForm.phone),
          password: selectedHeadForm.password || undefined,
          subOrganizers: tempSelectedSubOrganizerIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.message || "Failed to update coordinator",
          variant: "destructive",
        });
        return;
      }

      setSelectedHeadSubOrganizerIds(tempSelectedSubOrganizerIds);
      setIsSubOrganizersPanelOpen(false);
      
      toast({
        title: "Success",
        description: "Sub-organizers updated successfully",
      });

      // Refresh the coordinators list
      await fetchCoordinators();
    } catch (error: any) {
      console.error("Error updating sub-organizers:", error);
      
      const errorMessage = error.message || "An error occurred while updating sub-organizers";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleCreateSubOrganizer = async () => {
    // Validate required fields
    if (!newSubOrganizerForm.name || !newSubOrganizerForm.email || !newSubOrganizerForm.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (name, email, phone)",
        variant: "destructive",
      });
      return;
    }

    // Validate phone is exactly 10 digits
    const cleanPhone = formatPhoneForStorage(newSubOrganizerForm.phone);
    if (cleanPhone.length !== 10) {
      toast({
        title: "Error",
        description: "Phone number must be 10 digits",
        variant: "destructive",
      });
      return;
    }

    // Validate email
    if (!isEmailValid(newSubOrganizerForm.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await subOrganizerApi.createSubOrganizer({
        name: newSubOrganizerForm.name,
        email: newSubOrganizerForm.email,
        phone: cleanPhone,
        coordinatorId: null,
      });

      if (!response.data.success) {
        toast({
          title: "Error",
          description: response.data.message || "Failed to create sub organizer",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Sub organizer created successfully",
      });

      // Reset form
      setNewSubOrganizerForm({ name: "", phone: "", email: "" });
      
      // Refresh the sub organizers list
      await fetchSubOrganizers();
    } catch (error: any) {
      console.error("Error creating sub organizer:", error);
      
      // Get detailed error message from Axios response
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0] ||
                          error.message || 
                          "An error occurred while creating sub organizer";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleSaveSelected = async () => {
    if (!selectedHead) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`http://localhost:5000/api/coordinators/${selectedHead.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: selectedHeadForm.name,
          email: selectedHeadForm.email,
          phone: formatPhoneForStorage(selectedHeadForm.phone),
          password: selectedHeadForm.password || undefined,
          subOrganizers: selectedHeadSubOrganizerIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.message || "Failed to update coordinator",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Coordinator updated successfully",
      });

      // Refresh the coordinators list
      await fetchCoordinators();
      setIsEditingSelected(false);
    } catch (error: any) {
      console.error("Error updating coordinator:", error);
      
      const errorMessage = error.message || "An error occurred while updating coordinator";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleCreateHead = async () => {
    // Validate
    if (!newHeadForm.name || !newHeadForm.email || !newHeadForm.phone || !newHeadForm.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (newHeadForm.password !== newHeadForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5000/api/coordinators", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newHeadForm.name,
          email: newHeadForm.email,
          phone: formatPhoneForStorage(newHeadForm.phone),
          password: newHeadForm.password,
          confirmPassword: newHeadForm.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.message || "Failed to create coordinator",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Coordinator created successfully",
      });

      // Reset form
      setNewHeadForm({ name: "", phone: "", email: "", password: "", confirmPassword: "" });
      
      // Refresh the coordinators list
      await fetchCoordinators();
    } catch (error) {
      console.error("Error creating coordinator:", error);
      toast({
        title: "Error",
        description: "An error occurred while creating coordinator",
        variant: "destructive",
      });
    }
  };

  const handleDeleteHead = async () => {
    if (!selectedHeadId) return;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`http://localhost:5000/api/coordinators/${selectedHeadId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.message || "Failed to delete coordinator",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Coordinator deleted successfully",
      });

      // Refresh the coordinators list
      setSelectedHeadId(null);
      await fetchCoordinators();
    } catch (error) {
      console.error("Error deleting coordinator:", error);
      toast({
        title: "Error",
        description: "An error occurred while deleting coordinator",
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = async () => {
    // Validation
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in new password fields",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "New password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    // Validate authentication method
    if (passwordChangeMethod === "password") {
      if (!passwordForm.currentPassword) {
        toast({
          title: "Error",
          description: "Please enter your current password",
          variant: "destructive",
        });
        return;
      }
    } else {
      // Security questions method
      if (Object.keys(passwordChangeSecurityAnswers).length !== userSecurityQuestions.length) {
        toast({
          title: "Error",
          description: "Please answer all security questions",
          variant: "destructive",
        });
        return;
      }
    }

    setIsChangingPassword(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }

      let endpoint = "http://localhost:5000/api/auth/change-password";
      let body: any = {
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      };

      if (passwordChangeMethod === "password") {
        body.currentPassword = passwordForm.currentPassword;
      } else {
        endpoint = "http://localhost:5000/api/auth/change-password-with-questions";
        body.answers = passwordChangeSecurityAnswers;
      }

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.message || "Failed to change password",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Password changed successfully",
      });

      // Reset password form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordChangeSecurityAnswers({});
      setPasswordChangeMethod("password");
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Error",
        description: "An error occurred while changing password",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSetSecurityQuestions = async () => {
    // Validation
    const filledQuestions = securitySetupForm.filter(q => q.question && q.answer);
    if (filledQuestions.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one security question and answer",
        variant: "destructive",
      });
      return;
    }

    if (!securitySetupPassword) {
      toast({
        title: "Error",
        description: "Please enter your current password",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5000/api/auth/security-questions/set", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: securitySetupPassword,
          questions: filledQuestions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.message || "Failed to set security questions",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Security questions set successfully",
      });

      // Reset form
      setSecuritySetupForm([{ question: "", answer: "", isPreset: true }]);
      setSecuritySetupPassword("");
      setIsSettingUpSecurityQuestions(false);

      // Refresh security questions
      await fetchSecurityQuestions();
    } catch (error) {
      console.error("Error setting security questions:", error);
      toast({
        title: "Error",
        description: "An error occurred while setting security questions",
        variant: "destructive",
      });
    }
  };

  const handleVerifySecurityAnswers = async () => {
    if (Object.keys(securityAnswersForm).length !== userSecurityQuestions.length) {
      toast({
        title: "Error",
        description: "Please answer all security questions",
        variant: "destructive",
      });
      return;
    }

    setIsVerifyingSecurityAnswers(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5000/api/auth/security-questions/verify", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          answers: securityAnswersForm,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.message || "Failed to verify security answers",
          variant: "destructive",
        });
        return;
      }

      if (data.verified) {
        setSecurityAnswersVerified(true);
        toast({
          title: "Success",
          description: "Security answers verified. You can now change your password.",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "One or more answers are incorrect",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error verifying security answers:", error);
      toast({
        title: "Error",
        description: "An error occurred while verifying security answers",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingSecurityAnswers(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <EventTabs tabs={["Profile", "Connection", "Sub Organizers", "Security"]} activeTab={selectedTabIndex}>
        {/* Profile */}
        <div className="ef-card space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{userData?.firstName} {userData?.lastName}</h3>
              <p className="text-sm text-muted-foreground">{userData?.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="ef-label">First Name</label>
              <input
                type="text"
                value={profileForm.firstName}
                onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                className="ef-input"
                disabled={!isEditingProfile}
              />
            </div>
            <div>
              <label className="ef-label">Last Name</label>
              <input
                type="text"
                value={profileForm.lastName}
                onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                className="ef-input"
                disabled={!isEditingProfile}
              />
            </div>
            <div className="col-span-2">
              <label className="ef-label">Email</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="ef-input"
                disabled={!isEditingProfile}
              />
            </div>
          </div>
          <button className="ef-btn-primary text-sm py-2.5">Save Changes</button>
        </div>

        {/* Connection */}
        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="ef-card space-y-4">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Available Head Accounts</h3>
            </div>
            <p className="text-sm text-muted-foreground">Click a head to view saved profile details on the right.</p>
            <div className="space-y-3">
              {headAccounts.map((head) => (
                <button
                  key={head.id}
                  type="button"
                  onClick={() => handleSelectHead(head.id)}
                  className={`w-full text-left rounded-2xl border p-4 transition ${
                    selectedHeadId === head.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background hover:border-primary/80"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-foreground">{head.name}</p>
                      <p className="text-sm text-muted-foreground">{head.email}</p>
                    </div>
                    <span className="text-xs font-medium text-primary">View</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="ef-card space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Head Account Connection</h3>
              </div>
              {selectedHeadId && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingSelected((prev) => !prev)}
                    className="ef-btn-secondary text-sm py-2"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {isEditingSelected ? "Cancel" : "Edit"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteHead}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm font-medium"
                    title="Delete this head account"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Select a head account to view the saved details, then click edit to update and save.</p>

            {!selectedHeadId ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                Select an available head to show all details here.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="ef-label">Head Name</label>
                    <div className="flex gap-2">
                      <input
                        ref={selectedHeadNameRef}
                        type="text"
                        value={selectedHeadForm?.name || ""}
                        onChange={(event) => handleSelectedChange("name", event.target.value)}
                        onKeyPress={(e) => handleEnterKeySelected(e, selectedHeadPhoneRef)}
                        className="ef-input"
                        disabled={!isEditingSelected}
                      />
                      <button
                        type="button"
                        onClick={handleOpenSubOrganizersPanel}
                        className="px-4 py-2.5 rounded-lg border border-primary bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium whitespace-nowrap"
                        title="Manage sub-organizers for this head account"
                      >
                        <Users className="w-4 h-4 inline mr-1" />
                        Manage
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="ef-label">Phone No <span className="text-xs text-gray-500">(XXX-XXX-XXXX)</span></label>
                    <input
                      ref={selectedHeadPhoneRef}
                      type="tel"
                      placeholder="123-456-7890"
                      maxLength={12}
                      value={formatPhoneForDisplay(selectedHeadForm?.phone || "")}
                      onChange={(event) => handleSelectedChange("phone", event.target.value)}
                      onKeyPress={(e) => handleEnterKeySelected(e, selectedHeadEmailRef)}
                      className="ef-input"
                      disabled={!isEditingSelected}
                    />
                  </div>
                  <div>
                    <label className="ef-label">Email <span className="text-xs text-gray-500">(example@domain.com)</span></label>
                    <input
                      ref={selectedHeadEmailRef}
                      type="email"
                      placeholder="name@example.com"
                      value={selectedHeadForm?.email || ""}
                      onChange={(event) => handleSelectedChange("email", event.target.value)}
                      onKeyPress={(e) => handleEnterKeySelected(e, selectedHeadPasswordRef)}
                      className="ef-input"
                      disabled={!isEditingSelected}
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <label className="ef-label">Password</label>
                    <input
                      ref={selectedHeadPasswordRef}
                      type={isEditingSelected ? "password" : "text"}
                      value={isEditingSelected ? (selectedHeadForm?.password || "") : (selectedHeadForm?.password ? "********" : "")}
                      onChange={(event) => handleSelectedChange("password", event.target.value)}
                      className="ef-input"
                      disabled={!isEditingSelected}
                    />
                  </div>
                </div>

                {!isEditingSelected && selectedHeadSubOrganizerIds.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-border space-y-3">
                    <h5 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      Assigned Sub Organizers ({selectedHeadSubOrganizerIds.length})
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedHead?.subOrganizers?.map((sub: any) => (
                        <div key={sub.id || sub._id} className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                          <p className="font-medium text-sm text-foreground">{sub.name}</p>
                          <p className="text-xs text-muted-foreground">{sub.email}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isEditingSelected && (
                  <div className="mt-6 pt-6 border-t border-border space-y-4">
                    <div>
                      <h5 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        Assign Sub Organizers
                      </h5>
                      <p className="text-xs text-muted-foreground mb-4">Select one or more sub organizers to assign to this head coordinator.</p>
                      
                      {subOrganizers.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                          No sub organizers available. Create some first.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-2 bg-background/50 rounded-lg border border-border/50">
                          {subOrganizers.map((sub) => (
                            <label key={sub.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition">
                              <input
                                type="checkbox"
                                checked={selectedHeadSubOrganizerIds.includes(sub.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedHeadSubOrganizerIds([...selectedHeadSubOrganizerIds, sub.id]);
                                  } else {
                                    setSelectedHeadSubOrganizerIds(selectedHeadSubOrganizerIds.filter(id => id !== sub.id));
                                  }
                                }}
                                className="w-4 h-4 rounded cursor-pointer"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-foreground truncate">{sub.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{sub.email}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {isEditingSelected && (
                  <div className="flex gap-3 mt-6">
                    {canPreviewSelected && (
                      <button
                        type="button"
                        className="flex-1 ef-btn-secondary text-sm py-2.5"
                      >
                        Preview: {selectedHeadForm?.name || ""} → {selectedHeadForm?.phone || ""} → {selectedHeadForm?.email || ""}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleSaveSelected}
                      className="ef-btn-primary text-sm py-2.5"
                    >
                      <Save className="w-4 h-4 mr-2 inline" />
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="pt-6 border-t border-border">
              <h4 className="text-base font-semibold text-foreground">Create New Head Account</h4>
              <p className="text-sm text-muted-foreground">Enter a new head account in the fields below.</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
                <div>
                  <label className="ef-label">Head Name</label>
                  <input
                    ref={newHeadNameRef}
                    type="text"
                    value={newHeadForm?.name || ""}
                    onChange={(event) => setNewHeadForm((prev) => ({ ...prev, name: event.target.value }))}
                    onKeyPress={(e) => handleEnterKeyNew(e, newHeadPhoneRef)}
                    className="ef-input"
                  />
                </div>
                <div>
                  <label className="ef-label">Phone No <span className="text-xs text-gray-500">(XXX-XXX-XXXX)</span></label>
                  <input
                    ref={newHeadPhoneRef}
                    type="tel"
                    placeholder="123-456-7890"
                    maxLength={12}
                    value={formatPhoneForDisplay(newHeadForm?.phone || "")}
                    onChange={(event) => handleNewHeadChange("phone", event.target.value)}
                    onKeyPress={(e) => handleEnterKeyNew(e, newHeadEmailRef)}
                    className="ef-input"
                  />
                </div>
                <div>
                  <label className="ef-label">Email <span className="text-xs text-gray-500">(example@domain.com)</span></label>
                  <input
                    ref={newHeadEmailRef}
                    type="email"
                    placeholder="name@example.com"
                    value={newHeadForm?.email || ""}
                    onChange={(event) => handleNewHeadChange("email", event.target.value)}
                    onKeyPress={(e) => handleEnterKeyNew(e, newHeadPasswordRef)}
                    className="ef-input"
                  />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="ef-label">Password</label>
                  <input
                    ref={newHeadPasswordRef}
                    type="password"
                    placeholder="Enter password (at least 6 characters)"
                    value={newHeadForm?.password || ""}
                    onChange={(event) => setNewHeadForm((prev) => ({ ...prev, password: event.target.value }))}
                    onKeyPress={(e) => handleEnterKeyNew(e, newHeadConfirmPasswordRef)}
                    className="ef-input"
                  />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="ef-label">Confirm Password</label>
                  <input
                    ref={newHeadConfirmPasswordRef}
                    type="password"
                    placeholder="Confirm password"
                    value={newHeadForm?.confirmPassword || ""}
                    onChange={(event) => setNewHeadForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                    className="ef-input"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                {canPreviewNew && (
                  <button
                    type="button"
                    className="flex-1 ef-btn-secondary text-sm py-2.5"
                  >
                    Preview: {newHeadForm?.name || ""} → {newHeadForm?.phone || ""} → {newHeadForm?.email || ""}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCreateHead}
                  className="ef-btn-primary text-sm py-2.5"
                >
                  Create Head Account
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Sub Organizers Tab Content */}
        <div className="space-y-6">
          {/* Top Section - Stats and Search */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="ef-card p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Total Sub Organizers</p>
              <p className="text-3xl font-bold text-foreground mt-2">{subOrganizers.length}</p>
            </div>
            <div className="ef-card p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Active</p>
              <p className="text-3xl font-bold text-primary mt-2">{subOrganizers.filter(s => !s.coordinatorId).length}</p>
            </div>
            <div className="ef-card p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Assigned</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">{subOrganizers.filter(s => s.coordinatorId).length}</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Available Sub Organizers List Card */}
            <div className="lg:col-span-2 ef-card space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Sub Organizers Directory</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Manage your sub-organizers</p>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground"
                />
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {isLoadingSubOrganizers ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center gap-2 text-muted-foreground">
                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground border-t-primary animate-spin"></div>
                    Loading sub-organizers...
                  </div>
                </div>
              ) : subOrganizers.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center">
                  <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">No sub-organizers yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Create your first sub-organizer using the form on the right</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {subOrganizers.map((sub) => (
                    <div
                      key={sub.id}
                      className={`group p-4 rounded-xl border transition-all cursor-pointer ${
                        selectedSubOrganizerForView?.id === sub.id
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/50 hover:bg-muted/30"
                      }`}
                      onClick={() => handleSelectSubOrganizerForView(sub)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground truncate">{sub.name}</p>
                            {sub.coordinatorId && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                                Assigned
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 truncate">{sub.email}</p>
                          <p className="text-xs text-muted-foreground">{formatPhoneForDisplay(sub.phone)}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectSubOrganizerForView(sub);
                              setIsEditingSubOrganizer(true);
                            }}
                            className="p-1.5 rounded hover:bg-muted transition"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectSubOrganizerForView(sub);
                              handleDeleteSubOrganizerClick();
                            }}
                            className="p-1.5 rounded hover:bg-red-50 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Details & Create */}
            <div className="space-y-6">
              {/* Sub Organizer Details Card */}
              {selectedSubOrganizerForView && (
                <div className="ef-card space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-border">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{selectedSubOrganizerForView.name}</p>
                      <p className="text-xs text-muted-foreground">Sub Organizer</p>
                    </div>
                  </div>

                  {isEditingSubOrganizer ? (
                    <div className="space-y-3">
                      <div>
                        <label className="ef-label text-xs">Name</label>
                        <input
                          type="text"
                          value={editFormData.name}
                          onChange={(e) => handleEditSubOrganizerChange("name", e.target.value)}
                          className="ef-input text-sm"
                        />
                      </div>
                      <div>
                        <label className="ef-label text-xs">Phone</label>
                        <input
                          type="tel"
                          maxLength={12}
                          value={formatPhoneForDisplay(editFormData.phone)}
                          onChange={(e) => handleEditSubOrganizerChange("phone", e.target.value)}
                          className="ef-input text-sm"
                        />
                      </div>
                      <div>
                        <label className="ef-label text-xs">Email</label>
                        <input
                          type="email"
                          value={editFormData.email}
                          onChange={(e) => handleEditSubOrganizerChange("email", e.target.value)}
                          className="ef-input text-sm"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingSubOrganizer(false);
                            setEditFormData({
                              name: selectedSubOrganizerForView.name,
                              phone: selectedSubOrganizerForView.phone,
                              email: selectedSubOrganizerForView.email,
                            });
                          }}
                          className="flex-1 px-3 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveSubOrganizerEdit}
                          className="flex-1 px-3 py-2 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition"
                        >
                          <Save className="w-3 h-3 inline mr-1" />
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">EMAIL</p>
                        <p className="text-sm text-foreground font-medium break-all">{selectedSubOrganizerForView.email}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">PHONE</p>
                        <p className="text-sm text-foreground font-medium">{formatPhoneForDisplay(selectedSubOrganizerForView.phone)}</p>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingSubOrganizer(true)}
                          className="flex-1 px-3 py-2 rounded-lg border border-primary text-primary text-xs font-medium hover:bg-primary/5 transition"
                        >
                          <Edit3 className="w-3 h-3 inline mr-1" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteSubOrganizerClick}
                          className="flex-1 px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition"
                        >
                          <Trash2 className="w-3 h-3 inline mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Create New Card */}
              <div className="ef-card space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">New Sub Organizer</p>
                    <p className="text-xs text-muted-foreground">Add to your team</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="ef-label text-xs">Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={newSubOrganizerForm.name}
                      onChange={(e) => setNewSubOrganizerForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="ef-input text-sm"
                    />
                  </div>
                  <div>
                    <label className="ef-label text-xs">Phone <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      placeholder="123-456-7890"
                      maxLength={12}
                      value={formatPhoneForDisplay(newSubOrganizerForm.phone)}
                      onChange={(e) => handleNewSubOrganizerChange("phone", e.target.value)}
                      className="ef-input text-sm"
                    />
                  </div>
                  <div>
                    <label className="ef-label text-xs">Email <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      placeholder="example@domain.com"
                      value={newSubOrganizerForm.email}
                      onChange={(e) => handleNewSubOrganizerChange("email", e.target.value)}
                      className="ef-input text-sm"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCreateSubOrganizer}
                  className="w-full px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Sub Organizer
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="ef-card space-y-6">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Security Settings</h3>
          </div>

          {/* Security Questions Setup */}
          <div className="rounded-2xl border border-border bg-background/50 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-primary" />
                <div>
                  <h4 className="font-semibold text-foreground">Security Questions</h4>
                  <p className="text-sm text-muted-foreground">
                    {hasSecurityQuestions ? "You have security questions set" : "Set up security questions to protect your password changes"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingUpSecurityQuestions(!isSettingUpSecurityQuestions)}
                className="ef-btn-secondary text-sm py-2"
              >
                {isSettingUpSecurityQuestions ? "Cancel" : hasSecurityQuestions ? "Update" : "Set Up"}
              </button>
            </div>

            {isSettingUpSecurityQuestions && (
              <div className="pt-4 border-t border-border">
                <div className="grid grid-cols-2 gap-4 mb-4">
                {securitySetupForm.map((q, idx) => (
                  <div key={idx} className="space-y-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">Question {idx + 1}</label>
                      {securitySetupForm.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setSecuritySetupForm(securitySetupForm.filter((_, i) => i !== idx));
                          }}
                          className="p-1 hover:bg-destructive/10 rounded text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="ef-label text-xs">Select or Custom</label>
                      <select
                        value={q.question}
                        onChange={(e) => {
                          const newForm = [...securitySetupForm];
                          newForm[idx].question = e.target.value;
                          newForm[idx].isPreset = presetQuestions.includes(e.target.value);
                          setSecuritySetupForm(newForm);
                        }}
                        className="ef-input text-sm"
                      >
                        <option value="">Select a question or enter custom</option>
                        {presetQuestions.map((pq) => (
                          <option key={pq} value={pq}>
                            {pq}
                          </option>
                        ))}
                      </select>
                    </div>

                    {!presetQuestions.includes(q.question) && q.question && (
                      <div>
                        <label className="ef-label text-xs">Custom Question</label>
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) => {
                            const newForm = [...securitySetupForm];
                            newForm[idx].question = e.target.value;
                            newForm[idx].isPreset = false;
                            setSecuritySetupForm(newForm);
                          }}
                          placeholder="Enter your own question"
                          className="ef-input text-sm"
                        />
                      </div>
                    )}

                    <div>
                      <label className="ef-label text-xs">Your Answer</label>
                      <input
                        type="text"
                        value={q.answer}
                        onChange={(e) => {
                          const newForm = [...securitySetupForm];
                          newForm[idx].answer = e.target.value;
                          setSecuritySetupForm(newForm);
                        }}
                        placeholder="Enter your answer"
                        className="ef-input text-sm"
                      />
                    </div>
                  </div>
                ))}
                </div>

                {securitySetupForm.length < 5 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSecuritySetupForm([...securitySetupForm, { question: "", answer: "", isPreset: true }]);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-dashed border-primary/40 text-primary hover:bg-primary/5 transition text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Another Question
                  </button>
                )}

                <div>
                  <label className="ef-label">Current Password (to confirm changes)</label>
                  <input
                    type="password"
                    placeholder="Enter your current password"
                    value={securitySetupPassword}
                    onChange={(e) => setSecuritySetupPassword(e.target.value)}
                    className="ef-input"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSetSecurityQuestions}
                  className="w-full ef-btn-primary text-sm py-2.5"
                >
                  <Save className="w-4 h-4 mr-2 inline" />
                  Save Security Questions
                </button>
              </div>
            )}

            {hasSecurityQuestions && !isSettingUpSecurityQuestions && (
              <div className="space-y-2 pt-2">
                {userSecurityQuestions.map((q, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-muted/30 text-sm">
                    <p className="text-foreground font-medium">{idx + 1}. {q.question}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Password Change Section */}
          <div className="rounded-2xl border border-border bg-background/50 p-4">
            <h4 className="font-semibold text-foreground mb-4">Change Password</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Change your password using either your current password or security questions.
            </p>

            {hasSecurityQuestions && (
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setPasswordChangeMethod("password")}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                    passwordChangeMethod === "password"
                      ? "bg-blue-600 text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  Using Password
                </button>
                <button
                  type="button"
                  onClick={() => setPasswordChangeMethod("questions")}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                    passwordChangeMethod === "questions"
                      ? "bg-blue-600 text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  Using Security Questions
                </button>
              </div>
            )}

            <div className="space-y-4">
              {passwordChangeMethod === "password" && (
                <div>
                  <label className="ef-label">Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter your current password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="ef-input"
                    disabled={isChangingPassword}
                  />
                </div>
              )}

              {passwordChangeMethod === "questions" && hasSecurityQuestions && (
                <div className="space-y-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                  <p className="text-sm text-muted-foreground font-medium">Answer your security questions:</p>
                  {userSecurityQuestions.map((q, idx) => (
                    <div key={idx}>
                      <label className="text-sm font-medium text-foreground block mb-1">
                        {idx + 1}. {q.question}
                      </label>
                      <input
                        type="text"
                        value={passwordChangeSecurityAnswers[idx] || ""}
                        onChange={(e) => setPasswordChangeSecurityAnswers({ ...passwordChangeSecurityAnswers, [idx]: e.target.value })}
                        placeholder="Your answer"
                        className="ef-input text-sm"
                        disabled={isChangingPassword}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="ef-label">New Password</label>
                <input
                  type="password"
                  placeholder="Enter a new password (at least 6 characters)"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="ef-input"
                  disabled={isChangingPassword}
                />
              </div>
              <div>
                <label className="ef-label">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Confirm your new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="ef-input"
                  disabled={isChangingPassword}
                />
              </div>
            </div>

            <button
              onClick={handleChangePassword}
              disabled={isChangingPassword}
              className="w-full mt-4 ef-btn-primary text-sm py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChangingPassword ? "Updating Password..." : "Update Password"}
            </button>
          </div>
        </div>
      </EventTabs>

      {/* Sub-Organizers Selection Modal */}
      {isSubOrganizersPanelOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border">
            {/* Modal Header */}
            <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-primary" />
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Manage Sub-Organizers</h2>
                  <p className="text-sm text-muted-foreground mt-1">{selectedHeadForm?.name || "Head Account"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSubOrganizersPanelOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-base font-semibold text-foreground mb-4">Available Sub-Organizers</h3>
                <p className="text-sm text-muted-foreground mb-4">Select one or more sub-organizers to assign to this head coordinator.</p>
                
                {subOrganizers.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No sub-organizers available. Create some first in the Sub-Organizers tab.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto p-3 bg-muted/20 rounded-lg border border-border/50">
                    {subOrganizers.map((sub) => (
                      <label 
                        key={sub.id} 
                        className="flex items-start gap-3 p-4 rounded-lg hover:bg-muted/50 cursor-pointer transition border border-border/50 hover:border-primary/50"
                      >
                        <input
                          type="checkbox"
                          checked={tempSelectedSubOrganizerIds.includes(sub.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTempSelectedSubOrganizerIds([...tempSelectedSubOrganizerIds, sub.id]);
                            } else {
                              setTempSelectedSubOrganizerIds(tempSelectedSubOrganizerIds.filter(id => id !== sub.id));
                            }
                          }}
                          className="w-4 h-4 rounded cursor-pointer mt-1 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground">{sub.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{sub.email}</p>
                          <p className="text-xs text-muted-foreground">{formatPhoneForDisplay(sub.phone)}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Count */}
              {tempSelectedSubOrganizerIds.length > 0 && (
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm font-medium text-foreground">
                    {tempSelectedSubOrganizerIds.length} sub-organizer{tempSelectedSubOrganizerIds.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-background border-t border-border p-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsSubOrganizersPanelOpen(false);
                  setTempSelectedSubOrganizerIds(selectedHeadSubOrganizerIds);
                }}
                className="px-6 py-2.5 rounded-lg border border-border text-foreground hover:bg-muted transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSubOrganizerSelection}
                className="px-6 py-2.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
