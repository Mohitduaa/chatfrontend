import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the UserContext
export const UserContext = createContext();

// Create a provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Check if user data is in localStorage (or sessionStorage)
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null; // Parse the saved user data, or null if not found
  });

  useEffect(() => {
    // Whenever user state changes, save it to localStorage
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]); // Runs whenever user is updated

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Create the custom hook to access the UserContext
export const useUser = () => {
  return useContext(UserContext);
};
