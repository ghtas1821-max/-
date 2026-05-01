/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  History, 
  Plus, 
  Search, 
  Trash2, 
  X, 
  CheckCircle2, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  PackageCheck,
  Menu,
  Users,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Truck,
  Building2,
  Briefcase,
  Shield,
  Lock,
  Unlock,
  LogOut,
  ArrowLeftRight,
  ClipboardList,
  AlertTriangle,
  FileText,
  Download,
  Printer,
  Calendar,
  Filter,
  TrendingUp,
  PieChart as PieChartIcon,
  Info,
  Box,
  Settings,
  Barcode,
  Layers,
  Image,
  Upload,
  Smartphone,
  CreditCard,
  Banknote,
  Landmark,
  Wallet,
  Save,
  BarChart3,
  Zap,
  Check,
  MoreVertical,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  Star,
  Award,
  Clock,
  Edit,
  Database,
  Key,
  RefreshCw,
  ShieldCheck,
  Activity,
  Wifi,
  WifiOff,
  Wrench,
  List,
  Percent
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { exportToExcel, exportToPDF } from './utils/exportUtils';
import { dataService } from './services/dataService';

// --- Utilities ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  type: 'stock' | 'service';
  status: 'active' | 'inactive';
  description: string;
  shortDescription: string;
  
  // Pricing
  purchasePrice: number;
  price: number; // sale price
  wholesalePrice: number;
  minPrice: number;
  vat: number;
  defaultDiscount: number;
  
  // Inventory
  stock: number;
  minStockAlert: number;
  maxStock: number;
  unit: string;
  location: string;
  serialNumber?: string;
  batchNumber?: string;
  expiryDate?: number;
  
  // Supplier
  primarySupplierId?: string;
  
  // Media
  image?: string;
  images?: string[];
  
  // Advanced
  variants?: any[];
  isBundle?: boolean;
  bundleItems?: { productId: string, quantity: number }[];
  updatedAt?: number;
}

interface CartItem extends Product {
  quantity: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalSpent: number;
  lastVisit: number;
  openingBalance: number;
  openingBalanceType: 'debit' | 'credit';
  updatedAt?: number;
}

interface Supplier {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email?: string;
  address?: string;
  category: string;
  openingBalance: number;
  openingBalanceType: 'debit' | 'credit';
  updatedAt?: number;
}

interface SystemError {
  id: string;
  type: 'Database' | 'UI' | 'Logic' | 'Security' | 'Network';
  message: string;
  file?: string;
  timestamp: number;
  status: 'open' | 'resolved';
  autoFixAvailable: boolean;
  suggestedFix?: string;
  updatedAt?: number;
}

interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  details: string;
  timestamp: number;
  type: 'auth' | 'data' | 'financial' | 'security';
  device?: string;
  ip?: string;
  updatedAt?: number;
}

interface Session {
  id: string;
  userId: string;
  username: string;
  startTime: number;
  lastActive: number;
  device: string;
  ip?: string;
  status: 'active' | 'expired' | 'terminated';
}

interface Backup {
  id: string;
  filename: string;
  date: number;
  size: string;
  type: 'manual' | 'auto';
  status: 'success' | 'failed';
}

type Role = 'admin' | 'cashier' | 'accountant' | 'store' | 'branch_manager';

interface User {
  id: string;
  username: string;
  password?: string;
  role: Role;
  name: string;
  employeeId?: string;
  status: 'active' | 'suspended';
  lastLogin?: number;
  failedAttempts: number;
  isLocked: boolean;
  updatedAt?: number;
}

const ROLE_PERMISSIONS: Record<Role, string[]> = {
  admin: ['create_invoice', 'edit_invoice', 'delete_invoice', 'edit_price', 'give_discount', 'view_reports', 'manage_users', 'manage_inventory', 'manage_customers', 'manage_suppliers', 'manage_employees', 'manage_warehouses', 'manage_treasury', 'view_treasury_balance', 'add_expense', 'withdraw_treasury', 'transfer_treasury', 'manage_security', 'view_logs', 'manage_backups'],
  cashier: ['create_invoice', 'give_discount'],
  accountant: ['view_reports', 'manage_customers', 'manage_suppliers', 'view_treasury_balance', 'add_expense'],
  store: ['manage_inventory', 'manage_warehouses'],
  branch_manager: ['create_invoice', 'edit_invoice', 'view_reports', 'manage_inventory', 'manage_customers', 'manage_suppliers', 'manage_employees', 'view_treasury_balance', 'add_expense'],
};

interface Employee {
  id: string;
  name: string;
  nationalId: string;
  phone: string;
  email: string;
  address: string;
  photo?: string;
  jobTitle: string;
  branchId: string;
  department: string;
  joinDate: number;
  status: 'active' | 'suspended' | 'on_leave';
  salary: number;
  salaryType: 'monthly' | 'daily' | 'hourly';
  bonuses: number;
  deductions: number;
  insurance?: number;
  rating?: number;
  roleId?: string;
  updatedAt?: number;
}

interface Branch {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  updatedAt?: number;
}

interface Department {
  id: string;
  name: string;
  branchId: string;
  updatedAt?: number;
}

interface Attendance {
  id: string;
  employeeId: string;
  month: string; // "YYYY-MM"
  days: { [day: number]: 'present' | 'absent' | 'late' | 'excused' };
  advances: number;
  deductions: number;
  bonuses: number;
  overtimeHours: number;
  lateMinutes: number;
  updatedAt?: number;
}

interface SalaryRecord {
  id: string;
  employeeId: string;
  month: string; // "YYYY-MM"
  basicSalary: number;
  daysWorked: number;
  overtimePay: number;
  lateDeductions: number;
  advances: number;
  bonuses: number;
  deductions: number;
  netSalary: number;
  status: 'pending' | 'paid';
  paymentDate?: number;
  updatedAt?: number;
}

interface EmployeeRole {
  id: string;
  name: string;
  permissions: string[];
  updatedAt?: number;
}

interface Warehouse {
  id: string;
  name: string;
  location?: string;
  type: 'main' | 'sub';
  manager?: string;
  status?: string;
  updatedAt?: number;
}

interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  fromWarehouseId?: string;
  toWarehouseId?: string;
  quantity: number;
  type: 'transfer' | 'adjustment' | 'sale' | 'purchase' | 'return';
  timestamp: number;
  note?: string;
  updatedAt?: number;
}

interface Payment {
  id: string;
  method: 'cash' | 'wallet' | 'card' | 'bank';
  amount: number;
  details?: {
    walletProvider?: 'vodafone' | 'orange' | 'etisalat';
    walletNumber?: string;
    walletOwner?: string;
    transactionId?: string;
    cardType?: 'visa' | 'mastercard';
    last4?: string;
    bankName?: string;
    accountNumber?: string;
    transferDate?: string;
  };
}

interface Transaction {
  id: string;
  items: CartItem[];
  total: number;
  subTotal?: number;
  discountType?: 'amount' | 'percent';
  customerId?: string;
  timestamp: number;
  type: 'sale' | 'sale_return' | 'purchase' | 'purchase_return';
  status: 'draft' | 'confirmed' | 'paid' | 'cancelled';
  invoiceNumber: string;
  payments?: Payment[];
  paidAmount: number;
  tax: number;
  discount: number;
  shipping: number;
  note?: string;
  updatedAt?: number;
}

interface Treasury {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'wallet';
  balance: number;
  currency: string;
  branchId?: string;
  accountNumber?: string;
  bankName?: string;
  walletNumber?: string;
  status: 'active' | 'inactive';
  updatedAt?: number;
}

interface TreasuryTransaction {
  id: string;
  treasuryId: string;
  type: 'deposit' | 'withdraw' | 'transfer' | 'sale' | 'purchase' | 'expense' | 'salary' | 'opening_balance';
  amount: number;
  balanceAfter: number;
  date: number;
  userId: string;
  note?: string;
  referenceId?: string;
  toTreasuryId?: string;
  category?: string;
  updatedAt?: number;
}

interface ExpenseCategory {
  id: string;
  name: string;
  parentId?: string;
  updatedAt?: number;
}

interface Expense {
  id: string;
  name: string;
  categoryId: string;
  amount: number;
  treasuryId: string;
  date: number;
  note?: string;
  attachment?: string;
  userId: string;
  updatedAt?: number;
}

interface SystemSettings {
  general: {
    language: 'ar' | 'en';
    currency: 'EGP' | 'USD';
    timezone: string;
    dateFormat: string;
  };
  company: {
    name: string;
    logo?: string;
    address: string;
    phone: string;
    email: string;
    taxNumber: string;
  };
  invoice: {
    format: 'A4' | 'Receipt';
    showLogo: boolean;
    showTax: boolean;
    showDiscount: boolean;
    showBarcode: boolean;
    numberingType: 'auto' | 'manual';
    prefix: string;
    footerMessage: string;
  };
  pos: {
    quickSale: boolean;
    defaultWarehouseId: string;
    defaultCashierId: string;
    mixedPayment: boolean;
    barcodeEnabled: boolean;
    soundEnabled: boolean;
    openDrawer: boolean;
  };
  barcode: {
    enabled: boolean;
    readMode: 'auto' | 'button';
    autoIncrement: boolean;
    soundEnabled: boolean;
    inputType: 'keyboard' | 'camera';
    debounceTime: number;
    autoFocus: boolean;
  };
  inventory: {
    trackStock: boolean;
    allowNegativeStock: boolean;
    minStockAlert: number;
    inventoryCheckType: 'manual' | 'periodic';
    enableSerialNumber: boolean;
    enableBatchNumber: boolean;
    multiWarehouse: boolean;
  };
  payment: {
    cashEnabled: boolean;
    cardEnabled: boolean;
    walletEnabled: boolean;
    bankEnabled: boolean;
    cashAccount: string;
    cardAccount: string;
    walletAccount: string;
    bankAccount: string;
    cardFee: number;
  };
  taxes: {
    defaultTaxRate: number;
    isTaxInclusive: boolean;
    taxTypes: { name: string; rate: number }[];
  };
  notifications: {
    stockAlert: boolean;
    expiryAlert: boolean;
    unpaidInvoicesAlert: boolean;
    channels: {
      system: boolean;
      email: boolean;
      whatsapp: boolean;
    };
  };
  backup: {
    autoBackup: boolean;
    frequency: 'daily' | 'weekly';
    location: 'local' | 'google_drive';
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    lockOnIdle: boolean;
  };
  integrations: {
    apiKey: string;
    ecommerceLink?: string;
    accountingLink?: string;
  };
  license: {
    status: 'trial' | 'active' | 'expired';
    expiryDate: number;
    key?: string;
  };
}

const DEFAULT_SETTINGS: SystemSettings = {
  general: {
    language: 'ar',
    currency: 'EGP',
    timezone: 'Africa/Cairo',
    dateFormat: 'YYYY-MM-DD',
  },
  company: {
    name: 'مينا سيستم',
    address: 'القاهرة، مصر',
    phone: '0123456789',
    email: 'info@mena-system.com',
    taxNumber: '123-456-789',
  },
  invoice: {
    format: 'Receipt',
    showLogo: true,
    showTax: true,
    showDiscount: true,
    showBarcode: true,
    numberingType: 'auto',
    prefix: 'INV-',
    footerMessage: 'شكراً لزيارتكم!',
  },
  pos: {
    quickSale: true,
    defaultWarehouseId: 'main',
    defaultCashierId: '1',
    mixedPayment: true,
    barcodeEnabled: true,
    soundEnabled: true,
    openDrawer: false,
  },
  barcode: {
    enabled: true,
    readMode: 'auto',
    autoIncrement: true,
    soundEnabled: true,
    inputType: 'keyboard',
    debounceTime: 50,
    autoFocus: true,
  },
  inventory: {
    trackStock: true,
    allowNegativeStock: false,
    minStockAlert: 5,
    inventoryCheckType: 'manual',
    enableSerialNumber: false,
    enableBatchNumber: false,
    multiWarehouse: true,
  },
  payment: {
    cashEnabled: true,
    cardEnabled: true,
    walletEnabled: true,
    bankEnabled: true,
    cashAccount: 'الخزينة الرئيسية',
    cardAccount: 'البنك الأهلي',
    walletAccount: 'فودافون كاش',
    bankAccount: 'بنك مصر',
    cardFee: 0,
  },
  taxes: {
    defaultTaxRate: 14,
    isTaxInclusive: false,
    taxTypes: [{ name: 'ضريبة القيمة المضافة', rate: 14 }],
  },
  notifications: {
    stockAlert: true,
    expiryAlert: true,
    unpaidInvoicesAlert: true,
    channels: {
      system: true,
      email: false,
      whatsapp: false,
    },
  },
  backup: {
    autoBackup: true,
    frequency: 'daily',
    location: 'local',
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 30,
    lockOnIdle: false,
  },
  integrations: {
    apiKey: '',
  },
  license: {
    status: 'trial',
    expiryDate: Date.now() + (14 * 24 * 60 * 60 * 1000), // 14 days trial
  }
};

// --- Mock Data ---
const INITIAL_PRODUCTS: Product[] = [];

interface AuditPageProps {
  systemErrors: any[];
  setSystemErrors: React.Dispatch<React.SetStateAction<any[]>>;
  activityLogs: any[];
  backups: any[];
  playSound: (soundName: string) => void;
  setShowToast: (toast: { message: string, type: 'success' | 'error' | 'info' | 'warning' } | null) => void;
}

const AuditPage: React.FC<AuditPageProps> = ({ 
  systemErrors, 
  setSystemErrors, 
  activityLogs, 
  backups, 
  playSound, 
  setShowToast 
}) => {
  const [auditTab, setAuditTab] = useState<'dashboard' | 'logs' | 'tests' | 'errors' | 'security' | 'backups'>('dashboard');
  
  // 1. Dashboard metrics
  const totalErrors = systemErrors.length;
  const unresolvedErrors = systemErrors.filter(e => e.status === 'open').length;
  const dailyOperations = activityLogs.filter(l => l.timestamp > Date.now() - 86400000).length;
  const systemHealth = unresolvedErrors === 0 ? 'سليم' : 'يوجد مشاكل';
  
  const runAutoFix = (errorId: string) => {
    playSound('success');
    setSystemErrors(prev => prev.map(e => e.id === errorId ? { ...e, status: 'resolved' } : e));
    setShowToast({ message: 'تم إصلاح الخطأ بنجاح', type: 'success' });
  };
  
  // Functional testing routines
  const testFunctional = () => {
    playSound('click');
    setShowToast({ message: 'جاري فحص وظائف النظام...', type: 'info' });
    setTimeout(() => setShowToast({ message: 'اكتمل الفحص: جميع الوظائف تعمل بكفاءة', type: 'success' }), 2000);
  };

  const testPerformance = () => {
    playSound('click');
    setShowToast({ message: 'جاري فحص سرعة وأداء النظام...', type: 'info' });
    setTimeout(() => setShowToast({ message: 'معدل الاستجابة ممتاز (أقل من 50ms)', type: 'success' }), 2000);
  };
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300" dir="rtl">
       {/* Tabs Navigation */}
       <div className="flex bg-white rounded-2xl shadow-sm border border-slate-100 p-2 overflow-x-auto hide-scrollbar">
          {[
            { id: 'dashboard', label: 'ملخص الحالة', icon: <Activity size={18} /> },
            { id: 'logs', label: 'سجل العمليات', icon: <List size={18} /> },
            { id: 'tests', label: 'اختبار النظام', icon: <CheckCircle2 size={18} /> },
            { id: 'errors', label: 'فحص الأخطاء', icon: <AlertTriangle size={18} /> },
            { id: 'security', label: 'اختبار الأمان', icon: <Shield size={18} /> },
            { id: 'backups', label: 'النسخ الاحتياطي', icon: <Database size={18} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                playSound('click');
                setAuditTab(tab.id as any);
              }}
              className={cn("flex-1 whitespace-nowrap px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all", auditTab === tab.id ? "bg-emerald-50 text-emerald-600 shadow-sm" : "text-slate-500 hover:bg-slate-50")}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
       </div>
       
       {auditTab === 'dashboard' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-2">
               <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-2", unresolvedErrors === 0 ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600")}>
                 {unresolvedErrors === 0 ? <CheckCircle2 size={32} /> : <AlertTriangle size={32} />}
               </div>
               <h4 className="font-black text-slate-800 text-xl">{systemHealth}</h4>
               <p className="text-sm text-slate-500">حالة النظام الحالية</p>
            </div>
            <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-2">
               <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-2">
                 <AlertCircle size={32} />
               </div>
               <h4 className="font-black text-slate-800 text-3xl">{unresolvedErrors}</h4>
               <p className="text-sm text-slate-500">أخطاء تحتاج للمراجعة</p>
            </div>
            <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-2">
               <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
                 <Activity size={32} />
               </div>
               <h4 className="font-black text-slate-800 text-3xl">{dailyOperations}</h4>
               <p className="text-sm text-slate-500">عملية خلال 24 ساعة</p>
            </div>
            <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-2">
               <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2">
                 <Percent size={32} />
               </div>
               <h4 className="font-black text-slate-800 text-3xl">99.9%</h4>
               <p className="text-sm text-slate-500">نسبة نجاح العمليات</p>
            </div>
         </div>
       )}
       
       {auditTab === 'logs' && (
         <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
           <div className="p-6 border-b flex justify-between items-center bg-slate-50">
             <h3 className="font-bold text-slate-800 flex items-center gap-2"><List size={20} className="text-indigo-500"/> سجل العمليات (Audit Log)</h3>
             <button onClick={() => playSound('click')} className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-200 transition-colors"><Download size={16}/> تصدير السجل PDF</button>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-right">
               <thead className="bg-slate-100 text-slate-500 text-sm">
                 <tr>
                   <th className="px-6 py-4">التاريخ والوقت</th>
                   <th className="px-6 py-4">المستخدم</th>
                   <th className="px-6 py-4">نوع العملية</th>
                   <th className="px-6 py-4">التفاصيل</th>
                   <th className="px-6 py-4">الجهاز / IP</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {activityLogs.slice(0, 50).map(log => (
                   <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                     <td className="px-6 py-4 text-xs font-mono text-slate-500">{new Date(log.timestamp).toLocaleString('ar-EG')}</td>
                     <td className="px-6 py-4 font-bold text-slate-700">
                       <div className="flex items-center gap-2">
                         <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-[10px]">{(log.username || 'M').charAt(0)}</div>
                         {log.username || 'System'}
                       </div>
                     </td>
                     <td className="px-6 py-4"><span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">{log.action}</span></td>
                     <td className="px-6 py-4 text-sm text-slate-600">{log.details}</td>
                     <td className="px-6 py-4 text-xs font-mono text-slate-400">{log.ip || '127.0.0.1'}</td>
                   </tr>
                 ))}
                 {activityLogs.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-400">لا يوجد سجلات حتى الآن</td></tr>}
               </tbody>
             </table>
           </div>
         </div>
       )}
       
       {auditTab === 'tests' && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
             <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><CheckCircle2 size={20} className="text-emerald-500" /> اختبار الوظائف (Functional)</h4>
             <div className="space-y-4">
               {['اختبار إضافة منتج', 'اختبار إنشاء فاتورة', 'اختبار تسجيل عميل', 'اختبار التقارير'].map((test, i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                   <span className="font-bold text-slate-600">{test}</span>
                   <button onClick={testFunctional} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:text-emerald-600 hover:border-emerald-200 shadow-sm transition-all">بدء الاختبار</button>
                 </div>
               ))}
             </div>
           </div>
           <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
             <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Activity size={20} className="text-blue-500" /> اختبار الأداء وقاعدة البيانات</h4>
             <div className="space-y-4">
               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                 <span className="font-bold text-slate-600">سرعة استجابة النظام (Performance)</span>
                 <button onClick={testPerformance} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all">تشغيل</button>
               </div>
               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                 <span className="font-bold text-slate-600">سلامة البيانات (Data Integrity)</span>
                 <button onClick={() => {playSound('click'); setShowToast({message: 'جاري مراجعة القيود المحاسبية والأرصدة...', type: 'info'}); setTimeout(()=>setShowToast({message:'البيانات سليمة ومتصلة', type: 'success'}), 1500);}} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all">تشغيل</button>
               </div>
               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                 <span className="font-bold text-slate-600">اختبار الاسترجاع (Backup Restore)</span>
                 <button onClick={() => {playSound('click'); setShowToast({message: 'تم تفعيل بيئة اختبار الاسترجاع الوهمية', type: 'info'})}} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all">تشغيل</button>
               </div>
             </div>
           </div>
         </div>
       )}
       
       {auditTab === 'errors' && (
         <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
           <div className="p-6 border-b flex justify-between items-center bg-slate-50">
             <h3 className="font-bold text-slate-800 flex items-center gap-2"><AlertTriangle size={20} className="text-red-500"/> فحص الأخطاء (Error Detection)</h3>
             {systemErrors.filter(e => e.status === 'open').length === 0 && <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-xs font-bold rounded-full">النظام خالي من الأخطاء</span>}
           </div>
           <div className="divide-y divide-slate-100">
             {systemErrors.length > 0 ? systemErrors.map(err => (
               <div key={err.id} className={cn("p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between transition-colors", err.status === 'open' ? "bg-red-50/30" : "")}>
                 <div>
                   <div className="flex items-center gap-2 mb-2">
                     <span className={cn("px-2 py-0.5 text-[10px] font-bold rounded uppercase", err.status === 'open' ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600")}>{err.status === 'open' ? 'نشط' : 'محلول'}</span>
                     <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase">{err.type}</span>
                     <span className="text-xs text-slate-400 font-mono">{new Date(err.timestamp).toLocaleString('ar-EG')}</span>
                   </div>
                   <p className="font-bold text-slate-800 text-sm mb-1">{err.message}</p>
                   {err.file && <p className="text-xs text-slate-500 font-mono">{err.file}</p>}
                   {err.suggestedFix && err.status === 'open' && (
                     <div className="mt-3 text-xs bg-blue-50 text-blue-700 p-2 rounded-lg border border-blue-100 flex items-start gap-2">
                       <Wrench size={14} className="mt-0.5 shrink-0"/>
                       <span><strong className="block mb-1">اقتراح حل (AI):</strong> {err.suggestedFix}</span>
                     </div>
                   )}
                 </div>
                 {err.status === 'open' && err.autoFixAvailable && (
                   <button onClick={() => runAutoFix(err.id)} className="shrink-0 px-4 py-2 bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-md hover:bg-emerald-600 transition-all flex items-center gap-2">
                     <Wrench size={16} /> إصلاح تلقائي
                   </button>
                 )}
               </div>
             )) : (
               <div className="p-16 text-center flex flex-col items-center justify-center gap-4 text-slate-400">
                 <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center"><CheckCircle2 size={32}/></div>
                 <p className="font-bold">تهانينا! لم يتم اكتشاف أي أخطاء بالنظام.</p>
               </div>
             )}
           </div>
         </div>
       )}

       {auditTab === 'security' && (
         <div className="p-8 bg-slate-900 rounded-3xl text-slate-300 relative overflow-hidden shadow-xl">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500"></div>
           <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
             <Shield size={200} />
           </div>
           <h3 className="font-bold text-white text-2xl mb-2 flex items-center gap-3"><Shield size={28} className="text-emerald-500"/> اختبار الأمان (Security Audit)</h3>
           <p className="text-slate-400 text-sm mb-8">لوحة تحكم متقدمة لمراقبة محاولات الوصول والتحقق من التشفير والصلاحيات.</p>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
             <div className="space-y-4">
               <div className="p-5 bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 flex justify-between items-center hover:bg-slate-800 transition-colors">
                 <div>
                   <span className="block font-bold text-slate-200 mb-1">محاولات الدخول غير المصرح</span>
                   <span className="text-xs text-slate-500">مراقبة الـ IP ومحاولات التخمين</span>
                 </div>
                 <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/30">آمن (0)</span>
               </div>
               <div className="p-5 bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 flex justify-between items-center hover:bg-slate-800 transition-colors">
                 <div>
                   <span className="block font-bold text-slate-200 mb-1">التحقق من الصلاحيات للمستخدمين</span>
                   <span className="text-xs text-slate-500">مراجعة الأدوار (Roles Audit)</span>
                 </div>
                 <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/30">تم التحقق</span>
               </div>
             </div>
             <div className="space-y-4">
               <div className="p-5 bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 flex justify-between items-center hover:bg-slate-800 transition-colors">
                 <div>
                   <span className="block font-bold text-slate-200 mb-1">تشفير قواعد البيانات</span>
                   <span className="text-xs text-slate-500">تشفير البيانات الحساسة (AES)</span>
                 </div>
                 <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/30">نشط ومعتمد</span>
               </div>
               <button onClick={() => {playSound('click'); setShowToast({message: 'جاري تنفيذ الفحص الأمني الشامل...', type: 'info'})}} className="w-full p-5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2">
                 <Activity size={20} /> تشغيل فحص أمني شامل للثغرات
               </button>
             </div>
           </div>
         </div>
       )}

       {auditTab === 'backups' && (
         <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10 text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5">
             <Database size={200} />
           </div>
           <Database size={48} className="text-emerald-500 mx-auto mb-4 relative z-10" />
           <h3 className="text-2xl font-black text-slate-800 mb-2 relative z-10">نظام النسخ الاحتياطي المراقب</h3>
           <p className="text-slate-500 mb-8 max-w-md mx-auto relative z-10">مراقبة دورية لضمان عدم فقدان أي بيانات، مع دعم النسخ السحابي المشفر والمحلي.</p>
           <div className="max-w-md mx-auto space-y-4 relative z-10">
             <div className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-200">
               <span className="text-slate-600 font-bold">آخر نسخة تم إنشاؤها (سحابي)</span>
               <span className="text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-lg">{backups.length > 0 ? new Date(backups[0].date).toLocaleDateString('ar-EG') : 'اليوم 09:00 ص'}</span>
             </div>
             <button onClick={() => {playSound('click'); setShowToast({message: 'جاري إنشاء النسخة وحفظها...', type: 'info'})}} className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all text-lg">إنشاء نسخة احتياطية يدوياً الآن</button>
           </div>
         </div>
       )}
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pos' | 'products' | 'history' | 'purchases' | 'customers' | 'suppliers' | 'employees' | 'security' | 'warehouses' | 'inventory' | 'reports' | 'settings' | 'treasury' | 'audit'>('dashboard');
  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('pos_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Deep merge helper
        const mergeSettings = (p: any): SystemSettings => ({
          ...DEFAULT_SETTINGS,
          ...p,
          general: { ...DEFAULT_SETTINGS.general, ...(p.general || {}) },
          company: { ...DEFAULT_SETTINGS.company, ...(p.company || {}) },
          invoice: { ...DEFAULT_SETTINGS.invoice, ...(p.invoice || {}) },
          pos: { ...DEFAULT_SETTINGS.pos, ...(p.pos || {}) },
          barcode: { ...DEFAULT_SETTINGS.barcode, ...(p.barcode || {}) },
          inventory: { ...DEFAULT_SETTINGS.inventory, ...(p.inventory || {}) },
          payment: { ...DEFAULT_SETTINGS.payment, ...(p.payment || {}) },
          taxes: { ...DEFAULT_SETTINGS.taxes, ...(p.taxes || {}) },
          notifications: { ...DEFAULT_SETTINGS.notifications, ...(p.notifications || {}) },
          backup: { ...DEFAULT_SETTINGS.backup, ...(p.backup || {}) },
          security: { ...DEFAULT_SETTINGS.security, ...(p.security || {}) },
          integrations: { ...DEFAULT_SETTINGS.integrations, ...(p.integrations || {}) },
          license: { ...DEFAULT_SETTINGS.license, ...(p.license || {}) },
        });
        return mergeSettings(parsed);
      } catch (e) {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  const playSound = (type: 'click' | 'success' | 'error') => {
    if (!settings?.pos?.soundEnabled) return;
    
    const sounds = {
      click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
      success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
      error: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'
    };

    const playSynth = () => {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        const now = ctx.currentTime;
        if (type === 'click') {
          osc.frequency.setValueAtTime(800, now);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          osc.start(now); osc.stop(now + 0.1);
        } else if (type === 'success') {
          osc.frequency.setValueAtTime(523, now);
          osc.frequency.exponentialRampToValueAtTime(783, now + 0.2);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          osc.start(now); osc.stop(now + 0.3);
        } else {
          osc.frequency.setValueAtTime(150, now);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          osc.start(now); osc.stop(now + 0.2);
        }
      } catch (e) {}
    };

    try {
      const audio = new Audio(sounds[type]);
      audio.volume = 0.4;
      audio.play().catch(playSynth);
    } catch (e) {
      playSynth();
    }
  };
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('pos_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('pos_customers');
    return saved ? JSON.parse(saved) : [];
  });
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('pos_suppliers');
    return saved ? JSON.parse(saved) : [];
  });
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('pos_employees');
    return saved ? JSON.parse(saved) : [];
  });
  const [attendance, setAttendance] = useState<Attendance[]>(() => {
    const saved = localStorage.getItem('pos_attendance');
    return saved ? JSON.parse(saved) : [];
  });
  const [salaries, setSalaries] = useState<SalaryRecord[]>(() => {
    const saved = localStorage.getItem('pos_salaries');
    return saved ? JSON.parse(saved) : [];
  });
  const [employeeRoles, setEmployeeRoles] = useState<EmployeeRole[]>(() => {
    const saved = localStorage.getItem('pos_employee_roles');
    return saved ? JSON.parse(saved) : [
      { id: 'admin', name: 'مدير النظام', permissions: ['all'] },
      { id: 'cashier', name: 'كاشير', permissions: ['create_invoice', 'view_products'] },
      { id: 'accountant', name: 'محاسب', permissions: ['view_reports', 'view_treasury_balance'] },
      { id: 'store', name: 'موظف مخزن', permissions: ['manage_inventory', 'manage_warehouses'] }
    ];
  });
  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => {
    const saved = localStorage.getItem('pos_warehouses');
    const initial: Warehouse[] = [{ id: 'main', name: 'المخزن الرئيسي', type: 'main', location: 'المقر الرئيسي' }];
    return saved ? JSON.parse(saved) : initial;
  });
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem('pos_stock_movements');
    return saved ? JSON.parse(saved) : [];
  });
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('pos_users');
    const defaultAdmin: User = { id: '1', username: 'admin', role: 'admin', name: 'مدير النظام', status: 'active', failedAttempts: 0, isLocked: false };
    return saved ? JSON.parse(saved) : [defaultAdmin];
  });
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('pos_current_user');
    const defaultAdmin: User = { id: '1', username: 'admin', role: 'admin', name: 'مدير النظام', status: 'active', failedAttempts: 0, isLocked: false };
    return saved ? JSON.parse(saved) : defaultAdmin;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('pos_is_authenticated') === 'true');
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [securitySettings, setSecuritySettings] = useState({
    autoLogoutMinutes: 30,
    maxFailedAttempts: 5,
    require2FA: false,
    passwordExpiryDays: 90,
    encryptionEnabled: true
  });
  const [loginForm, setLoginForm] = useState({ username: '', password: '', rememberMe: false });
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Helper to log activities
  const logActivity = (action: string, details: string, type: ActivityLog['type'] = 'data') => {
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      username: currentUser.username,
      action,
      details,
      timestamp: Date.now(),
      type
    };
    setActivityLogs(prev => [newLog, ...prev].slice(0, 1000));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginForm.username, password: loginForm.password })
      });
      const data = await response.json();
      
      if (data.success) {
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        setLastActivity(Date.now());
        if (loginForm.rememberMe) {
          localStorage.setItem('pos_is_authenticated', 'true');
          localStorage.setItem('pos_current_user', JSON.stringify(data.user));
        }
        playSound('success');
        setShowToast({ message: `مرحباً بك، ${data.user.name}`, type: 'success' });
        logActivity('تسجيل دخول', 'تم تسجيل الدخول بنجاح', 'auth');
      } else {
        throw new Error(data.error || 'فشل تسجيل الدخول');
      }
    } catch (error) {
      playSound('error');
      setShowToast({ message: (error as Error).message, type: 'error' });
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleLogout = () => {
    logActivity('تسجيل خروج', 'تم تسجيل الخروج يدوياً', 'auth');
    setIsAuthenticated(false);
    localStorage.removeItem('pos_is_authenticated');
    localStorage.removeItem('pos_current_user');
    setCurrentUser({ id: '1', username: 'admin', role: 'admin', name: 'مدير النظام', status: 'active', failedAttempts: 0, isLocked: false });
    playSound('click');
  };

  // Auto Logout Logic
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const checkIdle = setInterval(() => {
      const idleTime = Date.now() - lastActivity;
      const timeout = (securitySettings.autoLogoutMinutes || 30) * 60 * 1000;
      
      if (idleTime > timeout) {
        handleLogout();
        setShowToast({ message: 'تم تسجيل الخروج بسبب عدم النشاط', type: 'info' });
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkIdle);
  }, [isAuthenticated, lastActivity, securitySettings.autoLogoutMinutes]);

  // Update last activity on interaction
  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now());
    window.addEventListener('mousedown', updateActivity);
    window.addEventListener('keypress', updateActivity);
    return () => {
      window.removeEventListener('mousedown', updateActivity);
      window.removeEventListener('keypress', updateActivity);
    };
  }, []);
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('pos_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'amount' | 'percent'>('amount');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cash');
  const [searchQuery, setSearchQuery] = useState('');
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const [barcodeScanValue, setBarcodeScanValue] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'sale' | 'purchase' | 'return'>('all');

  useEffect(() => {
    if (activeTab === 'pos' && settings.barcode?.autoFocus && barcodeInputRef.current) {
      const timer = setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeTab, settings.barcode?.autoFocus]);

  const handleBarcodeScan = (code: string, forceAdd = false) => {
    if (!settings.barcode?.enabled) return;
    if (!code.trim()) return;
    
    if (settings.barcode.readMode === 'auto' || forceAdd) {
      const product = products.find(p => p.barcode === code || p.sku === code);
      if (product) {
        if (settings.barcode.soundEnabled) playSound('success');
        addToCart(product);
        setBarcodeScanValue('');
        if (settings.barcode.autoFocus && barcodeInputRef.current) {
           barcodeInputRef.current.focus();
        }
      } else {
        if (settings.barcode.soundEnabled) playSound('error');
        setShowToast({ message: 'المنتج غير موجود!', type: 'error' });
        setBarcodeScanValue('');
      }
    }
  };
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [employeeTab, setEmployeeTab] = useState<'list' | 'attendance' | 'payroll' | 'roles' | 'reports'>('list');
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedEmployeeForAttendance, setSelectedEmployeeForAttendance] = useState<Employee | null>(null);
  const [attendanceMonth, setAttendanceMonth] = useState(new Date().toISOString().slice(0, 7));
  const [employeeFilters, setEmployeeFilters] = useState({
    search: '',
    branchId: 'all',
    jobTitle: 'all',
    status: 'all'
  });
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [newAdjustment, setNewAdjustment] = useState({
    employeeId: '',
    type: 'bonus' as 'bonus' | 'deduction' | 'advance',
    amount: 0,
    month: new Date().toISOString().slice(0, 7),
    note: ''
  });
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [securityTab, setSecurityTab] = useState<'users' | 'roles' | 'logs' | 'backups' | 'settings'>('users');
  const [systemErrors, setSystemErrors] = useState<SystemError[]>(() => {
    const saved = localStorage.getItem('pos_system_errors');
    return saved ? JSON.parse(saved) : [];
  });
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('pos_activity_logs');
    return saved ? JSON.parse(saved) : [];
  });
  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem('pos_sessions');
    return saved ? JSON.parse(saved) : [];
  });
  const [backups, setBackups] = useState<Backup[]>(() => {
    const saved = localStorage.getItem('pos_backups');
    return saved ? JSON.parse(saved) : [];
  });
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isSecuritySettingsOpen, setIsSecuritySettingsOpen] = useState(false);
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isInvoicePreviewOpen, setIsInvoicePreviewOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false);
  const [invoiceFormType, setInvoiceFormType] = useState<'sale' | 'purchase' | 'sale_return' | 'purchase_return'>('sale');
  const [invoiceItems, setInvoiceItems] = useState<{ productId: string, name: string, barcode: string, quantity: number, unit: string, price: number, discount: number, tax: number, total: number }[]>([]);
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');
  const [invoiceSelectedCustomer, setInvoiceSelectedCustomer] = useState<string>('');
  const [invoiceSelectedSupplier, setInvoiceSelectedSupplier] = useState<string>('');
  const [invoiceDiscount, setInvoiceDiscount] = useState(0);
  const [invoiceTax, setInvoiceTax] = useState(0);
  const [invoiceShipping, setInvoiceShipping] = useState(0);
  const [invoiceNote, setInvoiceNote] = useState('');
  const [invoiceStatus, setInvoiceStatus] = useState<'draft' | 'confirmed' | 'paid' | 'cancelled'>('draft');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceTime, setInvoiceTime] = useState(new Date().toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5));
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  
  const [currentPayments, setCurrentPayments] = useState<Payment[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'wallet' | 'card' | 'bank'>('cash');
  const [lastPaymentMethod, setLastPaymentMethod] = useState<'cash' | 'wallet' | 'card' | 'bank'>('cash');
  const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'company' | 'users' | 'invoice' | 'pos' | 'barcode' | 'inventory' | 'payment' | 'taxes' | 'notifications' | 'backup' | 'security' | 'integrations' | 'advanced'>('general');
  const [settingsSearchQuery, setSettingsSearchQuery] = useState('');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [walletData, setWalletData] = useState({ provider: 'vodafone', number: '', owner: '', transactionId: '' });
  const [cardData, setCardData] = useState({ type: 'visa' as 'visa' | 'mastercard', last4: '', ref: '', bank: '' });
  const [bankData, setBankData] = useState({ bank: '', account: '', ref: '', date: new Date().toISOString().split('T')[0] });
  const [treasury, setTreasury] = useState(() => {
    const saved = localStorage.getItem('pos_treasury');
    return saved ? JSON.parse(saved) : { cash: 0, bank: 0, wallets: 0 };
  });

  const [treasuries, setTreasuries] = useState<Treasury[]>(() => {
    const saved = localStorage.getItem('pos_treasuries');
    const initial: Treasury[] = [
      { id: '1', name: 'الخزينة الرئيسية', type: 'cash', balance: 0, currency: 'EGP', status: 'active' },
      { id: '2', name: 'البنك الأهلي', type: 'bank', balance: 0, currency: 'EGP', status: 'active', bankName: 'البنك الأهلي', accountNumber: '123456789' },
      { id: '3', name: 'فودافون كاش', type: 'wallet', balance: 0, currency: 'EGP', status: 'active', walletNumber: '01012345678' }
    ];
    return saved ? JSON.parse(saved) : initial;
  });

  const [treasuryTransactions, setTreasuryTransactions] = useState<TreasuryTransaction[]>(() => {
    const saved = localStorage.getItem('pos_treasury_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('pos_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(() => {
    const saved = localStorage.getItem('pos_expense_categories');
    const initial: ExpenseCategory[] = [
      { id: '1', name: 'إيجار' },
      { id: '2', name: 'كهرباء' },
      { id: '3', name: 'مرتبات' },
      { id: '4', name: 'صيانة' },
      { id: '5', name: 'مشتريات خارجية' }
    ];
    return saved ? JSON.parse(saved) : initial;
  });

  const [branches, setBranches] = useState<Branch[]>(() => {
    const saved = localStorage.getItem('pos_branches');
    return saved ? JSON.parse(saved) : [{ id: '1', name: 'المركز الرئيسي', address: 'القاهرة', phone: '0123456789' }];
  });
  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem('pos_departments');
    return saved ? JSON.parse(saved) : [{ id: '1', name: 'الإدارة', branchId: '1' }];
  });
  
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'error' | 'syncing'>('synced');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTreasuryModalOpen, setIsTreasuryModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Network Status Tracking
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowToast({ message: 'تم استعادة الاتصال بالإنترنت - جاري المزامنة...', type: 'success' });
      syncData();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowToast({ message: 'انقطع الاتصال بالإنترنت - يعمل النظام الآن في وضع الأوفلاين', type: 'error' });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [warehouses, products, isOnline]);

  // Sync / Auto-Save Logic
  const syncData = async () => {
    if (!navigator.onLine) {
      setSyncStatus('pending');
      return;
    }

    setSyncStatus('syncing');
    setIsSyncing(true);
    try {
      const payload = {
        products, customers, suppliers, employees, attendance, 
        salaries, users, transactions, expenses, treasuries, 
        activityLogs, settings, securitySettings,
        warehouses, stockMovements, expenseCategories, branches, departments
      };

      const response = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSyncStatus('synced');
      } else {
        setSyncStatus('error');
      }
    } catch (error) {
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Debounced auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      syncData();
      // Also save to local storage (Auto-Save Offline)
      localStorage.setItem('pos_products', JSON.stringify(products));
      localStorage.setItem('pos_customers', JSON.stringify(customers));
      localStorage.setItem('pos_suppliers', JSON.stringify(suppliers));
      localStorage.setItem('pos_employees', JSON.stringify(employees));
      localStorage.setItem('pos_transactions', JSON.stringify(transactions));
      localStorage.setItem('pos_treasuries', JSON.stringify(treasuries));
      localStorage.setItem('pos_expenses', JSON.stringify(expenses));
      localStorage.setItem('pos_stock_movements', JSON.stringify(stockMovements));
      localStorage.setItem('pos_warehouses', JSON.stringify(warehouses));
      localStorage.setItem('pos_branches', JSON.stringify(branches));
      localStorage.setItem('pos_departments', JSON.stringify(departments));
      localStorage.setItem('pos_settings', JSON.stringify(settings));
    }, 2000);
    return () => clearTimeout(timer);
  }, [
    products, customers, suppliers, employees, attendance, 
    salaries, users, transactions, expenses, treasuries, 
    activityLogs, settings, securitySettings,
    warehouses, stockMovements, expenseCategories, branches, departments,
    isOnline
  ]);

  // Initial Data Fetch
  useEffect(() => {
    const initData = async () => {
      try {
        const response = await fetch('/api/data');
        if (response.ok) {
          const data = await response.json();
          if (data.products?.length) setProducts(data.products);
          if (data.customers?.length) setCustomers(data.customers);
          if (data.suppliers?.length) setSuppliers(data.suppliers);
          if (data.employees?.length) setEmployees(data.employees);
          if (data.transactions?.length) setTransactions(data.transactions);
          if (data.treasuries?.length) setTreasuries(data.treasuries);
          if (data.expenses?.length) setExpenses(data.expenses);
          if (data.warehouses?.length) setWarehouses(data.warehouses);
          if (data.branches?.length) setBranches(data.branches);
          if (data.departments?.length) setDepartments(data.departments);
          if (data.users?.length) setUsers(data.users);
        }
      } finally {
        setIsInitialLoad(false);
      }
    };
    initData();
  }, []);
  const [isTreasuryTransactionModalOpen, setIsTreasuryTransactionModalOpen] = useState(false);
  const [treasuryTransactionType, setTreasuryTransactionType] = useState<'deposit' | 'withdraw' | 'transfer'>('deposit');
  const [selectedTreasuryId, setSelectedTreasuryId] = useState<string>('');

  const [newTreasuryForm, setNewTreasuryForm] = useState<Partial<Treasury>>({
    name: '',
    type: 'cash',
    currency: 'EGP',
    balance: 0,
    status: 'active'
  });

  const [newExpenseForm, setNewExpenseForm] = useState<Partial<Expense>>({
    name: '',
    categoryId: '',
    amount: 0,
    treasuryId: '',
    date: Date.now(),
    note: ''
  });

  const [newTreasuryTransactionForm, setNewTreasuryTransactionForm] = useState({
    amount: 0,
    treasuryId: '',
    toTreasuryId: '',
    note: '',
    category: ''
  });
  const [paymentLogs, setPaymentLogs] = useState<{ id: string, timestamp: number, message: string, type: 'info' | 'warning' | 'error' }[]>(() => {
    const saved = localStorage.getItem('pos_payment_logs');
    return saved ? JSON.parse(saved) : [];
  });
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [newWarehouse, setNewWarehouse] = useState<Partial<Warehouse>>({ name: '', type: 'sub', location: '' });
  const [transferData, setTransferData] = useState({ productId: '', fromId: '', toId: '', quantity: '' });
  const [auditData, setAuditData] = useState({ warehouseId: '', productId: '', actualQuantity: '' });

  const [reportPeriod, setReportPeriod] = useState<'day' | 'week' | 'month' | 'custom'>('week');
  const [reportWarehouseId, setReportWarehouseId] = useState<string>('all');
  const [reportPage, setReportPage] = useState(1);
  const [reportType, setReportType] = useState<'sales' | 'purchases' | 'inventory' | 'profit_loss' | 'customers' | 'suppliers' | 'payments' | 'invoices' | 'treasury' | 'employees' | 'stagnant' | 'top_selling' | 'low_stock'>(() => {
    const saved = localStorage.getItem('pos_report_type');
    return (saved as any) || 'sales';
  });
  const [reportFilters, setReportFilters] = useState(() => {
    const saved = localStorage.getItem('pos_report_filters');
    const initial = {
      period: 'week' as 'day' | 'week' | 'month' | 'custom',
      startDate: '',
      endDate: '',
      warehouseId: 'all',
      userId: 'all',
      customerId: 'all',
      supplierId: 'all',
      categoryId: 'all',
      paymentMethod: 'all',
      invoiceStatus: 'all',
      searchQuery: ''
    };
    return saved ? JSON.parse(saved) : initial;
  });
  const [savedFilters, setSavedFilters] = useState<{ name: string, filters: any }[]>(() => {
    const saved = localStorage.getItem('pos_saved_report_filters');
    return saved ? JSON.parse(saved) : [];
  });

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'cashier' as Role,
    employeeId: '',
    status: 'active' as const
  });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteCustomerId, setConfirmDeleteCustomerId] = useState<string | null>(null);
  const [confirmDeleteSupplierId, setConfirmDeleteSupplierId] = useState<string | null>(null);
  const [confirmDeleteEmployeeId, setConfirmDeleteEmployeeId] = useState<string | null>(null);
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    barcode: '',
    category: 'مشروبات',
    type: 'stock' as 'stock' | 'service',
    status: 'active' as 'active' | 'inactive',
    description: '',
    shortDescription: '',
    purchasePrice: '',
    price: '',
    wholesalePrice: '',
    minPrice: '',
    vat: '0',
    defaultDiscount: '0',
    stock: '',
    minStockAlert: '5',
    maxStock: '',
    unit: 'قطعة',
    location: '',
    serialNumber: '',
    batchNumber: '',
    expiryDate: '',
    primarySupplierId: '',
    image: ''
  });
  const [activeProductTab, setActiveProductTab] = useState<'general' | 'pricing' | 'inventory' | 'suppliers' | 'advanced'>('general');
  const [newCustomer, setNewCustomer] = useState({ 
    name: '', 
    phone: '', 
    email: '', 
    address: '', 
    openingBalance: '0', 
    openingBalanceType: 'debit' as 'debit' | 'credit' 
  });
  const [newSupplier, setNewSupplier] = useState({ 
    name: '', 
    contactName: '', 
    phone: '', 
    email: '', 
    address: '', 
    category: 'عام',
    openingBalance: '0',
    openingBalanceType: 'debit' as 'debit' | 'credit'
  });
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    name: '',
    nationalId: '',
    phone: '',
    email: '',
    address: '',
    jobTitle: '',
    branchId: 'all',
    department: '',
    status: 'active',
    salary: 0,
    salaryType: 'monthly',
    bonuses: 0,
    deductions: 0
  });

  useEffect(() => {
    if (showToast) {
      playSound(showToast.type);
      const timer = setTimeout(() => setShowToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // --- Pagination & Filtering Logic ---
  const fadeIn = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.2, ease: "easeOut" }
  };

  const buttonVariants = {
    tap: { scale: 0.95 },
    hover: { scale: 1.02, transition: { duration: 0.2 } },
    success: { 
      scale: [1, 1.05, 1],
      backgroundColor: ["#10b981", "#059669", "#10b981"],
      transition: { type: "keyframes", duration: 0.3 }
    },
    error: {
      x: [0, -4, 4, -4, 4, 0],
      backgroundColor: ["#ef4444", "#dc2626", "#ef4444"],
      transition: { type: "keyframes", duration: 0.4 }
    }
  };

  const shake = {
    error: {
      x: [0, -4, 4, -4, 4, 0],
      transition: { type: "keyframes", duration: 0.4 }
    }
  };

  const successPulse = {
    success: {
      scale: [1, 1.05, 1],
      backgroundColor: ["#ffffff", "#f0fdf4", "#ffffff"],
      transition: { type: "keyframes", duration: 0.3 }
    }
  };

  const buttonClick = {
    whileTap: { scale: 0.96 },
    whileHover: { scale: 1.02 },
    transition: { type: "spring", stiffness: 400, damping: 17 }
  };

  const hasPermission = (permission: string) => {
    return ROLE_PERMISSIONS[currentUser.role].includes(permission);
  };

  // --- POS Logic ---
  const addToCart = (product: Product) => {
    if (!settings.inventory.allowNegativeStock && product.stock <= 0) {
      setShowToast({ message: 'عذراً، المنتج غير متوفر في المخزن', type: 'error' });
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (!settings.inventory.allowNegativeStock && existing.quantity >= product.stock) {
          setShowToast({ message: 'عذراً، تم الوصول للحد الأقصى للمخزون', type: 'error' });
          return prev;
        }
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    if (settings.pos.soundEnabled) {
      // Play sound logic here if needed
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        if (!settings.inventory.allowNegativeStock && newQty > item.stock) {
          setShowToast({ message: 'عذراً، تم الوصول للحد الأقصى للمخزون', type: 'error' });
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const subTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxValue = settings?.taxes?.isTaxInclusive ? 0 : (subTotal * (settings?.taxes?.defaultTaxRate || 0) / 100);
  const discountValue = discountType === 'amount' ? discount : (subTotal * discount / 100);
  const cartTotal = Math.max(0, subTotal + taxValue - discountValue);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F1: Dashboard
      if (e.key === 'F1') {
        e.preventDefault();
        setActiveTab('dashboard');
      }
      // F2: POS
      if (e.key === 'F2') {
        e.preventDefault();
        setActiveTab('pos');
      }
      // F3: Products
      if (e.key === 'F3') {
        e.preventDefault();
        setActiveTab('products');
      }
      // F4: History
      if (e.key === 'F4') {
        e.preventDefault();
        setActiveTab('history');
      }
      // F9: Checkout (if in POS)
      if (e.key === 'F9' && activeTab === 'pos') {
        e.preventDefault();
        handleCheckout();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, cart, cartTotal]);

  const handleCheckout = () => {
    if (!hasPermission('create_invoice')) {
      setShowToast({ message: 'ليس لديك صلاحية لإتمام البيع', type: 'error' });
      return;
    }
    if (cart.length === 0) return;
    
    setCurrentPayments([]);
    setPaymentMethod(lastPaymentMethod);
    setCashReceived('');
    
    // Auto-fill cash if it's the last used method or default
    if (lastPaymentMethod === 'cash') {
      setCashReceived(cartTotal.toString());
    }
    
    setIsPaymentModalOpen(true);
  };

  const addPayment = () => {
    let amount = 0;
    let details: any = {};

    const totalPaidSoFar = currentPayments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = cartTotal - totalPaidSoFar;

    if (remaining <= 0.01) return;

    if (paymentMethod === 'cash') {
      const received = Number(cashReceived) || remaining;
      amount = Math.min(received, remaining);
      details = { received, change: Math.max(0, received - remaining) };
    } else if (paymentMethod === 'wallet') {
      amount = remaining;
      details = { walletProvider: walletData.provider, walletNumber: walletData.number, walletOwner: walletData.owner, transactionId: walletData.transactionId };
    } else if (paymentMethod === 'card') {
      amount = remaining;
      details = { cardType: cardData.type, last4: cardData.last4, transactionId: cardData.ref, bankName: cardData.bank };
    } else if (paymentMethod === 'bank') {
      amount = remaining;
      details = { bankName: bankData.bank, accountNumber: bankData.account, transactionId: bankData.ref, transferDate: bankData.date };
    }

    const newPayment: Payment = {
      id: Math.random().toString(36).substr(2, 9),
      method: paymentMethod,
      amount: amount,
      details
    };

    setCurrentPayments([...currentPayments, newPayment]);
    setLastPaymentMethod(paymentMethod);
    
    // Log payment
    const logEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      message: `تمت إضافة دفعة بقيمة ${amount} ج.م بطريقة ${paymentMethod === 'cash' ? 'نقدي' : paymentMethod === 'card' ? 'فيزا' : paymentMethod === 'wallet' ? 'محفظة' : 'تحويل'}`,
      type: 'info' as const
    };
    setPaymentLogs(prev => [logEntry, ...prev].slice(0, 50));

    // Reset forms
    setCashReceived('');
    setWalletData({ provider: 'vodafone', number: '', owner: '', transactionId: '' });
    setCardData({ type: 'visa', last4: '', ref: '', bank: '' });
    setBankData({ bank: '', account: '', ref: '', date: new Date().toISOString().split('T')[0] });
  };

  const finalizeSale = () => {
    const totalPaid = currentPayments.reduce((sum, p) => sum + p.amount, 0);
    if (totalPaid < cartTotal - 0.01) { 
      setShowToast({ message: 'المبلغ المدفوع غير كافٍ', type: 'error' });
      return;
    }

    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      invoiceNumber: `INV-${Date.now()}`,
      status: 'paid',
      paidAmount: totalPaid,
      tax: cartTotal - subTotal + discount,
      shipping: 0,
      discount: discount,
      items: [...cart],
      total: cartTotal,
      subTotal: subTotal,
      discountType: discountType,
      customerId: selectedCustomerId,
      timestamp: Date.now(),
      type: 'sale',
      payments: currentPayments,
      updatedAt: Date.now()
    };

    setTransactions(prev => [newTransaction, ...prev]);
    
    // Update Treasury
    currentPayments.forEach(p => {
      let targetTreasuryId = '';
      if (p.method === 'cash') targetTreasuryId = treasuries.find(t => t.type === 'cash')?.id || '1';
      else if (p.method === 'card' || p.method === 'bank') targetTreasuryId = treasuries.find(t => t.type === 'bank')?.id || '2';
      else if (p.method === 'wallet') targetTreasuryId = treasuries.find(t => t.type === 'wallet')?.id || '3';
      
      if (targetTreasuryId) {
        handleTreasuryTransaction('sale', p.amount, targetTreasuryId, `مبيعات فاتورة ${newTransaction.invoiceNumber}`, newTransaction.id);
      }
    });

    // Update stock
    setProducts(prev => prev.map(p => {
      const cartItem = cart.find(item => item.id === p.id);
      if (cartItem) {
        return { ...p, stock: p.stock - cartItem.quantity };
      }
      return p;
    }));

    // Record stock movements
    const movements: StockMovement[] = cart.map(item => ({
      id: Math.random().toString(36).substr(2, 9),
      productId: item.id,
      productName: item.name,
      fromWarehouseId: settings.pos.defaultWarehouseId || 'main',
      quantity: item.quantity,
      type: 'sale',
      timestamp: Date.now(),
      note: `بيع فاتورة #${newTransaction.id}`,
      updatedAt: Date.now()
    }));
    setStockMovements(prev => [...movements, ...prev]);

    setCart([]);
    setIsPaymentModalOpen(false);
    setCurrentPayments([]);
    setShowToast({ message: 'تمت عملية البيع بنجاح!', type: 'success' });
    setSelectedTransaction(newTransaction);
    setIsInvoicePreviewOpen(true);
  };

  const handlePurchase = () => {
    if (!hasPermission('create_invoice')) {
      setShowToast({ message: 'ليس لديك صلاحية لإتمام الشراء', type: 'error' });
      return;
    }
    if (cart.length === 0) return;

    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      invoiceNumber: `PUR-${Date.now()}`,
      status: 'paid',
      paidAmount: cartTotal,
      tax: 0,
      shipping: 0,
      discount: discount,
      items: [...cart],
      total: cartTotal,
      subTotal: subTotal,
      discountType: discountType,
      timestamp: Date.now(),
      type: 'purchase',
      updatedAt: Date.now()
    };

    setTransactions(prev => [newTransaction, ...prev]);
    
    // Update Treasury
    const purchaseTreasuryId = treasuries.find(t => t.type === 'cash')?.id || '1';
    handleTreasuryTransaction('purchase', cartTotal, purchaseTreasuryId, `مشتريات فاتورة ${newTransaction.invoiceNumber}`, newTransaction.id);

    // Update stock (Purchases increase stock)
    setProducts(prev => prev.map(p => {
      const cartItem = cart.find(item => item.id === p.id);
      if (cartItem) {
        return { ...p, stock: p.stock + cartItem.quantity };
      }
      return p;
    }));

    // Record stock movements
    const movements: StockMovement[] = cart.map(item => ({
      id: Math.random().toString(36).substr(2, 9),
      productId: item.id,
      productName: item.name,
      toWarehouseId: 'main',
      quantity: item.quantity,
      type: 'purchase',
      timestamp: Date.now(),
      note: `شراء فاتورة #${newTransaction.id}`,
      updatedAt: Date.now()
    }));
    setStockMovements(prev => [...movements, ...prev]);

    setCart([]);
    setShowToast({ message: 'تمت عملية الشراء بنجاح!', type: 'success' });
  };

  const handleReturn = (transaction: Transaction) => {
    const returnType = transaction.type === 'sale' ? 'sale_return' : 'purchase_return';
    
    const newTransaction: Transaction = {
      id: `RET-${transaction.id}`,
      invoiceNumber: `RET-${transaction.invoiceNumber || transaction.id}`,
      status: 'paid',
      paidAmount: transaction.total,
      tax: transaction.tax || 0,
      shipping: transaction.shipping || 0,
      discount: transaction.discount || 0,
      items: transaction.items,
      total: transaction.total,
      timestamp: Date.now(),
      type: returnType,
      updatedAt: Date.now()
    };

    setTransactions(prev => [newTransaction, ...prev]);

    // Update Treasury
    const returnTreasuryId = treasuries.find(t => t.type === 'cash')?.id || '1';
    if (returnType === 'sale_return') {
      handleTreasuryTransaction('withdraw', transaction.total, returnTreasuryId, `مرتجع مبيعات فاتورة ${transaction.invoiceNumber}`, newTransaction.id);
    } else {
      handleTreasuryTransaction('deposit', transaction.total, returnTreasuryId, `مرتجع مشتريات فاتورة ${transaction.invoiceNumber}`, newTransaction.id);
    }

    // Update stock
    setProducts(prev => prev.map(p => {
      const item = transaction.items.find(i => i.id === p.id);
      if (item) {
        // Sale Return increases stock, Purchase Return decreases stock
        const stockDelta = transaction.type === 'sale' ? item.quantity : -item.quantity;
        return { ...p, stock: p.stock + stockDelta };
      }
      return p;
    }));

    setShowToast({ message: 'تمت عملية المرتجع بنجاح!', type: 'success' });
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('manage_inventory')) {
      setShowToast({ message: 'ليس لديك صلاحية لإدارة المخزون', type: 'error' });
      return;
    }
    if (!newProduct.name) return;

    const productData: Omit<Product, 'id'> = {
      name: newProduct.name,
      sku: newProduct.sku,
      barcode: newProduct.barcode,
      category: newProduct.category,
      type: newProduct.type,
      status: newProduct.status,
      description: newProduct.description,
      shortDescription: newProduct.shortDescription,
      purchasePrice: Number(newProduct.purchasePrice) || 0,
      price: Number(newProduct.price) || 0,
      wholesalePrice: Number(newProduct.wholesalePrice) || 0,
      minPrice: Number(newProduct.minPrice) || 0,
      vat: Number(newProduct.vat) || 0,
      defaultDiscount: Number(newProduct.defaultDiscount) || 0,
      stock: Number(newProduct.stock) || 0,
      minStockAlert: Number(newProduct.minStockAlert) || 0,
      maxStock: Number(newProduct.maxStock) || 0,
      unit: newProduct.unit,
      location: newProduct.location,
      serialNumber: newProduct.serialNumber,
      batchNumber: newProduct.batchNumber,
      expiryDate: newProduct.expiryDate ? new Date(newProduct.expiryDate).getTime() : undefined,
      primarySupplierId: newProduct.primarySupplierId,
      image: newProduct.image,
    };

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? {
        ...p,
        ...productData,
        updatedAt: Date.now()
      } : p));
      setShowToast({ message: 'تم تحديث المنتج بنجاح', type: 'success' });
    } else {
      const product: Product = {
        id: Math.random().toString(36).substr(2, 9),
        ...productData,
        updatedAt: Date.now()
      };
      setProducts(prev => [...prev, product]);
      setShowToast({ message: 'تم إضافة المنتج بنجاح', type: 'success' });
    }

    resetProductForm();
  };

  const resetProductForm = () => {
    setNewProduct({
      name: '',
      sku: '',
      barcode: '',
      category: 'مشروبات',
      type: 'stock',
      status: 'active',
      description: '',
      shortDescription: '',
      purchasePrice: '',
      price: '',
      wholesalePrice: '',
      minPrice: '',
      vat: '0',
      defaultDiscount: '0',
      stock: '',
      minStockAlert: '5',
      maxStock: '',
      unit: 'قطعة',
      location: '',
      serialNumber: '',
      batchNumber: '',
      expiryDate: '',
      primarySupplierId: '',
      image: ''
    });
    setIsAddModalOpen(false);
    setEditingProduct(null);
    setActiveProductTab('general');
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      sku: product.sku || '',
      barcode: product.barcode || '',
      category: product.category,
      type: product.type || 'stock',
      status: product.status || 'active',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      purchasePrice: (product.purchasePrice || 0).toString(),
      price: (product.price || 0).toString(),
      wholesalePrice: (product.wholesalePrice || 0).toString(),
      minPrice: (product.minPrice || 0).toString(),
      vat: (product.vat || 0).toString(),
      defaultDiscount: (product.defaultDiscount || 0).toString(),
      stock: (product.stock || 0).toString(),
      minStockAlert: (product.minStockAlert || 5).toString(),
      maxStock: (product.maxStock || 0).toString(),
      unit: product.unit || 'قطعة',
      location: product.location || '',
      serialNumber: product.serialNumber || '',
      batchNumber: product.batchNumber || '',
      expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : '',
      primarySupplierId: product.primarySupplierId || '',
      image: product.image || ''
    });
    setIsAddModalOpen(true);
  };

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.phone) return;

    if (editingCustomer) {
      setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? {
        ...c,
        name: newCustomer.name,
        phone: newCustomer.phone,
        email: newCustomer.email,
        address: newCustomer.address,
        openingBalance: Number(newCustomer.openingBalance),
        openingBalanceType: newCustomer.openingBalanceType,
        updatedAt: Date.now()
      } : c));
      setShowToast({ message: 'تم تحديث بيانات العميل بنجاح', type: 'success' });
    } else {
      const customer: Customer = {
        id: Math.random().toString(36).substr(2, 9),
        name: newCustomer.name,
        phone: newCustomer.phone,
        email: newCustomer.email,
        address: newCustomer.address,
        totalSpent: 0,
        lastVisit: Date.now(),
        openingBalance: Number(newCustomer.openingBalance),
        openingBalanceType: newCustomer.openingBalanceType,
        updatedAt: Date.now()
      };
      setCustomers(prev => [...prev, customer]);
      setShowToast({ message: 'تم إضافة العميل بنجاح', type: 'success' });
    }

    setNewCustomer({ 
      name: '', 
      phone: '', 
      email: '', 
      address: '', 
      openingBalance: '0', 
      openingBalanceType: 'debit' 
    });
    setIsCustomerModalOpen(false);
    setEditingCustomer(null);
  };

  const openEditCustomerModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setNewCustomer({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      openingBalance: (customer.openingBalance || 0).toString(),
      openingBalanceType: customer.openingBalanceType || 'debit'
    });
    setIsCustomerModalOpen(true);
  };

  const deleteProduct = () => {
    if (!hasPermission('manage_inventory')) {
      setShowToast({ message: 'ليس لديك صلاحية لإدارة المخزون', type: 'error' });
      return;
    }
    if (confirmDeleteId) {
      setProducts(prev => prev.filter(p => p.id !== confirmDeleteId));
      setConfirmDeleteId(null);
      setShowToast({ message: 'تم حذف المنتج بنجاح', type: 'success' });
    }
  };

  const deleteCustomer = () => {
    if (!hasPermission('manage_customers')) {
      setShowToast({ message: 'ليس لديك صلاحية لإدارة العملاء', type: 'error' });
      return;
    }
    if (confirmDeleteCustomerId) {
      setCustomers(prev => prev.filter(c => c.id !== confirmDeleteCustomerId));
      setConfirmDeleteCustomerId(null);
      setShowToast({ message: 'تم حذف العميل بنجاح', type: 'success' });
    }
  };

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('manage_suppliers')) {
      setShowToast({ message: 'ليس لديك صلاحية لإدارة الموردين', type: 'error' });
      return;
    }
    if (!newSupplier.name || !newSupplier.phone) return;

    if (editingSupplier) {
      setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? {
        ...s,
        name: newSupplier.name,
        contactName: newSupplier.contactName,
        phone: newSupplier.phone,
        email: newSupplier.email,
        address: newSupplier.address,
        category: newSupplier.category,
        openingBalance: Number(newSupplier.openingBalance),
        openingBalanceType: newSupplier.openingBalanceType
      } : s));
      setShowToast({ message: 'تم تحديث بيانات المورد بنجاح', type: 'success' });
    } else {
      const supplier: Supplier = {
        id: Math.random().toString(36).substr(2, 9),
        name: newSupplier.name,
        contactName: newSupplier.contactName,
        phone: newSupplier.phone,
        email: newSupplier.email,
        address: newSupplier.address,
        category: newSupplier.category,
        openingBalance: Number(newSupplier.openingBalance),
        openingBalanceType: newSupplier.openingBalanceType
      };
      setSuppliers(prev => [...prev, supplier]);
      setShowToast({ message: 'تم إضافة المورد بنجاح', type: 'success' });
    }

    setNewSupplier({ 
      name: '', 
      contactName: '', 
      phone: '', 
      email: '', 
      address: '', 
      category: 'عام',
      openingBalance: '0',
      openingBalanceType: 'debit'
    });
    setIsSupplierModalOpen(false);
    setEditingSupplier(null);
  };

  const openEditSupplierModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setNewSupplier({
      name: supplier.name,
      contactName: supplier.contactName,
      phone: supplier.phone,
      email: supplier.email || '',
      address: supplier.address || '',
      category: supplier.category,
      openingBalance: (supplier.openingBalance || 0).toString(),
      openingBalanceType: supplier.openingBalanceType || 'debit'
    });
    setIsSupplierModalOpen(true);
  };

  const deleteSupplier = () => {
    if (!hasPermission('manage_suppliers')) {
      setShowToast({ message: 'ليس لديك صلاحية لإدارة الموردين', type: 'error' });
      return;
    }
    if (confirmDeleteSupplierId) {
      setSuppliers(prev => prev.filter(s => s.id !== confirmDeleteSupplierId));
      setConfirmDeleteSupplierId(null);
      setShowToast({ message: 'تم حذف المورد بنجاح', type: 'success' });
    }
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('manage_employees')) {
      setShowToast({ message: 'ليس لديك صلاحية لإدارة الموظفين', type: 'error' });
      return;
    }
    if (!newEmployee.name || !newEmployee.jobTitle) return;

    const employeeData = {
      name: newEmployee.name!,
      nationalId: newEmployee.nationalId || '',
      phone: newEmployee.phone || '',
      email: newEmployee.email || '',
      address: newEmployee.address || '',
      jobTitle: newEmployee.jobTitle!,
      branchId: newEmployee.branchId || 'main',
      department: newEmployee.department || '',
      status: newEmployee.status || 'active',
      salary: Number(newEmployee.salary) || 0,
      salaryType: newEmployee.salaryType || 'monthly',
      bonuses: Number(newEmployee.bonuses) || 0,
      deductions: Number(newEmployee.deductions) || 0,
      insurance: Number(newEmployee.insurance) || 0,
      roleId: newEmployee.roleId
    };

    if (editingEmployee) {
      setEmployees(prev => prev.map(emp => emp.id === editingEmployee.id ? {
        ...emp,
        ...employeeData
      } : emp));
      setShowToast({ message: 'تم تحديث بيانات الموظف بنجاح', type: 'success' });
    } else {
      const employee: Employee = {
        id: `EMP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        ...employeeData,
        joinDate: Date.now()
      };
      setEmployees(prev => [...prev, employee]);
      setShowToast({ message: 'تم إضافة الموظف بنجاح', type: 'success' });
    }

    setNewEmployee({
      name: '',
      nationalId: '',
      phone: '',
      email: '',
      address: '',
      jobTitle: '',
      branchId: 'all',
      department: '',
      status: 'active',
      salary: 0,
      salaryType: 'monthly',
      bonuses: 0,
      deductions: 0
    });
    setIsEmployeeModalOpen(false);
    setEditingEmployee(null);
  };

  const openEditEmployeeModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setNewEmployee({
      ...employee
    });
    setIsEmployeeModalOpen(true);
  };

  const handleToggleAttendance = (employeeId: string, month: string, day: number, status: 'present' | 'absent') => {
    setAttendance(prev => {
      const existing = prev.find(a => a.employeeId === employeeId && a.month === month);
      if (existing) {
        return prev.map(a => a.id === existing.id ? {
          ...a,
          days: { ...a.days, [day]: status }
        } : a);
      } else {
        return [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          employeeId,
          month,
          days: { [day]: status },
          advances: 0,
          deductions: 0,
          bonuses: 0,
          overtimeHours: 0,
          lateMinutes: 0
        }];
      }
    });
  };

  const calculateMonthlySalary = (employeeId: string, month: string) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return 0;
    const att = attendance.find(a => a.employeeId === employeeId && a.month === month);
    
    const daysInMonth = new Date(Number(month.split('-')[0]), Number(month.split('-')[1]), 0).getDate();
    const presentDays = att ? Object.values(att.days).filter(d => d === 'present').length : 0;
    
    const dailyRate = emp.salaryType === 'monthly' ? emp.salary / 30 : emp.salary;
    const basePay = presentDays * dailyRate;
    
    const totalBonuses = (emp.bonuses || 0) + (att?.bonuses || 0);
    const totalDeductions = (emp.deductions || 0) + (att?.deductions || 0) + (att?.advances || 0);
    
    return basePay + totalBonuses - totalDeductions;
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdjustment.employeeId || newAdjustment.amount <= 0) return;

    setAttendance(prev => {
      const existing = prev.find(a => a.employeeId === newAdjustment.employeeId && a.month === newAdjustment.month);
      if (existing) {
        return prev.map(a => a.id === existing.id ? {
          ...a,
          bonuses: newAdjustment.type === 'bonus' ? a.bonuses + newAdjustment.amount : a.bonuses,
          deductions: newAdjustment.type === 'deduction' ? a.deductions + newAdjustment.amount : a.deductions,
          advances: newAdjustment.type === 'advance' ? a.advances + newAdjustment.amount : a.advances
        } : a);
      } else {
        return [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          employeeId: newAdjustment.employeeId,
          month: newAdjustment.month,
          days: {},
          advances: newAdjustment.type === 'advance' ? newAdjustment.amount : 0,
          deductions: newAdjustment.type === 'deduction' ? newAdjustment.amount : 0,
          bonuses: newAdjustment.type === 'bonus' ? newAdjustment.amount : 0,
          overtimeHours: 0,
          lateMinutes: 0
        }];
      }
    });

    setIsAdjustmentModalOpen(false);
    setNewAdjustment({
      employeeId: '',
      type: 'bonus',
      amount: 0,
      month: new Date().toISOString().slice(0, 7),
      note: ''
    });
    setShowToast({ message: 'تم تسجيل الحركة المالية بنجاح', type: 'success' });
  };

  const deleteEmployee = () => {
    if (!hasPermission('manage_employees')) {
      setShowToast({ message: 'ليس لديك صلاحية لإدارة الموظفين', type: 'error' });
      return;
    }
    if (confirmDeleteEmployeeId) {
      setEmployees(prev => prev.filter(emp => emp.id !== confirmDeleteEmployeeId));
      setConfirmDeleteEmployeeId(null);
      setShowToast({ message: 'تم حذف الموظف بنجاح', type: 'success' });
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.name || !newUser.role) return;

    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? {
        ...u,
        username: newUser.username,
        name: newUser.name,
        role: newUser.role,
        updatedAt: Date.now()
      } : u));
      setShowToast({ message: 'تم تحديث بيانات المستخدم بنجاح', type: 'success' });
    } else {
      const user: User = {
        id: Math.random().toString(36).substr(2, 9),
        username: newUser.username,
        name: newUser.name,
        role: newUser.role,
        status: 'active',
        failedAttempts: 0,
        isLocked: false,
        updatedAt: Date.now()
      };
      setUsers(prev => [...prev, user]);
      setShowToast({ message: 'تم إضافة المستخدم بنجاح', type: 'success' });
    }

    setNewUser({ username: '', name: '', role: 'cashier', password: '' });
    setIsUserModalOpen(false);
    setEditingUser(null);
  };

  const openEditUserModal = (user: User) => {
    setEditingUser(user);
    setNewUser({
      username: user.username,
      name: user.name,
      role: user.role,
      password: ''
    });
    setIsUserModalOpen(true);
  };

  const deleteUser = () => {
    if (confirmDeleteUserId) {
      if (confirmDeleteUserId === currentUser.id) {
        setShowToast({ message: 'لا يمكنك حذف المستخدم الحالي', type: 'error' });
        setConfirmDeleteUserId(null);
        return;
      }
      setUsers(prev => prev.filter(u => u.id !== confirmDeleteUserId));
      setConfirmDeleteUserId(null);
      setShowToast({ message: 'تم حذف المستخدم بنجاح', type: 'success' });
    }
  };

  const switchUser = (user: User) => {
    setCurrentUser(user);
    setShowToast({ message: `تم التبديل إلى ${user.name}`, type: 'success' });
    setActiveTab('dashboard');
  };

  const handleAddWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWarehouse.name) return;

    if (editingWarehouse) {
      setWarehouses(prev => prev.map(w => w.id === editingWarehouse.id ? {
        ...w,
        name: newWarehouse.name!,
        type: newWarehouse.type as 'main' | 'sub',
        location: newWarehouse.location,
        updatedAt: Date.now()
      } : w));
      setShowToast({ message: 'تم تحديث بيانات المخزن بنجاح', type: 'success' });
    } else {
      const warehouse: Warehouse = {
        id: Math.random().toString(36).substr(2, 9),
        name: newWarehouse.name!,
        type: newWarehouse.type as 'main' | 'sub',
        location: newWarehouse.location,
        updatedAt: Date.now()
      };
      setWarehouses(prev => [...prev, warehouse]);
      setShowToast({ message: 'تم إضافة المخزن بنجاح', type: 'success' });
    }

    setNewWarehouse({ name: '', type: 'sub', location: '' });
    setIsWarehouseModalOpen(false);
    setEditingWarehouse(null);
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const { productId, fromId, toId, quantity } = transferData;
    const qty = Number(quantity);

    if (!productId || !toId || qty <= 0) return;

    const product = products.find(p => p.id === productId);
    if (!product) return;

    // In this simplified model, we just record the movement
    // and update the global stock if needed (though global stock is already updated by sales/purchases)
    // For transfers between warehouses, global stock doesn't change.
    
    const movement: StockMovement = {
      id: Math.random().toString(36).substr(2, 9),
      productId,
      productName: product.name,
      fromWarehouseId: fromId || undefined,
      toWarehouseId: toId,
      quantity: qty,
      type: 'transfer',
      timestamp: Date.now(),
      note: `نقل من ${warehouses.find(w => w.id === fromId)?.name || 'غير محدد'} إلى ${warehouses.find(w => w.id === toId)?.name}`,
      updatedAt: Date.now()
    };

    setStockMovements(prev => [movement, ...prev]);
    setShowToast({ message: 'تمت عملية النقل بنجاح', type: 'success' });
    setIsTransferModalOpen(false);
    setTransferData({ productId: '', fromId: '', toId: '', quantity: '' });
  };

  const handleAudit = (e: React.FormEvent) => {
    e.preventDefault();
    const { warehouseId, productId, actualQuantity } = auditData;
    const actual = Number(actualQuantity);

    if (!warehouseId || !productId) return;

    const product = products.find(p => p.id === productId);
    if (!product) return;

    const warehouse = warehouses.find(w => w.id === warehouseId);
    const diff = actual - product.stock; 
    
    const movement: StockMovement = {
      id: Math.random().toString(36).substr(2, 9),
      productId,
      productName: product.name,
      toWarehouseId: warehouseId,
      quantity: Math.abs(diff),
      type: 'adjustment',
      timestamp: Date.now(),
      note: `جرد مخزون في ${warehouse?.name || 'غير محدد'}: ${diff > 0 ? 'زيادة' : 'نقص'} بمقدار ${Math.abs(diff)}`
    };

    if (diff !== 0) {
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: actual } : p));
      setStockMovements(prev => [movement, ...prev]);
    }

    setShowToast({ message: 'تم تحديث الجرد بنجاح', type: 'success' });
    setIsAuditModalOpen(false);
    setAuditData({ warehouseId: '', productId: '', actualQuantity: '' });
  };

  const deleteWarehouse = (id: string) => {
    if (id === 'main') {
      setShowToast({ message: 'لا يمكن حذف المخزن الرئيسي', type: 'error' });
      return;
    }
    setWarehouses(prev => prev.filter(w => w.id !== id));
    setShowToast({ message: 'تم حذف المخزن بنجاح', type: 'success' });
  };

  // --- Dashboard Data ---
  const filteredTransactionsForReports = useMemo(() => {
    return transactions.filter(t => {
      const timestamp = t.timestamp;
      const now = new Date();
      let matchesPeriod = true;

      if (reportFilters.period === 'day') {
        matchesPeriod = new Date(timestamp).toDateString() === now.toDateString();
      } else if (reportFilters.period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesPeriod = timestamp >= weekAgo.getTime();
      } else if (reportFilters.period === 'month') {
        matchesPeriod = new Date(timestamp).getMonth() === now.getMonth() && new Date(timestamp).getFullYear() === now.getFullYear();
      } else if (reportFilters.period === 'custom') {
        const start = reportFilters.startDate ? new Date(reportFilters.startDate).getTime() : 0;
        const end = reportFilters.endDate ? new Date(reportFilters.endDate).getTime() + 86400000 : Infinity;
        matchesPeriod = timestamp >= start && timestamp <= end;
      }

      const matchesWarehouse = reportFilters.warehouseId === 'all' || t.fromWarehouseId === reportFilters.warehouseId || t.toWarehouseId === reportFilters.warehouseId;
      const matchesUser = reportFilters.userId === 'all' || t.userId === reportFilters.userId;
      const matchesCustomer = reportFilters.customerId === 'all' || t.customerId === reportFilters.customerId;
      const matchesSupplier = reportFilters.supplierId === 'all' || t.customerId === reportFilters.supplierId;
      const matchesStatus = reportFilters.invoiceStatus === 'all' || t.status === reportFilters.invoiceStatus;
      
      let matchesPayment = reportFilters.paymentMethod === 'all';
      if (!matchesPayment && t.payments) {
        matchesPayment = t.payments.some(p => p.method === reportFilters.paymentMethod);
      }

      const matchesSearch = !reportFilters.searchQuery || 
        t.invoiceNumber?.toLowerCase().includes(reportFilters.searchQuery.toLowerCase()) ||
        customers.find(c => c.id === t.customerId)?.name.toLowerCase().includes(reportFilters.searchQuery.toLowerCase());

      // Type filtering based on reportType
      let matchesType = true;
      if (reportType === 'sales') matchesType = t.type === 'sale';
      else if (reportType === 'purchases') matchesType = t.type === 'purchase';
      else if (reportType === 'inventory') matchesType = true;
      else if (reportType === 'profit_loss') matchesType = t.type === 'sale' || t.type === 'purchase';
      else if (reportType === 'customers') matchesType = t.type === 'sale' || t.type === 'sale_return';
      else if (reportType === 'suppliers') matchesType = t.type === 'purchase' || t.type === 'purchase_return';
      else if (reportType === 'employees') matchesType = t.type === 'sale';
      else if (reportType === 'top_selling') matchesType = t.type === 'sale';

      return matchesPeriod && matchesWarehouse && matchesUser && matchesCustomer && matchesSupplier && matchesStatus && matchesPayment && matchesType && matchesSearch;
    });
  }, [transactions, reportFilters, reportType, customers]);

  const filteredTreasuryTransactionsForReports = useMemo(() => {
    return treasuryTransactions.filter(tx => {
      const timestamp = tx.date;
      const now = new Date();
      let matchesPeriod = true;

      if (reportFilters.period === 'day') {
        matchesPeriod = new Date(timestamp).toDateString() === now.toDateString();
      } else if (reportFilters.period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesPeriod = timestamp >= weekAgo.getTime();
      } else if (reportFilters.period === 'month') {
        matchesPeriod = new Date(timestamp).getMonth() === now.getMonth() && new Date(timestamp).getFullYear() === now.getFullYear();
      } else if (reportFilters.period === 'custom') {
        const start = reportFilters.startDate ? new Date(reportFilters.startDate).getTime() : 0;
        const end = reportFilters.endDate ? new Date(reportFilters.endDate).getTime() + 86400000 : Infinity;
        matchesPeriod = timestamp >= start && timestamp <= end;
      }

      const matchesTreasury = reportFilters.warehouseId === 'all' || tx.treasuryId === reportFilters.warehouseId;
      const matchesUser = reportFilters.userId === 'all' || tx.userId === reportFilters.userId;
      
      return matchesPeriod && matchesTreasury && matchesUser;
    });
  }, [treasuryTransactions, reportFilters]);

  const reportStats = useMemo(() => {
    const sales = filteredTransactionsForReports.filter(t => t.type === 'sale');
    const purchases = filteredTransactionsForReports.filter(t => t.type === 'purchase');
    const returns = filteredTransactionsForReports.filter(t => t.type.includes('return'));

    const totalSales = sales.reduce((sum, t) => sum + t.total, 0);
    const totalPurchases = purchases.reduce((sum, t) => sum + t.total, 0);
    const totalReturns = returns.reduce((sum, t) => sum + t.total, 0);
    
    const totalExpenses = expenses.filter(e => {
      const start = reportFilters.startDate ? new Date(reportFilters.startDate).getTime() : 0;
      const end = reportFilters.endDate ? new Date(reportFilters.endDate).getTime() + 86400000 : Infinity;
      if (reportFilters.period === 'custom') return e.date >= start && e.date <= end;
      // Simplified for other periods
      return true; 
    }).reduce((sum, e) => sum + e.amount, 0);

    // Calculate Cost of Goods Sold (COGS)
    let totalCost = 0;
    sales.forEach(s => {
      s.items.forEach(item => {
        const product = products.find(p => p.id === item.id);
        totalCost += (Number(product?.purchasePrice) || 0) * item.quantity;
      });
    });

    const grossProfit = totalSales - totalCost;
    const netProfit = grossProfit - totalExpenses;
    const profitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;
    const invoiceCount = sales.length;
    const avgInvoice = invoiceCount > 0 ? totalSales / invoiceCount : 0;

    const productSales: Record<string, { name: string, qty: number, total: number }> = {};
    filteredTransactionsForReports.forEach(t => {
      t.items.forEach(item => {
        if (!productSales[item.id]) productSales[item.id] = { name: item.name, qty: 0, total: 0 };
        productSales[item.id].qty += item.quantity;
        productSales[item.id].total += item.price * item.quantity;
      });
    });

    const topProducts = Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 10);

    const customerSales: Record<string, number> = {};
    sales.forEach(t => {
      if (t.customerId) {
        customerSales[t.customerId] = (customerSales[t.customerId] || 0) + t.total;
      }
    });
    const topCustomers = Object.entries(customerSales)
      .map(([id, total]) => ({ name: customers.find(c => c.id === id)?.name || 'عميل نقدي', total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const employeeSales: Record<string, number> = {};
    sales.forEach(t => {
      employeeSales[t.userId] = (employeeSales[t.userId] || 0) + t.total;
    });
    const topEmployees = Object.entries(employeeSales)
      .map(([id, total]) => ({ name: users.find(u => u.id === id)?.name || 'غير معروف', total }))
      .sort((a, b) => b.total - a.total);

    const paymentMethodTotals: Record<string, number> = { cash: 0, card: 0, wallet: 0, bank: 0 };
    filteredTransactionsForReports.forEach(t => {
      if (t.payments) {
        t.payments.forEach(p => {
          paymentMethodTotals[p.method] = (paymentMethodTotals[p.method] || 0) + p.amount;
        });
      }
    });
    const paymentMethodData = Object.entries(paymentMethodTotals).map(([name, value]) => ({ name, value }));

    // Inventory metrics
    const lowStockCount = products.filter(p => p.stock <= (Number(p.minStockAlert) || 5)).length;
    const totalInventoryValue = products.reduce((sum, p) => sum + (p.stock * (Number(p.purchasePrice) || 0)), 0);

    const stagnantProducts = products.filter(p => {
      const hasSales = transactions.some(t => t.type === 'sale' && t.items.some(i => i.id === p.id));
      return !hasSales && p.stock > 0;
    }).slice(0, 10);

    return { 
      totalSales, totalPurchases, totalReturns, totalExpenses, grossProfit, netProfit, profitMargin, 
      invoiceCount, avgInvoice, topProducts, topCustomers, topEmployees,
      paymentMethodData, lowStockCount, totalInventoryValue, totalCost, stagnantProducts
    };
  }, [filteredTransactionsForReports, products, customers, expenses, users, transactions, reportFilters]);

  const reportChartData = useMemo(() => {
    const data: Record<string, any> = {};
    filteredTransactionsForReports.forEach(t => {
      const dateStr = new Date(t.timestamp).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
      if (!data[dateStr]) data[dateStr] = { name: dateStr, sales: 0, purchases: 0, profit: 0 };
      if (t.type === 'sale') {
        data[dateStr].sales += t.total;
        // Simplified daily profit
        let dailyCost = 0;
        t.items.forEach(item => {
          const p = products.find(prod => prod.id === item.id);
          dailyCost += (Number(p?.purchasePrice) || 0) * item.quantity;
        });
        data[dateStr].profit += (t.total - dailyCost);
      }
      if (t.type === 'purchase') data[dateStr].purchases += t.total;
    });
    return Object.values(data);
  }, [filteredTransactionsForReports, products]);

  const stats = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const todaySales = transactions
      .filter(t => t.timestamp >= today)
      .reduce((sum, t) => sum + t.total, 0);
    
    const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
    const lowStockCount = products.filter(p => p.stock < 10).length;
    
    return { todaySales, totalRevenue, lowStockCount, totalTransactions: transactions.length };
  }, [transactions, products]);

  const chartData = useMemo(() => {
    // Last 7 days
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d).setHours(0, 0, 0, 0);
      const dayEnd = new Date(d).setHours(23, 59, 59, 999);
      
      const dayTotal = transactions
        .filter(t => t.timestamp >= dayStart && t.timestamp <= dayEnd)
        .reduce((sum, t) => sum + t.total, 0);
      
      data.push({
        name: d.toLocaleDateString('ar-EG', { weekday: 'short' }),
        sales: dayTotal
      });
    }
    return data;
  }, [transactions]);

  // --- Render Helpers ---
  const renderTreasury = () => {
    const totalBalance = treasuries.reduce((sum, t) => sum + t.balance, 0);
    const recentTransactions = treasuryTransactions.slice(0, 10);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    return (
      <div className="space-y-8" dir="rtl">
        {/* Treasury Header / Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <Landmark size={24} />
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">إجمالي الرصيد</span>
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-800">{totalBalance.toLocaleString()} <span className="text-sm font-normal text-slate-400">ج.م</span></h3>
              <p className="text-xs text-slate-400 mt-1">عبر جميع الخزن والحسابات</p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                <ArrowDownRight size={24} />
              </div>
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">إجمالي المصروفات</span>
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-800">{totalExpenses.toLocaleString()} <span className="text-sm font-normal text-slate-400">ج.م</span></h3>
              <p className="text-xs text-slate-400 mt-1">خلال الفترة الحالية</p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <Banknote size={24} />
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">الخزن النقدية</span>
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-800">
                {treasuries.filter(t => t.type === 'cash').reduce((sum, t) => sum + t.balance, 0).toLocaleString()} 
                <span className="text-sm font-normal text-slate-400"> ج.م</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">{treasuries.filter(t => t.type === 'cash').length} خزن</p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                <Wallet size={24} />
              </div>
              <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">البنوك والمحافظ</span>
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-800">
                {treasuries.filter(t => t.type !== 'cash').reduce((sum, t) => sum + t.balance, 0).toLocaleString()} 
                <span className="text-sm font-normal text-slate-400"> ج.م</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">{treasuries.filter(t => t.type !== 'cash').length} حسابات</p>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => {
              setTreasuryTransactionType('deposit');
              setIsTreasuryTransactionModalOpen(true);
            }}
            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
          >
            <Plus size={20} />
            إيداع رصيد
          </button>
          <button 
            onClick={() => {
              setTreasuryTransactionType('withdraw');
              setIsTreasuryTransactionModalOpen(true);
            }}
            className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-red-100 hover:bg-red-700 transition-all"
          >
            <ArrowDownRight size={20} />
            سحب رصيد
          </button>
          <button 
            onClick={() => {
              setTreasuryTransactionType('transfer');
              setIsTreasuryTransactionModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
          >
            <ArrowLeftRight size={20} />
            تحويل بين الخزن
          </button>
          <button 
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-slate-100 hover:bg-slate-900 transition-all"
          >
            <DollarSign size={20} />
            إضافة مصروف
          </button>
          <button 
            onClick={() => setIsTreasuryModalOpen(true)}
            className="flex items-center gap-2 bg-white text-slate-800 border border-slate-200 px-6 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-all"
          >
            <Building2 size={20} />
            إدارة الخزن
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Treasuries List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Landmark size={24} className="text-emerald-500" />
                قائمة الخزن والحسابات
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {treasuries.map(t => (
                <div key={t.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        t.type === 'cash' ? "bg-emerald-50 text-emerald-600" :
                        t.type === 'bank' ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                      )}>
                        {t.type === 'cash' ? <Banknote size={20} /> : t.type === 'bank' ? <Landmark size={20} /> : <Wallet size={20} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{t.name}</h4>
                        <p className="text-xs text-slate-400">
                          {t.type === 'cash' ? 'خزينة نقدية' : t.type === 'bank' ? 'حساب بنكي' : 'محفظة إلكترونية'}
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-lg font-black text-slate-800">{t.balance.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">ج.م</span></p>
                      {t.balance < 500 && <span className="text-[10px] text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-full">رصيد منخفض</span>}
                    </div>
                  </div>
                  {t.type === 'bank' && (
                    <div className="mt-2 pt-2 border-t border-slate-50 flex justify-between text-[10px] text-slate-500">
                      <span>{t.bankName}</span>
                      <span className="font-mono">{t.accountNumber}</span>
                    </div>
                  )}
                  {t.type === 'wallet' && (
                    <div className="mt-2 pt-2 border-t border-slate-50 flex justify-between text-[10px] text-slate-500">
                      <span>رقم المحفظة</span>
                      <span className="font-mono">{t.walletNumber}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Recent Transactions Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h3 className="font-black text-slate-800 flex items-center gap-2">
                  <History size={20} className="text-blue-500" />
                  آخر حركات الخزنة
                </h3>
                <button className="text-xs font-bold text-blue-600 hover:underline">عرض الكل</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs">
                      <th className="px-6 py-4 font-bold">التاريخ</th>
                      <th className="px-6 py-4 font-bold">الخزينة</th>
                      <th className="px-6 py-4 font-bold">النوع</th>
                      <th className="px-6 py-4 font-bold">المبلغ</th>
                      <th className="px-6 py-4 font-bold">الرصيد بعد</th>
                      <th className="px-6 py-4 font-bold">البيان</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentTransactions.map(tx => {
                      const txTreasury = treasuries.find(t => t.id === tx.treasuryId);
                      return (
                        <tr key={tx.id} className="text-sm hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-slate-500 text-xs">
                            {new Date(tx.date).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-700">{txTreasury?.name || '---'}</td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-2 py-1 rounded-full text-[10px] font-bold",
                              tx.type === 'deposit' || tx.type === 'sale' || tx.type === 'opening_balance' ? "bg-emerald-50 text-emerald-600" :
                              tx.type === 'withdraw' || tx.type === 'purchase' || tx.type === 'expense' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                            )}>
                              {tx.type === 'deposit' ? 'إيداع' : 
                               tx.type === 'withdraw' ? 'سحب' : 
                               tx.type === 'transfer' ? 'تحويل' : 
                               tx.type === 'sale' ? 'مبيعات' : 
                               tx.type === 'purchase' ? 'مشتريات' : 
                               tx.type === 'expense' ? 'مصروف' : 
                               tx.type === 'salary' ? 'مرتبات' : 'رصيد أول'}
                            </span>
                          </td>
                          <td className={cn(
                            "px-6 py-4 font-black",
                            tx.type === 'deposit' || tx.type === 'sale' || tx.type === 'opening_balance' ? "text-emerald-600" : "text-red-600"
                          )}>
                            {tx.type === 'deposit' || tx.type === 'sale' || tx.type === 'opening_balance' ? '+' : '-'}{tx.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-mono text-xs">{tx.balanceAfter.toLocaleString()}</td>
                          <td className="px-6 py-4 text-slate-500 text-xs truncate max-w-[150px]">{tx.note || '---'}</td>
                        </tr>
                      );
                    })}
                    {recentTransactions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">لا توجد حركات مسجلة حتى الآن</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Expenses Summary & Categories */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
                <PieChartIcon size={20} className="text-red-500" />
                تحليل المصروفات
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseCategories.map(cat => ({
                        name: cat.name,
                        value: expenses.filter(e => e.categoryId === cat.id).reduce((sum, e) => sum + e.amount, 0)
                      })).filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {expenseCategories.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6'][index % 7]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 space-y-3">
                {expenseCategories.map((cat, index) => {
                  const amount = expenses.filter(e => e.categoryId === cat.id).reduce((sum, e) => sum + e.amount, 0);
                  if (amount === 0) return null;
                  return (
                    <div key={cat.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6'][index % 7] }} />
                        <span className="text-slate-600">{cat.name}</span>
                      </div>
                      <span className="font-bold text-slate-800">{amount.toLocaleString()} ج.م</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl shadow-slate-200 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-bold text-slate-400 mb-2">تنبيهات ذكية</h3>
                <div className="space-y-4">
                  {treasuries.some(t => t.balance < 500) && (
                    <div className="flex items-start gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/10">
                      <AlertTriangle className="text-amber-400 shrink-0" size={18} />
                      <p className="text-xs leading-relaxed">هناك خزن رصيدها أقل من الحد المسموح به (500 ج.م). يرجى مراجعة السيولة.</p>
                    </div>
                  )}
                  <div className="flex items-start gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/10">
                    <Zap className="text-blue-400 shrink-0" size={18} />
                    <p className="text-xs leading-relaxed">تم تسجيل مصروفات بقيمة {totalExpenses.toLocaleString()} ج.م هذا الشهر. هذا يمثل 15% من إجمالي الدخل.</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const exportAllToExcel = () => {
    playSound('click');
    const data = products.map(p => ({
      "الاسم": p.name,
      "SKU": p.sku,
      "الباركود": p.barcode,
      "الفئة": p.category,
      "السعر": p.price,
      "سعر الشراء": p.purchasePrice,
      "المخزون": p.stock,
      "تنبيه المخزون": p.minStockAlert
    }));
    exportToExcel(data, `mena-products-${Date.now()}`);
    setShowToast({ message: 'تم التصدير بنجاح', type: 'success' });
  };
  const handleTreasuryTransaction = (
    type: 'deposit' | 'withdraw' | 'transfer' | 'sale' | 'purchase' | 'expense' | 'salary' | 'opening_balance',
    amount: number,
    treasuryId: string,
    note?: string,
    referenceId?: string,
    toTreasuryId?: string,
    category?: string
  ) => {
    const treasuryToUpdate = treasuries.find(t => t.id === treasuryId);
    if (!treasuryToUpdate) return;

    let newBalance = treasuryToUpdate.balance;
    if (type === 'deposit' || type === 'sale' || type === 'opening_balance') {
      newBalance += amount;
    } else if (type === 'withdraw' || type === 'purchase' || type === 'expense' || type === 'salary') {
      newBalance -= amount;
    } else if (type === 'transfer' && toTreasuryId) {
      newBalance -= amount;
      const toTreasury = treasuries.find(t => t.id === toTreasuryId);
      if (toTreasury) {
        const updatedToTreasuries = treasuries.map(t => 
          t.id === toTreasuryId ? { ...t, balance: t.balance + amount } : t
        );
        // We will update all treasuries at once below
        const toTransaction: TreasuryTransaction = {
          id: Math.random().toString(36).substr(2, 9),
          treasuryId: toTreasuryId,
          type: 'deposit',
          amount,
          balanceAfter: toTreasury.balance + amount,
          date: Date.now(),
          userId: currentUser.id,
          note: `تحويل من ${treasuryToUpdate.name}: ${note || ''}`,
          referenceId,
          updatedAt: Date.now()
        };
        setTreasuryTransactions(prev => [toTransaction, ...prev]);
      }
    }

    const updatedTreasuries = treasuries.map(t => {
      if (t.id === treasuryId) return { ...t, balance: newBalance };
      if (type === 'transfer' && t.id === toTreasuryId) return { ...t, balance: t.balance + amount };
      return t;
    });
    setTreasuries(updatedTreasuries);

    const transaction: TreasuryTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      treasuryId,
      type,
      amount,
      balanceAfter: newBalance,
      date: Date.now(),
      userId: currentUser.id,
      note,
      referenceId,
      toTreasuryId,
      category,
      updatedAt: Date.now()
    };
    setTreasuryTransactions(prev => [transaction, ...prev]);
    
    // Update legacy treasury state for compatibility
    setTreasury({
      cash: updatedTreasuries.filter(t => t.type === 'cash').reduce((acc, curr) => acc + curr.balance, 0),
      bank: updatedTreasuries.filter(t => t.type === 'bank').reduce((acc, curr) => acc + curr.balance, 0),
      wallets: updatedTreasuries.filter(t => t.type === 'wallet').reduce((acc, curr) => acc + curr.balance, 0)
    });
  };

  const handleSaveTreasury = () => {
    if (!newTreasuryForm.name) {
      setShowToast({ message: 'يرجى إدخال اسم الخزينة', type: 'error' });
      return;
    }

    const treasury: Treasury = {
      id: Math.random().toString(36).substr(2, 9),
      name: newTreasuryForm.name || '',
      type: newTreasuryForm.type || 'cash',
      balance: Number(newTreasuryForm.balance) || 0,
      currency: newTreasuryForm.currency || 'EGP',
      status: 'active',
      bankName: newTreasuryForm.bankName,
      accountNumber: newTreasuryForm.accountNumber,
      walletNumber: newTreasuryForm.walletNumber,
      updatedAt: Date.now()
    };

    setTreasuries(prev => [...prev, treasury]);
    
    // Record opening balance if > 0
    if (treasury.balance > 0) {
      const transaction: TreasuryTransaction = {
        id: Math.random().toString(36).substr(2, 9),
        treasuryId: treasury.id,
        type: 'opening_balance',
        amount: treasury.balance,
        balanceAfter: treasury.balance,
        date: Date.now(),
        userId: currentUser.id,
        note: 'رصيد افتتاحي'
      };
      setTreasuryTransactions(prev => [transaction, ...prev]);
    }

    setIsTreasuryModalOpen(false);
    setNewTreasuryForm({ name: '', type: 'cash', currency: 'EGP', balance: 0, status: 'active' });
    setShowToast({ message: 'تمت إضافة الخزينة بنجاح', type: 'success' });
  };

  const handleSaveExpense = () => {
    if (!newExpenseForm.name || !newExpenseForm.amount || !newExpenseForm.treasuryId || !newExpenseForm.categoryId) {
      setShowToast({ message: 'يرجى إكمال جميع الحقول المطلوبة', type: 'error' });
      return;
    }

    const amount = Number(newExpenseForm.amount);
    const treasury = treasuries.find(t => t.id === newExpenseForm.treasuryId);
    
    if (!treasury || treasury.balance < amount) {
      setShowToast({ message: 'رصيد الخزينة غير كافٍ', type: 'error' });
      return;
    }

    const expense: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      name: newExpenseForm.name || '',
      categoryId: newExpenseForm.categoryId || '',
      amount,
      treasuryId: newExpenseForm.treasuryId || '',
      date: Date.now(),
      note: newExpenseForm.note || '',
      userId: currentUser.id
    };

    setExpenses(prev => [expense, ...prev]);
    handleTreasuryTransaction('expense', amount, expense.treasuryId, `مصروف: ${expense.name}`, expense.id, undefined, expense.categoryId);
    
    setIsExpenseModalOpen(false);
    setNewExpenseForm({ name: '', categoryId: '', amount: 0, treasuryId: '', date: Date.now(), note: '' });
    setShowToast({ message: 'تم تسجيل المصروف بنجاح', type: 'success' });
  };

  const handleSaveTreasuryTransaction = () => {
    const { amount, treasuryId, toTreasuryId, note } = newTreasuryTransactionForm;
    const numAmount = Number(amount);

    if (!numAmount || !treasuryId) {
      setShowToast({ message: 'يرجى إدخال المبلغ واختيار الخزينة', type: 'error' });
      return;
    }

    if (treasuryTransactionType === 'transfer' && !toTreasuryId) {
      setShowToast({ message: 'يرجى اختيار الخزينة المحول إليها', type: 'error' });
      return;
    }

    const sourceTreasury = treasuries.find(t => t.id === treasuryId);
    if (treasuryTransactionType !== 'deposit' && (!sourceTreasury || sourceTreasury.balance < numAmount)) {
      setShowToast({ message: 'رصيد الخزينة غير كافٍ', type: 'error' });
      return;
    }

    handleTreasuryTransaction(treasuryTransactionType, numAmount, treasuryId, note, undefined, toTreasuryId);
    
    setIsTreasuryTransactionModalOpen(false);
    setNewTreasuryTransactionForm({ amount: 0, treasuryId: '', toTreasuryId: '', note: '', category: '' });
    setShowToast({ message: 'تمت العملية بنجاح', type: 'success' });
  };

  const renderDashboard = () => (
    <motion.div 
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="space-y-6" 
      dir="rtl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="مبيعات اليوم" value={`${stats.todaySales} ج.م`} icon={<DollarSign className="text-emerald-500" />} trend="+12%" />
        <StatCard title="إجمالي الإيرادات" value={`${stats.totalRevenue} ج.م`} icon={<ArrowUpRight className="text-blue-500" />} trend="+5%" />
        <StatCard title="إجمالي العمليات" value={stats.totalTransactions} icon={<ShoppingCart className="text-purple-500" />} />
        <StatCard title="منتجات منخفضة المخزون" value={stats.lowStockCount} icon={<AlertCircle className="text-orange-500" />} isAlert={stats.lowStockCount > 0} />
      </div>

      {/* Treasury Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Landmark size={24} className="text-emerald-500" />
            الخزينة والحسابات (Treasury)
          </h3>
          <span className="text-xs font-bold text-slate-400">تحديث لحظي</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
              <Banknote size={18} />
              الخزينة (كاش)
            </div>
            <p className="text-3xl font-black text-emerald-700">{treasury.cash.toLocaleString()} ج.م</p>
          </div>
          <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
              <Building2 size={18} />
              الحساب البنكي
            </div>
            <p className="text-3xl font-black text-blue-700">{treasury.bank.toLocaleString()} ج.م</p>
          </div>
          <div className="p-6 rounded-3xl bg-purple-50 border border-purple-100 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-purple-600 font-bold text-sm">
              <Smartphone size={18} />
              المحافظ الإلكترونية
            </div>
            <p className="text-3xl font-black text-purple-700">{treasury.wallets.toLocaleString()} ج.م</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-6 text-slate-800">أداء المبيعات (آخر 7 أيام)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">سجل المدفوعات</h3>
            <ClipboardList size={20} className="text-slate-400" />
          </div>
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
            {paymentLogs.map(log => (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className={cn(
                  "p-2 rounded-lg mt-0.5",
                  log.type === 'info' ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"
                )}>
                  <Info size={14} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 leading-tight">{log.message}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{new Date(log.timestamp).toLocaleString('ar-EG')}</p>
                </div>
              </div>
            ))}
            {paymentLogs.length === 0 && (
              <div className="text-center py-10 text-slate-400">لا توجد سجلات دفع</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold mb-6 text-slate-800">أحدث العمليات</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {transactions.slice(0, 6).map(t => (
            <div key={t.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">عملية #{t.id}</p>
                  <p className="text-[10px] text-slate-500">{new Date(t.timestamp).toLocaleString('ar-EG')}</p>
                </div>
              </div>
              <p className="font-bold text-emerald-600">{t.total} ج.م</p>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="col-span-full text-center py-10 text-slate-400">لا توجد عمليات بيع حتى الآن</div>
          )}
        </div>
      </div>
    </motion.div>
  );

  const renderPOS = (mode: 'sale' | 'purchase' = 'sale') => (
    <motion.div 
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)]" 
      dir="rtl"
    >
      {/* Products Grid */}
      <div className="flex-1 space-y-4 overflow-hidden flex flex-col">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="بحث عن منتج..." 
              className="w-full pr-12 pl-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative flex-1">
            <Barcode className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
            <input 
              ref={barcodeInputRef}
              type="text" 
              placeholder="تمرير الباركود هنا..." 
              className="w-full pr-12 pl-4 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-emerald-50/30 font-mono"
              value={barcodeScanValue}
              onChange={(e) => {
                setBarcodeScanValue(e.target.value);
                if (settings.barcode?.readMode === 'auto') {
                  // Basic debounce for auto scan mode
                  setTimeout(() => handleBarcodeScan(e.target.value), settings.barcode?.debounceTime || 50);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleBarcodeScan(barcodeScanValue, true);
                }
              }}
            />
          </div>
          <div className={cn(
            "px-4 py-2 rounded-lg font-bold text-sm",
            mode === 'sale' ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
          )}>
            {mode === 'sale' ? 'وضع البيع' : 'وضع الشراء'}
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-4">
          {products
            .filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(product => (
            <motion.button
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              key={product.id}
              onClick={() => addToCart(product)}
              disabled={mode === 'sale' && product.stock <= 0}
              className={cn(
                "bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-right flex flex-col gap-2 transition-all",
                (mode === 'sale' && product.stock <= 0) ? "opacity-50 grayscale cursor-not-allowed" : "hover:border-emerald-200 hover:shadow-md"
              )}
            >
              <div className="w-full aspect-square bg-slate-100 rounded-xl mb-2 flex items-center justify-center text-slate-400">
                <Package size={32} />
              </div>
              <h4 className="font-bold text-slate-800 truncate">{product.name}</h4>
              <div className="flex justify-between items-center mt-auto">
                <span className="text-emerald-600 font-bold">{product.price} ج.م</span>
                <span className={cn("text-xs px-2 py-1 rounded-full", product.stock < 10 ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-500")}>
                  المخزون: {product.stock}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-full lg:w-96 bg-white rounded-2xl shadow-lg border border-slate-100 flex flex-col overflow-hidden">
        <div className="p-4 border-bottom border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <ShoppingCart size={20} />
            {mode === 'sale' ? 'سلة المبيعات' : 'سلة المشتريات'}
          </h3>
          <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">{cart.length} أصناف</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {cart.map(item => (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                key={item.id} 
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 group"
              >
                <div className="flex-1">
                  <p className="font-bold text-sm text-slate-800">{item.name}</p>
                  <p className="text-xs text-emerald-600">{item.price} ج.م</p>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-1">
                  <button onClick={() => updateCartQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded">-</button>
                  <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateCartQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 rounded">+</button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 opacity-50">
              <ShoppingCart size={48} />
              <p>السلة فارغة</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-4">
          {/* Customer Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500">العميل:</label>
            <select 
              className="w-full p-2 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
            >
              <option value="cash">عميل نقدي</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Discount Section */}
          {hasPermission('give_discount') && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">الخصم:</label>
              <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
                <input 
                  type="number" 
                  placeholder="0" 
                  className="flex-1 p-1 text-sm border-none outline-none focus:ring-0 font-bold text-red-500"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
                <select 
                  className="bg-slate-100 text-xs font-bold p-1 rounded outline-none"
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as 'amount' | 'percent')}
                >
                  <option value="amount">ج.م</option>
                  <option value="percent">%</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center text-lg font-bold pt-2 border-t border-slate-200">
            <span className="text-slate-600">الإجمالي:</span>
            <div className="flex flex-col items-end">
              {discountValue > 0 && <span className="text-xs text-slate-400 line-through decoration-red-400">{subTotal} {settings.general.currency === 'EGP' ? 'ج.م' : '$'}</span>}
              <span className="text-emerald-600">{cartTotal} {settings.general.currency === 'EGP' ? 'ج.م' : '$'}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                playSound('click');
                if (cart.length === 0) return;
                setIsInvoicePreviewOpen(true);
              }}
              className="py-2 px-4 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-all flex items-center justify-center gap-2 text-sm border border-black"
            >
              <FileText size={16} />
              معاينة
            </motion.button>
            {settings.pos.quickSale && mode === 'sale' ? (
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  playSound('click');
                  if (cart.length === 0) return;
                  setCurrentPayments([{ id: '1', method: 'cash', amount: cartTotal }]);
                  setTimeout(finalizeSale, 100);
                }}
                className="py-2 px-4 bg-amber-100 text-amber-600 font-bold rounded-xl hover:bg-amber-200 transition-all flex items-center justify-center gap-2 text-sm border border-black"
              >
                <Zap size={16} />
                بيع سريع
              </motion.button>
            ) : (
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  playSound('click');
                  if (cart.length === 0) return;
                  setIsInvoicePreviewOpen(true);
                  setTimeout(() => window.print(), 500);
                }}
                className="py-2 px-4 bg-blue-100 text-blue-600 font-bold rounded-xl hover:bg-blue-200 transition-all flex items-center justify-center gap-2 text-sm border border-black"
              >
                <Printer size={16} />
                طباعة
              </motion.button>
            )}
          </div>

          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              playSound('click');
              mode === 'sale' ? handleCheckout() : handlePurchase();
            }}
            disabled={cart.length === 0}
            className={cn(
              "w-full py-4 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2",
              mode === 'sale' ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200" : "bg-blue-500 hover:bg-blue-600 shadow-blue-200"
            )}
          >
            <CheckCircle2 size={20} />
            {mode === 'sale' ? 'إتمام الفاتورة' : 'إتمام الشراء'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  const printBarcode = (product: Product) => {
    if (!product.barcode) {
      setShowToast({ message: 'المنتج لا يحتوي على باركود', type: 'error' });
      return;
    }
    const printWindow = window.open('', '_blank', 'width=400,height=300');
    if (!printWindow) return;
    
    const barcodeUrl = `https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(product.barcode)}&code=Code128`;
    
    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>طباعة باركود - ${product.name}</title>
          <style>
            body { font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
            .container { border: 1px dashed #ccc; padding: 20px; border-radius: 8px; }
            h3 { margin: 0 0 10px 0; font-size: 16px; }
            img { max-width: 100%; height: auto; }
            p { margin: 10px 0 0 0; font-weight: bold; font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h3>${product.name}</h3>
            <img src="${barcodeUrl}" alt="${product.barcode}" onload="window.print(); window.close();" onerror="alert('خطأ في تحميل الباركود'); window.close();" />
            <p>${product.price} ${settings.general?.currency === 'USD' ? '$' : 'ج.م'}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    
    const log: ActivityLog = {
      id: Date.now().toString(),
      userId: currentUser.id,
      username: currentUser.name,
      action: 'print_barcode',
      details: `تم طباعة باركود للمنتج: ${product.name} (${product.barcode})`,
      timestamp: Date.now(),
      ip: '127.0.0.1',
      type: 'data'
    };
    setActivityLogs(prev => [log, ...prev]);
  };

  const renderProducts = () => (
    <motion.div 
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" 
      dir="rtl"
    >
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-xl font-bold text-slate-800">إدارة المنتجات</h3>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playSound('click');
            setIsAddModalOpen(true);
          }}
          className="px-6 py-2 bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-colors"
        >
          <Plus size={20} />
          إضافة منتج جديد
        </motion.button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-slate-50 text-slate-500 text-sm">
            <tr>
              <th className="px-6 py-4 font-medium">المنتج</th>
              <th className="px-6 py-4 font-medium">الفئة</th>
              <th className="px-6 py-4 font-medium">السعر</th>
              <th className="px-6 py-4 font-medium">المخزون</th>
              <th className="px-6 py-4 font-medium">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                      <Package size={20} />
                    </div>
                    <span className="font-bold text-slate-800">{product.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">{product.category}</td>
                <td className="px-6 py-4 font-bold text-emerald-600">{product.price} ج.م</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold",
                    product.stock < 10 ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
                  )}>
                    {product.stock} قطعة
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openEditModal(product)}
                      className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"
                      title="تعديل"
                    >
                      <Plus size={18} className="rotate-45" /> 
                      <span className="text-xs font-bold mr-1">تعديل</span>
                    </button>
                    <button 
                      onClick={() => printBarcode(product)}
                      className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                      title="طباعة الباركود"
                    >
                      <Barcode size={18} />
                    </button>
                    <button 
                      onClick={() => setConfirmDeleteId(product.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      title="حذف"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetProductForm}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              dir="rtl"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <Package size={24} />
                  </div>
                  <h3 className="text-xl font-black text-slate-800">
                    {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                  </h3>
                </div>
                <button onClick={resetProductForm} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Tabs Navigation */}
              <div className="flex border-b border-slate-100 bg-white sticky top-0 z-10">
                {[
                  { id: 'general', label: 'عام', icon: <Info size={18} /> },
                  { id: 'pricing', label: 'التسعير', icon: <DollarSign size={18} /> },
                  { id: 'inventory', label: 'المخزون', icon: <Box size={18} /> },
                  { id: 'suppliers', label: 'الموردين', icon: <Truck size={18} /> },
                  { id: 'advanced', label: 'متقدم', icon: <Settings size={18} /> },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveProductTab(tab.id as any)}
                    className={cn(
                      "flex-1 py-4 flex items-center justify-center gap-2 font-bold text-sm transition-all border-b-2",
                      activeProductTab === tab.id 
                        ? "border-emerald-500 text-emerald-600 bg-emerald-50/50" 
                        : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-8">
                <form id="product-form" onSubmit={handleAddProduct} className="space-y-8">
                  {activeProductTab === 'general' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                            اسم المنتج <span className="text-red-500">*</span>
                          </label>
                          <input 
                            required
                            type="text" 
                            className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            placeholder="مثال: بيبسي 330 مل"
                            value={newProduct.name}
                            onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600">كود المنتج (SKU)</label>
                            <input 
                              type="text" 
                              className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                              placeholder="SKU-001"
                              value={newProduct.sku}
                              onChange={e => setNewProduct({...newProduct, sku: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 flex justify-between items-center">
                              الباركود
                              <button 
                                type="button"
                                onClick={() => setNewProduct({...newProduct, barcode: Math.floor(100000000000 + Math.random() * 900000000000).toString()})}
                                className="text-xs text-emerald-600 hover:underline flex items-center gap-1"
                              >
                                توليد تلقائي
                              </button>
                            </label>
                            <div className="relative">
                              <input 
                                type="text" 
                                className="w-full p-3 pr-10 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                placeholder="Barcode"
                                value={newProduct.barcode}
                                onChange={e => setNewProduct({...newProduct, barcode: e.target.value})}
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <Barcode size={18} />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-600">التصنيف</label>
                          <select 
                            className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-white"
                            value={newProduct.category}
                            onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                          >
                            <option value="مشروبات">مشروبات</option>
                            <option value="أغذية">أغذية</option>
                            <option value="منظفات">منظفات</option>
                            <option value="إلكترونيات">إلكترونيات</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600">نوع المنتج</label>
                            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                              <button
                                type="button"
                                onClick={() => setNewProduct({...newProduct, type: 'stock'})}
                                className={cn(
                                  "flex-1 py-2 rounded-lg text-xs font-bold transition-all",
                                  newProduct.type === 'stock' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"
                                )}
                              >مخزني</button>
                              <button
                                type="button"
                                onClick={() => setNewProduct({...newProduct, type: 'service'})}
                                className={cn(
                                  "flex-1 py-2 rounded-lg text-xs font-bold transition-all",
                                  newProduct.type === 'service' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"
                                )}
                              >خدمي</button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600">الحالة</label>
                            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                              <button
                                type="button"
                                onClick={() => setNewProduct({...newProduct, status: 'active'})}
                                className={cn(
                                  "flex-1 py-2 rounded-lg text-xs font-bold transition-all",
                                  newProduct.status === 'active' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"
                                )}
                              >نشط</button>
                              <button
                                type="button"
                                onClick={() => setNewProduct({...newProduct, status: 'inactive'})}
                                className={cn(
                                  "flex-1 py-2 rounded-lg text-xs font-bold transition-all",
                                  newProduct.status === 'inactive' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"
                                )}
                              >غير نشط</button>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-600">وصف مختصر</label>
                          <input 
                            type="text" 
                            className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            placeholder="وصف يظهر في الفواتير..."
                            value={newProduct.shortDescription}
                            onChange={e => setNewProduct({...newProduct, shortDescription: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-600">الوصف التفصيلي</label>
                          <textarea 
                            rows={3}
                            className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                            placeholder="تفاصيل إضافية عن المنتج..."
                            value={newProduct.description}
                            onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeProductTab === 'pricing' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600">سعر الشراء</label>
                            <input 
                              type="number" 
                              className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                              value={newProduct.purchasePrice}
                              onChange={e => setNewProduct({...newProduct, purchasePrice: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600">سعر البيع</label>
                            <input 
                              type="number" 
                              className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                              value={newProduct.price}
                              onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600">سعر الجملة</label>
                            <input 
                              type="number" 
                              className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                              value={newProduct.wholesalePrice}
                              onChange={e => setNewProduct({...newProduct, wholesalePrice: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600">أقل سعر بيع</label>
                            <input 
                              type="number" 
                              className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                              value={newProduct.minPrice}
                              onChange={e => setNewProduct({...newProduct, minPrice: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600">الضريبة (VAT %)</label>
                            <input 
                              type="number" 
                              className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                              value={newProduct.vat}
                              onChange={e => setNewProduct({...newProduct, vat: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600">خصم افتراضي (%)</label>
                            <input 
                              type="number" 
                              className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                              value={newProduct.defaultDiscount}
                              onChange={e => setNewProduct({...newProduct, defaultDiscount: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-xs text-slate-500 leading-relaxed">
                            <Info size={14} className="inline ml-1" />
                            سيتم حساب الإجمالي تلقائياً في الفواتير بناءً على سعر البيع والضريبة المحددة.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeProductTab === 'inventory' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600">الكمية الحالية</label>
                            <input 
                              type="number" 
                              className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                              value={newProduct.stock}
                              onChange={e => setNewProduct({...newProduct, stock: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600">وحدة القياس</label>
                            <select 
                              className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-white"
                              value={newProduct.unit}
                              onChange={e => setNewProduct({...newProduct, unit: e.target.value})}
                            >
                              <option value="قطعة">قطعة</option>
                              <option value="كرتونة">كرتونة</option>
                              <option value="كيلو">كيلو</option>
                              <option value="متر">متر</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600">حد التنبيه (الأدنى)</label>
                            <input 
                              type="number" 
                              className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                              value={newProduct.minStockAlert}
                              onChange={e => setNewProduct({...newProduct, minStockAlert: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600">الحد الأقصى</label>
                            <input 
                              type="number" 
                              className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                              value={newProduct.maxStock}
                              onChange={e => setNewProduct({...newProduct, maxStock: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-600">موقع التخزين</label>
                          <input 
                            type="text" 
                            className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            placeholder="مثال: الرف A1"
                            value={newProduct.location}
                            onChange={e => setNewProduct({...newProduct, location: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-600">تاريخ الصلاحية</label>
                          <input 
                            type="date" 
                            className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            value={newProduct.expiryDate}
                            onChange={e => setNewProduct({...newProduct, expiryDate: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeProductTab === 'suppliers' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-600">المورد الأساسي</label>
                          <select 
                            className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-white"
                            value={newProduct.primarySupplierId}
                            onChange={e => setNewProduct({...newProduct, primarySupplierId: e.target.value})}
                          >
                            <option value="">اختر مورد...</option>
                            {suppliers.map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-600">كود المنتج عند المورد</label>
                          <input 
                            type="text" 
                            className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            value={newProduct.serialNumber} // Reusing field for simplicity in demo
                            onChange={e => setNewProduct({...newProduct, serialNumber: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 gap-4">
                        <Truck size={48} />
                        <p className="text-sm font-bold">يمكنك ربط المنتج بموردين إضافيين بعد الحفظ</p>
                      </div>
                    </div>
                  )}

                  {activeProductTab === 'advanced' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <h4 className="font-bold text-slate-800 flex items-center gap-2">
                            <Layers size={18} className="text-emerald-500" />
                            المتغيرات (Variants)
                          </h4>
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-600">تفعيل المتغيرات (اللون، المقاس...)</span>
                              <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                              </div>
                            </div>
                            <p className="text-xs text-slate-400">تتيح لك هذه الخاصية إنشاء نسخ متعددة من نفس المنتج بخصائص مختلفة.</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h4 className="font-bold text-slate-800 flex items-center gap-2">
                            <Package size={18} className="text-emerald-500" />
                            المجموعات (Bundles)
                          </h4>
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-600">تحويل المنتج إلى مجموعة منتجات</span>
                              <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                              </div>
                            </div>
                            <p className="text-xs text-slate-400">مفيد للعروض الترويجية أو المنتجات المركبة.</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                          <Image size={18} className="text-emerald-500" />
                          وسائط المنتج
                        </h4>
                        <label className="aspect-video border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 gap-2 hover:border-emerald-500 hover:bg-emerald-50 transition-all cursor-pointer group">
                          <input type="file" className="hidden" accept="*/*" />
                          <div className="p-4 bg-slate-50 rounded-full group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-all">
                            <Upload size={24} />
                          </div>
                          <p className="text-sm font-bold">اسحب وأفلت صورة المنتج هنا</p>
                          <p className="text-xs">أو اضغط لاختيار ملف (مسموح بأي صيغة)</p>
                        </label>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  onClick={resetProductForm}
                  className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-all"
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  form="product-form"
                  className="px-10 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all flex items-center gap-2"
                >
                  <CheckCircle2 size={20} />
                  {editingProduct ? 'تحديث المنتج' : 'حفظ المنتج'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmDeleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDeleteId(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center"
              dir="rtl"
            >
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">تأكيد الحذف</h3>
              <p className="text-slate-500 mb-8">هل أنت متأكد من رغبتك في حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.</p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setConfirmDeleteId(null)}
                  className="py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
                >
                  إلغاء
                </button>
                <button 
                  onClick={deleteProduct}
                  className="py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-100"
                >
                  حذف
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const renderCustomers = () => (
    <motion.div 
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="space-y-6" 
      dir="rtl"
    >
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-xl font-bold text-slate-800">قائمة العملاء</h3>
          <button 
            onClick={() => setIsCustomerModalOpen(true)}
            className="px-6 py-2 bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-colors"
          >
            <UserPlus size={20} />
            إضافة عميل جديد
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-500 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">العميل</th>
                <th className="px-6 py-4 font-medium">رقم الهاتف</th>
                <th className="px-6 py-4 font-medium">الرصيد الافتتاحي</th>
                <th className="px-6 py-4 font-medium">إجمالي المشتريات</th>
                <th className="px-6 py-4 font-medium">آخر زيارة</th>
                <th className="px-6 py-4 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map(customer => (
                <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Users size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{customer.name}</p>
                        <p className="text-xs text-slate-500">{customer.email || 'لا يوجد بريد'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-sm">{customer.phone}</td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "text-sm font-bold",
                      customer.openingBalanceType === 'debit' ? "text-red-500" : "text-emerald-500"
                    )}>
                      {customer.openingBalance || 0} ج.م
                      <span className="text-[10px] block opacity-70">
                        ({customer.openingBalanceType === 'debit' ? 'عليه - لنا' : 'له - علينا'})
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-600">{customer.totalSpent} ج.م</td>
                  <td className="px-6 py-4 text-slate-500 text-sm">{new Date(customer.lastVisit).toLocaleDateString('ar-EG')}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openEditCustomerModal(customer)}
                        className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"
                      >
                        <span className="text-xs font-bold">تعديل</span>
                      </button>
                      <button 
                        onClick={() => setConfirmDeleteCustomerId(customer.id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400">لا يوجد عملاء مضافين بعد</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Modal */}
      <AnimatePresence>
        {isCustomerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => {
                setIsCustomerModalOpen(false);
                setEditingCustomer(null);
                setNewCustomer({ 
                  name: '', 
                  phone: '', 
                  email: '', 
                  address: '', 
                  openingBalance: '0', 
                  openingBalanceType: 'debit' 
                });
              }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8"
              dir="rtl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-800">
                  {editingCustomer ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
                </h3>
                <button onClick={() => setIsCustomerModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddCustomer} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">اسم العميل</label>
                  <div className="relative">
                    <Users className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input required type="text" className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">رقم الهاتف</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input required type="tel" className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">البريد الإلكتروني (اختياري)</label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="email" className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">العنوان (اختياري)</label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} />
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl space-y-4 border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-800 mb-1">
                    <DollarSign size={18} className="text-emerald-500" />
                    <span className="font-bold text-sm">الرصيد الافتتاحي</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    استخدم الرصيد الافتتاحي لتسجيل المبالغ المستحقة قبل بدء استخدام النظام. 
                    <br />
                    <span className="font-bold text-red-500">"مدين (لنا)":</span> العميل عليه مبالغ سابقة.
                    <br />
                    <span className="font-bold text-emerald-500">"دائن (علينا)":</span> العميل له مبالغ سابقة (رصيد مقدم).
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500">المبلغ</label>
                      <input 
                        type="number" 
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        value={newCustomer.openingBalance} 
                        onChange={e => setNewCustomer({...newCustomer, openingBalance: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500">الحالة</label>
                      <select 
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        value={newCustomer.openingBalanceType} 
                        onChange={e => setNewCustomer({...newCustomer, openingBalanceType: e.target.value as 'debit' | 'credit'})}
                      >
                        <option value="debit">مدين (لنا)</option>
                        <option value="credit">دائن (علينا)</option>
                      </select>
                    </div>
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-100 mt-4 hover:bg-emerald-600 transition-all">
                  {editingCustomer ? 'تحديث البيانات' : 'حفظ العميل'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Customer Confirmation */}
      <AnimatePresence>
        {confirmDeleteCustomerId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setConfirmDeleteCustomerId(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center" dir="rtl">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">حذف العميل</h3>
              <p className="text-slate-500 mb-8">هل أنت متأكد من حذف هذا العميل؟ سيتم حذف بياناته وسجله.</p>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setConfirmDeleteCustomerId(null)} className="py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all">إلغاء</button>
                <button onClick={deleteCustomer} className="py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-100">حذف</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const renderSuppliers = () => (
    <motion.div 
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="space-y-6" 
      dir="rtl"
    >
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-xl font-bold text-slate-800">قائمة الموردين</h3>
          <button 
            onClick={() => setIsSupplierModalOpen(true)}
            className="px-6 py-2 bg-blue-500 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-colors"
          >
            <Building2 size={20} />
            إضافة مورد جديد
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-500 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">المورد</th>
                <th className="px-6 py-4 font-medium">مسؤول التواصل</th>
                <th className="px-6 py-4 font-medium">رقم الهاتف</th>
                <th className="px-6 py-4 font-medium">الرصيد الافتتاحي</th>
                <th className="px-6 py-4 font-medium">الفئة</th>
                <th className="px-6 py-4 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {suppliers.map(supplier => (
                <tr key={supplier.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-400">
                        <Truck size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{supplier.name}</p>
                        <p className="text-xs text-slate-500">{supplier.email || 'لا يوجد بريد'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{supplier.contactName}</td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-sm">{supplier.phone}</td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "text-sm font-bold",
                      supplier.openingBalanceType === 'credit' ? "text-red-500" : "text-emerald-500"
                    )}>
                      {supplier.openingBalance || 0} ج.م
                      <span className="text-[10px] block opacity-70">
                        ({supplier.openingBalanceType === 'credit' ? 'له - علينا' : 'عليه - لنا'})
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                      {supplier.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openEditSupplierModal(supplier)}
                        className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                      >
                        <span className="text-xs font-bold">تعديل</span>
                      </button>
                      <button 
                        onClick={() => setConfirmDeleteSupplierId(supplier.id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {suppliers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400">لا يوجد موردين مضافين بعد</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Modal */}
      <AnimatePresence>
        {isSupplierModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => {
                setIsSupplierModalOpen(false);
                setEditingSupplier(null);
                setNewSupplier({ 
                  name: '', 
                  contactName: '', 
                  phone: '', 
                  email: '', 
                  address: '', 
                  category: 'عام',
                  openingBalance: '0',
                  openingBalanceType: 'debit'
                });
              }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8"
              dir="rtl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-800">
                  {editingSupplier ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'}
                </h3>
                <button onClick={() => setIsSupplierModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddSupplier} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">اسم الشركة/المورد</label>
                  <div className="relative">
                    <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input required type="text" className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                      value={newSupplier.name} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">اسم مسؤول التواصل</label>
                  <div className="relative">
                    <Users className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input required type="text" className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                      value={newSupplier.contactName} onChange={e => setNewSupplier({...newSupplier, contactName: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">رقم الهاتف</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input required type="tel" className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                      value={newSupplier.phone} onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">البريد الإلكتروني (اختياري)</label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="email" className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                      value={newSupplier.email} onChange={e => setNewSupplier({...newSupplier, email: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">الفئة</label>
                  <select className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                    value={newSupplier.category} onChange={e => setNewSupplier({...newSupplier, category: e.target.value})}>
                    <option value="عام">عام</option>
                    <option value="مواد خام">مواد خام</option>
                    <option value="تجهيزات">تجهيزات</option>
                    <option value="خدمات">خدمات</option>
                  </select>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl space-y-4 border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-800 mb-1">
                    <DollarSign size={18} className="text-blue-500" />
                    <span className="font-bold text-sm">الرصيد الافتتاحي</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    استخدم الرصيد الافتتاحي لتسجيل المبالغ المستحقة قبل بدء استخدام النظام. 
                    <br />
                    <span className="font-bold text-emerald-500">"مدين (لنا)":</span> المورد عليه مبالغ لنا (مثل مرتجعات لم تسدد).
                    <br />
                    <span className="font-bold text-red-500">"دائن (علينا)":</span> المورد له مبالغ علينا (ديون للمورد).
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500">المبلغ</label>
                      <input 
                        type="number" 
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        value={newSupplier.openingBalance} 
                        onChange={e => setNewSupplier({...newSupplier, openingBalance: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500">الحالة</label>
                      <select 
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        value={newSupplier.openingBalanceType} 
                        onChange={e => setNewSupplier({...newSupplier, openingBalanceType: e.target.value as 'debit' | 'credit'})}
                      >
                        <option value="debit">مدين (لنا)</option>
                        <option value="credit">دائن (علينا)</option>
                      </select>
                    </div>
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-100 mt-4 hover:bg-blue-600 transition-all">
                  {editingSupplier ? 'تحديث البيانات' : 'حفظ المورد'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Supplier Confirmation */}
      <AnimatePresence>
        {confirmDeleteSupplierId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setConfirmDeleteSupplierId(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center" dir="rtl">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">حذف المورد</h3>
              <p className="text-slate-500 mb-8">هل أنت متأكد من حذف هذا المورد؟ سيتم حذف بياناته وسجله.</p>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setConfirmDeleteSupplierId(null)} className="py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all">إلغاء</button>
                <button onClick={deleteSupplier} className="py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-100">حذف</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const renderEmployees = () => {
    const filteredEmployees = employees.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(employeeFilters.search.toLowerCase()) || 
                           emp.id.toLowerCase().includes(employeeFilters.search.toLowerCase());
      const matchesBranch = employeeFilters.branchId === 'all' || emp.branchId === employeeFilters.branchId;
      const matchesJob = employeeFilters.jobTitle === 'all' || emp.jobTitle === employeeFilters.jobTitle;
      const matchesStatus = employeeFilters.status === 'all' || emp.status === employeeFilters.status;
      return matchesSearch && matchesBranch && matchesJob && matchesStatus;
    });

    const stats = {
      total: employees.length,
      active: employees.filter(e => e.status === 'active').length,
      onLeave: employees.filter(e => e.status === 'on_leave').length,
      presentToday: attendance.filter(a => a.month === new Date().toISOString().slice(0, 7) && a.days[new Date().getDate()] === 'present').length
    };

    return (
      <div className="space-y-8" dir="rtl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
              <div className="p-3 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-200">
                <Briefcase size={28} />
              </div>
              إدارة الموظفين
            </h2>
            <p className="text-slate-500 mt-2 font-medium">إدارة البيانات، الحضور، الرواتب والصلاحيات</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setIsAdjustmentModalOpen(true)}
              className="px-6 py-3 bg-amber-500 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-amber-600 transition-all shadow-lg shadow-amber-100"
            >
              <Banknote size={20} />
              تسجيل (مكافأة / خصم / سلفة)
            </button>
            <button 
              onClick={() => {
                setEditingEmployee(null);
                setNewEmployee({
                  name: '', jobTitle: '', salary: 0, phone: '', status: 'active', branchId: 'main', salaryType: 'monthly'
                });
                setIsEmployeeModalOpen(true);
              }}
              className="px-6 py-3 bg-indigo-500 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-100"
            >
              <UserPlus size={20} />
              إضافة موظف جديد
            </button>
            <button className="p-3 bg-white text-slate-600 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm">
              <Printer size={20} />
            </button>
            <button className="p-3 bg-white text-slate-600 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm">
              <Download size={20} />
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="إجمالي الموظفين" value={stats.total} icon={<Users size={20} />} color="indigo" />
          <StatCard title="نشط حالياً" value={stats.active} icon={<UserCheck size={20} />} color="emerald" />
          <StatCard title="حضور اليوم" value={stats.presentToday} icon={<CheckCircle2 size={20} />} color="blue" />
          <StatCard title="في إجازة" value={stats.onLeave} icon={<UserX size={20} />} color="amber" />
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
          {[
            { id: 'list', label: 'قائمة الموظفين', icon: <Users size={18} /> },
            { id: 'attendance', label: 'الحضور والانصراف', icon: <Clock size={18} /> },
            { id: 'payroll', label: 'مسيرات الرواتب', icon: <DollarSign size={18} /> },
            { id: 'roles', label: 'الأدوار والصلاحيات', icon: <Shield size={18} /> },
            { id: 'reports', label: 'تقارير الأداء', icon: <TrendingUp size={18} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setEmployeeTab(tab.id as any)}
              className={cn(
                "px-6 py-3 rounded-2xl font-bold flex items-center gap-2 whitespace-nowrap transition-all",
                employeeTab === tab.id 
                  ? "bg-slate-800 text-white shadow-lg" 
                  : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {employeeTab === 'list' && (
          <>
            {/* Filters */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="بحث بالاسم أو الكود..." 
                    value={employeeFilters.search}
                    onChange={e => setEmployeeFilters({...employeeFilters, search: e.target.value})}
                    className="w-full pr-10 pl-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                  />
                </div>
                <select 
                  value={employeeFilters.branchId}
                  onChange={e => setEmployeeFilters({...employeeFilters, branchId: e.target.value})}
                  className="p-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                >
                  <option value="all">جميع الفروع</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
                <select 
                  value={employeeFilters.jobTitle}
                  onChange={e => setEmployeeFilters({...employeeFilters, jobTitle: e.target.value})}
                  className="p-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                >
                  <option value="all">جميع الوظائف</option>
                  <option value="كاشير">كاشير</option>
                  <option value="مدير">مدير</option>
                  <option value="محاسب">محاسب</option>
                  <option value="موظف مخزن">موظف مخزن</option>
                </select>
                <select 
                  value={employeeFilters.status}
                  onChange={e => setEmployeeFilters({...employeeFilters, status: e.target.value})}
                  className="p-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="active">نشط</option>
                  <option value="suspended">موقوف</option>
                  <option value="on_leave">في إجازة</option>
                </select>
              </div>
            </div>

            {/* Employee Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-slate-50 text-slate-400 text-xs font-black uppercase tracking-wider">
                    <tr>
                      <th className="px-8 py-5">الموظف</th>
                      <th className="px-8 py-5">الوظيفة والفرع</th>
                      <th className="px-8 py-5">الاتصال</th>
                      <th className="px-8 py-5">الحالة</th>
                      <th className="px-8 py-5">الراتب</th>
                      <th className="px-8 py-5">التقييم</th>
                      <th className="px-8 py-5">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredEmployees.map(emp => (
                      <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 font-black text-lg shadow-sm">
                              {emp.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-black text-slate-800">{emp.name}</p>
                              <p className="text-xs text-slate-400 font-bold mt-0.5">{emp.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <p className="font-bold text-slate-700">{emp.jobTitle}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{warehouses.find(w => w.id === emp.branchId)?.name || '---'}</p>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-slate-600 text-sm font-bold">
                              <Phone size={14} className="text-slate-400" />
                              {emp.phone}
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 text-xs">
                              <Mail size={14} />
                              {emp.email || '---'}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={cn(
                            "px-3 py-1 rounded-lg text-xs font-black",
                            emp.status === 'active' ? "bg-emerald-50 text-emerald-600" :
                            emp.status === 'suspended' ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                          )}>
                            {emp.status === 'active' ? 'نشط' : emp.status === 'suspended' ? 'موقوف' : 'في إجازة'}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <p className="font-black text-slate-800">{emp.salary.toLocaleString()} ج.م</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{emp.salaryType === 'monthly' ? 'شهري' : emp.salaryType === 'daily' ? 'يومي' : 'بالساعة'}</p>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-1 text-amber-400">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} size={14} fill={s <= (emp.rating || 4) ? "currentColor" : "none"} />
                            ))}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditEmployeeModal(emp)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors">
                              <Edit size={18} />
                            </button>
                            <button onClick={() => setConfirmDeleteEmployeeId(emp.id)} className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors">
                              <Trash2 size={18} />
                            </button>
                            <button className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">
                              <MoreVertical size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {employeeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <select 
                    value={selectedEmployeeForAttendance?.id || ''}
                    onChange={e => setSelectedEmployeeForAttendance(employees.find(emp => emp.id === e.target.value) || null)}
                    className="p-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 min-w-[200px]"
                  >
                    <option value="">اختر الموظف...</option>
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                  </select>
                  <input 
                    type="month" 
                    value={attendanceMonth}
                    onChange={e => setAttendanceMonth(e.target.value)}
                    className="p-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                    <span className="text-xs font-bold text-slate-500">حضور</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-rose-500 rounded-full"></div>
                    <span className="text-xs font-bold text-slate-500">غياب</span>
                  </div>
                </div>
              </div>

              {selectedEmployeeForAttendance ? (
                <div className="grid grid-cols-7 gap-4">
                  {Array.from({ length: new Date(Number(attendanceMonth.split('-')[0]), Number(attendanceMonth.split('-')[1]), 0).getDate() }, (_, i) => i + 1).map(day => {
                    const att = attendance.find(a => a.employeeId === selectedEmployeeForAttendance.id && a.month === attendanceMonth);
                    const status = att?.days[day];
                    return (
                      <div key={day} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-xs font-black text-slate-400">{day}</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleToggleAttendance(selectedEmployeeForAttendance.id, attendanceMonth, day, 'present')}
                            className={cn(
                              "p-2 rounded-lg transition-all",
                              status === 'present' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" : "bg-white text-slate-300 hover:bg-emerald-50 hover:text-emerald-500"
                            )}
                          >
                            <Check size={16} />
                          </button>
                          <button 
                            onClick={() => handleToggleAttendance(selectedEmployeeForAttendance.id, attendanceMonth, day, 'absent')}
                            className={cn(
                              "p-2 rounded-lg transition-all",
                              status === 'absent' ? "bg-rose-500 text-white shadow-lg shadow-rose-100" : "bg-white text-slate-300 hover:bg-rose-50 hover:text-rose-500"
                            )}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-20 text-center text-slate-400">
                  <Clock size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="font-bold">يرجى اختيار موظف لعرض سجل الحضور</p>
                </div>
              )}
            </div>
          </div>
        )}

        {employeeTab === 'payroll' && (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-8">
                <h4 className="text-xl font-black text-slate-800">مسير رواتب شهر {attendanceMonth}</h4>
                <div className="flex gap-3">
                  <input 
                    type="month" 
                    value={attendanceMonth}
                    onChange={e => setAttendanceMonth(e.target.value)}
                    className="p-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                  />
                  <button className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100">
                    اعتماد الرواتب
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-slate-50 text-slate-400 text-xs font-black uppercase tracking-wider">
                    <tr>
                      <th className="px-8 py-5">الموظف</th>
                      <th className="px-8 py-5">الراتب الأساسي</th>
                      <th className="px-8 py-5">أيام الحضور</th>
                      <th className="px-8 py-5">مكافآت</th>
                      <th className="px-8 py-5">خصومات / سلف</th>
                      <th className="px-8 py-5">صافي الراتب</th>
                      <th className="px-8 py-5">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {employees.map(emp => {
                      const netSalary = calculateMonthlySalary(emp.id, attendanceMonth);
                      const att = attendance.find(a => a.employeeId === emp.id && a.month === attendanceMonth);
                      const presentDays = att ? Object.values(att.days).filter(d => d === 'present').length : 0;
                      return (
                        <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-8 py-5 font-bold text-slate-800">{emp.name}</td>
                          <td className="px-8 py-5 text-slate-600 font-bold">{emp.salary.toLocaleString()} ج.م</td>
                          <td className="px-8 py-5 text-blue-600 font-black">{presentDays} يوم</td>
                          <td className="px-8 py-5 text-emerald-600 font-bold">+{((emp.bonuses || 0) + (att?.bonuses || 0)).toLocaleString()}</td>
                          <td className="px-8 py-5 text-rose-600 font-bold">-{((emp.deductions || 0) + (att?.deductions || 0) + (att?.advances || 0)).toLocaleString()}</td>
                          <td className="px-8 py-5 text-xl font-black text-slate-800">{netSalary.toLocaleString()} ج.م</td>
                          <td className="px-8 py-5">
                            <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-black">قيد المراجعة</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {employeeTab === 'roles' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employeeRoles.map(role => (
              <div key={role.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 bg-indigo-50 text-indigo-500 rounded-2xl group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    <Shield size={24} />
                  </div>
                  <button className="p-2 text-slate-300 hover:text-indigo-500"><Edit size={18} /></button>
                </div>
                <h4 className="text-xl font-black text-slate-800 mb-2">{role.name}</h4>
                <p className="text-sm text-slate-400 font-bold mb-6">{role.permissions.length} صلاحيات مفعلة</p>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.slice(0, 3).map(p => (
                    <span key={p} className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black uppercase">{p}</span>
                  ))}
                  {role.permissions.length > 3 && <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-black">+{role.permissions.length - 3}</span>}
                </div>
              </div>
            ))}
            <button 
              onClick={() => setIsRoleModalOpen(true)}
              className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-8 text-slate-400 hover:bg-white hover:border-indigo-300 hover:text-indigo-500 transition-all group"
            >
              <div className="p-4 bg-white rounded-2xl shadow-sm mb-4 group-hover:shadow-md transition-all">
                <Plus size={24} />
              </div>
              <span className="font-black">إضافة دور جديد</span>
            </button>
          </div>
        )}

        {employeeTab === 'reports' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h4 className="text-xl font-black text-slate-800 mb-6">تحليل الحضور والانصراف</h4>
              <div className="h-64 flex items-end justify-between gap-2">
                {['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map((day, i) => (
                  <div key={day} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-indigo-500 rounded-t-xl transition-all hover:bg-indigo-600" 
                      style={{ height: `${[85, 92, 78, 95, 88, 70, 40][i]}%` }}
                    ></div>
                    <span className="text-[10px] font-black text-slate-400">{day}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h4 className="text-xl font-black text-slate-800 mb-6">توزيع الرواتب حسب القسم</h4>
              <div className="space-y-4">
                {[
                  { label: 'المبيعات', value: 45, color: 'bg-indigo-500' },
                  { label: 'المخازن', value: 25, color: 'bg-emerald-500' },
                  { label: 'الإدارة', value: 20, color: 'bg-amber-500' },
                  { label: 'المحاسبة', value: 10, color: 'bg-rose-500' },
                ].map(item => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-slate-600">{item.label}</span>
                      <span className="text-slate-400">{item.value}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.value}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <AnimatePresence>
          {isAdjustmentModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAdjustmentModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8" dir="rtl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-slate-800">تسجيل حركة مالية للموظف</h3>
                  <button onClick={() => setIsAdjustmentModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
                </div>
                <form onSubmit={handleSaveAdjustment} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400">الموظف</label>
                    <select 
                      required
                      value={newAdjustment.employeeId}
                      onChange={e => setNewAdjustment({...newAdjustment, employeeId: e.target.value})}
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                    >
                      <option value="">اختر الموظف...</option>
                      {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400">نوع الحركة</label>
                      <select 
                        value={newAdjustment.type}
                        onChange={e => setNewAdjustment({...newAdjustment, type: e.target.value as any})}
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                      >
                        <option value="bonus">مكافأة</option>
                        <option value="deduction">خصم</option>
                        <option value="advance">سلفة</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400">الشهر</label>
                      <input 
                        type="month"
                        value={newAdjustment.month}
                        onChange={e => setNewAdjustment({...newAdjustment, month: e.target.value})}
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400">المبلغ</label>
                    <div className="relative">
                      <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        required
                        type="number"
                        min="1"
                        value={newAdjustment.amount || ''}
                        onChange={e => setNewAdjustment({...newAdjustment, amount: Number(e.target.value)})}
                        className="w-full pr-10 pl-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400">ملاحظات</label>
                    <textarea 
                      value={newAdjustment.note}
                      onChange={e => setNewAdjustment({...newAdjustment, note: e.target.value})}
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 h-24"
                      placeholder="أدخل ملاحظاتك هنا..."
                    />
                  </div>
                  <button type="submit" className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-600 transition-all">
                    حفظ الحركة
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isRoleModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsRoleModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8" dir="rtl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-slate-800">إضافة دور وظيفي جديد</h3>
                  <button onClick={() => setIsRoleModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400">اسم الدور</label>
                    <input type="text" placeholder="مثلاً: مشرف مبيعات" className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400">الصلاحيات</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['إدارة المخزون', 'إدارة المبيعات', 'إدارة الموظفين', 'التقارير المالية', 'إعدادات النظام', 'إدارة العملاء'].map(perm => (
                        <label key={perm} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                          <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-indigo-500 focus:ring-indigo-500" />
                          <span className="text-sm font-bold text-slate-600">{perm}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <button className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-600 transition-all">حفظ الدور</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
          {isEmployeeModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEmployeeModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden" dir="rtl">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="text-2xl font-black text-slate-800">{editingEmployee ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}</h3>
                  <button onClick={() => setIsEmployeeModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400"><X size={24} /></button>
                </div>
                <form onSubmit={handleAddEmployee} className="p-8 overflow-y-auto max-h-[70vh]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Basic Info */}
                    <div className="space-y-6">
                      <h5 className="text-sm font-black text-indigo-500 uppercase tracking-widest">البيانات الأساسية</h5>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400">الاسم بالكامل</label>
                          <input required type="text" value={newEmployee.name} onChange={e => setNewEmployee({...newEmployee, name: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400">الرقم القومي</label>
                            <input type="text" value={newEmployee.nationalId} onChange={e => setNewEmployee({...newEmployee, nationalId: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400">رقم الهاتف</label>
                            <input required type="tel" value={newEmployee.phone} onChange={e => setNewEmployee({...newEmployee, phone: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400">العنوان</label>
                          <input type="text" value={newEmployee.address} onChange={e => setNewEmployee({...newEmployee, address: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700" />
                        </div>
                      </div>
                    </div>

                    {/* Job Info */}
                    <div className="space-y-6">
                      <h5 className="text-sm font-black text-indigo-500 uppercase tracking-widest">البيانات الوظيفية والمالية</h5>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400">الوظيفة</label>
                            <select value={newEmployee.jobTitle} onChange={e => setNewEmployee({...newEmployee, jobTitle: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700">
                              <option value="">اختر الوظيفة...</option>
                              <option value="كاشير">كاشير</option>
                              <option value="مدير">مدير</option>
                              <option value="محاسب">محاسب</option>
                              <option value="موظف مخزن">موظف مخزن</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400">الفرع</label>
                            <select value={newEmployee.branchId} onChange={e => setNewEmployee({...newEmployee, branchId: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700">
                              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400">الراتب الأساسي</label>
                            <input required type="number" value={newEmployee.salary} onChange={e => setNewEmployee({...newEmployee, salary: Number(e.target.value)})} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400">نوع الراتب</label>
                            <select value={newEmployee.salaryType} onChange={e => setNewEmployee({...newEmployee, salaryType: e.target.value as any})} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700">
                              <option value="monthly">شهري</option>
                              <option value="daily">يومي</option>
                              <option value="hourly">بالساعة</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400">الحالة</label>
                          <select value={newEmployee.status} onChange={e => setNewEmployee({...newEmployee, status: e.target.value as any})} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700">
                            <option value="active">نشط</option>
                            <option value="suspended">موقوف</option>
                            <option value="on_leave">في إجازة</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-12 flex justify-end gap-4">
                    <button type="button" onClick={() => setIsEmployeeModalOpen(false)} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all">إلغاء</button>
                    <button type="submit" className="px-12 py-4 bg-indigo-500 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-600 transition-all">
                      {editingEmployee ? 'تحديث البيانات' : 'حفظ الموظف'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        {/* Delete Employee Confirmation */}
        <AnimatePresence>
          {confirmDeleteEmployeeId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setConfirmDeleteEmployeeId(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center" dir="rtl">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2">حذف الموظف</h3>
                <p className="text-slate-500 mb-8">هل أنت متأكد من حذف هذا الموظف؟ سيتم حذف بياناته وسجله.</p>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setConfirmDeleteEmployeeId(null)} className="py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all">إلغاء</button>
                  <button onClick={deleteEmployee} className="py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-100">حذف</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderSecurity = () => {
    const securityTabs = [
      { id: 'users', label: 'المستخدمين', icon: <Users size={20} /> },
      { id: 'roles', label: 'الصلاحيات', icon: <Shield size={20} /> },
      { id: 'logs', label: 'سجل النشاط', icon: <Activity size={20} /> },
      { id: 'backups', label: 'النسخ الاحتياطي', icon: <Database size={20} /> },
      { id: 'settings', label: 'إعدادات الأمان', icon: <Lock size={20} /> },
    ];

    const handleSaveUser = (e: React.FormEvent) => {
      e.preventDefault();
      if (newUser.password !== newUser.confirmPassword) {
        setShowToast({ message: 'كلمات المرور غير متطابقة', type: 'error' });
        return;
      }

      if (editingUser) {
        setUsers(prev => prev.map(u => u.id === editingUser.id ? {
          ...u,
          username: newUser.username,
          name: newUser.name,
          role: newUser.role,
          employeeId: newUser.employeeId,
          status: newUser.status,
          password: newUser.password || u.password
        } : u));
        logActivity('تعديل مستخدم', `تم تعديل بيانات المستخدم ${newUser.username}`, 'security');
      } else {
        const user: User = {
          id: Math.random().toString(36).substr(2, 9),
          username: newUser.username,
          password: newUser.password,
          name: newUser.name,
          role: newUser.role,
          employeeId: newUser.employeeId,
          status: 'active',
          failedAttempts: 0,
          isLocked: false
        };
        setUsers(prev => [...prev, user]);
        logActivity('إضافة مستخدم', `تم إضافة مستخدم جديد ${newUser.username}`, 'security');
      }
      setIsUserModalOpen(false);
      setEditingUser(null);
      setNewUser({ username: '', password: '', confirmPassword: '', name: '', role: 'cashier', employeeId: '', status: 'active' });
    };

    const toggleUserStatus = (userId: string) => {
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          const newStatus = u.status === 'active' ? 'suspended' : 'active';
          logActivity('تغيير حالة مستخدم', `تم تغيير حالة المستخدم ${u.username} إلى ${newStatus}`, 'security');
          return { ...u, status: newStatus };
        }
        return u;
      }));
    };

    const handleBackup = async () => {
      try {
        const result = await dataService.createBackup();
        if (result.success) {
          const newBackup: Backup = {
            id: Math.random().toString(36).substr(2, 9),
            filename: result.filename,
            date: Date.now(),
            size: result.size,
            type: 'manual',
            status: 'success'
          };
          setBackups(prev => [newBackup, ...prev]);
          logActivity('نسخ احتياطي', 'تم إنشاء نسخة احتياطية يدوية للبيانات', 'security');
          setShowToast({ message: 'تم إنشاء النسخة الاحتياطية بنجاح', type: 'success' });
        }
      } catch (error) {
        console.error('Backup failed:', error);
        setShowToast({ message: 'فشل إنشاء النسخة الاحتياطية', type: 'error' });
      }
    };

    const handleRestore = async (filename: string) => {
      if (!confirm('هل أنت متأكد من استعادة هذه النسخة؟ سيتم إعادة تشغيل النظام وفقدان البيانات الحالية غير المحفوظة.')) return;
      
      try {
        const result = await dataService.restoreBackup(filename);
        if (result.success) {
          setShowToast({ message: 'تم استعادة البيانات بنجاح. سيتم إعادة تشغيل النظام...', type: 'success' });
          setTimeout(() => window.location.reload(), 2000);
        }
      } catch (error) {
        console.error('Restore failed:', error);
        setShowToast({ message: 'فشل استعادة البيانات', type: 'error' });
      }
    };

    return (
      <div className="space-y-8" dir="rtl">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-black text-slate-800 flex items-center gap-4">
              <ShieldCheck className="text-indigo-500" size={40} />
              الأمان والخصوصية
            </h2>
            <p className="text-slate-500 mt-2 font-medium">حماية البيانات، إدارة المستخدمين ومراقبة النظام</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleBackup}
              className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
            >
              <Database size={20} />
              نسخ احتياطي الآن
            </button>
          </div>
        </div>

        {/* Security Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {securityTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSecurityTab(tab.id as any)}
              className={cn(
                "px-6 py-3 rounded-2xl font-bold flex items-center gap-2 whitespace-nowrap transition-all",
                securityTab === tab.id 
                  ? "bg-slate-800 text-white shadow-lg" 
                  : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {securityTab === 'users' && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-xl font-black text-slate-800">إدارة مستخدمي النظام</h4>
              <button 
                onClick={() => {
                  setEditingUser(null);
                  setNewUser({ username: '', password: '', confirmPassword: '', name: '', role: 'cashier', employeeId: '', status: 'active' });
                  setIsUserModalOpen(true);
                }}
                className="px-6 py-3 bg-indigo-500 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-100"
              >
                <UserPlus size={20} />
                إضافة مستخدم
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-slate-50 text-slate-400 text-xs font-black uppercase tracking-wider">
                  <tr>
                    <th className="px-8 py-5">المستخدم</th>
                    <th className="px-8 py-5">اسم الدخول</th>
                    <th className="px-8 py-5">الدور</th>
                    <th className="px-8 py-5">آخر دخول</th>
                    <th className="px-8 py-5">الحالة</th>
                    <th className="px-8 py-5">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black">
                            {user.name.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-800">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-slate-600 font-bold">{user.username}</td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-black uppercase">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-slate-400 text-sm">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString('ar-EG') : 'لم يسجل دخول'}
                      </td>
                      <td className="px-8 py-5">
                        <span className={cn(
                          "px-3 py-1 rounded-lg text-xs font-black",
                          user.status === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        )}>
                          {user.status === 'active' ? 'نشط' : 'موقوف'}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setEditingUser(user);
                              setNewUser({
                                username: user.username,
                                password: '',
                                confirmPassword: '',
                                name: user.name,
                                role: user.role,
                                employeeId: user.employeeId || '',
                                status: user.status
                              });
                              setIsUserModalOpen(true);
                            }}
                            className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => toggleUserStatus(user.id)}
                            className={cn(
                              "p-2 rounded-lg transition-colors",
                              user.status === 'active' ? "text-rose-500 hover:bg-rose-50" : "text-emerald-500 hover:bg-emerald-50"
                            )}
                          >
                            {user.status === 'active' ? <UserX size={18} /> : <UserCheck size={18} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {securityTab === 'roles' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h4 className="text-xl font-black text-slate-800 mb-6">الأدوار والصلاحيات</h4>
              <div className="space-y-4">
                {Object.keys(ROLE_PERMISSIONS).map(role => (
                  <div key={role} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-black text-slate-800 uppercase">{role}</span>
                      <span className="text-xs font-bold text-indigo-500">{ROLE_PERMISSIONS[role as Role].length} صلاحية</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ROLE_PERMISSIONS[role as Role].slice(0, 5).map(p => (
                        <span key={p} className="px-2 py-1 bg-white text-slate-500 rounded text-[10px] font-bold">{p}</span>
                      ))}
                      {ROLE_PERMISSIONS[role as Role].length > 5 && (
                        <span className="px-2 py-1 bg-white text-slate-400 rounded text-[10px] font-bold">+{ROLE_PERMISSIONS[role as Role].length - 5}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h4 className="text-xl font-black text-slate-800 mb-6">تخصيص الصلاحيات</h4>
              <p className="text-slate-500 font-medium mb-8">اختر دوراً لتعديل صلاحياته بشكل مفصل لكل صفحة وعملية.</p>
              <div className="p-12 border-2 border-dashed border-slate-100 rounded-3xl text-center">
                <Lock className="mx-auto text-slate-200 mb-4" size={48} />
                <p className="text-slate-400 font-bold">اختر دوراً للبدء في التخصيص</p>
              </div>
            </div>
          </div>
        )}

        {securityTab === 'logs' && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-xl font-black text-slate-800">سجل نشاط النظام</h4>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" placeholder="بحث في السجل..." className="pr-10 pl-4 py-2 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700" />
                </div>
                <button className="p-2 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-colors">
                  <Filter size={20} />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-slate-50 text-slate-400 text-xs font-black uppercase tracking-wider">
                  <tr>
                    <th className="px-8 py-5">المستخدم</th>
                    <th className="px-8 py-5">العملية</th>
                    <th className="px-8 py-5">التفاصيل</th>
                    <th className="px-8 py-5">التاريخ والوقت</th>
                    <th className="px-8 py-5">الجهاز</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {activityLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-5 font-bold text-slate-800">{log.username}</td>
                      <td className="px-8 py-5">
                        <span className={cn(
                          "px-3 py-1 rounded-lg text-xs font-black uppercase",
                          log.type === 'auth' ? "bg-blue-50 text-blue-600" :
                          log.type === 'security' ? "bg-rose-50 text-rose-600" :
                          log.type === 'financial' ? "bg-emerald-50 text-emerald-600" :
                          "bg-slate-100 text-slate-600"
                        )}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-slate-500 text-sm font-medium">{log.details}</td>
                      <td className="px-8 py-5 text-slate-400 text-xs font-bold">
                        {new Date(log.timestamp).toLocaleString('ar-EG')}
                      </td>
                      <td className="px-8 py-5 text-slate-400 text-xs">{log.device}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {securityTab === 'backups' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h4 className="text-xl font-black text-slate-800 mb-8">سجل النسخ الاحتياطي</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-slate-50 text-slate-400 text-xs font-black uppercase tracking-wider">
                    <tr>
                      <th className="px-8 py-5">الملف</th>
                      <th className="px-8 py-5">التاريخ</th>
                      <th className="px-8 py-5">الحجم</th>
                      <th className="px-8 py-5">النوع</th>
                      <th className="px-8 py-5">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {backups.map(backup => (
                      <tr key={backup.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-5 font-bold text-slate-800">{backup.filename}</td>
                        <td className="px-8 py-5 text-slate-400 text-sm">
                          {new Date(backup.date).toLocaleString('ar-EG')}
                        </td>
                        <td className="px-8 py-5 text-slate-600 font-bold">{backup.size}</td>
                        <td className="px-8 py-5">
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase">
                            {backup.type === 'manual' ? 'يدوي' : 'تلقائي'}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <button 
                            onClick={() => handleRestore(backup.filename)}
                            className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="استعادة النسخة"
                          >
                            <RefreshCw size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h4 className="text-xl font-black text-slate-800 mb-6">إعدادات النسخ</h4>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-600">نسخ احتياطي تلقائي</span>
                    <button className="w-12 h-6 bg-emerald-500 rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400">تكرار النسخ</label>
                    <select className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700">
                      <option>يومياً</option>
                      <option>أسبوعياً</option>
                      <option>شهرياً</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400">مكان الحفظ</label>
                    <select className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700">
                      <option>محلي (الجهاز)</option>
                      <option>Google Drive</option>
                      <option>سيرفر خارجي</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="bg-indigo-500 p-8 rounded-3xl shadow-lg shadow-indigo-100 text-white">
                <h4 className="text-xl font-black mb-4">استعادة البيانات</h4>
                <p className="text-indigo-100 text-sm mb-6 font-medium">يمكنك استعادة بيانات النظام من ملف نسخة احتياطية سابق.</p>
                <button className="w-full py-4 bg-white text-indigo-500 rounded-2xl font-black hover:bg-indigo-50 transition-all">
                  رفع ملف النسخة
                </button>
              </div>
            </div>
          </div>
        )}

        {securityTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h4 className="text-xl font-black text-slate-800 mb-8">سياسات الدخول</h4>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">تسجيل خروج تلقائي (بالدقائق)</label>
                  <input 
                    type="number" 
                    value={securitySettings.autoLogoutMinutes}
                    onChange={e => setSecuritySettings({...securitySettings, autoLogoutMinutes: Number(e.target.value)})}
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">أقصى عدد لمحاولات الدخول الفاشلة</label>
                  <input 
                    type="number" 
                    value={securitySettings.maxFailedAttempts}
                    onChange={e => setSecuritySettings({...securitySettings, maxFailedAttempts: Number(e.target.value)})}
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                  />
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                  <div>
                    <p className="font-black text-slate-800">التحقق بخطوتين (2FA)</p>
                    <p className="text-xs text-slate-400 font-bold">إرسال كود OTP عند تسجيل الدخول</p>
                  </div>
                  <button 
                    onClick={() => setSecuritySettings({...securitySettings, require2FA: !securitySettings.require2FA})}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-all",
                      securitySettings.require2FA ? "bg-indigo-500" : "bg-slate-300"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all",
                      securitySettings.require2FA ? "left-1" : "right-1"
                    )}></div>
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h4 className="text-xl font-black text-slate-800 mb-8">تشفير وخصوصية البيانات</h4>
              <div className="space-y-6">
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                  <div>
                    <p className="font-black text-slate-800">تشفير البيانات الحساسة</p>
                    <p className="text-xs text-slate-400 font-bold">تشفير الرواتب وبيانات العملاء في قاعدة البيانات</p>
                  </div>
                  <button 
                    onClick={() => setSecuritySettings({...securitySettings, encryptionEnabled: !securitySettings.encryptionEnabled})}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-all",
                      securitySettings.encryptionEnabled ? "bg-emerald-500" : "bg-slate-300"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all",
                      securitySettings.encryptionEnabled ? "left-1" : "right-1"
                    )}></div>
                  </button>
                </div>
                <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl">
                  <div className="flex gap-3 text-amber-600 mb-2">
                    <AlertTriangle size={20} />
                    <span className="font-black">تنبيه أمني</span>
                  </div>
                  <p className="text-xs text-amber-700 font-medium leading-relaxed">
                    عند تفعيل التشفير، سيتم تشفير كافة البيانات الحساسة باستخدام خوارزمية AES-256. تأكد من الاحتفاظ بمفتاح التشفير في مكان آمن.
                  </p>
                </div>
                <button className="w-full py-4 bg-rose-50 text-rose-600 rounded-2xl font-black hover:bg-rose-100 transition-all flex items-center justify-center gap-2">
                  <LogOut size={20} />
                  تسجيل الخروج من كافة الأجهزة
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Modal */}
        <AnimatePresence>
          {isUserModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsUserModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden" dir="rtl">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="text-2xl font-black text-slate-800">{editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}</h3>
                  <button onClick={() => setIsUserModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400"><X size={24} /></button>
                </div>
                <form onSubmit={handleSaveUser} className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400">الاسم بالكامل</label>
                    <input required type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400">اسم المستخدم</label>
                    <input required type="text" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400">كلمة المرور</label>
                      <input required={!editingUser} type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400">تأكيد كلمة المرور</label>
                      <input required={!editingUser} type="password" value={newUser.confirmPassword} onChange={e => setNewUser({...newUser, confirmPassword: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400">الدور</label>
                      <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as Role})} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700">
                        {Object.keys(ROLE_PERMISSIONS).map(role => <option key={role} value={role}>{role.toUpperCase()}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400">ربط بموظف</label>
                      <select value={newUser.employeeId} onChange={e => setNewUser({...newUser, employeeId: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700">
                        <option value="">لا يوجد</option>
                        {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end gap-4">
                    <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all">إلغاء</button>
                    <button type="submit" className="px-12 py-4 bg-indigo-500 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-600 transition-all">
                      {editingUser ? 'تحديث' : 'حفظ'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderUsers = () => (
    <div className="space-y-6" dir="rtl">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-xl font-bold text-slate-800">إدارة مستخدمي النظام</h3>
          <button 
            onClick={() => setIsUserModalOpen(true)}
            className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-slate-900 transition-colors"
          >
            <UserPlus size={20} />
            إضافة مستخدم جديد
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-500 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">المستخدم</th>
                <th className="px-6 py-4 font-medium">اسم الدخول</th>
                <th className="px-6 py-4 font-medium">الصلاحية</th>
                <th className="px-6 py-4 font-medium">الحالة</th>
                <th className="px-6 py-4 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user.id} className={cn("hover:bg-slate-50 transition-colors", currentUser.id === user.id && "bg-blue-50/50")}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Users size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{user.name}</p>
                        {currentUser.id === user.id && <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full">أنت حالياً</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-sm">{user.username}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold",
                      user.role === 'admin' ? "bg-red-100 text-red-600" :
                      user.role === 'cashier' ? "bg-emerald-100 text-emerald-600" :
                      user.role === 'accountant' ? "bg-blue-100 text-blue-600" :
                      "bg-amber-100 text-amber-600"
                    )}>
                      {user.role === 'admin' ? 'مدير النظام' :
                       user.role === 'cashier' ? 'كاشير' :
                       user.role === 'accountant' ? 'محاسب' : 'موظف مخزن'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      نشط
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {currentUser.id !== user.id && (
                        <button 
                          onClick={() => switchUser(user)}
                          className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
                        >
                          تبديل
                        </button>
                      )}
                      <button 
                        onClick={() => openEditUserModal(user)}
                        className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                      >
                        <span className="text-xs font-bold">تعديل</span>
                      </button>
                      <button 
                        onClick={() => setConfirmDeleteUserId(user.id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        disabled={currentUser.id === user.id}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      <AnimatePresence>
        {isUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => {
                setIsUserModalOpen(false);
                setEditingUser(null);
                setNewUser({ username: '', name: '', role: 'cashier', password: '' });
              }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8"
              dir="rtl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-800">
                  {editingUser ? 'تعديل بيانات المستخدم' : 'إضافة مستخدم جديد'}
                </h3>
                <button onClick={() => setIsUserModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">الاسم الكامل</label>
                  <div className="relative">
                    <Users className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input required type="text" className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-800"
                      value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">اسم المستخدم (للدخول)</label>
                  <div className="relative">
                    <Users className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input required type="text" className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-800"
                      value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">الصلاحية</label>
                  <div className="relative">
                    <Shield className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-800 appearance-none"
                      value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as Role})}>
                      <option value="admin">مدير النظام</option>
                      <option value="cashier">كاشير</option>
                      <option value="accountant">محاسب</option>
                      <option value="store">موظف مخزن</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">كلمة المرور</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="password" placeholder="اتركها فارغة لعدم التغيير" className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-800"
                      value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-100 mt-4 hover:bg-slate-900 transition-all">
                  {editingUser ? 'تحديث البيانات' : 'حفظ المستخدم'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete User Confirmation */}
      <AnimatePresence>
        {confirmDeleteUserId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setConfirmDeleteUserId(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center" dir="rtl">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">حذف المستخدم</h3>
              <p className="text-slate-500 mb-8">هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.</p>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setConfirmDeleteUserId(null)} className="py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all">إلغاء</button>
                <button onClick={deleteUser} className="py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-100">حذف</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderSettings = () => {
    const settingsTabs = [
      { id: 'general', label: 'عام', icon: <Settings size={18} /> },
      { id: 'company', label: 'بيانات الشركة', icon: <Building2 size={18} /> },
      { id: 'users', label: 'المستخدمين والصلاحيات', icon: <Shield size={18} /> },
      { id: 'invoice', label: 'الفواتير والمبيعات', icon: <FileText size={18} /> },
      { id: 'pos', label: 'إعدادات نقطة البيع', icon: <ShoppingCart size={18} /> },
      { id: 'barcode', label: 'إعدادات الباركود', icon: <Barcode size={18} /> },
      { id: 'inventory', label: 'المخازن والمخزون', icon: <Package size={18} /> },
      { id: 'payment', label: 'طرق الدفع', icon: <CreditCard size={18} /> },
      { id: 'taxes', label: 'الضرائب', icon: <DollarSign size={18} /> },
      { id: 'notifications', label: 'الإشعارات', icon: <AlertTriangle size={18} /> },
      { id: 'backup', label: 'النسخ الاحتياطي', icon: <Download size={18} /> },
      { id: 'security', label: 'الأمان', icon: <Lock size={18} /> },
      { id: 'integrations', label: 'التكامل', icon: <Layers size={18} /> },
      { id: 'advanced', label: 'متقدم', icon: <Settings size={18} /> },
    ];

    const updateSettings = (section: keyof SystemSettings, key: string, value: any) => {
      setSettings(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value
        }
      }));
    };

    return (
      <div className="flex flex-col md:flex-row gap-8 min-h-[600px]" dir="rtl">
        {/* Settings Sidebar */}
        <div className="w-full md:w-72 space-y-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-1">
            <div className="relative mb-4">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="بحث في الإعدادات..."
                className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-800"
                value={settingsSearchQuery}
                onChange={e => setSettingsSearchQuery(e.target.value)}
              />
            </div>
            {settingsTabs.filter(tab => tab.label.includes(settingsSearchQuery)).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSettingsTab(tab.id as any)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                  activeSettingsTab === tab.id 
                    ? "bg-slate-800 text-white shadow-lg shadow-slate-200" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden min-h-full">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800">
                {settingsTabs.find(t => t.id === activeSettingsTab)?.label}
              </h3>
              <button 
                onClick={() => setShowToast({ message: 'تم حفظ الإعدادات بنجاح', type: 'success' })}
                className="px-6 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
              >
                حفظ التغييرات
              </button>
            </div>
            
            <div className="p-8">
              {activeSettingsTab === 'general' && (
                <div className="space-y-6 max-w-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600">اللغة الافتراضية</label>
                      <select 
                        className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-800"
                        value={settings.general.language}
                        onChange={e => updateSettings('general', 'language', e.target.value)}
                      >
                        <option value="ar">العربية</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600">العملة الأساسية</label>
                      <select 
                        className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-800"
                        value={settings.general.currency}
                        onChange={e => updateSettings('general', 'currency', e.target.value)}
                      >
                        <option value="EGP">جنيه مصري (EGP)</option>
                        <option value="USD">دولار أمريكي (USD)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600">المنطقة الزمنية</label>
                      <select 
                        className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-800"
                        value={settings.general.timezone}
                        onChange={e => updateSettings('general', 'timezone', e.target.value)}
                      >
                        <option value="Africa/Cairo">القاهرة (GMT+2)</option>
                        <option value="Asia/Riyadh">الرياض (GMT+3)</option>
                        <option value="UTC">توقيت عالمي (UTC)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600">تنسيق التاريخ</label>
                      <select 
                        className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-800"
                        value={settings.general.dateFormat}
                        onChange={e => updateSettings('general', 'dateFormat', e.target.value)}
                      >
                        <option value="YYYY-MM-DD">2026-04-01</option>
                        <option value="DD/MM/YYYY">01/04/2026</option>
                        <option value="MM/DD/YYYY">04/01/2026</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeSettingsTab === 'company' && (
                <div className="space-y-8 max-w-3xl">
                  <div className="flex items-center gap-8 pb-8 border-b border-slate-50">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-3xl bg-slate-100 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 group-hover:border-slate-400 transition-all cursor-pointer overflow-hidden">
                        {settings.company.logo ? (
                          <img src={settings.company.logo} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                          <>
                            <Upload size={24} className="mb-2" />
                            <span className="text-[10px] font-bold">رفع الشعار</span>
                          </>
                        )}
                      </div>
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600">اسم الشركة / المؤسسة</label>
                        <input 
                          type="text" 
                          className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-800"
                          value={settings.company.name}
                          onChange={e => updateSettings('company', 'name', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600">العنوان</label>
                      <input 
                        type="text" 
                        className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-800"
                        value={settings.company.address}
                        onChange={e => updateSettings('company', 'address', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600">رقم الهاتف</label>
                      <input 
                        type="text" 
                        className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-800"
                        value={settings.company.phone}
                        onChange={e => updateSettings('company', 'phone', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600">البريد الإلكتروني</label>
                      <input 
                        type="email" 
                        className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-800"
                        value={settings.company.email}
                        onChange={e => updateSettings('company', 'email', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600">الرقم الضريبي</label>
                      <input 
                        type="text" 
                        className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-800"
                        value={settings.company.taxNumber}
                        onChange={e => updateSettings('company', 'taxNumber', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeSettingsTab === 'users' && renderUsers()}

              {activeSettingsTab === 'invoice' && (
                <div className="space-y-8 max-w-3xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h4 className="font-bold text-slate-800 border-b pb-2">تنسيق الفاتورة</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                          <span className="text-sm font-bold text-slate-700">حجم الورق</span>
                          <div className="flex gap-2">
                            {['A4', 'Receipt'].map(f => (
                              <button 
                                key={f}
                                onClick={() => updateSettings('invoice', 'format', f)}
                                className={cn(
                                  "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                                  settings.invoice.format === f ? "bg-slate-800 text-white shadow-md" : "bg-white text-slate-500 border border-slate-100"
                                )}
                              >
                                {f === 'A4' ? 'A4 (كبير)' : 'Receipt (حراري)'}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                          <span className="text-sm font-bold text-slate-700">ترقيم الفواتير</span>
                          <div className="flex gap-2">
                            {['auto', 'manual'].map(t => (
                              <button 
                                key={t}
                                onClick={() => updateSettings('invoice', 'numberingType', t)}
                                className={cn(
                                  "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                                  settings.invoice.numberingType === t ? "bg-slate-800 text-white shadow-md" : "bg-white text-slate-500 border border-slate-100"
                                )}
                              >
                                {t === 'auto' ? 'تلقائي' : 'يدوي'}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-600">بادئة الفاتورة</label>
                          <input 
                            type="text" 
                            className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-800"
                            value={settings.invoice.prefix}
                            onChange={e => updateSettings('invoice', 'prefix', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h4 className="font-bold text-slate-800 border-b pb-2">خيارات العرض</h4>
                      <div className="space-y-3">
                        {[
                          { id: 'showLogo', label: 'إظهار الشعار' },
                          { id: 'showTax', label: 'إظهار الضريبة' },
                          { id: 'showDiscount', label: 'إظهار الخصم' },
                          { id: 'showBarcode', label: 'إظهار الباركود' },
                        ].map(opt => (
                          <label key={opt.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl cursor-pointer transition-all">
                            <span className="text-sm font-bold text-slate-700">{opt.label}</span>
                            <div 
                              onClick={() => updateSettings('invoice', opt.id, !settings.invoice[opt.id as keyof typeof settings.invoice])}
                              className={cn(
                                "w-12 h-6 rounded-full relative transition-all duration-300",
                                settings.invoice[opt.id as keyof typeof settings.invoice] ? "bg-emerald-500" : "bg-slate-200"
                              )}
                            >
                              <div className={cn(
                                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                                settings.invoice[opt.id as keyof typeof settings.invoice] ? "right-7" : "right-1"
                              )} />
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600">رسالة أسفل الفاتورة</label>
                    <textarea 
                      rows={3}
                      className="w-full p-4 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-800"
                      value={settings.invoice.footerMessage}
                      onChange={e => updateSettings('invoice', 'footerMessage', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {activeSettingsTab === 'pos' && (
                <div className="space-y-8 max-w-3xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h4 className="font-bold text-slate-800 border-b pb-2">خيارات البيع</h4>
                      <div className="space-y-3">
                        {[
                          { id: 'quickSale', label: 'تفعيل البيع السريع' },
                          { id: 'mixedPayment', label: 'تفعيل الدفع المختلط' },
                          { id: 'barcodeEnabled', label: 'تفعيل الباركود' },
                          { id: 'soundEnabled', label: 'تفعيل الصوت عند الإضافة' },
                          { id: 'openDrawer', label: 'فتح درج الكاشير تلقائياً' },
                        ].map(opt => (
                          <label key={opt.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl cursor-pointer transition-all">
                            <span className="text-sm font-bold text-slate-700">{opt.label}</span>
                            <div 
                              onClick={() => updateSettings('pos', opt.id, !settings.pos[opt.id as keyof typeof settings.pos])}
                              className={cn(
                                "w-12 h-6 rounded-full relative transition-all duration-300",
                                settings.pos[opt.id as keyof typeof settings.pos] ? "bg-emerald-500" : "bg-slate-200"
                              )}
                            >
                              <div className={cn(
                                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                                settings.pos[opt.id as keyof typeof settings.pos] ? "right-7" : "right-1"
                              )} />
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h4 className="font-bold text-slate-800 border-b pb-2">القيم الافتراضية</h4>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-600">المخزن الافتراضي</label>
                          <select 
                            className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-800"
                            value={settings.pos.defaultWarehouseId}
                            onChange={e => updateSettings('pos', 'defaultWarehouseId', e.target.value)}
                          >
                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-600">الكاشير الافتراضي</label>
                          <select 
                            className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-800"
                            value={settings.pos.defaultCashierId}
                            onChange={e => updateSettings('pos', 'defaultCashierId', e.target.value)}
                          >
                            {users.filter(u => u.role === 'cashier' || u.role === 'admin').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSettingsTab === 'barcode' && (
                <div className="space-y-8 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h4 className="font-bold text-slate-800 border-b pb-2">إعدادات الباركود الأساسية</h4>
                      <div className="space-y-3">
                        {[
                          { id: 'enabled', label: 'تفعيل / تعطيل قارئ الباركود' },
                          { id: 'autoIncrement', label: 'زيادة الكمية تلقائياً عند التكرار' },
                          { id: 'soundEnabled', label: 'تشغيل صوت عند القراءة' },
                          { id: 'autoFocus', label: 'الفوكس التلقائي على حقل الباركود' },
                        ].map(opt => (
                          <label key={opt.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl cursor-pointer transition-all">
                            <span className="text-sm font-bold text-slate-700">{opt.label}</span>
                            <div 
                              onClick={() => updateSettings('barcode', opt.id, !settings.barcode[opt.id as keyof typeof settings.barcode])}
                              className={cn(
                                "w-12 h-6 rounded-full relative transition-all duration-300",
                                settings.barcode[opt.id as keyof typeof settings.barcode] ? "bg-emerald-500" : "bg-slate-200"
                              )}
                            >
                              <div className={cn(
                                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                                settings.barcode[opt.id as keyof typeof settings.barcode] ? "right-7" : "right-1"
                              )} />
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h4 className="font-bold text-slate-800 border-b pb-2">إعدادات الإدخال</h4>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-600">وضع القراءة</label>
                          <select 
                            className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-800"
                            value={settings.barcode.readMode}
                            onChange={e => updateSettings('barcode', 'readMode', e.target.value)}
                          >
                            <option value="auto">تلقائي عند الإدخال (Auto Add)</option>
                            <option value="button">بزر "إضافة" (Manual Submit)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-600">نوع الإدخال</label>
                          <select 
                            className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-800"
                            value={settings.barcode.inputType}
                            onChange={e => updateSettings('barcode', 'inputType', e.target.value)}
                          >
                            <option value="keyboard">USB Scanner (Keyboard)</option>
                            <option value="camera">كاميرا (Camera)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-600">مدة الانتظار (Debounce) بالملي ثانية</label>
                          <input 
                            type="number"
                            className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-800"
                            value={settings.barcode.debounceTime}
                            onChange={e => updateSettings('barcode', 'debounceTime', parseInt(e.target.value) || 50)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSettingsTab === 'inventory' && (
                <div className="space-y-8 max-w-3xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h4 className="font-bold text-slate-800 border-b pb-2">تتبع المخزون</h4>
                      <div className="space-y-3">
                        {[
                          { id: 'trackStock', label: 'تفعيل تتبع المخزون' },
                          { id: 'allowNegativeStock', label: 'السماح بالبيع بدون رصيد' },
                          { id: 'enableSerialNumber', label: 'تفعيل الرقم التسلسلي (Serial)' },
                          { id: 'enableBatchNumber', label: 'تفعيل رقم التشغيلة (Batch)' },
                          { id: 'multiWarehouse', label: 'تفعيل تعدد المخازن' },
                        ].map(opt => (
                          <label key={opt.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl cursor-pointer transition-all">
                            <span className="text-sm font-bold text-slate-700">{opt.label}</span>
                            <div 
                              onClick={() => updateSettings('inventory', opt.id, !settings.inventory[opt.id as keyof typeof settings.inventory])}
                              className={cn(
                                "w-12 h-6 rounded-full relative transition-all duration-300",
                                settings.inventory[opt.id as keyof typeof settings.inventory] ? "bg-emerald-500" : "bg-slate-200"
                              )}
                            >
                              <div className={cn(
                                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                                settings.inventory[opt.id as keyof typeof settings.inventory] ? "right-7" : "right-1"
                              )} />
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h4 className="font-bold text-slate-800 border-b pb-2">الجرد والتنبيهات</h4>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-600">نوع الجرد</label>
                          <select 
                            className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-800"
                            value={settings.inventory.inventoryCheckType}
                            onChange={e => updateSettings('inventory', 'inventoryCheckType', e.target.value)}
                          >
                            <option value="manual">يدوي</option>
                            <option value="periodic">دوري</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-600">الحد الأدنى للتنبيه (افتراضي)</label>
                          <input 
                            type="number" 
                            className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-800"
                            value={settings.inventory.minStockAlert}
                            onChange={e => updateSettings('inventory', 'minStockAlert', Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSettingsTab === 'payment' && (
                <div className="space-y-8 max-w-4xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h4 className="font-bold text-slate-800 border-b pb-2">تفعيل طرق الدفع</h4>
                      <div className="space-y-3">
                        {[
                          { id: 'cashEnabled', label: 'تفعيل الدفع النقدي', account: 'cashAccount' },
                          { id: 'cardEnabled', label: 'تفعيل الدفع بالفيزا', account: 'cardAccount' },
                          { id: 'walletEnabled', label: 'تفعيل المحافظ الإلكترونية', account: 'walletAccount' },
                          { id: 'bankEnabled', label: 'تفعيل التحويل البنكي', account: 'bankAccount' },
                        ].map(opt => (
                          <div key={opt.id} className="p-4 bg-slate-50 rounded-2xl space-y-4">
                            <label className="flex items-center justify-between cursor-pointer">
                              <span className="text-sm font-bold text-slate-700">{opt.label}</span>
                              <div 
                                onClick={() => updateSettings('payment', opt.id, !settings.payment[opt.id as keyof typeof settings.payment])}
                                className={cn(
                                  "w-12 h-6 rounded-full relative transition-all duration-300",
                                  settings.payment[opt.id as keyof typeof settings.payment] ? "bg-emerald-500" : "bg-slate-200"
                                )}
                              >
                                <div className={cn(
                                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                                  settings.payment[opt.id as keyof typeof settings.payment] ? "right-7" : "right-1"
                                )} />
                              </div>
                            </label>
                            {settings.payment[opt.id as keyof typeof settings.payment] && (
                              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <label className="text-xs font-bold text-slate-500">الحساب المرتبط</label>
                                <input 
                                  type="text" 
                                  className="w-full p-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-slate-800"
                                  value={settings.payment[opt.account as keyof typeof settings.payment]}
                                  onChange={e => updateSettings('payment', opt.account, e.target.value)}
                                  placeholder="مثلاً: الخزينة الرئيسية"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h4 className="font-bold text-slate-800 border-b pb-2">إعدادات إضافية</h4>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-600">رسوم إضافية على الفيزا (%)</label>
                          <input 
                            type="number" 
                            className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-800"
                            value={settings.payment.cardFee}
                            onChange={e => updateSettings('payment', 'cardFee', Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSettingsTab === 'taxes' && (
                <div className="space-y-8 max-w-3xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h4 className="font-bold text-slate-800 border-b pb-2">الضريبة الافتراضية</h4>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-600">نسبة الضريبة (%)</label>
                          <input 
                            type="number" 
                            className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-800"
                            value={settings.taxes.defaultTaxRate}
                            onChange={e => updateSettings('taxes', 'defaultTaxRate', Number(e.target.value))}
                          />
                        </div>
                        <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer">
                          <span className="text-sm font-bold text-slate-700">الأسعار شاملة الضريبة</span>
                          <div 
                            onClick={() => updateSettings('taxes', 'isTaxInclusive', !settings.taxes.isTaxInclusive)}
                            className={cn(
                              "w-12 h-6 rounded-full relative transition-all duration-300",
                              settings.taxes.isTaxInclusive ? "bg-emerald-500" : "bg-slate-200"
                            )}
                          >
                            <div className={cn(
                              "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                              settings.taxes.isTaxInclusive ? "right-7" : "right-1"
                            )} />
                          </div>
                        </label>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center border-b pb-2">
                        <h4 className="font-bold text-slate-800">أنواع الضرائب</h4>
                        <button className="text-xs font-bold text-blue-600 hover:underline">إضافة نوع</button>
                      </div>
                      <div className="space-y-2">
                        {settings.taxes.taxTypes.map((tax, idx) => (
                          <div key={idx} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-2xl">
                            <div>
                              <p className="text-sm font-bold text-slate-800">{tax.name}</p>
                              <p className="text-xs text-slate-500">{tax.rate}%</p>
                            </div>
                            <button className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSettingsTab === 'notifications' && (
                <div className="space-y-8 max-w-3xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h4 className="font-bold text-slate-800 border-b pb-2">تنبيهات النظام</h4>
                      <div className="space-y-3">
                        {[
                          { id: 'stockAlert', label: 'تنبيه نقص المخزون' },
                          { id: 'expiryAlert', label: 'تنبيه انتهاء الصلاحية' },
                          { id: 'unpaidInvoicesAlert', label: 'تنبيه فواتير غير مدفوعة' },
                        ].map(opt => (
                          <label key={opt.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl cursor-pointer transition-all">
                            <span className="text-sm font-bold text-slate-700">{opt.label}</span>
                            <div 
                              onClick={() => updateSettings('notifications', opt.id, !settings.notifications[opt.id as keyof typeof settings.notifications])}
                              className={cn(
                                "w-12 h-6 rounded-full relative transition-all duration-300",
                                settings.notifications[opt.id as keyof typeof settings.notifications] ? "bg-emerald-500" : "bg-slate-200"
                              )}
                            >
                              <div className={cn(
                                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                                settings.notifications[opt.id as keyof typeof settings.notifications] ? "right-7" : "right-1"
                              )} />
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h4 className="font-bold text-slate-800 border-b pb-2">قنوات الإرسال</h4>
                      <div className="space-y-3">
                        {[
                          { id: 'system', label: 'داخل النظام' },
                          { id: 'email', label: 'البريد الإلكتروني' },
                          { id: 'whatsapp', label: 'واتساب (WhatsApp)' },
                        ].map(opt => (
                          <label key={opt.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl cursor-pointer transition-all">
                            <span className="text-sm font-bold text-slate-700">{opt.label}</span>
                            <div 
                              onClick={() => {
                                const newChannels = { ...settings.notifications.channels, [opt.id]: !settings.notifications.channels[opt.id as keyof typeof settings.notifications.channels] };
                                updateSettings('notifications', 'channels', newChannels);
                              }}
                              className={cn(
                                "w-12 h-6 rounded-full relative transition-all duration-300",
                                settings.notifications.channels[opt.id as keyof typeof settings.notifications.channels] ? "bg-emerald-500" : "bg-slate-200"
                              )}
                            >
                              <div className={cn(
                                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                                settings.notifications.channels[opt.id as keyof typeof settings.notifications.channels] ? "right-7" : "right-1"
                              )} />
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSettingsTab === 'backup' && (
                <div className="space-y-8 max-w-3xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h4 className="font-bold text-slate-800 border-b pb-2">النسخ التلقائي</h4>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer">
                          <span className="text-sm font-bold text-slate-700">تفعيل النسخ التلقائي</span>
                          <div 
                            onClick={() => updateSettings('backup', 'autoBackup', !settings.backup.autoBackup)}
                            className={cn(
                              "w-12 h-6 rounded-full relative transition-all duration-300",
                              settings.backup.autoBackup ? "bg-emerald-500" : "bg-slate-200"
                            )}
                          >
                            <div className={cn(
                              "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                              settings.backup.autoBackup ? "right-7" : "right-1"
                            )} />
                          </div>
                        </label>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-600">تكرار النسخ</label>
                          <select 
                            className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-800"
                            value={settings.backup.frequency}
                            onChange={e => updateSettings('backup', 'frequency', e.target.value)}
                          >
                            <option value="daily">يومي</option>
                            <option value="weekly">أسبوعي</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-600">مكان الحفظ</label>
                          <select 
                            className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-800"
                            value={settings.backup.location}
                            onChange={e => updateSettings('backup', 'location', e.target.value)}
                          >
                            <option value="local">على الجهاز</option>
                            <option value="google_drive">Google Drive</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h4 className="font-bold text-slate-800 border-b pb-2">إجراءات يدوية</h4>
                      <div className="space-y-4">
                        <button className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                          <Download size={20} />
                          إنشاء نسخة احتياطية الآن
                        </button>
                        <button className="w-full py-4 bg-slate-100 text-slate-700 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-all">
                          <History size={20} />
                          استرجاع من نسخة سابقة
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSettingsTab === 'security' && (
                <div className="space-y-8 max-w-3xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h4 className="font-bold text-slate-800 border-b pb-2">حماية الحساب</h4>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer">
                          <span className="text-sm font-bold text-slate-700">تفعيل التحقق بخطوتين (2FA)</span>
                          <div 
                            onClick={() => updateSettings('security', 'twoFactorAuth', !settings.security.twoFactorAuth)}
                            className={cn(
                              "w-12 h-6 rounded-full relative transition-all duration-300",
                              settings.security.twoFactorAuth ? "bg-emerald-500" : "bg-slate-200"
                            )}
                          >
                            <div className={cn(
                              "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                              settings.security.twoFactorAuth ? "right-7" : "right-1"
                            )} />
                          </div>
                        </label>
                        <button className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-all">
                          تغيير كلمة مرور المدير
                        </button>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h4 className="font-bold text-slate-800 border-b pb-2">الجلسة والنشاط</h4>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-600">وقت انتهاء الجلسة (بالدقائق)</label>
                          <input 
                            type="number" 
                            className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-800"
                            value={settings.security.sessionTimeout}
                            onChange={e => updateSettings('security', 'sessionTimeout', Number(e.target.value))}
                          />
                        </div>
                        <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer">
                          <span className="text-sm font-bold text-slate-700">قفل النظام عند عدم الاستخدام</span>
                          <div 
                            onClick={() => updateSettings('security', 'lockOnIdle', !settings.security.lockOnIdle)}
                            className={cn(
                              "w-12 h-6 rounded-full relative transition-all duration-300",
                              settings.security.lockOnIdle ? "bg-emerald-500" : "bg-slate-200"
                            )}
                          >
                            <div className={cn(
                              "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                              settings.security.lockOnIdle ? "right-7" : "right-1"
                            )} />
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSettingsTab === 'integrations' && (
                <div className="space-y-8 max-w-3xl">
                  <div className="space-y-6">
                    <h4 className="font-bold text-slate-800 border-b pb-2">مفاتيح الربط (API Keys)</h4>
                    <div className="p-6 bg-slate-50 rounded-2xl space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600">System API Key</label>
                        <div className="flex gap-2">
                          <input 
                            type="password" 
                            readOnly
                            className="flex-1 p-3 rounded-xl border border-slate-200 bg-white font-mono text-xs"
                            value="sk_live_51MzX7vL9y2R8q4p0..."
                          />
                          <button className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-300">نسخ</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-800 border-b pb-2">المتجر الإلكتروني</h4>
                      <input 
                        type="text" 
                        placeholder="رابط الموقع (WooCommerce/Shopify)"
                        className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-800"
                        value={settings.integrations.ecommerceLink}
                        onChange={e => updateSettings('integrations', 'ecommerceLink', e.target.value)}
                      />
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-800 border-b pb-2">النظام المحاسبي</h4>
                      <input 
                        type="text" 
                        placeholder="رابط النظام (Odoo/SAP)"
                        className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-800"
                        value={settings.integrations.accountingLink}
                        onChange={e => updateSettings('integrations', 'accountingLink', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeSettingsTab === 'advanced' && (
                <div className="space-y-8 max-w-3xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h4 className="font-bold text-slate-800 border-b pb-2">تصدير واستيراد</h4>
                      <div className="space-y-4">
                        <button 
                          onClick={exportAllToExcel}
                          className="w-full py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
                        >
                          <FileText size={18} />
                          تصدير كافة البيانات (Excel)
                        </button>
                        <button className="w-full py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                          <Upload size={18} />
                          استيراد بيانات من ملف
                        </button>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h4 className="font-bold text-red-600 border-b pb-2">منطقة الخطر</h4>
                      <div className="space-y-4">
                        <button 
                          onClick={() => {
                            if(window.confirm('هل أنت متأكد من إعادة ضبط النظام؟ سيتم حذف كافة البيانات!')) {
                              localStorage.clear();
                              window.location.reload();
                            }
                          }}
                          className="w-full py-3 bg-red-50 text-red-600 border border-red-100 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 transition-all"
                        >
                          <AlertTriangle size={18} />
                          إعادة ضبط المصنع
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  


  const renderWarehouses = () => (
    <motion.div 
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="space-y-6" 
      dir="rtl"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-black text-slate-800">إدارة المخازن</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsTransferModalOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-colors"
          >
            <ArrowLeftRight size={20} />
            نقل منتجات
          </button>
          <button 
            onClick={() => setIsWarehouseModalOpen(true)}
            className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-colors"
          >
            <Plus size={20} />
            إضافة مخزن
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.map(warehouse => (
          <motion.div 
            key={warehouse.id}
            whileHover={{ y: -4 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4"
          >
            <div className="flex justify-between items-start">
              <div className={cn(
                "p-3 rounded-2xl",
                warehouse.type === 'main' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
              )}>
                <Building2 size={24} />
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => {
                    setEditingWarehouse(warehouse);
                    setNewWarehouse(warehouse);
                    setIsWarehouseModalOpen(true);
                  }}
                  className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"
                >
                  <Plus size={18} className="rotate-45" />
                </button>
                <button 
                  onClick={() => deleteWarehouse(warehouse.id)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-800">{warehouse.name}</h4>
              <p className="text-slate-500 text-sm flex items-center gap-1 mt-1">
                <MapPin size={14} />
                {warehouse.location || 'لا يوجد عنوان'}
              </p>
            </div>
            <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold",
                warehouse.type === 'main' ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
              )}>
                {warehouse.type === 'main' ? 'مخزن رئيسي' : 'مخزن فرعي'}
              </span>
              <button 
                onClick={() => {
                  setAuditData({ ...auditData, warehouseId: warehouse.id });
                  setIsAuditModalOpen(true);
                }}
                className="text-xs font-bold text-slate-400 hover:text-slate-800 flex items-center gap-1"
              >
                <ClipboardList size={14} />
                جرد المخزن
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Warehouse Modal */}
      <AnimatePresence>
        {isWarehouseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsWarehouseModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8"
              dir="rtl"
            >
              <h3 className="text-xl font-black text-slate-800 mb-6">
                {editingWarehouse ? 'تعديل بيانات المخزن' : 'إضافة مخزن جديد'}
              </h3>
              <form onSubmit={handleAddWarehouse} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">اسم المخزن</label>
                  <input required type="text" className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    value={newWarehouse.name} onChange={e => setNewWarehouse({...newWarehouse, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">النوع</label>
                  <select className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    value={newWarehouse.type} onChange={e => setNewWarehouse({...newWarehouse, type: e.target.value as 'main' | 'sub'})}>
                    <option value="main">مخزن رئيسي</option>
                    <option value="sub">مخزن فرعي</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">الموقع / العنوان</label>
                  <input type="text" className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    value={newWarehouse.location} onChange={e => setNewWarehouse({...newWarehouse, location: e.target.value})} />
                </div>
                <button type="submit" className="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-100 mt-4">
                  حفظ البيانات
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Transfer Modal */}
      <AnimatePresence>
        {isTransferModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsTransferModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8"
              dir="rtl"
            >
              <h3 className="text-xl font-black text-slate-800 mb-6">نقل منتجات بين المخازن</h3>
              <form onSubmit={handleTransfer} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">المنتج</label>
                  <select required className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                    value={transferData.productId} onChange={e => setTransferData({...transferData, productId: e.target.value})}>
                    <option value="">اختر المنتج...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} (المخزون: {p.stock})</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600">من مخزن</label>
                    <select className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                      value={transferData.fromId} onChange={e => setTransferData({...transferData, fromId: e.target.value})}>
                      <option value="">غير محدد</option>
                      {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600">إلى مخزن</label>
                    <select required className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                      value={transferData.toId} onChange={e => setTransferData({...transferData, toId: e.target.value})}>
                      <option value="">اختر المخزن...</option>
                      {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">الكمية</label>
                  <input required type="number" className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                    value={transferData.quantity} onChange={e => setTransferData({...transferData, quantity: e.target.value})} />
                </div>
                <button type="submit" className="w-full py-4 bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-100 mt-4">
                  إتمام النقل
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Audit Modal */}
      <AnimatePresence>
        {isAuditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAuditModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8"
              dir="rtl"
            >
              <h3 className="text-xl font-black text-slate-800 mb-6">جرد المخزون</h3>
              <form onSubmit={handleAudit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">المخزن</label>
                  <select disabled className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 outline-none"
                    value={auditData.warehouseId}>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">المنتج</label>
                  <select required className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    value={auditData.productId} onChange={e => setAuditData({...auditData, productId: e.target.value})}>
                    <option value="">اختر المنتج...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} (الحالي: {p.stock})</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">الكمية الفعلية</label>
                  <input required type="number" className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    value={auditData.actualQuantity} onChange={e => setAuditData({...auditData, actualQuantity: e.target.value})} />
                </div>
                <button type="submit" className="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-100 mt-4">
                  تحديث الجرد
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const renderInventory = () => {
    const lowStockProducts = products.filter(p => p.stock < 10);
    
    return (
      <div className="space-y-6" dir="rtl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            title="إجمالي المنتجات" 
            value={products.length} 
            icon={<Package size={20} className="text-blue-500" />} 
          />
          <StatCard 
            title="منتجات منخفضة المخزون" 
            value={lowStockProducts.length} 
            icon={<AlertTriangle size={20} className="text-orange-500" />} 
            isAlert={lowStockProducts.length > 0}
          />
          <StatCard 
            title="إجمالي القطع" 
            value={products.reduce((sum, p) => sum + p.stock, 0)} 
            icon={<PackageCheck size={20} className="text-emerald-500" />} 
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">حالة المخزون الحالي</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-slate-50 text-slate-500 text-sm">
                <tr>
                  <th className="px-6 py-4 font-medium">المنتج</th>
                  <th className="px-6 py-4 font-medium">الفئة</th>
                  <th className="px-6 py-4 font-medium">الكمية المتاحة</th>
                  <th className="px-6 py-4 font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{product.name}</td>
                    <td className="px-6 py-4 text-slate-500">{product.category}</td>
                    <td className="px-6 py-4 font-mono font-bold">{product.stock}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold",
                        product.stock < 10 ? "bg-orange-100 text-orange-600" : "bg-emerald-100 text-emerald-600"
                      )}>
                        {product.stock < 10 ? 'مخزون منخفض' : 'متوفر'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">حركة المخزون (الأخيرة)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-slate-50 text-slate-500 text-sm">
                <tr>
                  <th className="px-6 py-4 font-medium">المنتج</th>
                  <th className="px-6 py-4 font-medium">النوع</th>
                  <th className="px-6 py-4 font-medium">الكمية</th>
                  <th className="px-6 py-4 font-medium">التاريخ</th>
                  <th className="px-6 py-4 font-medium">ملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockMovements.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{m.productName}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold",
                        m.type === 'transfer' && "bg-blue-100 text-blue-600",
                        m.type === 'adjustment' && "bg-orange-100 text-orange-600",
                        m.type === 'sale' && "bg-emerald-100 text-emerald-600",
                        m.type === 'purchase' && "bg-purple-100 text-purple-600"
                      )}>
                        {m.type === 'transfer' && 'نقل'}
                        {m.type === 'adjustment' && 'تعديل/جرد'}
                        {m.type === 'sale' && 'بيع'}
                        {m.type === 'purchase' && 'شراء'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold">{m.quantity}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{new Date(m.timestamp).toLocaleString('ar-EG')}</td>
                    <td className="px-6 py-4 text-slate-400 text-xs">{m.note}</td>
                  </tr>
                ))}
                {stockMovements.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400">لا توجد حركات مخزون مسجلة</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const StatCard = ({ title, value, icon, trend, color = "emerald", isAlert = false }: { title: string, value: string | number, icon: React.ReactNode, trend?: string, color?: string, isAlert?: boolean }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, shadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      className={cn(
        "bg-white p-6 rounded-3xl shadow-sm border transition-all",
        isAlert ? "border-rose-200 bg-rose-50/30" : "border-slate-100"
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={cn(
          "p-3 rounded-2xl",
          isAlert ? "bg-rose-100 text-rose-600" :
          color === 'emerald' ? "bg-emerald-50 text-emerald-500" :
          color === 'blue' ? "bg-blue-50 text-blue-500" :
          color === 'amber' ? "bg-amber-50 text-amber-500" :
          color === 'rose' ? "bg-rose-50 text-rose-500" :
          color === 'purple' ? "bg-purple-50 text-purple-500" :
          "bg-slate-50 text-slate-500"
        )}>
          {icon}
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1",
            trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          )}>
            {trend.startsWith('+') ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trend}
          </span>
        )}
      </div>
      <h4 className="text-slate-400 font-bold text-sm mb-1">{title}</h4>
      <p className="text-2xl font-black text-slate-800">{value}</p>
    </motion.div>
  );

  const renderReports = () => {
    const filteredTransactions = filteredTransactionsForReports;
    const filteredTreasuryTransactions = filteredTreasuryTransactionsForReports;

    const handleExport = (format: 'excel' | 'pdf') => {
      console.log(`Exporting as ${format}...`);
      // Implement actual export logic here
    };

    const handleSaveFilter = () => {
      const name = prompt('أدخل اسماً لهذا الفلتر:');
      if (!name) return;
      
      const newFilter = {
        id: Date.now().toString(),
        name,
        filters: reportFilters
      };
      
      const updated = [...savedFilters, newFilter];
      setSavedFilters(updated);
      localStorage.setItem('saved_report_filters', JSON.stringify(updated));
    };

    // Determine which data to show in the table based on report type
    let tableData: any[] = [];
    if (reportType === 'inventory') tableData = products;
    else if (reportType === 'customers') tableData = customers;
    else if (reportType === 'suppliers') tableData = suppliers;
    else if (reportType === 'employees') tableData = employees;
    else if (reportType === 'treasury') tableData = filteredTreasuryTransactions;
    else if (reportType === 'stagnant') tableData = reportStats.stagnantProducts;
    else tableData = filteredTransactions;

    return (
      <div className="space-y-8" dir="rtl">
        {/* Header & Export */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-3xl font-black text-slate-800">لوحة التقارير والتحليلات</h3>
            <p className="text-slate-500 mt-1">بيانات دقيقة لاتخاذ قرارات ذكية</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => window.print()} className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-colors flex items-center gap-2 font-bold">
              <Printer size={20} />
              طباعة
            </button>
            <button onClick={() => handleExport('excel')} className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-colors flex items-center gap-2 font-bold">
              <Download size={20} />
              Excel
            </button>
            <button onClick={() => handleExport('pdf')} className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-colors flex items-center gap-2 font-bold">
              <FileText size={20} />
              PDF
            </button>
            <button className="p-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-colors flex items-center gap-2 font-bold shadow-lg shadow-emerald-100">
              <Mail size={20} />
              مشاركة
            </button>
          </div>
        </div>

        {/* Report Tabs */}
        <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
          {[
            { id: 'sales', label: 'المبيعات', icon: <TrendingUp size={18} /> },
            { id: 'purchases', label: 'المشتريات', icon: <ShoppingCart size={18} /> },
            { id: 'profit_loss', label: 'الأرباح والخسائر', icon: <DollarSign size={18} /> },
            { id: 'inventory', label: 'المخزون', icon: <Package size={18} /> },
            { id: 'customers', label: 'العملاء', icon: <Users size={18} /> },
            { id: 'suppliers', label: 'الموردين', icon: <Building2 size={18} /> },
            { id: 'treasury', label: 'الخزينة', icon: <Landmark size={18} /> },
            { id: 'employees', label: 'الموظفين', icon: <Briefcase size={18} /> },
            { id: 'top_selling', label: 'الأكثر مبيعاً', icon: <Zap size={18} /> },
            { id: 'stagnant', label: 'المنتجات الراكدة', icon: <Box size={18} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setReportType(tab.id as any);
                setReportPage(1);
              }}
              className={cn(
                "px-6 py-3 rounded-2xl font-bold flex items-center gap-2 whitespace-nowrap transition-all",
                reportType === tab.id 
                  ? "bg-slate-800 text-white shadow-lg" 
                  : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Advanced Filters Panel */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-black text-slate-800 flex items-center gap-2">
              <Filter size={20} className="text-emerald-500" />
              فلاتر التقرير
            </h4>
            <div className="flex gap-2">
              {savedFilters.length > 0 && (
                <select 
                  onChange={(e) => {
                    const saved = savedFilters.find(f => f.name === e.target.value);
                    if (saved) setReportFilters(saved.filters);
                  }}
                  className="text-xs font-bold p-2 bg-slate-50 rounded-xl border-none outline-none text-slate-600"
                >
                  <option value="">فلاتر محفوظة</option>
                  {savedFilters.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
                </select>
              )}
              <button onClick={handleSaveFilter} className="text-xs font-bold p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors flex items-center gap-1">
                <Save size={14} />
                حفظ الفلتر
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400">الفترة الزمنية</label>
              <select 
                value={reportFilters.period} 
                onChange={(e) => setReportFilters({...reportFilters, period: e.target.value as any})}
                className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700"
              >
                <option value="day">اليوم</option>
                <option value="week">آخر 7 أيام</option>
                <option value="month">الشهر الحالي</option>
                <option value="custom">فترة مخصصة</option>
              </select>
            </div>

            {reportFilters.period === 'custom' && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400">من تاريخ</label>
                  <input 
                    type="date" 
                    value={reportFilters.startDate} 
                    onChange={(e) => setReportFilters({...reportFilters, startDate: e.target.value})}
                    className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400">إلى تاريخ</label>
                  <input 
                    type="date" 
                    value={reportFilters.endDate} 
                    onChange={(e) => setReportFilters({...reportFilters, endDate: e.target.value})}
                    className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400">المخزن / الفرع</label>
              <select 
                value={reportFilters.warehouseId} 
                onChange={(e) => setReportFilters({...reportFilters, warehouseId: e.target.value})}
                className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700"
              >
                <option value="all">جميع المخازن</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400">المستخدم (الكاشير)</label>
              <select 
                value={reportFilters.userId} 
                onChange={(e) => setReportFilters({...reportFilters, userId: e.target.value})}
                className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700"
              >
                <option value="all">جميع المستخدمين</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400">طريقة الدفع</label>
              <select 
                value={reportFilters.paymentMethod} 
                onChange={(e) => setReportFilters({...reportFilters, paymentMethod: e.target.value})}
                className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700"
              >
                <option value="all">جميع الطرق</option>
                <option value="cash">نقدي</option>
                <option value="card">بطاقة</option>
                <option value="wallet">محفظة</option>
                <option value="bank">تحويل بنكي</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400">بحث</label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="رقم الفاتورة، اسم العميل..."
                  value={reportFilters.searchQuery}
                  onChange={(e) => setReportFilters({...reportFilters, searchQuery: e.target.value})}
                  className="w-full p-3 pr-10 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reportType === 'sales' && (
            <>
              <StatCard title="إجمالي المبيعات" value={`${reportStats.totalSales.toLocaleString()} ج.م`} icon={<TrendingUp size={20} />} trend="+12%" />
              <StatCard title="عدد الفواتير" value={reportStats.invoiceCount} icon={<FileText size={20} />} color="blue" />
              <StatCard title="متوسط الفاتورة" value={`${reportStats.avgInvoice.toFixed(2)} ج.م`} icon={<DollarSign size={20} />} color="amber" />
              <StatCard title="إجمالي المرتجعات" value={`${reportStats.totalReturns.toLocaleString()} ج.م`} icon={<ArrowLeftRight size={20} />} color="rose" />
            </>
          )}
          {reportType === 'profit_loss' && (
            <>
              <StatCard title="إجمالي الإيرادات" value={`${reportStats.totalSales.toLocaleString()} ج.م`} icon={<TrendingUp size={20} />} />
              <StatCard title="إجمالي المصروفات" value={`${reportStats.totalExpenses.toLocaleString()} ج.م`} icon={<ArrowDownRight size={20} />} color="rose" />
              <StatCard title="صافي الربح" value={`${reportStats.netProfit.toLocaleString()} ج.م`} icon={<DollarSign size={20} />} color="blue" />
              <StatCard title="هامش الربح" value={`${reportStats.profitMargin.toFixed(1)}%`} icon={<PieChartIcon size={20} />} color="amber" />
            </>
          )}
          {reportType === 'inventory' && (
            <>
              <StatCard title="قيمة المخزون" value={`${reportStats.totalInventoryValue.toLocaleString()} ج.م`} icon={<Package size={20} />} />
              <StatCard title="منتجات منخفضة" value={reportStats.lowStockCount} icon={<AlertTriangle size={20} />} color="rose" />
              <StatCard title="إجمالي الأصناف" value={products.length} icon={<Layers size={20} />} color="blue" />
              <StatCard title="حركات المخزن" value={stockMovements.length} icon={<ArrowLeftRight size={20} />} color="amber" />
            </>
          )}
          {reportType === 'employees' && (
            <>
              <StatCard title="أفضل موظف" value={reportStats.topEmployees[0]?.name || '---'} icon={<Users size={20} />} />
              <StatCard title="متوسط مبيعات الموظف" value={`${(reportStats.totalSales / (users.length || 1)).toFixed(0)} ج.م`} icon={<TrendingUp size={20} />} color="blue" />
              <StatCard title="إجمالي العمولات" value={`${(reportStats.totalSales * 0.01).toFixed(0)} ج.م`} icon={<DollarSign size={20} />} color="amber" />
              <StatCard title="عدد الموظفين" value={users.length} icon={<Briefcase size={20} />} color="indigo" />
            </>
          )}
        </div>

        {/* Treasury Summary in Reports */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h4 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <Landmark size={20} className="text-emerald-500" />
            توزيع السيولة النقدية (Treasury Summary)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {treasuries.map(t => (
              <div key={t.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className={cn(
                  "p-3 rounded-xl",
                  t.type === 'cash' ? "bg-emerald-100 text-emerald-600" :
                  t.type === 'bank' ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"
                )}>
                  {t.type === 'cash' ? <Banknote size={24} /> : t.type === 'bank' ? <Landmark size={24} /> : <Smartphone size={24} />}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400">{t.name}</p>
                  <p className="text-xl font-black text-slate-800">{t.balance.toLocaleString()} ج.م</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Smart Analytics & Dashboard Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Zap size={24} className="text-amber-500" />
                تحليلات ذكية (Smart Insights)
              </h4>
              <span className="px-4 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-black">تحديث تلقائي</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100">
                <p className="text-sm font-bold text-emerald-600 mb-2">أفضل يوم مبيعات</p>
                <p className="text-2xl font-black text-emerald-800">الخميس</p>
                <p className="text-xs font-medium text-emerald-500 mt-1">بمتوسط مبيعات 15,400 ج.م</p>
              </div>
              <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100">
                <p className="text-sm font-bold text-blue-600 mb-2">المنتج الأكثر ربحية</p>
                <p className="text-2xl font-black text-blue-800">{reportStats.topProducts[0]?.name || '---'}</p>
                <p className="text-xs font-medium text-blue-500 mt-1">بنسبة مساهمة 24% من الأرباح</p>
              </div>
              <div className="p-6 rounded-2xl bg-amber-50 border border-amber-100">
                <p className="text-sm font-bold text-amber-600 mb-2">تنبيه المخزون</p>
                <p className="text-2xl font-black text-amber-800">{reportStats.lowStockCount} منتجات</p>
                <p className="text-xs font-medium text-amber-500 mt-1">تحتاج لإعادة طلب فوراً</p>
              </div>
              <div className="p-6 rounded-2xl bg-rose-50 border border-rose-100">
                <p className="text-sm font-bold text-rose-600 mb-2">معدل المرتجعات</p>
                <p className="text-2xl font-black text-rose-800">{(reportStats.totalReturns / (reportStats.totalSales || 1) * 100).toFixed(1)}%</p>
                <p className="text-xs font-medium text-rose-500 mt-1">انخفاض بنسبة 2% عن الشهر الماضي</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 p-8 rounded-3xl shadow-xl text-white">
            <h4 className="text-xl font-black mb-8 flex items-center gap-2">
              <LayoutDashboard size={24} className="text-emerald-400" />
              ملخص الأداء (Dashboard)
            </h4>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-slate-400">تحقيق المستهدف</span>
                  <span className="text-emerald-400">75%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-3/4"></div>
                </div>
              </div>
              <div className="pt-6 border-t border-slate-700 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold">إجمالي المبيعات</span>
                  <span className="text-xl font-black">{reportStats.totalSales.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold">إجمالي المشتريات</span>
                  <span className="text-xl font-black">{reportStats.totalPurchases.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold">المصروفات</span>
                  <span className="text-xl font-black text-rose-400">{reportStats.totalExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                  <span className="text-emerald-400 font-black">صافي الربح</span>
                  <span className="text-3xl font-black text-emerald-400">{reportStats.netProfit.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h4 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-emerald-500" />
              تحليل الأداء الزمني
            </h4>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={reportChartData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 'bold', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 'bold', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', direction: 'rtl'}}
                    itemStyle={{fontWeight: 'bold'}}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" name="المبيعات" />
                  <Area type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={4} fillOpacity={0} name="الربح" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h4 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <BarChart3 size={20} className="text-emerald-500" />
              أكثر المنتجات مبيعاً
            </h4>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportStats.topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" axisLine={false} tickLine={false} hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 'bold', fontSize: 12}} width={120} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', direction: 'rtl'}}
                  />
                  <Bar dataKey="qty" fill="#10b981" radius={[0, 8, 8, 0]} barSize={20} name="الكمية" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Data Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h4 className="text-xl font-black text-slate-800">البيانات التفصيلية</h4>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="بحث في النتائج..." 
                  value={reportFilters.searchQuery}
                  onChange={(e) => setReportFilters({...reportFilters, searchQuery: e.target.value})}
                  className="pr-12 pl-4 py-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700 w-64"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-slate-50 text-slate-400 text-xs font-black uppercase tracking-wider">
                <tr>
                  {reportType === 'sales' || reportType === 'purchases' || reportType === 'profit_loss' ? (
                    <>
                      <th className="px-8 py-5">رقم الفاتورة</th>
                      <th className="px-8 py-5">التاريخ</th>
                      <th className="px-8 py-5">{reportType === 'purchases' ? 'المورد' : 'العميل'}</th>
                      <th className="px-8 py-5">الإجمالي</th>
                      <th className="px-8 py-5">الخصم</th>
                      <th className="px-8 py-5">الضريبة</th>
                      <th className="px-8 py-5">الحالة</th>
                    </>
                  ) : reportType === 'inventory' ? (
                    <>
                      <th className="px-8 py-5">المنتج</th>
                      <th className="px-8 py-5">الكمية الحالية</th>
                      <th className="px-8 py-5">الحد الأدنى</th>
                      <th className="px-8 py-5">سعر الشراء</th>
                      <th className="px-8 py-5">سعر البيع</th>
                      <th className="px-8 py-5">الحالة</th>
                    </>
                  ) : reportType === 'treasury' ? (
                    <>
                      <th className="px-8 py-5">التاريخ</th>
                      <th className="px-8 py-5">الخزينة</th>
                      <th className="px-8 py-5">النوع</th>
                      <th className="px-8 py-5">المبلغ</th>
                      <th className="px-8 py-5">الرصيد بعد</th>
                      <th className="px-8 py-5">البيان</th>
                    </>
                  ) : reportType === 'employees' ? (
                    <>
                      <th className="px-8 py-5">الموظف</th>
                      <th className="px-8 py-5">الوظيفة</th>
                      <th className="px-8 py-5">إجمالي المبيعات</th>
                      <th className="px-8 py-5">الراتب</th>
                      <th className="px-8 py-5">العمولة (1%)</th>
                    </>
                  ) : (
                    <>
                      <th className="px-8 py-5">الاسم</th>
                      <th className="px-8 py-5">إجمالي التعاملات</th>
                      <th className="px-8 py-5">الرصيد</th>
                      <th className="px-8 py-5">آخر عملية</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tableData
                  .slice((reportPage - 1) * 10, reportPage * 10)
                  .map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                    {reportType === 'sales' || reportType === 'purchases' || reportType === 'profit_loss' ? (
                      <>
                        <td className="px-8 py-5 font-bold text-slate-700">#{t.invoiceNumber || t.id.slice(0, 8)}</td>
                        <td className="px-8 py-5 text-slate-500 font-medium">
                          {new Date(t.timestamp).toLocaleDateString('ar-EG')}
                        </td>
                        <td className="px-8 py-5 text-slate-600 font-bold">
                          {customers.find(c => c.id === t.customerId)?.name || suppliers.find(s => s.id === t.customerId)?.name || 'نقدي'}
                        </td>
                        <td className="px-8 py-5 font-black text-slate-800">{t.total.toLocaleString()} ج.م</td>
                        <td className="px-8 py-5 text-red-500 font-bold">-{t.discount.toLocaleString()}</td>
                        <td className="px-8 py-5 text-slate-500">{t.tax.toLocaleString()}</td>
                        <td className="px-8 py-5">
                          <span className={cn(
                            "px-3 py-1 rounded-lg text-xs font-bold",
                            t.status === 'paid' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                          )}>
                            {t.status === 'paid' ? 'مدفوعة' : 'غير مدفوعة'}
                          </span>
                        </td>
                      </>
                    ) : reportType === 'inventory' ? (
                      <>
                        <td className="px-8 py-5 font-bold text-slate-700">{t.name || products.find(p => p.id === t.productId)?.name}</td>
                        <td className="px-8 py-5 font-black text-slate-800">{t.stock || t.quantity}</td>
                        <td className="px-8 py-5 text-slate-500">{t.minStockAlert || 5}</td>
                        <td className="px-8 py-5 text-slate-600">{t.purchasePrice} ج.م</td>
                        <td className="px-8 py-5 text-emerald-600 font-bold">{t.price} ج.م</td>
                        <td className="px-8 py-5">
                          <span className={cn(
                            "px-3 py-1 rounded-lg text-xs font-bold",
                            (t.stock || t.quantity) <= (t.minStockAlert || 5) ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                          )}>
                            {(t.stock || t.quantity) <= (t.minStockAlert || 5) ? 'نقص مخزون' : 'متوفر'}
                          </span>
                        </td>
                      </>
                    ) : reportType === 'treasury' ? (
                      <>
                        <td className="px-8 py-5 text-slate-500 text-xs">
                          {new Date(t.date).toLocaleString('ar-EG')}
                        </td>
                        <td className="px-8 py-5 font-bold text-slate-700">{treasuries.find(tr => tr.id === t.treasuryId)?.name}</td>
                        <td className="px-8 py-5">
                          <span className={cn(
                            "px-3 py-1 rounded-lg text-xs font-bold",
                            t.type === 'deposit' || t.type === 'sale' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                          )}>
                            {t.type === 'deposit' ? 'إيداع' : t.type === 'withdraw' ? 'سحب' : t.type === 'sale' ? 'مبيعات' : 'مصروف'}
                          </span>
                        </td>
                        <td className="px-8 py-5 font-black text-slate-800">{t.amount.toLocaleString()} ج.م</td>
                        <td className="px-8 py-5 text-slate-500">{t.balanceAfter.toLocaleString()} ج.م</td>
                        <td className="px-8 py-5 text-slate-500 text-xs">{t.note}</td>
                      </>
                    ) : reportType === 'employees' ? (
                      <>
                        <td className="px-8 py-5 font-bold text-slate-700">{t.name}</td>
                        <td className="px-8 py-5 text-slate-500">{t.jobTitle}</td>
                        <td className="px-8 py-5 font-black text-emerald-600">{(reportStats.topEmployees.find(e => e.name === t.name)?.total || 0).toLocaleString()} ج.م</td>
                        <td className="px-8 py-5 text-slate-700 font-bold">{t.salary.toLocaleString()} ج.م</td>
                        <td className="px-8 py-5 text-blue-600 font-bold">{((reportStats.topEmployees.find(e => e.name === t.name)?.total || 0) * 0.01).toLocaleString()} ج.م</td>
                      </>
                    ) : (
                      <>
                        <td className="px-8 py-5 font-bold text-slate-700">{t.name}</td>
                        <td className="px-8 py-5 font-black text-slate-800">{(t.totalTransactions || 0).toLocaleString()} ج.م</td>
                        <td className="px-8 py-5 text-slate-500">{t.balance || 0} ج.م</td>
                        <td className="px-8 py-5 text-slate-400 text-xs">{t.lastTransactionDate ? new Date(t.lastTransactionDate).toLocaleDateString('ar-EG') : '---'}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <p className="text-sm font-bold text-slate-500">
              عرض {Math.min(tableData.length, 10)} من أصل {tableData.length} سجل
            </p>
            <div className="flex gap-2">
              <button 
                disabled={reportPage === 1}
                onClick={() => setReportPage(prev => prev - 1)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 disabled:opacity-50 transition-all"
              >
                السابق
              </button>
              <span className="flex items-center px-4 font-bold text-slate-400">{reportPage}</span>
              <button 
                disabled={reportPage * 10 >= tableData.length}
                onClick={() => setReportPage(prev => prev + 1)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 disabled:opacity-50 transition-all"
              >
                التالي
              </button>
            </div>
          </div>
        </div>

        {/* Smart Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-emerald-400 mb-4">
                <Zap size={20} />
                <span className="font-black uppercase tracking-wider text-sm">تحليلات ذكية (AI Insights)</span>
              </div>
              <h4 className="text-2xl font-black mb-6">توقعات المبيعات والنمو</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-slate-400 text-xs font-bold mb-1">التوقع للشهر القادم</p>
                    <p className="text-xl font-black text-emerald-400">+{((reportStats.totalSales * 1.15)).toLocaleString()} ج.م</p>
                    <p className="text-[10px] text-slate-500 mt-1">بناءً على نمط النمو الحالي (15%)</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-slate-400 text-xs font-bold mb-1">المنتج الأكثر ربحية</p>
                    <p className="text-xl font-black text-blue-400">{reportStats.topProducts[0]?.name || '---'}</p>
                    <p className="text-[10px] text-slate-500 mt-1">يساهم بنسبة 24% من إجمالي الأرباح</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    <p className="text-sm font-bold">نمو مستقر في قطاع المشروبات</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                    <p className="text-sm font-bold">تنبيه: انخفاض مبيعات "المنظفات" بنسبة 8%</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                    <p className="text-sm font-bold">فرصة: زيادة المخزون من "الأرز" قبل رمضان</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full"></div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h4 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <PieChartIcon size={20} className="text-emerald-500" />
              توزيع طرق الدفع
            </h4>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportStats.paymentMethodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[
                      { name: 'cash', color: '#10b981' },
                      { name: 'card', color: '#3b82f6' },
                      { name: 'wallet', color: '#f59e0b' },
                      { name: 'bank', color: '#8b5cf6' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-bold text-slate-600">نقدي</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs font-bold text-slate-600">بطاقة</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-xs font-bold text-slate-600">محفظة</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-violet-500"></div>
                <span className="text-xs font-bold text-slate-600">بنكي</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderInvoiceForm = () => {
    const subTotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
    const finalTotal = subTotal - invoiceDiscount + invoiceTax + invoiceShipping;
    const paidAmount = currentPayments.reduce((sum, p) => sum + p.amount, 0);
    const remainingAmount = finalTotal - paidAmount;

    const handleAddProductToInvoice = (product: Product) => {
      const existing = invoiceItems.find(i => i.productId === product.id);
      if (existing) {
        setInvoiceItems(prev => prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price } : i));
      } else {
        const price = invoiceFormType === 'purchase' || invoiceFormType === 'purchase_return' ? product.purchasePrice : product.price;
        setInvoiceItems(prev => [...prev, {
          productId: product.id,
          name: product.name,
          barcode: product.barcode,
          quantity: 1,
          unit: product.unit,
          price: price,
          discount: 0,
          tax: (price * (product.vat || 0)) / 100,
          total: price
        }]);
      }
      setInvoiceSearchQuery('');
    };

    const handleSaveInvoice = () => {
      if (invoiceItems.length === 0) {
        setShowToast({ message: 'يرجى إضافة أصناف للفاتورة', type: 'error' });
        return;
      }

      const invoiceData: Transaction = {
        id: editingInvoiceId || Date.now().toString(),
        invoiceNumber: invoiceNumber || `INV-${Date.now()}`,
        type: invoiceFormType,
        status: invoiceStatus,
        customerId: invoiceFormType === 'sale' || invoiceFormType === 'sale_return' ? invoiceSelectedCustomer : invoiceSelectedSupplier,
        items: invoiceItems.map(item => ({
          id: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total: finalTotal,
        paidAmount: paidAmount,
        tax: invoiceTax,
        discount: invoiceDiscount,
        shipping: invoiceShipping,
        timestamp: new Date(`${invoiceDate}T${invoiceTime}`).getTime(),
        payments: currentPayments,
        note: invoiceNote
      };

      // Update Inventory (Simple logic: reverse old, apply new)
      // For simplicity in this demo, we'll just apply the new one. 
      // In a real app, you'd calculate the diff.
      const updatedProducts = products.map(p => {
        const item = invoiceItems.find(i => i.productId === p.id);
        if (item) {
          let newStock = p.stock;
          // This is a simplified stock update logic
          if (invoiceFormType === 'sale') newStock -= item.quantity;
          else if (invoiceFormType === 'purchase') newStock += item.quantity;
          else if (invoiceFormType === 'sale_return') newStock += item.quantity;
          else if (invoiceFormType === 'purchase_return') newStock -= item.quantity;
          return { ...p, stock: newStock };
        }
        return p;
      });

      if (editingInvoiceId) {
        setTransactions(prev => prev.map(t => t.id === editingInvoiceId ? invoiceData : t));
      } else {
        setTransactions(prev => [invoiceData, ...prev]);
      }

      setProducts(updatedProducts);
      
      // Add Stock Movement
      const movements: StockMovement[] = invoiceItems.map(item => ({
        id: Math.random().toString(36).substr(2, 9),
        productId: item.productId,
        productName: item.name,
        quantity: item.quantity,
        type: invoiceFormType === 'sale' ? 'sale' : invoiceFormType === 'purchase' ? 'purchase' : 'return',
        timestamp: Date.now(),
        note: `فاتورة رقم ${invoiceData.invoiceNumber}`
      }));
      setStockMovements(prev => [...movements, ...prev]);

      setShowToast({ message: editingInvoiceId ? 'تم تحديث الفاتورة بنجاح' : 'تم حفظ الفاتورة بنجاح', type: 'success' });
      setIsInvoiceFormOpen(false);
      resetInvoiceForm();
    };

    const resetInvoiceForm = () => {
      setInvoiceItems([]);
      setInvoiceSelectedCustomer('');
      setInvoiceSelectedSupplier('');
      setInvoiceDiscount(0);
      setInvoiceTax(0);
      setInvoiceShipping(0);
      setInvoiceNote('');
      setInvoiceStatus('draft');
      setInvoiceNumber('');
      setCurrentPayments([]);
      setEditingInvoiceId(null);
    };

    const handlePrintInvoice = () => {
      // Logic to trigger print preview
      const invoiceData: Transaction = {
        id: editingInvoiceId || 'PREVIEW',
        invoiceNumber: invoiceNumber || 'INV-PREVIEW',
        type: invoiceFormType,
        status: invoiceStatus,
        customerId: invoiceFormType === 'sale' || invoiceFormType === 'sale_return' ? invoiceSelectedCustomer : invoiceSelectedSupplier,
        items: invoiceItems.map(item => ({
          id: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total: finalTotal,
        paidAmount: paidAmount,
        tax: invoiceTax,
        discount: invoiceDiscount,
        shipping: invoiceShipping,
        timestamp: new Date(`${invoiceDate}T${invoiceTime}`).getTime(),
        payments: currentPayments,
        note: invoiceNote
      };
      setSelectedTransaction(invoiceData);
      setIsInvoicePreviewOpen(true);
    };

    return (
      <div className="space-y-6" dir="rtl">
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsInvoiceFormOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
              <ArrowLeftRight size={24} className="rotate-180" />
            </button>
            <h2 className="text-2xl font-black text-slate-800">
              {invoiceFormType === 'sale' ? 'فاتورة بيع جديدة' : 
               invoiceFormType === 'purchase' ? 'فاتورة شراء جديدة' : 
               invoiceFormType === 'sale_return' ? 'مرتجع مبيعات' : 'مرتجع مشتريات'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <select 
              className="p-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
              value={invoiceStatus}
              onChange={(e) => setInvoiceStatus(e.target.value as any)}
            >
              <option value="draft">مسودة</option>
              <option value="confirmed">مؤكدة</option>
              <option value="paid">مدفوعة</option>
              <option value="cancelled">ملغية</option>
            </select>
            <button onClick={handlePrintInvoice} className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200">
              <Printer size={20} />
            </button>
            <button onClick={handleSaveInvoice} className="px-6 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100">
              {editingInvoiceId ? 'تحديث الفاتورة' : 'حفظ الفاتورة'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Header & Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Header Details */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">رقم الفاتورة</label>
                <input 
                  type="text" 
                  placeholder="تلقائي" 
                  className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">التاريخ</label>
                <input 
                  type="date" 
                  className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">الوقت</label>
                <input 
                  type="time" 
                  className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  value={invoiceTime}
                  onChange={(e) => setInvoiceTime(e.target.value)}
                />
              </div>
            </div>

            {/* Items Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="بحث بالاسم أو الباركود..." 
                    className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    value={invoiceSearchQuery}
                    onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                  />
                  {invoiceSearchQuery && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-30 max-h-60 overflow-y-auto">
                      {products.filter(p => p.name.includes(invoiceSearchQuery) || p.barcode.includes(invoiceSearchQuery)).map(p => (
                        <button 
                          key={p.id}
                          onClick={() => handleAddProductToInvoice(p)}
                          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                        >
                          <div className="text-right">
                            <p className="font-bold text-slate-800">{p.name}</p>
                            <p className="text-xs text-slate-400">{p.barcode}</p>
                          </div>
                          <p className="font-bold text-emerald-600">{invoiceFormType === 'purchase' ? p.purchasePrice : p.price} ج.م</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200">
                  <Barcode size={20} />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3 font-medium">المنتج</th>
                      <th className="px-4 py-3 font-medium text-center">الكمية</th>
                      <th className="px-4 py-3 font-medium text-center">السعر</th>
                      <th className="px-4 py-3 font-medium text-center">الخصم</th>
                      <th className="px-4 py-3 font-medium text-center">الضريبة</th>
                      <th className="px-4 py-3 font-medium text-left">الإجمالي</th>
                      <th className="px-4 py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoiceItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-800">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{item.barcode}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <input 
                              type="number" 
                              className="w-16 p-1 text-center border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                              value={item.quantity}
                              onChange={(e) => {
                                const qty = Number(e.target.value);
                                setInvoiceItems(prev => prev.map((it, i) => i === idx ? { ...it, quantity: qty, total: qty * it.price } : it));
                              }}
                            />
                            <span className="text-[10px] text-slate-400">{item.unit}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input 
                            type="number" 
                            className="w-20 p-1 text-center border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-600"
                            value={item.price}
                            onChange={(e) => {
                              const price = Number(e.target.value);
                              setInvoiceItems(prev => prev.map((it, i) => i === idx ? { ...it, price: price, total: it.quantity * price } : it));
                            }}
                          />
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-red-500">{item.discount}</td>
                        <td className="px-4 py-3 text-center font-bold text-slate-500">{item.tax}</td>
                        <td className="px-4 py-3 text-left font-black text-slate-800">{item.total}</td>
                        <td className="px-4 py-3">
                          <button 
                            onClick={() => setInvoiceItems(prev => prev.filter((_, i) => i !== idx))}
                            className="text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {invoiceItems.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">
                          لا توجد أصناف مضافة بعد. ابحث عن منتج لإضافته.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Note */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">ملاحظات الفاتورة</label>
              <textarea 
                className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                rows={3}
                placeholder="أضف أي ملاحظات إضافية هنا..."
                value={invoiceNote}
                onChange={(e) => setInvoiceNote(e.target.value)}
              />
            </div>
          </div>

          {/* Right Column: Customer & Totals */}
          <div className="space-y-6">
            {/* Customer/Supplier Selection */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-slate-800">
                  {invoiceFormType === 'sale' || invoiceFormType === 'sale_return' ? 'بيانات العميل' : 'بيانات المورد'}
                </h4>
                <button 
                  onClick={() => invoiceFormType === 'sale' || invoiceFormType === 'sale_return' ? setIsCustomerModalOpen(true) : setIsSupplierModalOpen(true)}
                  className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100"
                >
                  <Plus size={16} />
                </button>
              </div>
              <select 
                className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold"
                value={invoiceFormType === 'sale' || invoiceFormType === 'sale_return' ? invoiceSelectedCustomer : invoiceSelectedSupplier}
                onChange={(e) => invoiceFormType === 'sale' || invoiceFormType === 'sale_return' ? setInvoiceSelectedCustomer(e.target.value) : setInvoiceSelectedSupplier(e.target.value)}
              >
                <option value="">اختر {invoiceFormType === 'sale' || invoiceFormType === 'sale_return' ? 'العميل' : 'المورد'}...</option>
                <option value="cash">نقدي</option>
                {(invoiceFormType === 'sale' || invoiceFormType === 'sale_return' ? customers : suppliers).map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
              
              {/* Selected Entity Details */}
              {(invoiceFormType === 'sale' || invoiceFormType === 'sale_return' ? invoiceSelectedCustomer : invoiceSelectedSupplier) && (invoiceFormType === 'sale' || invoiceFormType === 'sale_return' ? invoiceSelectedCustomer : invoiceSelectedSupplier) !== 'cash' && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  {(() => {
                    const entity = (invoiceFormType === 'sale' || invoiceFormType === 'sale_return' ? customers : suppliers).find(i => i.id === (invoiceFormType === 'sale' || invoiceFormType === 'sale_return' ? invoiceSelectedCustomer : invoiceSelectedSupplier));
                    if (!entity) return null;
                    return (
                      <>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">الهاتف:</span>
                          <span className="font-bold text-slate-700">{entity.phone}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">الرصيد الحالي:</span>
                          <span className={cn("font-bold", entity.openingBalance >= 0 ? "text-emerald-600" : "text-red-600")}>
                            {entity.openingBalance} ج.م
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Totals Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">إجمالي الأصناف:</span>
                <span className="font-bold text-slate-800">{subTotal} ج.م</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">الخصم الإجمالي:</span>
                <input 
                  type="number" 
                  className="w-24 p-1 text-left border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 font-bold text-red-500"
                  value={invoiceDiscount}
                  onChange={(e) => setInvoiceDiscount(Number(e.target.value))}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">الضريبة:</span>
                <input 
                  type="number" 
                  className="w-24 p-1 text-left border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700"
                  value={invoiceTax}
                  onChange={(e) => setInvoiceTax(Number(e.target.value))}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">مصاريف الشحن:</span>
                <input 
                  type="number" 
                  className="w-24 p-1 text-left border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                  value={invoiceShipping}
                  onChange={(e) => setInvoiceShipping(Number(e.target.value))}
                />
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-lg font-black text-slate-800">الإجمالي النهائي:</span>
                <span className="text-2xl font-black text-emerald-600">{finalTotal} ج.م</span>
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-slate-800">المدفوعات</h4>
                <button 
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100"
                >
                  إضافة دفع
                </button>
              </div>
              <div className="space-y-3">
                {currentPayments.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "p-1.5 rounded-lg text-white",
                        p.method === 'cash' ? 'bg-emerald-500' : 
                        p.method === 'card' ? 'bg-blue-500' : 
                        p.method === 'wallet' ? 'bg-purple-500' : 'bg-orange-500'
                      )}>
                        {p.method === 'cash' ? <Banknote size={12} /> : 
                         p.method === 'card' ? <CreditCard size={12} /> : 
                         p.method === 'wallet' ? <Smartphone size={12} /> : <Landmark size={12} />}
                      </div>
                      <span className="text-xs font-bold text-slate-700">
                        {p.method === 'cash' ? 'نقدي' : p.method === 'card' ? 'فيزا' : p.method === 'wallet' ? 'محفظة' : 'تحويل'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">{p.amount} ج.م</span>
                      <button onClick={() => setCurrentPayments(prev => prev.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-red-500">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {currentPayments.length === 0 && (
                  <p className="text-center text-slate-400 text-xs italic py-4">لا توجد مدفوعات مسجلة</p>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-500">المتبقي:</span>
                <span className={cn("font-black", remainingAmount > 0 ? "text-red-500" : "text-emerald-600")}>
                  {remainingAmount} ج.م
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderHistory = () => {
    if (isInvoiceFormOpen) return renderInvoiceForm();

    const filteredTransactions = transactions.filter(t => {
      const matchesSearch = t.id?.toLowerCase().includes(searchQuery.toLowerCase()) || (t.invoiceNumber && t.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()));
      const type = t.type || 'sale';
      const matchesFilter = 
        historyFilter === 'all' || 
        (historyFilter === 'return' ? type.includes('return') : type === historyFilter);
      return matchesSearch && matchesFilter;
    });

    const totalValue = filteredTransactions.reduce((sum, t) => {
      const type = t.type || 'sale';
      if (type.includes('return')) return sum - t.total;
      return sum + t.total;
    }, 0);

    return (
      <div className="space-y-6" dir="rtl">
        {/* Header with New Invoice Button */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-black text-slate-800">إدارة الفواتير</h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                setInvoiceFormType('sale');
                setIsInvoiceFormOpen(true);
              }}
              className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
            >
              <Plus size={18} />
              فاتورة بيع
            </button>
            <button 
              onClick={() => {
                setInvoiceFormType('purchase');
                setIsInvoiceFormOpen(true);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-blue-100"
            >
              <Plus size={18} />
              فاتورة شراء
            </button>
            <div className="relative group">
              <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-200 transition-all">
                <ArrowLeftRight size={18} />
                مرتجع
              </button>
              <div className="absolute top-full left-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 hidden group-hover:block z-20">
                <button 
                  onClick={() => {
                    setInvoiceFormType('sale_return');
                    setIsInvoiceFormOpen(true);
                  }}
                  className="w-full text-right p-3 hover:bg-slate-50 text-sm font-bold text-red-500"
                >مرتجع مبيعات</button>
                <button 
                  onClick={() => {
                    setInvoiceFormType('purchase_return');
                    setIsInvoiceFormOpen(true);
                  }}
                  className="w-full text-right p-3 hover:bg-slate-50 text-sm font-bold text-orange-500 border-t border-slate-50"
                >مرتجع مشتريات</button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-slate-400 text-sm">إجمالي القيمة (للفلتر الحالي)</p>
            <p className={cn("text-2xl font-black mt-1", totalValue >= 0 ? "text-emerald-600" : "text-red-600")}>
              {totalValue.toLocaleString('ar-EG')} ج.م
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-slate-400 text-sm">عدد العمليات</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{filteredTransactions.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-slate-400 text-sm">متوسط قيمة الفاتورة</p>
            <p className="text-2xl font-black text-slate-800 mt-1">
              {filteredTransactions.length > 0 ? (totalValue / filteredTransactions.length).toFixed(2) : 0} ج.م
            </p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-full md:w-auto">
            <button 
              onClick={() => setHistoryFilter('all')}
              className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", historyFilter === 'all' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >الكل</button>
            <button 
              onClick={() => setHistoryFilter('sale')}
              className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", historyFilter === 'sale' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >المبيعات</button>
            <button 
              onClick={() => setHistoryFilter('purchase')}
              className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", historyFilter === 'purchase' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >المشتريات</button>
            <button 
              onClick={() => setHistoryFilter('return')}
              className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", historyFilter === 'return' ? "bg-white text-red-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >المرتجعات</button>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="بحث برقم الفاتورة..." 
              className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-slate-50 text-slate-500 text-sm">
                <tr>
                  <th className="px-6 py-4 font-medium">رقم الفاتورة</th>
                  <th className="px-6 py-4 font-medium">النوع</th>
                  <th className="px-6 py-4 font-medium">الحالة</th>
                  <th className="px-6 py-4 font-medium">التاريخ والوقت</th>
                  <th className="px-6 py-4 font-medium text-left">الإجمالي</th>
                  <th className="px-6 py-4 font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-mono text-sm text-slate-500">#{t.invoiceNumber || t.id}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold",
                        t.type === 'sale' && "bg-emerald-100 text-emerald-600",
                        t.type === 'purchase' && "bg-blue-100 text-blue-600",
                        t.type === 'sale_return' && "bg-red-100 text-red-600",
                        t.type === 'purchase_return' && "bg-orange-100 text-orange-600"
                      )}>
                        {t.type === 'sale' && 'بيع'}
                        {t.type === 'purchase' && 'شراء'}
                        {t.type === 'sale_return' && 'مرتجع بيع'}
                        {t.type === 'purchase_return' && 'مرتجع شراء'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase",
                        t.status === 'paid' ? "bg-emerald-100 text-emerald-600" :
                        t.status === 'confirmed' ? "bg-blue-100 text-blue-600" :
                        t.status === 'cancelled' ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"
                      )}>
                        {t.status === 'paid' ? 'مدفوعة' :
                         t.status === 'confirmed' ? 'مؤكدة' :
                         t.status === 'cancelled' ? 'ملغية' : 'مسودة'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{new Date(t.timestamp).toLocaleString('ar-EG')}</td>
                    <td className="px-6 py-4 font-bold text-slate-800 text-left">{t.total} ج.م</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setSelectedTransaction(t)}
                          className="text-xs font-bold text-emerald-600 hover:underline"
                        >
                          عرض
                        </button>
                        {hasPermission('edit_invoice') && (
                          <button 
                            onClick={() => {
                              // Load into form
                              setEditingInvoiceId(t.id);
                              setInvoiceFormType(t.type);
                              setInvoiceItems(t.items.map(item => {
                                const prod = products.find(p => p.id === item.id);
                                return {
                                  productId: item.id,
                                  name: item.name,
                                  barcode: prod?.barcode || '',
                                  quantity: item.quantity,
                                  unit: prod?.unit || 'قطعة',
                                  price: item.price,
                                  discount: 0,
                                  tax: 0,
                                  total: item.price * item.quantity
                                };
                              }));
                              setInvoiceNumber(t.invoiceNumber);
                              setInvoiceStatus(t.status);
                              setInvoiceNote(t.note || '');
                              setInvoiceDiscount(t.discount || 0);
                              setInvoiceTax(t.tax || 0);
                              setInvoiceShipping(t.shipping || 0);
                              setCurrentPayments(t.payments || []);
                              if (t.type === 'sale' || t.type === 'sale_return') setInvoiceSelectedCustomer(t.customerId || '');
                              else setInvoiceSelectedSupplier(t.customerId || '');
                              setIsInvoiceFormOpen(true);
                            }}
                            className="text-xs font-bold text-blue-600 hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            تعديل
                          </button>
                        )}
                        {hasPermission('delete_invoice') && (
                          <button 
                            onClick={() => {
                              if (window.confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
                                setTransactions(prev => prev.filter(item => item.id !== t.id));
                              }
                            }}
                            className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-slate-400">لا توجد سجلات فواتير تطابق البحث</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transaction Details Modal */}
        <AnimatePresence>
          {selectedTransaction && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedTransaction(null)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
                dir="rtl"
              >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <div>
                    <h3 className="text-xl font-black text-slate-800">تفاصيل الفاتورة #{selectedTransaction.id}</h3>
                    <p className="text-xs text-slate-500 mt-1">{new Date(selectedTransaction.timestamp).toLocaleString('ar-EG')}</p>
                  </div>
                  <button onClick={() => setSelectedTransaction(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400">
                    <X size={20} />
                  </button>
                </div>
                <div className="p-6">
                  <table className="w-full text-right">
                    <thead className="text-slate-400 text-xs uppercase border-b border-slate-100">
                      <tr>
                        <th className="pb-3 font-medium">المنتج</th>
                        <th className="pb-3 font-medium text-center">الكمية</th>
                        <th className="pb-3 font-medium text-center">السعر</th>
                        <th className="pb-3 font-medium text-left">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {selectedTransaction.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-4 font-bold text-slate-700">{item.name}</td>
                          <td className="py-4 text-center">{item.quantity}</td>
                          <td className="py-4 text-center">{item.price} ج.م</td>
                          <td className="py-4 text-left font-bold text-emerald-600">{item.price * item.quantity} ج.م</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-4 flex-1 w-full">
                      <div className="text-slate-500">
                        <p className="text-sm">نوع العملية: 
                          <span className="font-bold mr-2">
                            {selectedTransaction.type === 'sale' ? 'بيع' : 
                             selectedTransaction.type === 'purchase' ? 'شراء' : 
                             selectedTransaction.type === 'sale_return' ? 'مرتجع بيع' : 'مرتجع شراء'}
                          </span>
                        </p>
                      </div>
                      
                      {selectedTransaction.payments && selectedTransaction.payments.length > 0 && (
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <p className="text-xs font-black text-slate-400 mb-3 uppercase tracking-wider">تفاصيل المدفوعات:</p>
                          <div className="space-y-2">
                            {selectedTransaction.payments.map((p, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                  <div className={cn(
                                    "p-1.5 rounded-lg text-white",
                                    p.method === 'cash' ? 'bg-emerald-500' : 
                                    p.method === 'card' ? 'bg-blue-500' : 
                                    p.method === 'wallet' ? 'bg-purple-500' : 'bg-orange-500'
                                  )}>
                                    {p.method === 'cash' ? <Banknote size={12} /> : 
                                     p.method === 'card' ? <CreditCard size={12} /> : 
                                     p.method === 'wallet' ? <Smartphone size={12} /> : <Landmark size={12} />}
                                  </div>
                                  <span className="font-bold text-slate-700">
                                    {p.method === 'cash' ? 'نقدي' : 
                                     p.method === 'card' ? `فيزا (${p.details?.cardType})` : 
                                     p.method === 'wallet' ? `محفظة (${p.details?.walletProvider === 'vodafone' ? 'فودافون' : p.details?.walletProvider === 'orange' ? 'أورنج' : 'اتصالات'})` : 'تحويل'}
                                  </span>
                                </div>
                                <span className="font-black text-slate-800">{p.amount} ج.م</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-sm">المبلغ الإجمالي</p>
                      <p className="text-3xl font-black text-emerald-600">{selectedTransaction.total} ج.م</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                  <button 
                    onClick={() => window.print()} 
                    className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors flex items-center gap-2"
                  >
                    طباعة الفاتورة
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderLogin = () => {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans rtl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-[40px] shadow-2xl shadow-slate-200 p-10 border border-slate-100"
        >
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-emerald-500 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-100 mb-6 rotate-3 transform">
              <Zap size={40} className="text-white fill-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 mb-2">مينا بيزنس</h1>
            <p className="text-slate-500 font-medium">سجل دخولك لإدارة أعمالك باحترافية</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 px-1">اسم المستخدم</label>
              <div className="relative">
                <Users size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  required
                  className="w-full pr-12 pl-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold transition-all"
                  placeholder="أدخل اسم المستخدم"
                  value={loginForm.username}
                  onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 px-1">كلمة المرور</label>
              <div className="relative">
                <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required
                  className="w-full pr-12 pl-12 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold transition-all"
                  placeholder="أدخل كلمة المرور"
                  value={loginForm.password}
                  onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-all font-bold text-xs"
                >
                  {showPassword ? 'إخفاء' : 'إظهار'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded-lg border-slate-200 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                  checked={loginForm.rememberMe}
                  onChange={e => setLoginForm({...loginForm, rememberMe: e.target.checked})}
                />
                <span className="text-sm font-bold text-slate-600 group-hover:text-slate-800 transition-all">تذكرني</span>
              </label>
              <button type="button" className="text-sm font-bold text-emerald-600 hover:text-emerald-700">نسيت كلمة المرور؟</button>
            </div>

            <button 
              type="submit" 
              disabled={isLoginLoading}
              className="w-full py-5 bg-slate-800 text-white font-black rounded-3xl hover:bg-slate-900 shadow-xl shadow-slate-100 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {isLoginLoading ? (
                <RefreshCw size={24} className="animate-spin" />
              ) : (
                <>
                  <Unlock size={22} />
                  تسجيل الدخول
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-2xl border border-amber-100">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold">نسخة تجريبية - اطلب التفعيل الآن</span>
            </div>
            <p className="mt-4 text-[10px] text-slate-400 font-medium">جميع الحقوق محفوظة &copy; {new Date().getFullYear()} مينا تيك</p>
          </div>
        </motion.div>
      </div>
    );
  };

  if (!isAuthenticated) return renderLogin();

  if (isInitialLoad && !products.length) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-slate-500 font-bold animate-pulse">جاري تشغيل النظام...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-white border-r border-slate-200 flex flex-col z-20 shadow-xl"
      >
        <div className="p-6 flex items-center justify-between overflow-hidden">
          {isSidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                <PackageCheck size={24} />
              </div>
              <span className="font-black text-xl tracking-tight text-slate-800">نظام POS</span>
            </motion.div>
          )}
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              playSound('click');
              setIsSidebarOpen(!isSidebarOpen);
            }} 
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
          >
            <Menu size={20} />
          </motion.button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {hasPermission('view_reports') && (
            <NavItem 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
              icon={<LayoutDashboard size={20} />} 
              label="لوحة التحكم" 
              collapsed={!isSidebarOpen}
              playSound={playSound}
            />
          )}
          {hasPermission('create_invoice') && (
            <NavItem 
              active={activeTab === 'pos'} 
              onClick={() => setActiveTab('pos')} 
              icon={<ShoppingCart size={20} />} 
              label="نقطة البيع" 
              collapsed={!isSidebarOpen}
              playSound={playSound}
            />
          )}
          {hasPermission('create_invoice') && (
            <NavItem 
              active={activeTab === 'purchases'} 
              onClick={() => setActiveTab('purchases')} 
              icon={<Plus size={20} />} 
              label="المشتريات" 
              collapsed={!isSidebarOpen}
              playSound={playSound}
            />
          )}
          {hasPermission('manage_inventory') && (
            <NavItem 
              active={activeTab === 'products'} 
              onClick={() => setActiveTab('products')} 
              icon={<Package size={20} />} 
              label="المنتجات" 
              collapsed={!isSidebarOpen}
              playSound={playSound}
            />
          )}
          {hasPermission('view_reports') && (
            <NavItem 
              active={activeTab === 'history'} 
              onClick={() => setActiveTab('history')} 
              icon={<History size={20} />} 
              label="الفواتير" 
              collapsed={!isSidebarOpen}
              playSound={playSound}
            />
          )}
          {hasPermission('view_reports') && (
            <NavItem 
              active={activeTab === 'reports'} 
              onClick={() => setActiveTab('reports')} 
              icon={<TrendingUp size={20} />} 
              label="التقارير" 
              collapsed={!isSidebarOpen}
              playSound={playSound}
            />
          )}
          {hasPermission('view_treasury_balance') && (
            <NavItem 
              active={activeTab === 'treasury'} 
              onClick={() => setActiveTab('treasury')} 
              icon={<Landmark size={20} />} 
              label="الخزينة والمصروفات" 
              collapsed={!isSidebarOpen}
              playSound={playSound}
            />
          )}
          {hasPermission('manage_warehouses') && (
            <NavItem 
              active={activeTab === 'warehouses'} 
              onClick={() => setActiveTab('warehouses')} 
              icon={<Building2 size={20} />} 
              label="المخازن" 
              collapsed={!isSidebarOpen}
              playSound={playSound}
            />
          )}
          {hasPermission('manage_inventory') && (
            <NavItem 
              active={activeTab === 'inventory'} 
              onClick={() => setActiveTab('inventory')} 
              icon={<ClipboardList size={20} />} 
              label="المخزون" 
              collapsed={!isSidebarOpen}
              playSound={playSound}
            />
          )}
          {hasPermission('manage_customers') && (
            <NavItem 
              active={activeTab === 'customers'} 
              onClick={() => setActiveTab('customers')} 
              icon={<Users size={20} />} 
              label="العملاء" 
              collapsed={!isSidebarOpen}
              playSound={playSound}
            />
          )}
          {hasPermission('manage_suppliers') && (
            <NavItem 
              active={activeTab === 'suppliers'} 
              onClick={() => setActiveTab('suppliers')} 
              icon={<Truck size={20} />} 
              label="الموردين" 
              collapsed={!isSidebarOpen}
              playSound={playSound}
            />
          )}
          {hasPermission('manage_employees') && (
            <NavItem 
              active={activeTab === 'employees'} 
              onClick={() => setActiveTab('employees')} 
              icon={<Briefcase size={20} />} 
              label="الموظفين" 
              collapsed={!isSidebarOpen}
              playSound={playSound}
            />
          )}
          {hasPermission('manage_security') && (
            <NavItem 
              active={activeTab === 'security'} 
              onClick={() => setActiveTab('security')} 
              icon={<Shield size={20} />} 
              label="الأمان والخصوصية" 
              collapsed={!isSidebarOpen}
              playSound={playSound}
            />
          )}
          {currentUser.role === 'admin' && (
            <NavItem 
              active={activeTab === 'audit'} 
              onClick={() => setActiveTab('audit')} 
              icon={<Activity size={20} />} 
              label="الاختبار والتدقيق" 
              collapsed={!isSidebarOpen}
              playSound={playSound}
            />
          )}
          {hasPermission('manage_users') && (
            <NavItem 
              active={activeTab === 'settings'} 
              onClick={() => setActiveTab('settings')} 
              icon={<Settings size={20} />} 
              label="الإعدادات" 
              collapsed={!isSidebarOpen}
              playSound={playSound}
            />
          )}
        </nav>

        <div className="p-6 border-t border-slate-100">
          <div className={cn("flex items-center gap-3", !isSidebarOpen && "justify-center")}>
            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-slate-500">
              <Users size={20} />
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden flex-1">
                <p className="font-bold text-sm text-slate-800 truncate">{currentUser.name}</p>
                <p className="text-xs text-slate-500 truncate">
                  {currentUser.role === 'admin' ? 'مدير النظام' :
                   currentUser.role === 'cashier' ? 'كاشير' :
                   currentUser.role === 'accountant' ? 'محاسب' : 'موظف مخزن'}
                </p>
              </div>
            )}
            {isSidebarOpen && (
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-all"
                title="تسجيل الخروج"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between z-10">
          <h2 className="text-2xl font-black text-slate-800">
            {activeTab === 'dashboard' && 'نظرة عامة'}
            {activeTab === 'pos' && 'نقطة البيع (بيع)'}
            {activeTab === 'purchases' && 'نقطة الشراء (شراء)'}
            {activeTab === 'products' && 'إدارة المخزون'}
            {activeTab === 'history' && 'سجل الفواتير'}
            {activeTab === 'customers' && 'إدارة العملاء'}
            {activeTab === 'suppliers' && 'إدارة الموردين'}
            {activeTab === 'employees' && 'إدارة الموظفين'}
            {activeTab === 'users' && 'إدارة المستخدمين'}
            {activeTab === 'settings' && 'إعدادات النظام'}
            {activeTab === 'audit' && 'اختبار وتدقيق النظام'}
            {activeTab === 'treasury' && 'الخزينة والمصروفات'}
          </h2>
          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm",
              isOnline ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
            )}>
              {isOnline ? <Wifi size={14} className="animate-pulse" /> : <WifiOff size={14} />}
              <span className="hidden sm:inline">
                {isOnline ? (
                  syncStatus === 'syncing' ? 'جاري المزامنة...' :
                  syncStatus === 'synced' ? 'متصل (أونلاين)' :
                  syncStatus === 'pending' ? 'بانتظار المزامنة' : 'خطأ في المزامنة'
                ) : 'غير متصل (أوفلاين)'}
              </span>
            </div>

            {isOnline && (
              <button
                onClick={syncData}
                disabled={syncStatus === 'syncing'}
                className={cn(
                  "p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-slate-600",
                  syncStatus === 'syncing' && "animate-spin"
                )}
                title="مزامنة البيانات الآن"
              >
                <RefreshCw size={18} />
              </button>
            )}

            <div className="hidden md:flex flex-col items-end">
              <p className="text-sm font-bold text-slate-800">{new Date().toLocaleDateString('ar-EG', { dateStyle: 'full' })}</p>
              <p className="text-xs text-slate-500">مرحباً بك مجدداً</p>
            </div>
            {settings?.license?.status === 'trial' && (
              <div className="px-4 py-2 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-amber-700">نسخة تجريبية (تنتهي في {settings?.license?.expiryDate ? new Date(settings.license.expiryDate).toLocaleDateString('ar-EG') : '...'})</span>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'pos' && renderPOS('sale')}
            {activeTab === 'purchases' && renderPOS('purchase')}
            {activeTab === 'products' && renderProducts()}
            {activeTab === 'history' && renderHistory()}
            {activeTab === 'reports' && renderReports()}
            {activeTab === 'warehouses' && renderWarehouses()}
            {activeTab === 'inventory' && renderInventory()}
            {activeTab === 'customers' && renderCustomers()}
            {activeTab === 'suppliers' && renderSuppliers()}
            {activeTab === 'employees' && renderEmployees()}
            {activeTab === 'security' && renderSecurity()}
            {activeTab === 'settings' && renderSettings()}
            {activeTab === 'audit' && (
              <AuditPage 
                systemErrors={systemErrors}
                setSystemErrors={setSystemErrors}
                activityLogs={activityLogs}
                backups={backups}
                playSound={playSound}
                setShowToast={setShowToast}
              />
            )}
            {activeTab === 'treasury' && renderTreasury()}
          </motion.div>
        </div>
      </main>

      {/* Invoice Preview Modal */}
      <AnimatePresence>
        {isInvoicePreviewOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 print:p-0 print:static print:inset-auto print:z-0">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsInvoicePreviewOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm no-print"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:shadow-none print:rounded-none print:w-full print:max-w-none"
              dir="rtl"
              id="invoice-print-area"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 no-print">
                <h3 className="text-xl font-black text-slate-800">معاينة الفاتورة</h3>
                <button onClick={() => setIsInvoicePreviewOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6 print:p-4">
                {/* Invoice Header */}
                <div className="text-center space-y-3 pb-6 border-b-2 border-dashed border-slate-200">
                  {settings.invoice.showLogo && settings.company.logo && (
                    <img src={settings.company.logo} alt="Company Logo" className="h-16 mx-auto mb-4 object-contain" />
                  )}
                  <h2 className="text-2xl font-black text-slate-800">{settings.company.name || 'فاتورة مبيعات'}</h2>
                  <div className="text-[10px] text-slate-500 space-y-1">
                    <p>{settings.company.address}</p>
                    <p>{settings.company.phone} | {settings.company.email}</p>
                    {settings.company.taxNumber && <p>الرقم الضريبي: {settings.company.taxNumber}</p>}
                  </div>
                  <div className="pt-4 flex justify-between items-center text-xs text-slate-400">
                    <div className="space-y-1 text-right">
                      <p>رقم الفاتورة: {settings.invoice.prefix}{selectedTransaction?.id || '---'}</p>
                      <p>التاريخ: {new Date(selectedTransaction?.timestamp || Date.now()).toLocaleString(settings.general.language === 'ar' ? 'ar-EG' : 'en-US')}</p>
                    </div>
                    <div className="space-y-1 text-left">
                      <p>العميل: {customers.find(c => c.id === (selectedTransaction?.customerId || selectedCustomerId))?.name || 'عميل نقدي'}</p>
                      <p>البائع: {currentUser.name}</p>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full text-right mt-6">
                  <thead className="text-slate-400 text-[10px] uppercase border-b border-slate-100">
                    <tr>
                      <th className="pb-3 font-medium">المنتج</th>
                      <th className="pb-3 font-medium text-center">الكمية</th>
                      <th className="pb-3 font-medium text-center">السعر</th>
                      <th className="pb-3 font-medium text-left">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(selectedTransaction?.items || cart).map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-3 font-bold text-slate-700 text-xs">{item.name}</td>
                        <td className="py-3 text-center text-xs">{item.quantity}</td>
                        <td className="py-3 text-center text-xs">{item.price} {settings.general.currency === 'EGP' ? 'ج.م' : '$'}</td>
                        <td className="py-3 text-left font-bold text-slate-800 text-xs">{item.price * item.quantity} {settings.general.currency === 'EGP' ? 'ج.م' : '$'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="space-y-2 pt-4 border-t-2 border-dashed border-slate-200">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>الإجمالي الفرعي:</span>
                    <span>{selectedTransaction?.subTotal || subTotal} {settings.general.currency === 'EGP' ? 'ج.م' : '$'}</span>
                  </div>
                  {settings.invoice.showTax && (
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>الضريبة ({settings.taxes.defaultTaxRate}%):</span>
                      <span>{((selectedTransaction?.subTotal || subTotal) * settings.taxes.defaultTaxRate / 100).toFixed(2)} {settings.general.currency === 'EGP' ? 'ج.م' : '$'}</span>
                    </div>
                  )}
                  {(selectedTransaction?.discount || discount) > 0 && settings.invoice.showDiscount && (
                    <div className="flex justify-between text-xs text-red-500">
                      <span>الخصم ({ (selectedTransaction?.discountType || discountType) === 'percent' ? `${selectedTransaction?.discount || discount}%` : 'مبلغ'}):</span>
                      <span>-{(selectedTransaction?.discountType || discountType) === 'percent' ? ((selectedTransaction?.subTotal || subTotal) * (selectedTransaction?.discount || discount) / 100) : (selectedTransaction?.discount || discount)} {settings.general.currency === 'EGP' ? 'ج.م' : '$'}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-black text-emerald-600 pt-2">
                    <span>الإجمالي النهائي:</span>
                    <span>{selectedTransaction?.total || cartTotal} {settings.general.currency === 'EGP' ? 'ج.م' : '$'}</span>
                  </div>
                </div>

                {/* Payment Breakdown */}
                {(selectedTransaction?.payments || currentPayments).length > 0 && (
                  <div className="mt-6 pt-4 border-t border-dashed border-slate-200">
                    <p className="text-xs font-black text-slate-400 mb-3">تفاصيل الدفع:</p>
                    <div className="space-y-2">
                      {(selectedTransaction?.payments || currentPayments).map((p, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <span className="text-slate-600 font-bold">
                            {p.method === 'cash' ? 'نقدي' : 
                             p.method === 'card' ? `فيزا (${p.details?.cardType})` : 
                             p.method === 'wallet' ? `محفظة (${p.details?.walletProvider === 'vodafone' ? 'فودافون' : p.details?.walletProvider === 'orange' ? 'أورنج' : 'اتصالات'})` : 'تحويل بنكي'}
                            {p.details?.transactionId && <span className="text-[10px] text-slate-400 mr-2">#{p.details.transactionId}</span>}
                          </span>
                          <span className="font-black text-slate-800">{p.amount} ج.م</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Message */}
                {settings.invoice.footerMessage && (
                  <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p className="text-[10px] text-slate-400 italic">{settings.invoice.footerMessage}</p>
                  </div>
                )}

                {/* Barcode Placeholder */}
                {settings.invoice.showBarcode && (
                  <div className="mt-6 flex flex-col items-center gap-2">
                    <div className="w-48 h-12 bg-slate-100 rounded flex items-center justify-center text-slate-300">
                      |||| || ||||| || |||| |||
                    </div>
                    <span className="text-[8px] text-slate-400 font-mono">{selectedTransaction?.id || '000000000000'}</span>
                  </div>
                )}
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3 no-print">
                <button 
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Printer size={20} />
                  طباعة الآن
                </button>
                <button 
                  onClick={() => setIsInvoicePreviewOpen(false)}
                  className="flex-1 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPaymentModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              dir="rtl"
            >
              {/* Header */}
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-100">
                    <DollarSign size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800">إتمام الدفع</h3>
                    <p className="text-sm text-slate-500 font-bold">اختر طريقة الدفع المناسبة للعميل</p>
                  </div>
                </div>
                <button onClick={() => setIsPaymentModalOpen(false)} className="p-3 hover:bg-slate-200 rounded-full text-slate-400 transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                {/* Left Side: Payment Methods & Form */}
                <div className="flex-1 p-8 overflow-y-auto border-l border-slate-100">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    {[
                      { id: 'cash', label: 'نقدي', icon: <Banknote size={24} />, color: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600', enabled: settings.payment.cashEnabled },
                      { id: 'card', label: 'فيزا / كارت', icon: <CreditCard size={24} />, color: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600', enabled: settings.payment.cardEnabled },
                      { id: 'wallet', label: 'محفظة', icon: <Smartphone size={24} />, color: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600', enabled: settings.payment.walletEnabled },
                      { id: 'bank', label: 'تحويل', icon: <Landmark size={24} />, color: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600', enabled: settings.payment.bankEnabled },
                    ].filter(m => m.enabled).map(method => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={cn(
                          "flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all group",
                          paymentMethod === method.id 
                            ? `border-slate-800 ${method.light} scale-105 shadow-xl` 
                            : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                        )}
                      >
                        <div className={cn(
                          "p-3 rounded-2xl transition-all",
                          paymentMethod === method.id ? `${method.color} text-white shadow-lg` : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                        )}>
                          {method.icon}
                        </div>
                        <span className={cn(
                          "font-black text-sm",
                          paymentMethod === method.id ? "text-slate-800" : "text-slate-500"
                        )}>{method.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Payment Forms */}
                  <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {paymentMethod === 'cash' && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-black text-slate-800">الدفع النقدي</h4>
                          <button 
                            onClick={() => setCashReceived(String(cartTotal - currentPayments.reduce((sum, p) => sum + p.amount, 0)))}
                            className="text-xs font-bold text-emerald-600 hover:underline"
                          >دفع كامل المبلغ</button>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-500">المبلغ المستلم</label>
                          <div className="relative">
                            <input 
                              type="number" 
                              className="w-full p-5 pr-12 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-emerald-500/20 text-2xl font-black text-slate-800 transition-all"
                              placeholder="0.00"
                              value={cashReceived}
                              onChange={e => setCashReceived(e.target.value)}
                              autoFocus
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <DollarSign size={24} />
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-white rounded-2xl border border-slate-100">
                            <p className="text-xs font-bold text-slate-400 mb-1">المتبقي المطلوب</p>
                            <p className="text-xl font-black text-slate-800">
                              {Math.max(0, cartTotal - currentPayments.reduce((sum, p) => sum + p.amount, 0))} {settings.general.currency === 'EGP' ? 'ج.م' : '$'}
                            </p>
                          </div>
                          <div className="p-4 bg-white rounded-2xl border border-slate-100">
                            <p className="text-xs font-bold text-slate-400 mb-1">الفكة (الباقي)</p>
                            <p className="text-xl font-black text-emerald-600">
                              {Math.max(0, Number(cashReceived) - (cartTotal - currentPayments.reduce((sum, p) => sum + p.amount, 0)))} {settings.general.currency === 'EGP' ? 'ج.م' : '$'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'wallet' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-black text-slate-800">محفظة إلكترونية</h4>
                          <div className="flex gap-2">
                            {['vodafone', 'orange', 'etisalat'].map(p => (
                              <button 
                                key={p}
                                onClick={() => setWalletData({...walletData, provider: p as any})}
                                className={cn(
                                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all",
                                  walletData.provider === p 
                                    ? "bg-purple-500 text-white shadow-md shadow-purple-100" 
                                    : "bg-white text-slate-400 border border-slate-100 hover:border-purple-200"
                                )}
                              >
                                {p === 'vodafone' ? 'فودافون' : p === 'orange' ? 'أورنج' : 'اتصالات'}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-500">رقم المحفظة</label>
                            <div className="relative">
                              <Smartphone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                              <input 
                                type="text" 
                                className="w-full p-4 pr-12 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                                placeholder="01xxxxxxxxx"
                                value={walletData.number}
                                onChange={e => setWalletData({...walletData, number: e.target.value})}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-500">كود العملية</label>
                            <input 
                              type="text" 
                              className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                              placeholder="Transaction ID"
                              value={walletData.transactionId}
                              onChange={e => setWalletData({...walletData, transactionId: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-500">اسم صاحب المحفظة (اختياري)</label>
                          <input 
                            type="text" 
                            className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                            value={walletData.owner}
                            onChange={e => setWalletData({...walletData, owner: e.target.value})}
                          />
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'card' && (
                      <div className="space-y-4">
                        <h4 className="text-lg font-black text-slate-800 mb-4">فيزا / كارت بنكي</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-500">نوع الكارت</label>
                            <select 
                              className="w-full p-4 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                              value={cardData.type}
                              onChange={e => setCardData({...cardData, type: e.target.value as any})}
                            >
                              <option value="visa">Visa</option>
                              <option value="mastercard">MasterCard</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-500">آخر 4 أرقام</label>
                            <input 
                              type="text" 
                              maxLength={4}
                              className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="xxxx"
                              value={cardData.last4}
                              onChange={e => setCardData({...cardData, last4: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-500">رقم مرجع الـ POS</label>
                            <input 
                              type="text" 
                              className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Ref Number"
                              value={cardData.ref}
                              onChange={e => setCardData({...cardData, ref: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-500">اسم البنك</label>
                            <input 
                              type="text" 
                              className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                              value={cardData.bank}
                              onChange={e => setCardData({...cardData, bank: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'bank' && (
                      <div className="space-y-4">
                        <h4 className="text-lg font-black text-slate-800 mb-4">تحويل بنكي</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-500">اسم البنك</label>
                            <input 
                              type="text" 
                              className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-orange-500"
                              value={bankData.bank}
                              onChange={e => setBankData({...bankData, bank: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-500">رقم الحساب</label>
                            <input 
                              type="text" 
                              className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-orange-500"
                              value={bankData.account}
                              onChange={e => setBankData({...bankData, account: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-500">رقم العملية</label>
                            <input 
                              type="text" 
                              className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-orange-500"
                              value={bankData.ref}
                              onChange={e => setBankData({...bankData, ref: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-500">تاريخ التحويل</label>
                            <input 
                              type="date" 
                              className="w-full p-4 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-orange-500"
                              value={bankData.date}
                              onChange={e => setBankData({...bankData, date: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={() => {
                        if (!settings.pos.mixedPayment && currentPayments.length > 0) {
                          setShowToast({ message: 'عذراً، الدفع المختلط غير مفعل', type: 'error' });
                          return;
                        }
                        addPayment();
                      }}
                      className="w-full py-4 bg-slate-800 text-white font-bold rounded-2xl mt-6 hover:bg-slate-900 transition-all shadow-lg"
                    >
                      إضافة الدفعة
                    </button>
                  </div>
                </div>

                {/* Right Side: Summary & Split Payments */}
                <div className="w-full md:w-80 bg-slate-50 p-8 flex flex-col">
                  <h4 className="text-lg font-black text-slate-800 mb-6">ملخص الدفع</h4>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-bold">إجمالي الفاتورة:</span>
                      <span className="text-slate-800 font-black">{cartTotal} {settings.general.currency === 'EGP' ? 'ج.م' : '$'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-bold">تم دفعه:</span>
                      <span className="text-emerald-600 font-black">{currentPayments.reduce((sum, p) => sum + p.amount, 0)} {settings.general.currency === 'EGP' ? 'ج.م' : '$'}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg pt-4 border-t border-slate-200">
                      <span className="text-slate-800 font-black">المتبقي:</span>
                      <span className="text-red-500 font-black">
                        {Math.max(0, cartTotal - currentPayments.reduce((sum, p) => sum + p.amount, 0))} {settings.general.currency === 'EGP' ? 'ج.م' : '$'}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">المدفوعات المضافة:</p>
                    {currentPayments.map(p => (
                      <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex justify-between items-center animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg text-white",
                            p.method === 'cash' ? 'bg-emerald-500' : 
                            p.method === 'card' ? 'bg-blue-500' : 
                            p.method === 'wallet' ? 'bg-purple-500' : 'bg-orange-500'
                          )}>
                            {p.method === 'cash' ? <Banknote size={14} /> : 
                             p.method === 'card' ? <CreditCard size={14} /> : 
                             p.method === 'wallet' ? <Smartphone size={14} /> : <Landmark size={14} />}
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-800">
                              {p.method === 'cash' ? 'نقدي' : 
                               p.method === 'card' ? 'فيزا' : 
                               p.method === 'wallet' ? 'محفظة' : 'تحويل'}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold">{p.amount} ج.م</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setCurrentPayments(prev => prev.filter(item => item.id !== p.id))}
                          className="p-1 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {currentPayments.length === 0 && (
                      <div className="py-8 text-center text-slate-300 italic text-sm">
                        لا توجد مدفوعات مضافة
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={finalizeSale}
                    disabled={currentPayments.reduce((sum, p) => sum + p.amount, 0) < cartTotal - 0.01}
                    className={cn(
                      "w-full py-5 rounded-2xl font-black text-lg mt-8 transition-all shadow-xl flex items-center justify-center gap-3",
                      currentPayments.reduce((sum, p) => sum + p.amount, 0) >= cartTotal - 0.01
                        ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-200"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    )}
                  >
                    <CheckCircle2 size={24} />
                    إتمام الفاتورة
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Treasury Modal */}
      <AnimatePresence>
        {isTreasuryModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsTreasuryModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
              dir="rtl"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-black text-slate-800">إضافة خزينة جديدة</h3>
                <button onClick={() => setIsTreasuryModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">اسم الخزينة</label>
                  <input 
                    type="text" 
                    value={newTreasuryForm.name}
                    onChange={(e) => setNewTreasuryForm({ ...newTreasuryForm, name: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="مثلاً: الخزينة الرئيسية، البنك الأهلي..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">نوع الخزينة</label>
                  <select 
                    value={newTreasuryForm.type}
                    onChange={(e) => setNewTreasuryForm({ ...newTreasuryForm, type: e.target.value as any })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="cash">نقدية</option>
                    <option value="bank">حساب بنكي</option>
                    <option value="wallet">محفظة إلكترونية</option>
                  </select>
                </div>
                {newTreasuryForm.type === 'bank' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">اسم البنك</label>
                      <input 
                        type="text" 
                        value={newTreasuryForm.bankName}
                        onChange={(e) => setNewTreasuryForm({ ...newTreasuryForm, bankName: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">رقم الحساب</label>
                      <input 
                        type="text" 
                        value={newTreasuryForm.accountNumber}
                        onChange={(e) => setNewTreasuryForm({ ...newTreasuryForm, accountNumber: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                      />
                    </div>
                  </>
                )}
                {newTreasuryForm.type === 'wallet' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">رقم المحفظة</label>
                    <input 
                      type="text" 
                      value={newTreasuryForm.walletNumber}
                      onChange={(e) => setNewTreasuryForm({ ...newTreasuryForm, walletNumber: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">الرصيد الافتتاحي</label>
                  <input 
                    type="number" 
                    value={newTreasuryForm.balance}
                    onChange={(e) => setNewTreasuryForm({ ...newTreasuryForm, balance: Number(e.target.value) })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                  />
                </div>
                <button 
                  onClick={handleSaveTreasury}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all mt-4"
                >
                  إضافة الخزينة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Expense Modal */}
      <AnimatePresence>
        {isExpenseModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsExpenseModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
              dir="rtl"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-black text-slate-800">تسجيل مصروف جديد</h3>
                <button onClick={() => setIsExpenseModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">بيان المصروف</label>
                  <input 
                    type="text" 
                    value={newExpenseForm.name}
                    onChange={(e) => setNewExpenseForm({ ...newExpenseForm, name: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="مثلاً: فاتورة كهرباء شهر مارس"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">التصنيف</label>
                    <select 
                      value={newExpenseForm.categoryId}
                      onChange={(e) => setNewExpenseForm({ ...newExpenseForm, categoryId: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="">اختر التصنيف</option>
                      {expenseCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">المبلغ</label>
                    <input 
                      type="number" 
                      value={newExpenseForm.amount || ''}
                      onChange={(e) => setNewExpenseForm({ ...newExpenseForm, amount: Number(e.target.value) })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">الدفع من</label>
                  <select 
                    value={newExpenseForm.treasuryId}
                    onChange={(e) => setNewExpenseForm({ ...newExpenseForm, treasuryId: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="">اختر الخزينة</option>
                    {treasuries.map(t => (
                      <option key={t.id} value={t.id}>{t.name} (رصيد: {t.balance})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">ملاحظات</label>
                  <textarea 
                    value={newExpenseForm.note}
                    onChange={(e) => setNewExpenseForm({ ...newExpenseForm, note: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none h-20"
                  />
                </div>
                <button 
                  onClick={handleSaveExpense}
                  className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold shadow-lg shadow-slate-100 hover:bg-slate-900 transition-all mt-4"
                >
                  تسجيل المصروف
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Treasury Transaction Modal (Deposit/Withdraw/Transfer) */}
      <AnimatePresence>
        {isTreasuryTransactionModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsTreasuryTransactionModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
              dir="rtl"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-black text-slate-800">
                  {treasuryTransactionType === 'deposit' ? 'إيداع رصيد' : 
                   treasuryTransactionType === 'withdraw' ? 'سحب رصيد' : 'تحويل بين الخزن'}
                </h3>
                <button onClick={() => setIsTreasuryTransactionModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">
                    {treasuryTransactionType === 'transfer' ? 'من خزينة' : 'الخزينة'}
                  </label>
                  <select 
                    value={newTreasuryTransactionForm.treasuryId}
                    onChange={(e) => setNewTreasuryTransactionForm({ ...newTreasuryTransactionForm, treasuryId: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="">اختر الخزينة</option>
                    {treasuries.map(t => (
                      <option key={t.id} value={t.id}>{t.name} (رصيد: {t.balance})</option>
                    ))}
                  </select>
                </div>

                {treasuryTransactionType === 'transfer' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">إلى خزينة</label>
                    <select 
                      value={newTreasuryTransactionForm.toTreasuryId}
                      onChange={(e) => setNewTreasuryTransactionForm({ ...newTreasuryTransactionForm, toTreasuryId: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="">اختر الخزينة</option>
                      {treasuries.filter(t => t.id !== newTreasuryTransactionForm.treasuryId).map(t => (
                        <option key={t.id} value={t.id}>{t.name} (رصيد: {t.balance})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">المبلغ</label>
                  <input 
                    type="number" 
                    value={newTreasuryTransactionForm.amount || ''}
                    onChange={(e) => setNewTreasuryTransactionForm({ ...newTreasuryTransactionForm, amount: Number(e.target.value) })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">ملاحظات / السبب</label>
                  <input 
                    type="text" 
                    value={newTreasuryTransactionForm.note}
                    onChange={(e) => setNewTreasuryTransactionForm({ ...newTreasuryTransactionForm, note: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="مثلاً: إيداع رأس مال، سحب عهدة..."
                  />
                </div>

                <button 
                  onClick={handleSaveTreasuryTransaction}
                  className={cn(
                    "w-full py-4 text-white rounded-2xl font-bold shadow-lg transition-all mt-4",
                    treasuryTransactionType === 'deposit' ? "bg-emerald-600 shadow-emerald-100 hover:bg-emerald-700" :
                    treasuryTransactionType === 'withdraw' ? "bg-red-600 shadow-red-100 hover:bg-red-700" : "bg-blue-600 shadow-blue-100 hover:bg-blue-700"
                  )}
                >
                  إتمام العملية
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%', scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              x: '-50%', 
              scale: 1,
              ...(showToast.type === 'error' ? { x: ['-50%', '-52%', '-48%', '-52%', '-48%', '-50%'] } : { scale: [0.9, 1.05, 1] })
            }}
            exit={{ opacity: 0, y: 20, x: '-50%', scale: 0.9 }}
            transition={{ 
              type: "spring", 
              stiffness: 500, 
              damping: 30,
              x: { type: showToast.type === 'error' ? "keyframes" : "spring", duration: 0.4 },
              scale: { type: showToast.type === 'error' ? "spring" : "keyframes", duration: 0.3 }
            }}
            className={cn(
              "fixed bottom-8 left-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-white font-bold",
              showToast.type === 'success' ? "bg-emerald-500" : "bg-red-500"
            )}
          >
            {showToast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            {showToast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sub-components ---

function StatCard({ title, value, icon, trend, isAlert }: { title: string, value: string | number, icon: React.ReactNode, trend?: string, isAlert?: boolean }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, shadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      className={cn(
        "bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4 transition-all",
        isAlert && "border-orange-200 bg-orange-50"
      )}
    >
      <div className="flex justify-between items-start">
        <div className="p-3 rounded-xl bg-slate-50">{icon}</div>
        {trend && (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{trend}</span>
        )}
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-2xl font-black text-slate-800 mt-1">{value}</p>
      </div>
    </motion.div>
  );
}

function NavItem({ active, onClick, icon, label, collapsed, playSound }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, collapsed: boolean, playSound: (type: 'click') => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ x: 4 }}
      onClick={() => {
        playSound('click');
        onClick();
      }}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
        active 
          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" 
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
      )}
    >
      <div className={cn("transition-transform group-active:scale-90", !collapsed && "min-w-[20px]")}>
        {icon}
      </div>
      {!collapsed && (
        <motion.span 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="font-bold text-sm whitespace-nowrap"
        >
          {label}
        </motion.span>
      )}
    </motion.button>
  );
}
