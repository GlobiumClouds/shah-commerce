import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { KeyIcon } from 'lucide-react';

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

  // Check if we're in a browser environment for responsive detection
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  // Enhanced Professional Color Palette
  const primaryColor = [0, 102, 204]; // Professional Blue
  const secondaryColor = [52, 73, 94]; // Dark Gray
  const accentColor = [34, 197, 94]; // Green for amounts
  const warningColor = [245, 158, 11]; // Amber for warnings
  const borderColor = [229, 231, 235]; // Light Gray for borders
  const highlightColor = [254, 252, 232]; // Soft Yellow for highlights
  const lightGray = [248, 250, 252]; // Very light gray background
  const darkBlue = [23, 37, 84]; // Dark blue for headers

  // Page dimensions
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = isMobile ? 10 : 15;
  const contentWidth = pageWidth - (2 * margin);

  // Responsive font sizes
  const h1Size = isMobile ? 22 : 28;
  const h2Size = isMobile ? 16 : 20;
  const h3Size = isMobile ? 14 : 16;
  const bodySize = isMobile ? 10 : 11;
  const smallSize = isMobile ? 8 : 9;

  // Responsive spacing
  const lineHeight = isMobile ? 7 : 8;
  const sectionGap = isMobile ? 15 : 20;
  const boxPadding = isMobile ? 8 : 10;

  // Clear background with subtle gradient effect
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Add subtle background pattern
  doc.setFillColor(250, 250, 250);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  // ========== HEADER SECTION ==========
  let yPosition = margin;

  // Enhanced School Header with gradient effect
  const headerSectionHeight = isMobile ? 45 : 55;

  // Main header background
  doc.setFillColor(...primaryColor);
  doc.roundedRect(margin, yPosition, contentWidth, headerSectionHeight, 5, 5, 'F');

  // Add gradient effect with lighter blue
  doc.setFillColor(100, 150, 255);
  doc.roundedRect(margin, yPosition, contentWidth, headerSectionHeight * 0.6, 5, 5, 'F');

  // School badge/logo with enhanced styling
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(2);
  doc.roundedRect(margin + (isMobile ? 8 : 12), yPosition + (isMobile ? 10 : 12),
                  isMobile ? 25 : 30, isMobile ? 25 : 30, 4, 4, 'FD');
  doc.setTextColor(...primaryColor);
  doc.setFontSize(isMobile ? 14 : 18);
  doc.setFont('helvetica', 'bold');
  doc.text('EA', margin + (isMobile ? 8 : 12) + (isMobile ? 12.5 : 15), 
           yPosition + (isMobile ? 12 : 12) + (isMobile ? 12.5 : 15), 
           { align: 'center', baseline: 'middle' });

  // School name with enhanced positioning and shadow effect
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(h1Size);
  doc.setFont('helvetica', 'bold');
  const schoolName = 'EASE ACADEMY';
  const schoolX = isMobile ? margin + 45 : margin + 55;

  // Add subtle shadow for text
  doc.setTextColor(0, 50, 100, 0.3);
  doc.text(schoolName, schoolX + 1, yPosition + (isMobile ? 22 : 28) + 1);
  doc.setTextColor(255, 255, 255);
  doc.text(schoolName, schoolX, yPosition + (isMobile ? 22 : 28));

  // School motto with better positioning
  if (!isMobile) {
    doc.setFontSize(bodySize);
    doc.setFont('helvetica', 'italic');
    doc.text('Center of Excellence in Education', margin + 55, yPosition + 38);
  }

  // Enhanced Voucher title with background
  const titleY = yPosition + (isMobile ? 38 : 48);
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(1);
  doc.roundedRect(pageWidth / 2 - 60, titleY - 3, 120, isMobile ? 10 : 12, 2, 2, 'FD');

  doc.setTextColor(...primaryColor);
  doc.setFontSize(h2Size);
  doc.setFont('helvetica', 'bold');
  doc.text('FEE PAYMENT VOUCHER', pageWidth / 2, titleY + (isMobile ? 3 : 4), 
           { align: 'center', baseline: 'middle' });

  yPosition += headerSectionHeight + (isMobile ? 5 : 8);
  
  // ========== VOUCHER INFO BADGE ==========
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, yPosition, contentWidth, isMobile ? 20 : 24, 3, 3, 'FD');
  
  // Voucher number
  doc.setTextColor(...primaryColor);
  doc.setFontSize(h3Size);
  doc.setFont('helvetica', 'bold');
  const voucherText = isMobile ? `Voucher #${voucher.voucherNumber}` : `Fee Voucher #${voucher.voucherNumber}`;
  doc.text(voucherText, margin + boxPadding, yPosition + (isMobile ? 8 : 10));
  
  // Issue date
  doc.setFontSize(bodySize);
  doc.setFont('helvetica', 'normal');
  const issueDate = new Date().toLocaleDateString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  doc.text(`Issued: ${issueDate}`, margin + contentWidth - boxPadding, 
           yPosition + (isMobile ? 8 : 10), 
           { align: 'right', baseline: 'middle' });
  
  yPosition += isMobile ? 25 : 28;
  
  // ========== STUDENT INFORMATION SECTION ==========
  // Section header with enhanced styling
  doc.setFillColor(...primaryColor);
  doc.roundedRect(margin, yPosition, contentWidth, isMobile ? 8 : 10, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(h3Size);
  doc.setFont('helvetica', 'bold');
  doc.text('STUDENT DETAILS', margin + boxPadding, yPosition + (isMobile ? 5 : 7));

  yPosition += (isMobile ? 10 : 12);

  // Enhanced Student info box with gradient background
  const studentBoxHeight = isMobile ? 50 : 55;

  // Main background
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(margin, yPosition, contentWidth, studentBoxHeight, 4, 4, 'F');

  // Add subtle gradient effect
  doc.setFillColor(240, 245, 250);
  doc.roundedRect(margin, yPosition, contentWidth, studentBoxHeight * 0.4, 4, 4, 'F');

  // Border with primary color
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(1);
  doc.roundedRect(margin, yPosition, contentWidth, studentBoxHeight, 4, 4, 'S');
  
  const studentY = yPosition + boxPadding;
  
  // Get student data with fallbacks
  const studentName = voucher.studentId?.fullName ||
                     `${voucher.studentId?.firstName || ''} ${voucher.studentId?.lastName || ''}`.trim() ||
                     'N/A';
  const guardianType = voucher.studentId?.studentProfile?.guardianType || 'parent';
  const parentLabel = guardianType === 'guardian' ? 'Guardian:' : 'Father:';
  const parentName = guardianType === 'guardian'
    ? (voucher.studentId?.studentProfile?.guardian?.name || 'N/A')
    : (voucher.studentId?.fatherName || voucher.studentId?.studentProfile?.father?.name || 'N/A');
  const registrationNumber = voucher.studentId?.studentProfile?.registrationNumber ||
                            voucher.studentId?.registrationNumber || 'N/A';
  const rollNumber = voucher.studentId?.studentProfile?.rollNumber ||
                    voucher.studentId?.rollNumber || 'N/A';
  const className = voucher.classId?.name || 'N/A';
  const section = voucher.studentId?.studentProfile?.section || 'N/A';
  const branchName = voucher.branchId?.name || 'N/A';
  
  doc.setFontSize(bodySize);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  if (isMobile) {
    // Mobile: Stacked layout with proper alignment
    const labelValueGap = 5;
    const rowSpacing = lineHeight;
    
    // First row: Student Name
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...secondaryColor);
    doc.text('Student:', margin + boxPadding, studentY, { baseline: 'middle' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const studentLabelWidth = doc.getTextWidth('Student:');
    doc.text(studentName, margin + boxPadding + studentLabelWidth + labelValueGap, 
             studentY, { baseline: 'middle' });

    // Second row: Class & Section
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...secondaryColor);
    doc.text('Class:', margin + boxPadding, studentY + rowSpacing, { baseline: 'middle' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const classLabelWidth = doc.getTextWidth('Class:');
    doc.text(`${className} - ${section}`, margin + boxPadding + classLabelWidth + labelValueGap, 
             studentY + rowSpacing, { baseline: 'middle' });

    // Third row: Parent/Guardian
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...secondaryColor);
    doc.text(parentLabel, margin + boxPadding, studentY + (rowSpacing * 2), { baseline: 'middle' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const parentLabelWidth = doc.getTextWidth(parentLabel);
    doc.text(parentName, margin + boxPadding + parentLabelWidth + labelValueGap, 
             studentY + (rowSpacing * 2), { baseline: 'middle' });

    // Fourth row: Registration & Roll Number
    const fourthRowY = studentY + (rowSpacing * 3);
    
    // Registration Number
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...secondaryColor);
    doc.text('Reg #:', margin + boxPadding, fourthRowY, { baseline: 'middle' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const regLabelWidth = doc.getTextWidth('Reg #:');
    const regEndX = margin + boxPadding + regLabelWidth + labelValueGap + 
                   doc.getTextWidth(registrationNumber);
    
    doc.text(registrationNumber, margin + boxPadding + regLabelWidth + labelValueGap, 
             fourthRowY, { baseline: 'middle' });

    // Roll Number
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...secondaryColor);
    doc.text('Roll #:', regEndX + 10, fourthRowY, { baseline: 'middle' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const rollLabelWidth = doc.getTextWidth('Roll #:');
    doc.text(rollNumber, regEndX + 10 + rollLabelWidth + labelValueGap, 
             fourthRowY, { baseline: 'middle' });

  } else {
    // Desktop: Two-column layout with proper alignment
    const labelWidth = 45; // Fixed width for labels for better alignment
    const leftColX = margin + boxPadding;
    const rightColX = margin + contentWidth / 2;
    const valueOffset = labelWidth + 5; // Space between label and value
    
    // Set font for labels
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...secondaryColor);
    
    // Left Column - Labels
    doc.text('Student Name:', leftColX, studentY, { baseline: 'middle' });
    doc.text('Class & Section:', leftColX, studentY + lineHeight, { baseline: 'middle' });
    doc.text(parentLabel, leftColX, studentY + (lineHeight * 2), { baseline: 'middle' });

    // Right Column - Labels
    doc.text('Registration #:', rightColX, studentY, { baseline: 'middle' });
    doc.text('Roll Number:', rightColX, studentY + lineHeight, { baseline: 'middle' });
    doc.text('Branch:', rightColX, studentY + (lineHeight * 2), { baseline: 'middle' });

    // Set font for values
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    // Left Column - Values
    doc.text(studentName, leftColX + valueOffset, studentY, { baseline: 'middle' });
    doc.text(`${className} - ${section}`, leftColX + valueOffset, studentY + lineHeight, { baseline: 'middle' });
    doc.text(parentName, leftColX + valueOffset, studentY + (lineHeight * 2), { baseline: 'middle' });

    // Right Column - Values
    doc.text(registrationNumber, rightColX + valueOffset, studentY, { baseline: 'middle' });
    doc.text(rollNumber, rightColX + valueOffset, studentY + lineHeight, { baseline: 'middle' });
    doc.text(branchName, rightColX + valueOffset, studentY + (lineHeight * 2), { baseline: 'middle' });
  }
  
  yPosition += studentBoxHeight + (isMobile ? 5 : 8);
  
  // ========== FEE PERIOD SECTION ==========
  // Section header with enhanced styling
  doc.setFillColor(...primaryColor);
  doc.roundedRect(margin, yPosition, contentWidth, isMobile ? 8 : 10, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(h3Size);
  doc.setFont('helvetica', 'bold');
  doc.text('FEE PERIOD', margin + boxPadding, yPosition + (isMobile ? 5 : 7));

  yPosition += (isMobile ? 10 : 12);

  // Enhanced Fee period box with gradient background
  const periodBoxHeight = isMobile ? 20 : 22;

  // Main background
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(margin, yPosition, contentWidth, periodBoxHeight, 4, 4, 'F');

  // Add subtle gradient effect
  doc.setFillColor(240, 245, 250);
  doc.roundedRect(margin, yPosition, contentWidth, periodBoxHeight * 0.4, 4, 4, 'F');

  // Border with primary color
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(1);
  doc.roundedRect(margin, yPosition, contentWidth, periodBoxHeight, 4, 4, 'S');
  
  const periodY = yPosition + boxPadding;
  
  const monthName = MONTHS.find(m => m.value === voucher.month.toString())?.label || voucher.month;
  const dueDate = voucher.dueDate ? new Date(voucher.dueDate).toLocaleDateString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }) : 'N/A';
  
  doc.setFontSize(bodySize);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  if (isMobile) {
    // Mobile: Two lines for better readability
    const centerY = periodY;
    doc.text(`For Month: ${monthName} ${voucher.year}`, 
             margin + boxPadding, centerY, { baseline: 'middle' });
    doc.text(`Due Date: ${dueDate}`, 
             margin + contentWidth - boxPadding, centerY, 
             { align: 'right', baseline: 'middle' });
  } else {
    // Desktop: Three sections for better distribution
    const centerY = periodY;
    
    // Left: Month and Year
    doc.text(`For Month: ${monthName} ${voucher.year}`, 
             margin + boxPadding, centerY, { baseline: 'middle' });
    
    // Center: Due Date
    doc.text(`Due Date: ${dueDate}`, 
             pageWidth / 2, centerY, 
             { align: 'center', baseline: 'middle' });
    
    // Right: Fee Template
    doc.text(`Fee Template: ${voucher.templateId?.name || 'N/A'}`, 
             margin + contentWidth - boxPadding, centerY, 
             { align: 'right', baseline: 'middle' });
  }
  
  yPosition += periodBoxHeight + (isMobile ? 5 : 8);





// ========== FEE BREAKDOWN SECTION ==========
// Section header with enhanced styling
doc.setFillColor(...primaryColor);
doc.roundedRect(margin, yPosition, contentWidth, isMobile ? 8 : 10, 3, 3, 'F');

doc.setTextColor(255, 255, 255);
doc.setFontSize(h3Size);
doc.setFont('helvetica', 'bold');

// Fixed: Better vertical centering for section header
const feeHeaderTextY = yPosition + (isMobile ? 8 : 10) / 2;
doc.text('FEE BREAKDOWN', margin + boxPadding, feeHeaderTextY, { baseline: 'middle' });

yPosition += (isMobile ? 12 : 15);

// Prepare fee items
const feeItems = [
  { description: 'Tuition Fee', amount: voucher.amount || 0 },
  { description: 'Examination Fee', amount: voucher.examinationFee || 0 },
  { description: 'Library Fee', amount: voucher.libraryFee || 0 },
  { description: 'Sports Fee', amount: voucher.sportsFee || 0 },
  { description: 'Computer Fee', amount: voucher.computerFee || 0 },
  { description: 'Science Lab Fee', amount: voucher.scienceLabFee || 0 },
  { description: 'Transport Fee', amount: voucher.transportFee || 0 },
  { description: 'Activity Fee', amount: voucher.activityFee || 0 },
  { description: 'Late Fee Fine', amount: voucher.lateFeeAmount || 0 },
  { description: 'Other Charges', amount: voucher.otherCharges || 0 },
];

// Filter non-zero items
const nonZeroItems = feeItems.filter(item => item.amount > 0);

// Add discount if applicable
if (voucher.discountAmount > 0) {
  nonZeroItems.push({ description: 'Discount', amount: -voucher.discountAmount });
}

// Calculate table dimensions
const headerHeight = isMobile ? 12 : 15;
const rowHeight = isMobile ? 12 : 15;
const totalRowHeight = isMobile ? 14 : 18;
const tableHeight = headerHeight + (nonZeroItems.length * rowHeight) + totalRowHeight;

// Calculate column widths - adjust for better proportion
const descColWidth = contentWidth * 0.65; // Reduced from 0.7 for better balance
const amountColWidth = contentWidth * 0.35; // Increased from 0.3

// Column positions - improved alignment
const descHeaderX = margin + boxPadding;
const amountHeaderX = margin + descColWidth;
const amountEndX = margin + contentWidth - boxPadding;

// Table header with improved alignment
doc.setFillColor(...primaryColor);
doc.roundedRect(margin, yPosition, contentWidth, headerHeight, 1, 1, 'F');

doc.setTextColor(255, 255, 255);
doc.setFontSize(isMobile ? 10 : 12);
doc.setFont('helvetica', 'bold');

// Fixed: Better vertical centering for header text
const headerTextY = yPosition + headerHeight / 2;
doc.text('Description', descHeaderX, headerTextY, { baseline: 'middle' });
doc.text('Amount (PKR)', amountEndX, headerTextY, { align: 'right', baseline: 'middle' });

let currentY = yPosition + headerHeight;

// Table rows with improved alignment
let subTotal = 0;

nonZeroItems.forEach((item, index) => {
  // Alternate row background
  if (index % 2 === 0) {
    doc.setFillColor(255, 255, 255);
  } else {
    doc.setFillColor(249, 250, 251);
  }
  doc.rect(margin, currentY, contentWidth, rowHeight, 'F');

  // Description with better alignment
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(isMobile ? 9 : 11);

  // Truncate long descriptions if needed
  let description = item.description;
  const maxDescWidth = descColWidth - (boxPadding * 2);
  const textWidth = doc.getTextWidth(description);

  if (textWidth > maxDescWidth) {
    // Truncate with ellipsis
    let truncated = description;
    while (doc.getTextWidth(truncated + '...') > maxDescWidth && truncated.length > 3) {
      truncated = truncated.slice(0, -1);
    }
    description = truncated + '...';
  }

  // Better vertical centering for description
  const descY = currentY + rowHeight / 2;
  doc.text(description, descHeaderX, descY, { baseline: 'middle' });

  // Amount with improved alignment
  const amountText = Math.abs(item.amount).toLocaleString('en-PK');
  const amountColor = item.amount < 0 ? warningColor : secondaryColor;
  doc.setTextColor(...amountColor);

  // Format negative amounts with minus sign
  const formattedAmount = item.amount < 0 ? `-${amountText}` : amountText;

  // Better vertical centering for amount
  const amountY = currentY + rowHeight / 2;
  doc.text(formattedAmount, amountEndX, amountY, { align: 'right', baseline: 'middle' });

  subTotal += item.amount;
  currentY += rowHeight;
});

// Total row with improved alignment
const totalAmount = voucher.totalAmount || Math.max(0, subTotal);

// Background for total row
doc.setFillColor(...highlightColor);
doc.roundedRect(margin, currentY, contentWidth, totalRowHeight, 1, 1, 'F');

// Border for total row
doc.setDrawColor(245, 158, 11);
doc.setLineWidth(0.5);
doc.rect(margin, currentY, contentWidth, totalRowHeight);

// Total text with better alignment
doc.setFontSize(isMobile ? 11 : 13);
doc.setFont('helvetica', 'bold');
doc.setTextColor(133, 77, 14);

const totalLabel = isMobile ? 'TOTAL PAYABLE:' : 'TOTAL AMOUNT PAYABLE:';
// Fine-tune vertical centering for total label to improve visual alignment
const totalY = currentY + totalRowHeight / 2 - (isMobile ? 0.5 : 0.8);

doc.text(totalLabel, descHeaderX + descColWidth / 2, totalY, { align: 'center', baseline: 'middle' });

// Total amount with improved alignment
const totalText = totalAmount.toLocaleString('en-PK');
doc.text(totalText, amountEndX, totalY, { align: 'right', baseline: 'middle' });

// Add vertical line to separate columns
doc.setDrawColor(...borderColor);
doc.setLineWidth(0.5);
doc.line(amountHeaderX, yPosition, amountHeaderX, yPosition + tableHeight);

// Add border around entire table
doc.setDrawColor(...borderColor);
doc.setLineWidth(0.5);
doc.roundedRect(margin, yPosition, contentWidth, tableHeight, 2, 2, 'S');

yPosition += tableHeight + sectionGap;

// ========== PAYMENT STATUS SECTION ==========
if (voucher.paidAmount > 0) {
  const paidAmount = voucher.paidAmount || 0;
  const remainingAmount = Math.max(0, totalAmount - paidAmount);
  
  const statusBoxHeight = isMobile ? 35 : 40;
  
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(margin, yPosition, contentWidth, statusBoxHeight, 3, 3, 'F');
  doc.setDrawColor(34, 197, 94);
  doc.rect(margin, yPosition, contentWidth, statusBoxHeight);
  
  // Status title
  doc.setTextColor(21, 128, 61);
  doc.setFontSize(isMobile ? 12 : 14);
  doc.setFont('helvetica', 'bold');
  
  // Fixed: Calculate vertical position for status title
  const statusTitleY = yPosition + (statusBoxHeight / 4);
  doc.text('PAYMENT STATUS', margin + boxPadding, statusTitleY, { baseline: 'middle' });
  
  // Amount details
  doc.setFontSize(isMobile ? 10 : 12);
  doc.setFont('helvetica', 'normal');
  
  // Fixed: Calculate vertical position for amounts
  const amountsY = yPosition + (statusBoxHeight * 3/4);
  
  if (isMobile) {
    // Left: Paid amount
    doc.setTextColor(21, 128, 61);
    doc.text(`Paid: PKR ${paidAmount.toLocaleString('en-PK')}`, 
             margin + boxPadding, amountsY, { baseline: 'middle' });
    
    // Right: Remaining or fully paid status
    if (remainingAmount > 0) {
      doc.setTextColor(220, 38, 38);
      doc.text(`Due: PKR ${remainingAmount.toLocaleString('en-PK')}`, 
               margin + contentWidth - boxPadding, amountsY, 
               { align: 'right', baseline: 'middle' });
    } else {
      doc.setTextColor(21, 128, 61);
      doc.text('✓ Fully Paid', margin + contentWidth - boxPadding, amountsY, 
               { align: 'right', baseline: 'middle' });
    }
  } else {
    // Desktop layout
    doc.setTextColor(21, 128, 61);
    doc.text(`Amount Paid: PKR ${paidAmount.toLocaleString('en-PK')}`, 
             margin + boxPadding, amountsY, { baseline: 'middle' });
    
    if (remainingAmount > 0) {
      doc.setTextColor(220, 38, 38);
      doc.text(`Balance Due: PKR ${remainingAmount.toLocaleString('en-PK')}`, 
               margin + contentWidth - boxPadding, amountsY, 
               { align: 'right', baseline: 'middle' });
    } else {
      doc.setTextColor(21, 128, 61);
      doc.text('✓ Fully Paid', margin + contentWidth - boxPadding, amountsY, 
               { align: 'right', baseline: 'middle' });
    }
  }
  
  yPosition += statusBoxHeight + (isMobile ? 10 : 15);
}





  
  // ========== INSTRUCTIONS SECTION ==========
  if (yPosition < pageHeight - 50) {
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(isMobile ? 9 : 10);
    doc.setFont('helvetica', 'italic');
    
    const instructions = [
      '• Please pay before due date to avoid late fee charges.',
      '• Keep this voucher for your records.',
      '• Contact accounts office for any queries.'
    ];
    
    instructions.forEach((instruction, index) => {
      const instructionY = yPosition + (index * (isMobile ? 4 : 5));
      doc.text(instruction, margin + 2, instructionY, { baseline: 'middle' });
    });
    
    yPosition += isMobile ? 20 : 25;
  }
  
  // ========== FOOTER SECTION ==========
  const footerY = pageHeight - margin - (isMobile ? 25 : 30);
  
  // Horizontal line
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY, margin + contentWidth, footerY);
  
  // Signature areas
  doc.setFontSize(smallSize);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  
  if (!isMobile) {
    // Desktop: Two signature areas
    const leftSignatureX = margin + 60;
    const rightSignatureX = margin + contentWidth - 60;
    
    doc.text('____________________', leftSignatureX, footerY + 8, 
             { align: 'center', baseline: 'middle' });
    doc.text('Student/Parent Signature', leftSignatureX, footerY + 13, 
             { align: 'center', baseline: 'middle' });
    
    doc.text('____________________', rightSignatureX, footerY + 8, 
             { align: 'center', baseline: 'middle' });
    doc.text('Accounts Officer', rightSignatureX, footerY + 13, 
             { align: 'center', baseline: 'middle' });
  } else {
    // Mobile: Single signature area centered
    doc.text('____________________', pageWidth / 2, footerY + 8, 
             { align: 'center', baseline: 'middle' });
    doc.text('Student/Parent Signature', pageWidth / 2, footerY + 13, 
             { align: 'center', baseline: 'middle' });
  }
  
  // Footer text with proper alignment
  doc.setFontSize(smallSize);
  doc.setFont('helvetica', 'italic');
  
  const footerNoteY = pageHeight - margin - 5;
  doc.text('Computer Generated Document - No Signature Required', 
           pageWidth / 2, footerNoteY, 
           { align: 'center', baseline: 'middle' });
  
  // Generation timestamp
  doc.setFont('helvetica', 'normal');
  const timestamp = new Date().toLocaleString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const timestampY = pageHeight - margin - 10;
  doc.text(`Generated: ${timestamp}`, 
           margin + contentWidth, timestampY, 
           { align: 'right', baseline: 'middle' });
  
  // School contact information
  doc.setTextColor(...primaryColor);
  doc.setFontSize(smallSize);
  doc.setFont('helvetica', 'bold');
  
  const contactY = pageHeight - margin - 10;
  const contactText = 'EASE Academy • accounts@easeacademy.edu.pk • (042) 123-4567';
  
  // Check if text fits, otherwise split
  const contactTextWidth = doc.getTextWidth(contactText);
  if (contactTextWidth > contentWidth) {
    // Split into two lines if too long
    doc.text('EASE Academy • accounts@easeacademy.edu.pk', 
             margin, contactY - 3, { baseline: 'middle' });
    doc.text('(042) 123-4567', margin, contactY + 3, { baseline: 'middle' });
  } else {
    doc.text(contactText, margin, contactY, { baseline: 'middle' });
  }
  
  return doc.output('arraybuffer');
};
