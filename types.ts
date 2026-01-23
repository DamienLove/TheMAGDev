export enum View {
  Dashboard = 'DASHBOARD',
  Projects = 'PROJECTS',
  Editor = 'EDITOR',
  Design = 'DESIGN',
  Infrastructure = 'INFRASTRUCTURE',
  Marketplace = 'MARKETPLACE',
  Support = 'SUPPORT',
  Settings = 'SETTINGS'
}

export interface Metric {
  label: string;
  value: string;
  change: number; // percentage
  trend: 'up' | 'down' | 'neutral';
}

export interface Deployment {
  id: string;
  environment: 'Production' | 'Staging' | 'Dev';
  status: 'Live' | 'Building' | 'Failed';
  version: string;
  time: string;
}

export interface Task {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  assignee?: string;
  dueDate?: string;
}
