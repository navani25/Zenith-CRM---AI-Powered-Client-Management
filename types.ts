export type CustomField = {
  id: number;
  key: string;
  value: string;
};

export type Contact = {
  id: number;
  name: string;
  email: string;
  company: string;
  phone: string;
  status: 'lead' | 'customer' | 'archived';
  avatarUrl: string;
  customFields?: CustomField[];
};

export type DealStage = 'Lead In' | 'Contact Made' | 'Proposal Sent' | 'Won' | 'Lost';

export type Deal = {
  id: number;
  title: string;
  value: number;
  contactName: string;
  contactId: number;
  stage: DealStage;
  probability: number;
  createdDate: string;
};

export type TaskStatus = 'todo' | 'in-progress' | 'done';

export type Task = {
  id: number;
  title: string;
  dueDate: string;
  assignedTo: string;
  status: TaskStatus;
};

export type ActivityType = 'deal_won' | 'new_contact' | 'task_completed' | 'proposal_accepted' | 'new_lead';

export type Activity = {
  id: number;
  type: ActivityType;
  user: {
    name: string;
    avatarUrl: string;
  };
  details: string;
  timestamp: string;
};

export type RevenueData = {
  month: string;
  revenue: number;
};

export type ConversionData = {
  stage: string;
  value: number;
};

export type ReportData = {
  revenue: RevenueData[];
  conversions: ConversionData[];
};

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export type Email = {
  id: number;
  from: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  status: 'inbox' | 'sent' | 'draft';
  read: boolean;
};

export type EmailTemplate = {
  id: number;
  name: string;
  subject: string;
  body: string;
};

export type Proposal = {
  id: number;
  title: string;
  contactName: string;
  contactId: number;

  value: number;
  status: 'draft' | 'sent' | 'accepted' | 'declined';
  createdDate: string;
  lastUpdated: string;
};

export type Page = 
  | 'Dashboard' 
  | 'Leads' 
  | 'Deals' 
  | 'Contacts' 
  | 'Tasks' 
  | 'Calendar'
  | 'Emails'
  | 'Proposals'
  | 'AI Assistant' 
  | 'Analytics'
  | 'Settings'
  | 'Profile';