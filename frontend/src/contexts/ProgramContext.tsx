import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import programApi from "@/lib/programApi";
import { getAuthToken } from "@/lib/auth";
import { getApiURL } from "@/utils/baseUrl";

export interface ProgramAutomation {
  autoGenerateQR: boolean;
  autoCreateForm: boolean;
  formTemplate?: "basic" | "detailed";
  autoCreateCertificate: boolean;
  autoGeneratePoster: boolean;
  autoGenerateProposal: boolean;
  enableAttendanceTracking: boolean;
  certificateType: "participation" | "winner" | "both";
  includeQRInCertificate: boolean;
  maxParticipants: number;
  registrationDeadline: string;
  autoCloseRegistration: boolean;
  posterStyle: "minimal" | "academic" | "creative";
  proposalOptions: {
    eventProposal: boolean;
    budgetPlan: boolean;
    sponsorLetter: boolean;
    permissionLetter: boolean;
  };
}

export interface SubEvent {
  id: string;
  name: string;
  date: string;
  endDate?: string;
  time: string;
  venueName?: string;
  location?: string;
  organizerName?: string;
  enableDefaultVenue?: boolean;
  defaultVenueName?: string;
  defaultLocation?: string;
}

export interface EventProgram {
  id: string;
  eventName: string;
  eventType: "symposium" | "workshop" | "hackathon" | "seminar" | "conference";
  eventStructure: "single" | "multi";
  subEvents: SubEvent[];
  enableSubEvents: boolean;
  programCategory: string;
  startDate: string;
  endDate: string;
  time: string;
  isMultiDay: boolean;
  venueName: string;
  location: string;
  isOnline: boolean;
  meetingLink: string;
  organizerName: string;
  department: string;
  contactEmail: string;
  contactPhone: string;
  selectedCoordinatorId?: string;
  assignedSubOrganizers?: string[];
  useDefaultVenueLocation?: boolean;
  defaultVenueName?: string;
  defaultLocation?: string;
  themeColor: string;
  themeType: "static" | "gradient";
  gradientType?: "linear" | "radial";
  gradientStartColor?: string;
  gradientEndColor?: string;
  gradientAngle?: number;
  eventLogo: string | null;
  automation: ProgramAutomation;
  status: "draft" | "active" | "completed";
  progress: number;
  createdAt: string;
  updatedAt: string;
}

interface ProgramContextType {
  programs: EventProgram[];
  currentProgram: EventProgram | null;
  addProgram: (program: EventProgram, logoFile?: File) => Promise<boolean>;
  updateProgram: (id: string, program: Partial<EventProgram>, logoFile?: File) => Promise<void>;
  deleteProgram: (id: string) => Promise<void>;
  setCurrentProgram: (program: EventProgram | null) => void;
  hasDuplicateProgramName: (name: string, excludeId?: string) => boolean;
  hasDuplicateSubEventName: (subEvents: SubEvent[], name: string, excludeId?: string) => boolean;
  loadPrograms: (filters?: any) => Promise<void>;
  clearPrograms: () => void;
  isLoading: boolean;
  error: string | null;
}

const ProgramContext = createContext<ProgramContextType | undefined>(undefined);

const getBackendOrigin = (): string => {
  const apiUrl = getApiURL();

  if (apiUrl.startsWith('http://') || apiUrl.startsWith('https://')) {
    return apiUrl.replace(/\/api\/?$/, '');
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return '';
};

const normalizeProgramLogo = (eventLogo?: string | null): string | null => {
  if (!eventLogo) return null;
  if (eventLogo.startsWith('data:') || eventLogo.startsWith('blob:') || eventLogo.startsWith('http://') || eventLogo.startsWith('https://')) {
    return eventLogo;
  }
  if (eventLogo.startsWith('/')) {
    return `${getBackendOrigin()}${eventLogo}`;
  }
  return eventLogo;
};

const normalizeProgram = (program: any) => ({
  ...program,
  eventLogo: normalizeProgramLogo(program.eventLogo),
});

export const ProgramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [programs, setPrograms] = useState<EventProgram[]>([]);
  const [currentProgram, setCurrentProgram] = useState<EventProgram | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize loadPrograms to prevent infinite loops when used in dependency arrays
  const loadPrograms = useCallback(async (filters?: any) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('📋 ProgramContext.loadPrograms - fetching from API');
      const response = await programApi.getAllPrograms(filters);
      
      if (response.data.success) {
        const normalizedPrograms = response.data.data.map(normalizeProgram);
        setPrograms(normalizedPrograms);
        console.log('✅ Programs loaded:', normalizedPrograms.length);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to load programs';
      setError(errorMsg);
      console.error('❌ Error loading programs:', errorMsg);
      console.error('   Full error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array - loadPrograms logic doesn't depend on anything

  // Load programs from API on mount
  useEffect(() => {
    const token = getAuthToken();
    console.log('🔐 Auth token detected, reloading programs...');
    console.log('   Token:', token ? `${token.substring(0, 20)}...` : 'None');
    
    if (token) {
      loadPrograms();
    } else {
      // No token - clear programs
      setPrograms([]);
    }
  }, []); // Run once on mount only - loadPrograms is memoized and stable

  const addProgram = async (program: EventProgram, logoFile?: File): Promise<boolean> => {
    try {
      setError(null);
      const response = await programApi.createProgram(
        {
          ...program,
          eventLogo: null, // Will be handled by multipart
        },
        logoFile
      );

      if (response.data.success) {
        const newProgram = normalizeProgram(response.data.data);
        setPrograms([...programs, newProgram]);
        console.log('✅ Program added:', newProgram.eventName);
        return true;
      } else {
        const errorMsg = response.data.message || 'Failed to create program';
        setError(errorMsg);
        return false;
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to create program';
      setError(errorMsg);
      console.error('Error creating program:', errorMsg);
      return false;
    }
  };

  const hasDuplicateProgramName = (name: string, excludeId?: string): boolean => {
    return programs.some(
      (p) => p.eventName.toLowerCase() === name.toLowerCase() && p.id !== excludeId
    );
  };

  const hasDuplicateSubEventName = (subEvents: SubEvent[], name: string, excludeId?: string): boolean => {
    return subEvents.some(
      (e) => e.name.toLowerCase() === name.toLowerCase() && e.id !== excludeId
    );
  };

  const updateProgram = async (id: string, updates: Partial<EventProgram>, logoFile?: File) => {
    try {
      setError(null);
      
      const response = await programApi.updateProgram(id, updates, logoFile);
      
      if (response.data.success) {
        const updatedProgram = normalizeProgram(response.data.data);
        setPrograms(
          programs.map((p) =>
            p.id === id ? updatedProgram : p
          )
        );
        // Update currentProgram if it's the one being updated
        if (currentProgram?.id === id) {
          setCurrentProgram(updatedProgram);
        }
        console.log('✅ Program updated:', updatedProgram.eventName);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to update program';
      setError(errorMsg);
      console.error('Error updating program:', errorMsg);
      throw err; // Re-throw for component to handle
    }
  };

  const deleteProgram = async (id: string) => {
    try {
      setError(null);
      const response = await programApi.deleteProgram(id);
      if (response.data.success) {
        setPrograms(programs.filter((p) => p.id !== id));
        // Also clear currentProgram if it's the one being deleted
        if (currentProgram?.id === id) {
          setCurrentProgram(null);
        }
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to delete program';
      setError(errorMsg);
      console.error('Error deleting program:', errorMsg);
      throw err; // Re-throw for component to handle
    }
  };

  const clearPrograms = () => {
    console.log('🧹 Clearing all programs from cache');
    setPrograms([]);
    setCurrentProgram(null);
    setError(null);
  };

  return (
    <ProgramContext.Provider
      value={{
        programs,
        currentProgram,
        addProgram,
        updateProgram,
        deleteProgram,
        setCurrentProgram,
        hasDuplicateProgramName,
        hasDuplicateSubEventName,
        loadPrograms,
        clearPrograms,
        isLoading,
        error,
      }}
    >
      {children}
    </ProgramContext.Provider>
  );
};

/**
 * Custom hook to use the ProgramContext
 * Must be called within a ProgramProvider
 * @throws Error if used outside of ProgramProvider
 */
export const usePrograms = (): ProgramContextType => {
  const context = useContext(ProgramContext);
  
  if (context === undefined) {
    throw new Error(
      "usePrograms must be used within a ProgramProvider. " +
      "Make sure your component is wrapped inside <ProgramProvider>."
    );
  }
  
  return context;
};
