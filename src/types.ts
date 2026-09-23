export type MainCategory = '伙食' | '交通工具' | '服飾' | '日用品' | '網購' | '書籍' | '其他';

export type FoodSubcategory = '早餐' | '午餐' | '晚餐' | '飲料' | '點心';
export type TransportationSubcategory = '加油' | '保養' | '停車費';
export type OnlineShoppingSubcategory = '蝦皮' | '淘寶' | 'MOMO';
export type BookSubcategory = '數學' | '物理' | '化學' | '通識' | '加工';

export type Subcategory =
  | FoodSubcategory
  | TransportationSubcategory
  | OnlineShoppingSubcategory
  | BookSubcategory
  | string;

export type PersonnelId =
  | '1號人員'
  | '2號人員'
  | '3號人員'
  | '4號人員'
  | '5號人員'
  | '6號人員'
  | '7號人員'
  | '8號人員'
  | '9號人員';

export const ALL_PERSONNEL: PersonnelId[] = [
  '1號人員',
  '2號人員',
  '3號人員',
  '4號人員',
  '5號人員',
  '6號人員',
  '7號人員',
  '8號人員',
  '9號人員',
];

export interface ExpenseRecord {
  id: string;
  date: string; // YYYY-MM-DD
  category: MainCategory;
  subcategory: string;
  description: string;
  amount: number;
  invoiceNumber?: string;
  merchant?: string;
  notes?: string;
  personnel?: PersonnelId | string;
  createdAt: number;
}

export interface InvoiceItem {
  name: string;
  quantity?: number;
  unitPrice?: number;
  amount?: number;
  category?: MainCategory;
  subcategory?: string;
}

export interface InvoiceRecognitionResult {
  invoiceNumber: string;
  date: string;
  merchant: string;
  totalAmount: number;
  category: MainCategory;
  subcategory: string;
  description: string;
  items?: InvoiceItem[];
  notes?: string;
}

export type TableViewMode = 'standard' | 'matrix'; // standard = row-based with category dropdown; matrix = multi-column per category
