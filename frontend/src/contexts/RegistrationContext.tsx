import React, { createContext, useContext, useState, useCallback } from 'react';
import { registrationApi } from '../services/registrationApi';

interface Registration {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
}

interface RegistrationContextType {
  registrations: Registration[];
  currentRegistration: Registration | null;
  loading: boolean;
  error: string;
  register: (data: any) => Promise<any>;
  checkRegistration: (programId: string, email: string, phone?: string) => Promise<any>;
  fetchRegistrations: (programId: string) => Promise<void>;
  setCurrentRegistration: (registration: Registration | null) => void;
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

export const RegistrationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [currentRegistration, setCurrentRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const register = useCallback(async (data: any) => {
    try {
      setLoading(true);
      setError('');
      const response = await registrationApi.registerUser(data);
      if (response.success) {
        return response;
      } else {
        setError(response.message || 'Registration failed');
        throw new Error(response.message);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkRegistration = useCallback(async (programId: string, email: string, phone?: string) => {
    try {
      setLoading(true);
      setError('');
      const response = await registrationApi.checkRegistration(programId, email, phone);
      if (response.success && response.isRegistered) {
        setCurrentRegistration(response.data);
      }
      return response;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Check failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRegistrations = useCallback(async (programId: string) => {
    try {
      setLoading(true);
      setError('');
      const response = await registrationApi.getProgramRegistrations(programId);
      if (response.success) {
        setRegistrations(response.data);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Fetch failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const value: RegistrationContextType = {
    registrations,
    currentRegistration,
    loading,
    error,
    register,
    checkRegistration,
    fetchRegistrations,
    setCurrentRegistration,
  };

  return (
    <RegistrationContext.Provider value={value}>
      {children}
    </RegistrationContext.Provider>
  );
};

export const useRegistration = () => {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error(
      'useRegistration must be used within RegistrationProvider'
    );
  }
  return context;
};

export default RegistrationContext;
