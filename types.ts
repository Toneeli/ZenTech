export enum UserRole {
  OWNER = 'OWNER',
  BUILDING_ADMIN = 'BUILDING_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export enum UserStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  building: string;
  unit: string;
  status: UserStatus;
  avatar?: string;
  phoneNumber: string;
  password?: string;
  managedBuilding?: string; // specific building this admin manages
}

export interface VoteOption {
  id: string;
  label: string;
  count: number;
}

export interface VoteItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  deadline: string;
  options: VoteOption[];
  status: 'active' | 'closed';
  totalVotes: number;
  votedUserIds: string[]; // To prevent double voting
  isVisible?: boolean;
  order?: number;
}

export interface VoteCreationRequest {
  topic: string;
  deadline: string;
}

export interface GeminiVoteSuggestion {
  title: string;
  description: string;
  options: string[];
}