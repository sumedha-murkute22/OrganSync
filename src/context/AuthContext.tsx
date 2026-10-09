import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  currentUser: User;
  currentFacility: string;
  setCurrentFacility: (facility: string) => void;
  availableRoles: UserRole[];
  switchUserRole: (role: UserRole) => void;
  switchUser: (userIdOrRole: string) => void;
  canAccessModule: (moduleKey: string) => boolean;
  canPerformAction: (actionKey: string) => boolean;
  isRoleSwitcherOpen: boolean;
  setRoleSwitcherOpen: (open: boolean) => void;
}

export const DEFAULT_USERS: Record<UserRole, User> = {
  'System Administrator': {
    id: 'USR-ADM',
    username: 'admin',
    fullName: 'Dr. Katherine Bell, MD',
    email: 'admin@organsync.health',
    role: 'System Administrator',
    hospital: 'St. Jude National Transplant Institute',
    department: 'Clinical Governance & Medical Direction',
    licenseNumber: 'MD-89210-WA',
  },
  'Transplant Coordinator': {
    id: 'USR-COORD',
    username: 'coordinator',
    fullName: 'Sarah Jenkins, RN, CCTC',
    email: 'coordinator@organsync.health',
    role: 'Transplant Coordinator',
    hospital: 'St. Jude National Transplant Institute',
    department: 'Organ Procurement & Matching Operations',
    licenseNumber: 'RN-44120-WA',
  },
  'Transplant Surgeon': {
    id: 'USR-SURG',
    username: 'surgeon',
    fullName: 'Dr. James Sterling, MD, FACS',
    email: 'surgeon@organsync.health',
    role: 'Transplant Surgeon',
    hospital: 'St. Jude National Transplant Institute',
    department: 'Division of Cardiothoracic & Abdominal Transplantation',
    licenseNumber: 'MD-11904-WA',
  },
  'Transplant Physician': {
    id: 'USR-PHYS',
    username: 'physician',
    fullName: 'Dr. Robert Martinez, MD, FASN',
    email: 'physician@organsync.health',
    role: 'Transplant Physician',
    hospital: 'St. Jude National Transplant Institute',
    department: 'Department of Nephrology & Critical Care',
    licenseNumber: 'MD-33012-WA',
  },
  'Transport Coordinator': {
    id: 'USR-TRN',
    username: 'transport',
    fullName: 'Marcus Cole',
    email: 'transport@organsync.health',
    role: 'Transport Coordinator',
    hospital: 'Pacific Northwest Emergency Medical Courier Hub',
    department: 'Cold-Chain Aviation Logistics',
    licenseNumber: 'LOG-77319',
  },
  'Clinical Auditor': {
    id: 'USR-AUDIT',
    username: 'auditor',
    fullName: 'Patricia Alvarez, JD, CPHQ',
    email: 'auditor@organsync.health',
    role: 'Clinical Auditor',
    hospital: 'National Transplant Accreditation Board',
    department: 'Regulatory Compliance & Quality Audit',
    licenseNumber: 'CPHQ-99021',
  },
};

export const CLINICAL_PERSONAS: User[] = Object.values(DEFAULT_USERS);

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('organsync_role');
    if (saved && DEFAULT_USERS[saved as UserRole]) {
      api.setRole(saved);
      return DEFAULT_USERS[saved as UserRole];
    }
    api.setRole('Transplant Coordinator');
    return DEFAULT_USERS['Transplant Coordinator'];
  });

  const [currentFacility, setCurrentFacility] = useState<string>(
    'St. Jude National Transplant Institute (Seattle, WA)'
  );
  const [isRoleSwitcherOpen, setRoleSwitcherOpen] = useState<boolean>(false);

  const availableRoles: UserRole[] = [
    'System Administrator',
    'Transplant Coordinator',
    'Transplant Surgeon',
    'Transplant Physician',
    'Transport Coordinator',
    'Clinical Auditor',
  ];

  const switchUserRole = (role: UserRole) => {
    const user = DEFAULT_USERS[role];
    if (user) {
      setCurrentUser(user);
      api.setRole(role);
      localStorage.setItem('organsync_role', role);
    }
  };

  const switchUser = (userIdOrRole: string) => {
    const match = CLINICAL_PERSONAS.find(p => p.id === userIdOrRole || p.role === userIdOrRole);
    if (match) {
      setCurrentUser(match);
      api.setRole(match.role);
      localStorage.setItem('organsync_role', match.role);
    }
  };

  /**
   * Principle of Least Privilege: Module-level authorization
   */
  const canAccessModule = (moduleKey: string): boolean => {
    const role = currentUser.role;

    switch (moduleKey) {
      case 'overview':
        return true; // All clinical personnel can see the command overview
      case 'allocation':
        return ['System Administrator', 'Transplant Coordinator', 'Transplant Surgeon', 'Clinical Auditor'].includes(role);
      case 'donors':
        return ['System Administrator', 'Transplant Coordinator', 'Transplant Physician'].includes(role);
      case 'organs':
        return ['System Administrator', 'Transplant Coordinator', 'Transplant Surgeon'].includes(role);
      case 'recipients':
        return ['System Administrator', 'Transplant Coordinator', 'Transplant Physician', 'Transplant Surgeon'].includes(role);
      case 'matching':
        return ['System Administrator', 'Transplant Coordinator', 'Transplant Surgeon'].includes(role);
      case 'transport':
        return ['System Administrator', 'Transplant Coordinator', 'Transport Coordinator'].includes(role);
      case 'surgery':
        return ['System Administrator', 'Transplant Surgeon', 'Transplant Physician'].includes(role);
      case 'outcomes':
        return ['System Administrator', 'Transplant Surgeon', 'Transplant Physician', 'Clinical Auditor'].includes(role);
      case 'reports':
        return true; // De-identified operational metrics available to all roles
      case 'notifications':
        return true;
      case 'admin':
        return ['System Administrator', 'Clinical Auditor'].includes(role);
      default:
        return false;
    }
  };

  const canPerformAction = (actionKey: string): boolean => {
    const role = currentUser.role;
    switch (actionKey) {
      case 'approve_allocation':
        return ['System Administrator', 'Transplant Surgeon'].includes(role);
      case 'register_organ':
      case 'register_donor':
        return ['System Administrator', 'Transplant Coordinator'].includes(role);
      case 'advance_transport':
        return ['System Administrator', 'Transport Coordinator', 'Transplant Coordinator'].includes(role);
      case 'record_implantation':
        return ['System Administrator', 'Transplant Surgeon'].includes(role);
      case 'record_followup':
        return ['System Administrator', 'Transplant Physician', 'Transplant Surgeon'].includes(role);
      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentFacility,
        setCurrentFacility,
        availableRoles,
        switchUserRole,
        switchUser,
        canAccessModule,
        canPerformAction,
        isRoleSwitcherOpen,
        setRoleSwitcherOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
