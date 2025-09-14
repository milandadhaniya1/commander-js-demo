export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator' | 'guest';
  age?: number;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  due?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Config {
  theme: 'default' | 'dark' | 'light' | 'rainbow';
  colorOutput: boolean;
  dateFormat: 'locale' | 'iso' | 'us' | 'eu';
  defaultPriority: 'low' | 'medium' | 'high' | 'urgent';
  autoSave: boolean;
  maxItems: number;
  apiUrl: string;
  timeout: number;
  language: 'en' | 'es' | 'fr' | 'de' | 'it';
  debug: boolean;
}

export interface SystemInfo {
  hostname: string;
  platform: string;
  release: string;
  uptime: string;
  loadAverage: string;
  memory: {
    total: string;
    free: string;
    used: string;
    usagePercent: string;
  };
  cpu: {
    model: string;
    cores: number;
    speed: string;
  };
  node: {
    nodeVersion: string;
    platform: string;
    arch: string;
    projectName: string;
    projectVersion: string;
    pid: number;
    cwd: string;
  };
  disk?: Array<{
    mount: string;
    total: string;
    used: string;
    free: string;
    usagePercent: string;
  }>;
}

export interface ValidationResult {
  valid: boolean;
  value?: any;
  message?: string;
}

export interface CommandOptions {
  debug?: boolean;
  config?: string;
  color?: boolean;
}

export interface FileOptions {
  content?: string;
  template?: 'json' | 'js' | 'md' | 'html' | 'text';
  force?: boolean;
  lines?: number;
  format?: boolean;
  stats?: boolean;
  ext?: string;
  detailed?: boolean;
  hidden?: boolean;
  recursive?: boolean;
}

export interface UserOptions {
  interactive?: boolean;
  role?: User['role'];
  age?: number;
  phone?: string;
  format?: 'table' | 'json' | 'simple';
  sort?: 'name' | 'email' | 'role' | 'createdAt';
  limit?: number;
  name?: string;
  email?: string;
  caseInsensitive?: boolean;
  force?: boolean;
}

export interface TaskOptions {
  description?: string;
  priority?: Task['priority'];
  due?: string;
  tags?: string;
  interactive?: boolean;
  status?: Task['status'];
  tag?: string;
  format?: 'table' | 'json' | 'simple';
  sort?: 'title' | 'priority' | 'due' | 'created';
  reverse?: boolean;
  limit?: number;
  text?: string;
  caseInsensitive?: boolean;
  force?: boolean;
}

export interface SystemOptions {
  detailed?: boolean;
  format?: 'table' | 'json' | 'simple';
  color?: boolean;
  interval?: number;
  count?: number;
}

export interface ConfigOptions {
  all?: boolean;
  format?: 'json' | 'table' | 'simple';
  force?: boolean;
  key?: string;
  merge?: boolean;
}

// Profile-related types
export type Theme = 'default' | 'dark' | 'light' | 'rainbow';
export type Skill = 'javascript' | 'typescript' | 'react' | 'nodejs' | 'python' | 'java' | 'css' | 'sql' | 'docker' | 'aws';
export type Operation = 'validate' | 'save' | 'email' | 'setup' | 'analytics' | 'welcome';

export interface ProfileOptions {
  role?: 'admin' | 'developer' | 'designer' | 'user';
  age?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  email?: string;
  theme?: Theme;
  skills?: string;
  operations?: string;
  interactive?: boolean;
  format?: 'box' | 'table' | 'json';
  force?: boolean;
}

export interface ProfileData {
  name: string;
  role: 'admin' | 'developer' | 'designer' | 'user';
  age: number;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  email: string;
  theme: Theme;
  skills: Skill[];
  operations: Operation[];
  createdAt: Date;
  isActive: boolean;
}
