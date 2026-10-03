import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatINR, formatDate } from './business-logic';

export interface InvoiceData {
  invoiceNumber: string;
  paymentDate: string | Date;
  paymentMode: string;
  referenceId?: string | null;
  amount: number;
  discount?: number;
  member: {
    name: string;
    phone: string;
    memberCode: string;
  };
  items: Array<{
    description: string;
    amount: number;
  }>;
  notes?: string | null;
}

export function generateInvoicePdf(data: InvoiceData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Background Header Banner
  doc.setFillColor(9, 13, 22);
  doc.rect(0, 0, 210, 45, 'F');

  // Accent Line
  doc.setFillColor(16, 185, 129); // Emerald
  doc.rect(0, 45, 210, 2, 'F');

  // Gym Brand Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('IRON FORGE FITNESS', 15, 20);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('42, 100 Feet Road, Indiranagar, Bengaluru, KA 560038', 15, 27);
  doc.text('GSTIN: 29ABCDE1234F1Z5 | Phone: +91 98765 43210 | contact@ironforgegym.in', 15, 33);

  // Invoice Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text('PAYMENT RECEIPT', 150, 20);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255);
  doc.text(`Receipt #: ${data.invoiceNumber}`, 150, 27);
  doc.text(`Date: ${formatDate(data.paymentDate)}`, 150, 33);

  // Bill To Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, 54, 180, 28, 2, 2, 'FD');

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('MEMBER DETAILS:', 20, 61);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.text(data.member.name, 20, 68);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Member Code: ${data.member.memberCode}   |   Phone: +91 ${data.member.phone}`, 20, 75);

  // Payment Mode details
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT DETAILS:', 115, 61);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`Mode: ${data.paymentMode}`, 115, 68);
  if (data.referenceId) {
    doc.text(`Ref/Txn ID: ${data.referenceId}`, 115, 75);
  }

  // Items Table
  const tableRows = data.items.map((it, idx) => [
    (idx + 1).toString(),
    it.description,
    formatINR(it.amount),
  ]);

  autoTable(doc, {
    startY: 88,
    head: [['#', 'Description', 'Amount (INR)']],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 125 },
      2: { cellWidth: 40, halign: 'right' },
    },
    margin: { left: 15, right: 15 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 8;

  // Summary box
  doc.setDrawColor(226, 232, 240);
  doc.line(115, finalY, 195, finalY);

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Subtotal:', 120, finalY + 7);
  doc.text(formatINR(data.amount + (data.discount || 0)), 195, finalY + 7, { align: 'right' });

  if (data.discount && data.discount > 0) {
    doc.text('Discount:', 120, finalY + 14);
    doc.text(`- ${formatINR(data.discount)}`, 195, finalY + 14, { align: 'right' });
  }

  const offset = data.discount && data.discount > 0 ? 7 : 0;

  // Total
  doc.setFillColor(241, 245, 249);
  doc.rect(115, finalY + 11 + offset, 80, 10, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL PAID:', 120, finalY + 18 + offset);
  doc.setTextColor(5, 150, 105);
  doc.text(formatINR(data.amount), 195, finalY + 18 + offset, { align: 'right' });

  // Footer notes & stamp
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Terms: Fees paid are non-refundable and non-transferable.', 15, 260);
  doc.text('This is a computer-generated tax invoice issued by Iron Forge Fitness.', 15, 265);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Authorized Signatory', 160, 255);
  doc.setDrawColor(203, 213, 225);
  doc.line(155, 250, 195, 250);

  return doc;
}

export function getWhatsAppReceiptUrl(phone: string, memberName: string, invoiceNumber: string, amount: number): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const text = encodeURIComponent(
    `Hello ${memberName}! Thank you for your payment of ${formatINR(amount)} at Iron Forge Fitness. Your receipt (#${invoiceNumber}) is generated. View your membership status in your member app: https://ironforgegym.in/app`
  );
  return `https://wa.me/91${cleanPhone}?text=${text}`;
}
