import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const MONTHS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const getMonthName = (month) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month - 1];
};

/**
 * Generate Salary Slip PDF for Teachers
 */
export const generateSalarySlipPDF = async (payroll, teacher) => {
  const doc = new jsPDF();

  // Colors
  const primaryColor = [41, 128, 185]; // Blue
  const secondaryColor = [52, 73, 94]; // Dark gray
  const greenColor = [39, 174, 96]; // Green
  const redColor = [231, 76, 60]; // Red

  // Header Section
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('EASE ACADEMY', 105, 15, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Salary Slip', 105, 25, { align: 'center' });

  doc.setFontSize(10);
  doc.text(`${getMonthName(payroll.month)} ${payroll.year}`, 105, 32, { align: 'center' });

  // Employee Information Section
  let yPos = 45;

  doc.setTextColor(...secondaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Information', 15, yPos);

  yPos += 8;

  // Employee details table
  const employeeData = [
    ['Employee Name:', `${teacher.firstName} ${teacher.lastName}`],
    ['Employee ID:', teacher.teacherProfile?.employeeId || 'N/A'],
    ['Designation:', teacher.teacherProfile?.designation || 'Teacher'],
    ['Email:', teacher.email],
    ['Phone:', teacher.phone || 'N/A'],
  ];

  doc.autoTable({
    startY: yPos,
    head: [],
    body: employeeData,
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 120 },
    },
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // Salary Breakdown Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Salary Breakdown', 15, yPos);

  yPos += 5;

  // Earnings Table
  const earningsData = [
    ['Basic Salary', '', `PKR ${payroll.basicSalary.toLocaleString()}`],
    ['House Rent Allowance', '', `PKR ${payroll.allowances.houseRent.toLocaleString()}`],
    ['Medical Allowance', '', `PKR ${payroll.allowances.medical.toLocaleString()}`],
    ['Transport Allowance', '', `PKR ${payroll.allowances.transport.toLocaleString()}`],
    ['Other Allowances', '', `PKR ${payroll.allowances.other.toLocaleString()}`],
  ];

  doc.autoTable({
    startY: yPos,
    head: [['Earnings', '', 'Amount']],
    body: earningsData,
    foot: [['Gross Salary', '', `PKR ${payroll.grossSalary.toLocaleString()}`]],
    theme: 'grid',
    headStyles: {
      fillColor: [...primaryColor],
      fontSize: 10,
      fontStyle: 'bold',
    },
    footStyles: {
      fillColor: [...greenColor],
      fontSize: 11,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 30 },
      2: { cellWidth: 60, halign: 'right' },
    },
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // Deductions Table
  const deductionsData = [
    ['Tax', '', `PKR ${payroll.deductions.tax.toLocaleString()}`],
    ['Provident Fund', '', `PKR ${payroll.deductions.providentFund.toLocaleString()}`],
    ['Insurance', '', `PKR ${payroll.deductions.insurance.toLocaleString()}`],
    ['Other Deductions', '', `PKR ${payroll.deductions.other.toLocaleString()}`],
  ];

  // Add attendance deduction if applicable
  if (payroll.attendanceDeduction.calculatedDeduction > 0) {
    deductionsData.push([
      `Absence Deduction (${payroll.attendanceDeduction.absentDays} days)`,
      '',
      `PKR ${payroll.attendanceDeduction.calculatedDeduction.toLocaleString()}`,
    ]);
  }

  doc.autoTable({
    startY: yPos,
    head: [['Deductions', '', 'Amount']],
    body: deductionsData,
    foot: [['Total Deductions', '', `PKR ${payroll.totalDeductions.toLocaleString()}`]],
    theme: 'grid',
    headStyles: {
      fillColor: [...secondaryColor],
      fontSize: 10,
      fontStyle: 'bold',
    },
    footStyles: {
      fillColor: [...redColor],
      fontSize: 11,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 30 },
      2: { cellWidth: 60, halign: 'right' },
    },
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // Attendance Details (if available)
  if (payroll.attendanceDeduction.totalWorkingDays > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...secondaryColor);
    doc.text('Attendance Summary', 15, yPos);

    yPos += 5;

    const attendanceData = [
      ['Total Working Days', payroll.attendanceDeduction.totalWorkingDays.toString()],
      ['Present Days', payroll.attendanceDeduction.presentDays.toString()],
      ['Absent Days', payroll.attendanceDeduction.absentDays.toString()],
      ['Leave Days', payroll.attendanceDeduction.leaveDays.toString()],
    ];

    doc.autoTable({
      startY: yPos,
      body: attendanceData,
      theme: 'striped',
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80 },
        1: { cellWidth: 90 },
      },
    });

    yPos = doc.lastAutoTable.finalY + 10;
  }

  // Net Salary Box
  doc.setFillColor(...greenColor);
  doc.rect(15, yPos, 180, 20, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Net Salary:', 25, yPos + 12);
  doc.setFontSize(16);
  doc.text(`PKR ${payroll.netSalary.toLocaleString()}`, 175, yPos + 12, { align: 'right' });

  yPos += 30;

  // Bank Details (if available)
  if (teacher.teacherProfile?.salaryDetails?.bankAccount) {
    const bankAccount = teacher.teacherProfile.salaryDetails.bankAccount;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...secondaryColor);
    doc.text('Bank Account Details', 15, yPos);

    yPos += 5;

    const bankData = [
      ['Bank Name:', bankAccount.bankName || 'N/A'],
      ['Account Number:', bankAccount.accountNumber || 'N/A'],
      ['IBAN:', bankAccount.iban || 'N/A'],
    ];

    doc.autoTable({
      startY: yPos,
      body: bankData,
      theme: 'plain',
      styles: {
        fontSize: 9,
        cellPadding: 2,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 120 },
      },
    });

    yPos = doc.lastAutoTable.finalY + 10;
  }

  // Remarks (if available)
  if (payroll.remarks) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...secondaryColor);
    doc.text('Remarks:', 15, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const splitRemarks = doc.splitTextToSize(payroll.remarks, 170);
    doc.text(splitRemarks, 15, yPos + 5);
    
    yPos += 5 + (splitRemarks.length * 5) + 5;
  }

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(128, 128, 128);
  doc.text('This is a computer-generated salary slip and does not require a signature.', 105, pageHeight - 20, { align: 'center' });
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, pageHeight - 15, { align: 'center' });
  doc.text('© Ease Academy - School Management System', 105, pageHeight - 10, { align: 'center' });

  // Return PDF as buffer for email attachment
  return Buffer.from(doc.output('arraybuffer'));
};

export const generateFeeVoucherPDF = (voucher) => {
  const doc = new jsPDF();

  // Colors and styling
  const primaryColor = [41, 128, 185]; // Blue
  const secondaryColor = [52, 73, 94]; // Dark gray
  const accentColor = [155, 89, 182]; // Purple

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('EASE ACADEMY', 105, 15, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Fee Voucher', 105, 25, { align: 'center' });

  // Voucher Number Badge
  doc.setFillColor(...accentColor);
  doc.rect(150, 35, 40, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');

  doc.text(`#${voucher.voucherNumber}`, 170, 42, { align: 'center' });

  let yPosition = 55;

  // Student Information Section
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Student Information', 20, yPosition);

  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  // Student details
  const studentName = voucher.studentId?.fullName ||
                     `${voucher.studentId?.firstName || ''} ${voucher.studentId?.lastName || ''}`.trim() ||
                     'Student';
  const registrationNumber = voucher.studentId?.studentProfile?.registrationNumber ||
                            voucher.studentId?.registrationNumber ||
                            'N/A';
  const rollNumber = voucher.studentId?.studentProfile?.rollNumber ||
                    voucher.studentId?.rollNumber ||
                    'N/A';
  const className = voucher.classId?.name || 'N/A';
  const section = voucher.studentId?.studentProfile?.section || 'N/A';

  doc.text(`Name: ${studentName}`, 20, yPosition);
  doc.text(`Registration #: ${registrationNumber}`, 110, yPosition);
  yPosition += 8;

  doc.text(`Roll Number: ${rollNumber}`, 20, yPosition);
  doc.text(`Section: ${section}`, 110, yPosition);
  yPosition += 8;

  doc.text(`Class: ${className}`, 20, yPosition);
  doc.text(`Branch: ${voucher.branchId?.name || 'N/A'}`, 110, yPosition);
  yPosition += 15;

  // Fee Details Section
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Fee Details', 20, yPosition);

  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  doc.text(`Template: ${voucher.templateId?.name || 'N/A'}`, 20, yPosition);
  const monthName = MONTHS.find(m => m.value === voucher.month.toString())?.label || voucher.month;
  doc.text(`Month/Year: ${monthName} ${voucher.year}`, 110, yPosition);
  yPosition += 8;

  const dueDate = voucher.dueDate ? new Date(voucher.dueDate).toLocaleDateString('en-PK') : 'N/A';
  doc.text(`Due Date: ${dueDate}`, 20, yPosition);
  doc.text(`Status: ${voucher.status.charAt(0).toUpperCase() + voucher.status.slice(1)}`, 110, yPosition);
  yPosition += 15;

  // Amount Breakdown Table
  const tableData = [
    ['Description', 'Amount (PKR)'],
    ['Base Amount', voucher.amount?.toLocaleString() || '0'],
    ['Discount', `-${voucher.discountAmount?.toLocaleString() || '0'}`],
    ['Late Fee', voucher.lateFeeAmount?.toLocaleString() || '0'],
    ['Total Amount', voucher.totalAmount?.toLocaleString() || '0'],
  ];

  const tableEndY = autoTable(doc, {
    startY: yPosition,
    head: [tableData[0]],
    body: tableData.slice(1),
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: 255,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right' },
    },
    margin: { left: 20, right: 20 },
  });

  yPosition = tableEndY + 15;

  // Payment Information
  if (voucher.paidAmount > 0) {
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Information', 20, yPosition);

    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);

    doc.text(`Amount Paid: PKR ${voucher.paidAmount?.toLocaleString() || '0'}`, 20, yPosition);
    const remaining = (voucher.remainingAmount ?? voucher.totalAmount ?? 0) - (voucher.paidAmount ?? 0);
    doc.text(`Remaining Amount: PKR ${Math.max(0, remaining).toLocaleString()}`, 110, yPosition);
    yPosition += 15;
  }

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFillColor(240, 240, 240);
  doc.rect(0, pageHeight - 25, 210, 25, 'F');

  doc.setTextColor(...secondaryColor);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Generated on: ' + new Date().toLocaleDateString('en-PK'), 20, pageHeight - 15);
  doc.text('This is a computer generated document', 20, pageHeight - 10);

  doc.text('EASE Academy - Fee Management System', 105, pageHeight - 10, { align: 'center' });

  // Return PDF as buffer for download
  return doc.output('arraybuffer');
};