
export interface UserProfile {
  email: string;
  mobile: string;
  officeName: string;
  officeMobile: string;
  whatsapp: string;
  address?: string;
  logoUrl?: string;
}

export interface WhatsAppTemplates {
  daily: string;
  monthly: string;
  debt: string;
}

export interface DailyRecord {
  id: string;
  date: string;
  cash: number;
  network: number;
  transfer: number;
  withdrawals: number;
  drawerCash: number;
  note?: string;
}

export enum DebtType {
  CREDITOR = 'CREDITOR', // دائن
  DEBTOR = 'DEBTOR'     // مدين
}

export interface DebtTransaction {
  id: string;
  amount: number;
  date: string;
  note: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  balance: number; // Positive = we want money (debtor), Negative = we owe money (creditor)
  transactions: DebtTransaction[];
  initialType: DebtType;
}

export interface AppState {
  profile: UserProfile;
  templates: WhatsAppTemplates;
  dailyRecords: DailyRecord[];
  clients: Client[];
  isLoggedIn: boolean;
}
