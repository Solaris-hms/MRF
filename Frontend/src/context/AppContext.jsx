import React, { createContext, useState, useContext } from 'react';

// Create the context
const AppContext = createContext();

// Create a provider component
export const AppProvider = ({ children }) => {
  const [pendingApprovals, setPendingApprovals] = useState(0);

  const value = {
    pendingApprovals,
    setPendingApprovals,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Create a custom hook to use the context easily
export const useAppContext = () => {
  return useContext(AppContext);
};