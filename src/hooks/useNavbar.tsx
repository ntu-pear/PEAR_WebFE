import { createContext, useContext } from 'react';

interface NavbarContextType {
  refreshProfileInNav: () => void;
}

export const NavbarContext = createContext<NavbarContextType | undefined>(
  undefined
);

export const useNavbar = () => {
  const context = useContext(NavbarContext);
  if (!context) {
    throw new Error('useNavbar must be used within a NavbarProvider');
  }
  return context;
};
