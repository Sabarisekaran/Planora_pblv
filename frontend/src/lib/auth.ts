// Authentication utility functions

export const isAdminLoggedIn = (): boolean => {
  return !!localStorage.getItem("authToken");
};

export const isCoordinatorLoggedIn = (): boolean => {
  return !!localStorage.getItem("coordinatorToken");
};

export const isAnyoneLoggedIn = (): boolean => {
  return isAdminLoggedIn() || isCoordinatorLoggedIn();
};

export const getUserRole = (): "admin" | "coordinator" | null => {
  if (isAdminLoggedIn()) {
    return "admin";
  }
  if (isCoordinatorLoggedIn()) {
    return "coordinator";
  }
  return null;
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem("authToken") || localStorage.getItem("coordinatorToken");
};

export const logout = (): void => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("coordinatorToken");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("coordinatorEmail");
  localStorage.removeItem("coordinatorName");
  localStorage.removeItem("coordinatorId");
  localStorage.removeItem("userRole");
  localStorage.removeItem("isAuthenticated");
};
