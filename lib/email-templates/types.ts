// Email template types and interfaces
export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface BaseEmailData {
  email: string;
  firstName: string;
  lastName?: string;
}

export interface WaitlistEmailData extends BaseEmailData {
  position?: number;
}

export interface AdminNotificationData extends WaitlistEmailData {
  totalCount?: number;
  signupDate?: string;
}

export interface EmailConfig {
  companyName: string;
  fromEmail: string;
  supportEmail: string;
  unsubscribeUrl: string;
  websiteUrl: string;
}

export interface TemplateContext {
  user: {
    firstName: string;
    fullName: string;
    email: string;
  };
  waitlist: {
    position?: number;
    positionText: string;
    totalCount?: number;
  };
  company: EmailConfig;
  metadata: {
    timestamp: string;
    formattedDate: string;
  };
}

// Email template function signature
export type EmailTemplateFunction<T = any> = (data: T, context?: Partial<TemplateContext>) => EmailTemplate;

// Common email styles for consistency
export interface EmailStyles {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    text: string;
    background: string;
    cardBackground: string;
    border: string;
  };
  fonts: {
    primary: string;
    secondary: string;
  };
  spacing: {
    small: string;
    medium: string;
    large: string;
  };
}

export const defaultEmailStyles: EmailStyles = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545',
    text: '#333333',
    background: '#f8f9fa',
    cardBackground: '#ffffff',
    border: '#e0e0e0'
  },
  fonts: {
    primary: 'Arial, sans-serif',
    secondary: 'Georgia, serif'
  },
  spacing: {
    small: '10px',
    medium: '20px',
    large: '30px'
  }
};
