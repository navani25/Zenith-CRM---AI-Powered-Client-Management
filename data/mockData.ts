import { Contact, Deal, Task, ReportData, DealStage, Email, EmailTemplate, Proposal, Activity } from '../types';

export const contactsData: Contact[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', company: 'Innovate Inc.', phone: '555-0101', status: 'customer', avatarUrl: 'https://picsum.photos/seed/1/40/40', customFields: [{ id: 1, key: 'Birthday', value: '1990-05-15' }] },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', company: 'Solutions Co.', phone: '555-0102', status: 'lead', avatarUrl: 'https://picsum.photos/seed/2/40/40', customFields: [{ id: 1, key: 'LinkedIn', value: 'linkedin.com/in/bobsmith' }, {id: 2, key: 'Referred By', value: 'Alice Johnson'}] },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', company: 'Tech Gadgets', phone: '555-0103', status: 'customer', avatarUrl: 'https://picsum.photos/seed/3/40/40' },
  { id: 4, name: 'Diana Prince', email: 'diana@example.com', company: 'Global Exports', phone: '555-0104', status: 'archived', avatarUrl: 'https://picsum.photos/seed/4/40/40' },
  { id: 5, name: 'Ethan Hunt', email: 'ethan@example.com', company: 'Synergy Corp', phone: '555-0105', status: 'lead', avatarUrl: 'https://picsum.photos/seed/5/40/40' },
  { id: 6, name: 'Fiona Glenanne', email: 'fiona@example.com', company: 'Data Systems', phone: '555-0106', status: 'customer', avatarUrl: 'https://picsum.photos/seed/6/40/40', customFields: [{id: 1, key: 'Subscription', value: 'Premium'}] },
];

const today = new Date();
const getDate = (daysAgo: number) => {
    const date = new Date();
    date.setDate(today.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
}

export const dealsData: Deal[] = [
  { id: 101, title: 'Website Redesign', value: 5000, contactName: 'Bob Smith', contactId: 2, stage: 'Proposal Sent', probability: 75, createdDate: getDate(8) },
  { id: 102, title: 'Marketing Campaign', value: 7500, contactName: 'Ethan Hunt', contactId: 5, stage: 'Contact Made', probability: 50, createdDate: getDate(3) },
  { id: 103, title: 'Cloud Migration', value: 12000, contactName: 'Alice Johnson', contactId: 1, stage: 'Won', probability: 100, createdDate: getDate(28) },
  { id: 104, title: 'App Development', value: 25000, contactName: 'Charlie Brown', contactId: 3, stage: 'Lead In', probability: 20, createdDate: getDate(1) },
  { id: 105, title: 'SEO Optimization', value: 3000, contactName: 'Fiona Glenanne', contactId: 6, stage: 'Lost', probability: 0, createdDate: getDate(45) },
  { id: 106, title: 'IT Consulting', value: 4500, contactName: 'Bob Smith', contactId: 2, stage: 'Proposal Sent', probability: 80, createdDate: getDate(18) },
  { id: 107, title: 'New Hardware Rollout', value: 15000, contactName: 'Ethan Hunt', contactId: 5, stage: 'Lead In', probability: 15, createdDate: getDate(5) },
];

export const tasksData: Task[] = [
  { id: 201, title: 'Follow up with Bob Smith', dueDate: '2024-07-25', assignedTo: 'You', status: 'todo' },
  { id: 202, title: 'Prepare proposal for Ethan Hunt', dueDate: '2024-07-28', assignedTo: 'You', status: 'in-progress' },
  { id: 203, title: 'Send invoice to Alice Johnson', dueDate: '2024-07-20', assignedTo: 'You', status: 'done' },
  { id: 204, title: 'Schedule demo with new lead', dueDate: '2024-08-01', assignedTo: 'You', status: 'todo' },
  { id: 205, title: 'Review marketing campaign results', dueDate: '2024-07-22', assignedTo: 'You', status: 'done' },
  { id: 206, title: 'Team meeting', dueDate: new Date().toISOString().split('T')[0], assignedTo: 'You', status: 'todo' },
];

export const activityData: Activity[] = [
  { id: 1, type: 'deal_won', user: { name: 'Brian F.', avatarUrl: 'https://picsum.photos/seed/user/40/40' }, details: 'Won the "Cloud Migration" deal.', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: 2, type: 'new_contact', user: { name: 'Sarah Lee', avatarUrl: 'https://picsum.photos/seed/7/40/40' }, details: 'Added new contact "Innovate Inc.".', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
  { id: 3, type: 'task_completed', user: { name: 'Brian F.', avatarUrl: 'https://picsum.photos/seed/user/40/40' }, details: 'Completed task: "Review marketing campaign results".', timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString() },
  { id: 4, type: 'proposal_accepted', user: { name: 'Charlie Brown', avatarUrl: 'https://picsum.photos/seed/3/40/40' }, details: 'Accepted the "App Development Phase 1" proposal.', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 5, type: 'new_lead', user: { name: 'Alex Ray', avatarUrl: 'https://picsum.photos/seed/8/40/40' }, details: 'New lead assigned: "Synergy Corp".', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
];


export const reportsData: ReportData = {
  revenue: [
    { month: 'Jan', revenue: 1200000 },
    { month: 'Feb', revenue: 15000 },
    { month: 'Mar', revenue: 10000 },
    { month: 'Apr', revenue: 18000 },
    { month: 'May', revenue: 22000 },
    { month: 'Jun', revenue: 25000 },
  ],
  conversions: [
    { stage: 'Lead In', value: 400 },
    { stage: 'Contact Made', value: 300 },
    { stage: 'Proposal Sent', value: 200 },
    { stage: 'Won', value: 100 },
  ],
};

export const dealStages: DealStage[] = ['Lead In', 'Contact Made', 'Proposal Sent', 'Won', 'Lost'];

export const emailsData: Email[] = [
    { id: 1, from: 'bob@example.com', to: 'you@zenith.com', subject: 'Re: Website Redesign Proposal', body: 'Hi, thanks for sending that over. It looks great! Let\'s schedule a call to discuss next week. Best, Bob', date: '2024-07-24T10:00:00Z', status: 'inbox', read: false },
    { id: 2, from: 'you@zenith.com', to: 'ethan@example.com', subject: 'Following up on our marketing campaign', body: 'Hi Ethan, just wanted to check in and see if you had any questions about the marketing campaign proposal we discussed. Let me know!', date: '2024-07-23T14:30:00Z', status: 'sent', read: true },
    { id: 3, from: 'notifications@synergy.com', to: 'you@zenith.com', subject: 'Your invoice is paid', body: 'Hi, your recent invoice #INV-003 for Cloud Migration has been paid. Thank you!', date: '2024-07-22T09:00:00Z', status: 'inbox', read: true },
];

export const emailTemplatesData: EmailTemplate[] = [
    { id: 1, name: 'Follow-up After Meeting', subject: 'Following up from our meeting', body: 'Hi {{contact.name}},\n\nIt was great speaking with you earlier today. I\'ve attached the documents we discussed. Please let me know if you have any questions.\n\nBest,\n{{user.name}}' },
    { id: 2, name: 'Cold Outreach', subject: 'Quick Question', body: 'Hi {{contact.name}},\n\nMy name is {{user.name}} and I work at Zenith CRM. I came across your company and was impressed by your work in the industry. I was wondering if you might be open to a brief chat next week about how we can help streamline your sales process.\n\nBest,\n{{user.name}}' },
];

export const proposalsData: Proposal[] = [
    { id: 301, title: 'Website Redesign for Solutions Co.', contactName: 'Bob Smith', contactId: 2, value: 5000, status: 'sent', createdDate: '2024-07-20', lastUpdated: '2024-07-21' },
    { id: 302, title: 'Q3 Marketing Campaign', contactName: 'Ethan Hunt', contactId: 5, value: 7500, status: 'draft', createdDate: '2024-07-22', lastUpdated: '2024-07-24' },
    { id: 303, title: 'App Development Phase 1', contactName: 'Charlie Brown', contactId: 3, value: 25000, status: 'accepted', createdDate: '2024-06-15', lastUpdated: '2024-07-01' },
    { id: 304, title: 'SEO Optimization Package', contactName: 'Fiona Glenanne', contactId: 6, value: 3000, status: 'declined', createdDate: '2024-06-10', lastUpdated: '2024-06-18' },
];