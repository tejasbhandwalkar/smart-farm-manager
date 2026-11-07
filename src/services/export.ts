import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { FinanceItem, Worker } from '../types';

export const exportFinanceToExcel = (items: FinanceItem[], filename = 'Farm_Finance_Report.xlsx') => {
  const formattedData = items.map((item, index) => ({
    'Sr No': index + 1,
    'Date': item.date,
    'Type': item.type === 'income' ? 'Income' : 'Expense',
    'Category': item.category,
    'Amount (INR)': item.amount,
    'Payment Mode': item.payment_mode,
    'Linked Crop / Plot': item.crop_name || item.plot_name || '-',
    'Notes': item.notes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Finances');
  XLSX.writeFile(workbook, filename);
};

export const exportWorkersToExcel = (workers: Worker[], filename = 'Farm_Workers_Wage_Sheet.xlsx') => {
  const formattedData = workers.map((w, index) => ({
    'Sr No': index + 1,
    'Worker Name': w.name,
    'Phone': w.phone,
    'Daily Wage (INR)': w.daily_wage,
    'Days Worked': w.total_days_worked || 0,
    'Total Earned (INR)': w.total_earned || 0,
    'Total Advances (INR)': w.total_advances || 0,
    'Net Pending Wages (INR)': w.net_payable || 0,
    'Status': w.is_active ? 'Active' : 'Inactive',
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Workers');
  XLSX.writeFile(workbook, filename);
};

export const exportFinanceToPDF = (items: FinanceItem[], title = 'SMART FARM MANAGER - FINANCIAL STATEMENT') => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.setTextColor(21, 128, 61); // emerald-700
  doc.text(title, 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated on: ${new Date().toLocaleDateString()} | 20-Acre Farm Accounts`, 14, 27);

  // Summary calculations
  const totalIncome = items.filter(i => i.type === 'income').reduce((sum, i) => sum + Number(i.amount), 0);
  const totalExpense = items.filter(i => i.type === 'expense').reduce((sum, i) => sum + Number(i.amount), 0);
  const netProfit = totalIncome - totalExpense;

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`Total Income: Rs. ${totalIncome.toLocaleString('en-IN')}`, 14, 36);
  doc.text(`Total Expenses: Rs. ${totalExpense.toLocaleString('en-IN')}`, 80, 36);
  doc.text(`Net Profit: Rs. ${netProfit.toLocaleString('en-IN')}`, 150, 36);

  // AutoTable
  const tableData = items.map((item, idx) => [
    idx + 1,
    item.date,
    item.type.toUpperCase(),
    item.category.replace('cat_', '').replace(/_/g, ' '),
    `Rs. ${Number(item.amount).toLocaleString('en-IN')}`,
    item.payment_mode,
    item.notes || '-',
  ]);

  autoTable(doc, {
    startY: 42,
    head: [['#', 'Date', 'Type', 'Category', 'Amount', 'Mode', 'Notes']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [21, 128, 61] },
    alternateRowStyles: { fillColor: [240, 253, 244] },
    styles: { fontSize: 9 },
  });

  doc.save('Farm_Financial_Report.pdf');
};
