import { jsPDF } from "jspdf";
import QRCode from "qrcode";

export const generateInvoicePDF = async (invoice: any, client: any) => {
  const yourCompany = {
    name: "The H Enterprises",
    gst: "33AFQPH8317G1ZD",
    address: "No:121/2 kamala Garden, Bakthavachalam Nagar, Ankaputhure",
    city: "Chennai -600070",
    mobile: "9566689748",
    email: "maxirevota@gmail.com",
  };

  const bankDetails = {
    name: "The H Enterprises",
    accNo: "920020056431640",
    bank: "Axis Bank",
    branch: "Pallavaram",
    ifsc: "UTIB0000851",
  };

  const cleanAmount = parseFloat((invoice.amount || "0").replace(/[^0-9.-]+/g, "") || "0");
  const gstAmount = cleanAmount * 0.18;
  const totalAmount = cleanAmount + gstAmount;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  // 1. QR Code Generation
  const upiString = `upi://pay?pa=maxirevota@axisbank&pn=The+H+Enterprises&am=${totalAmount.toFixed(2)}&cu=INR`;
  const qrDataUrl = await QRCode.toDataURL(upiString, { width: 200, margin: 1 });

  // 2. Branding & Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(0, 0, 0);
  doc.text("INVOICE", pageWidth - margin, 25, { align: "right" });

  doc.setFontSize(14);
  doc.text(yourCompany.name, margin, 25);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`GSTIN: ${yourCompany.gst}`, margin, 30);
  doc.text(yourCompany.address, margin, 35);
  doc.text(yourCompany.city, margin, 40);

  // 3. Invoice Info
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, 50, pageWidth - margin, 50);

  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", margin, 60);
  doc.setFont("helvetica", "normal");
  doc.text(client.name || invoice.companyName || "Client", margin, 65);
  doc.text(client.address || "N/A", margin, 70);
  doc.text(`Contact: ${client.contactName || "N/A"}`, margin, 75);

  doc.setFont("helvetica", "bold");
  doc.text("Invoice Details:", pageWidth - 80, 60);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice No: ${invoice.invoiceNo}`, pageWidth - 80, 65);
  doc.text(`Date: ${invoice.date}`, pageWidth - 80, 70);
  doc.text(`Due Date: ${invoice.dueDate}`, pageWidth - 80, 75);

  // 4. Table Header
  const tableTop = 90;
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, tableTop, pageWidth - margin * 2, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.text("Description", margin + 5, tableTop + 6);
  doc.text("Amount", pageWidth - margin - 30, tableTop + 6, { align: "right" });

  // 5. Table Body
  doc.setFont("helvetica", "normal");
  doc.text("Professional Services / Consulting", margin + 5, tableTop + 18);
  doc.text(`Rs. ${cleanAmount.toFixed(2)}`, pageWidth - margin - 30, tableTop + 18, { align: "right" });

  // 6. Totals
  const footerTop = 130;
  doc.line(margin, footerTop, pageWidth - margin, footerTop);

  doc.text("Subtotal:", pageWidth - 80, footerTop + 10);
  doc.text(`Rs. ${cleanAmount.toFixed(2)}`, pageWidth - margin - 10, footerTop + 10, { align: "right" });

  doc.text("GST (18%):", pageWidth - 80, footerTop + 18);
  doc.text(`Rs. ${gstAmount.toFixed(2)}`, pageWidth - margin - 10, footerTop + 18, { align: "right" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Total Amount:", pageWidth - 80, footerTop + 28);
  doc.text(`Rs. ${totalAmount.toFixed(2)}`, pageWidth - margin - 10, footerTop + 28, { align: "right" });

  // 7. Payment Info (QR Code)
  doc.setFontSize(10);
  doc.text("Scan to Pay via UPI", margin, footerTop + 10);
  doc.addImage(qrDataUrl, "PNG", margin, footerTop + 15, 35, 35);

  // 8. Bank Details
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Bank Details:", margin + 50, footerTop + 10);
  doc.setFont("helvetica", "normal");
  doc.text(`Account Name: ${bankDetails.name}`, margin + 50, footerTop + 15);
  doc.text(`Account No: ${bankDetails.accNo}`, margin + 50, footerTop + 20);
  doc.text(`Bank: ${bankDetails.bank} (${bankDetails.branch})`, margin + 50, footerTop + 25);
  doc.text(`IFSC Code: ${bankDetails.ifsc}`, margin + 50, footerTop + 30);

  // 9. Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Thank you for your business!", pageWidth / 2, 280, { align: "center" });

  return { doc, qrDataUrl, totalAmount, cleanAmount };
};
