// Database Types for SQL Server Integration
// These types match the IcraMatik database schema

export interface Case {
  id: number;
  caseNumber: string;
  foyNumber: string;
  debtorId: number;
  creditorId: number;
  courtId: number;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  caseType: 'ilamli' | 'ilamsiz' | 'kambiyo';
  status: 'active' | 'pending' | 'completed' | 'closed';
  openDate: Date;
  closeDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: number;
}

export interface Debtor {
  id: number;
  tcNo: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  district?: string;
  birthDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Creditor {
  id: number;
  name: string;
  taxNumber?: string;
  type: 'individual' | 'company' | 'bank';
  phone?: string;
  email?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Court {
  id: number;
  name: string;
  city: string;
  district: string;
  type: 'icra' | 'mahkeme';
  uyapCode?: string;
  createdAt: Date;
}

export interface Transaction {
  id: number;
  caseId: number;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  transactionDate: Date;
  createdAt: Date;
  createdBy: number;
}

export interface Commitment {
  id: number;
  caseId: number;
  totalAmount: number;
  installmentCount: number;
  paidCount: number;
  status: 'active' | 'completed' | 'violated';
  startDate: Date;
  nextPaymentDate?: Date;
  nextPaymentAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommitmentInstallment {
  id: number;
  commitmentId: number;
  installmentNumber: number;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue';
}

export interface Notification {
  id: number;
  caseId: number;
  type: 'tebligat' | 'sms' | 'email';
  recipient: string;
  content: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentAt?: Date;
  deliveredAt?: Date;
  pttBarcode?: string;
  createdAt: Date;
}

export interface UyapLog {
  id: number;
  caseId?: number;
  action: string;
  requestXml?: string;
  responseXml?: string;
  status: 'success' | 'error' | 'pending';
  errorMessage?: string;
  duration: number;
  createdAt: Date;
  createdBy: number;
}

export interface BuyaparAction {
  id: number;
  caseId: number;
  actionType: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestData?: string;
  responseData?: string;
  createdAt: Date;
  completedAt?: Date;
  createdBy: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user' | 'viewer';
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CaseWarning {
  id: number;
  caseId: number;
  message: string;
  type: 'warning' | 'info' | 'critical';
  isActive: boolean;
  createdAt: Date;
  createdBy: number;
}

export interface PostItNote {
  id: number;
  userId: number;
  caseId?: number;
  title: string;
  content: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  caseId?: number;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

// Query result types
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CaseWithRelations extends Case {
  debtor: Debtor;
  creditor: Creditor;
  court: Court;
  warnings?: CaseWarning[];
}

// Filter types
export interface CaseFilter {
  status?: Case['status'];
  caseType?: Case['caseType'];
  courtId?: number;
  debtorId?: number;
  creditorId?: number;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}
