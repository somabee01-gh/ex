import { MainCategory } from '../types';

export interface CategoryConfig {
  name: MainCategory;
  color: string;
  bgColor: string;
  borderColor: string;
  iconName: string;
  subcategories: string[];
  placeholderDescription: string;
}

export const CATEGORIES_CONFIG: Record<MainCategory, CategoryConfig> = {
  伙食: {
    name: '伙食',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    iconName: 'Utensils',
    subcategories: ['早餐', '午餐', '晚餐', '飲料', '點心'],
    placeholderDescription: '例：培根蛋餅、美式咖啡、排骨便當',
  },
  交通工具: {
    name: '交通工具',
    color: 'text-sky-700',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    iconName: 'Car',
    subcategories: ['加油', '保養', '停車費'],
    placeholderDescription: '例：95無鉛汽油、換機油齒輪油、地下停車場月租、路邊停車費',
  },
  服飾: {
    name: '服飾',
    color: 'text-violet-700',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    iconName: 'Shirt',
    subcategories: [], // No required subcategory from user prompt
    placeholderDescription: '例：防風外套、牛仔褲、慢跑鞋',
  },
  日用品: {
    name: '日用品',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    iconName: 'ShoppingBag',
    subcategories: [], // No required subcategory from user prompt
    placeholderDescription: '例：衛生紙、洗衣精、沐浴乳、牙刷',
  },
  網購: {
    name: '網購',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    iconName: 'Globe',
    subcategories: ['蝦皮', '淘寶', 'MOMO'],
    placeholderDescription: '例：手機充電線、藍牙耳機、收納盒',
  },
  書籍: {
    name: '書籍',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    iconName: 'BookOpen',
    subcategories: ['數學', '物理', '化學', '通識', '加工'],
    placeholderDescription: '例：微積分教材、普通物理學、有機化學講義、機械加工實務',
  },
  其他: {
    name: '其他',
    color: 'text-stone-700',
    bgColor: 'bg-stone-50',
    borderColor: 'border-stone-200',
    iconName: 'MoreHorizontal',
    subcategories: [],
    placeholderDescription: '例：雜支、電話費、水電費',
  },
};

export const MAIN_CATEGORIES: MainCategory[] = [
  '伙食',
  '交通工具',
  '服飾',
  '日用品',
  '網購',
  '書籍',
  '其他',
];
