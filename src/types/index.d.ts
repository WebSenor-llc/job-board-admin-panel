// User and Authentication Types
export interface IUser {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Role and Permission Types
export interface IPermission {
  id: string;
  name: string;
  description: string;
  module?: string;
}

export interface IRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isCustom: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Member Types
export interface IMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'pending' | 'inactive';
  invitedAt?: string;
  lastActive?: string;
  avatar?: string;
}

// Post Types
export interface IPost {
  id: string;
  title: string;
  content: string;
  author: IUser;
  authorId: string;
  category: string;
  tags?: string[];
  status: 'published' | 'draft' | 'archived' | 'flagged';
  createdAt: string;
  updatedAt: string;
  views?: number;
  likes?: number;
}

// Moderation Types
export interface IFlaggedPost {
  id: string;
  postId: string;
  title: string;
  content: string;
  author: string;
  authorEmail: string;
  authorId: string;
  flaggedBy: string;
  flaggedById: string;
  flaggedReason: string;
  flaggedAt: Date | string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  category: string;
  reviewedBy?: string;
  reviewedAt?: Date | string;
  reviewNotes?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Dashboard Stats Types
export interface IDashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalMembers: number;
  pendingModeration: number;
  activeUsers: number;
  userGrowth?: number;
  postGrowth?: number;
}

// Analytics Types
export interface IAnalytics {
  date: string;
  users: number;
  posts: number;
  engagement: number;
}

// Table Types
export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface TableAction<T = any> {
  label: string;
  onClick: (row: T) => void;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file';
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  validation?: any;
}
