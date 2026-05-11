import { jsPDF } from "jspdf";

// Fetch an image from a public URL and return a data URL
async function fetchDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

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

  const cleanAmount = parseFloat(
    String(invoice.amount || "0").replace(/[^\d.]/g, "").replace(/^\.+/, "") || "0"
  );
  const gstAmount = cleanAmount * 0.18;
  const totalAmount = cleanAmount + gstAmount;

  // Assets — static real UPI QR code
  const qrDataUrl = await fetchDataUrl("/qr.png");
  const logoDataUrl = await fetchDataUrl("/logo.png");
  const signatureDataUrl = await fetchDataUrl("/signature.png");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const colWidth = (pageWidth - margin * 2) / 2;
  const headerFill: [number, number, number] = [235, 241, 245];

  // ─── 1. Logo (centered) ───────────────────────────────────────────────────
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", pageWidth / 2 - 20, 8, 40, 30);
  }

  // ─── 2. Title & GST ──────────────────────────────────────────────────────
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Performa Invoice", pageWidth / 2, 45, { align: "center" });
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - 28, 47, pageWidth / 2 + 28, 47);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(`GSTNo: ${yourCompany.gst}`, pageWidth - margin, 45, { align: "right" });

  // ─── 3. Header Boxes (Client left, Invoice meta right) ────────────────────
  doc.setDrawColor(0);

  // Left box — Client
  doc.setFillColor(...headerFill);
  doc.rect(margin, 55, colWidth, 25, "FD");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(
    String(invoice.companyName || client.name || "").toUpperCase(),
    margin + colWidth / 2, 62, { align: "center" }
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    String(client.city || "Chennai"),
    margin + colWidth / 2, 68, { align: "center" }
  );
  doc.setFont("helvetica", "bold");
  doc.text(
    String(client.gstNumber || client.gst || "N/A"),
    margin + colWidth / 2, 74, { align: "center" }
  );

  // Right box — Invoice meta
  doc.setFillColor(...headerFill);
  doc.rect(margin + colWidth, 55, colWidth, 25, "FD");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Invoice No   : ${invoice.invoiceNo || "N/A"}`, margin + colWidth + 5, 62);
  doc.text(`Invoice Date : ${invoice.date || "N/A"}`, margin + colWidth + 5, 68);
  doc.text(`Due date      : ${invoice.dueDate || "N/A"}`, margin + colWidth + 5, 74);

  // ─── 4. Item Table ────────────────────────────────────────────────────────
  const startY = 85;
  const rowH = 8;

  doc.setFont("helvetica", "normal");
  // Row 1 — Description
  doc.rect(margin, startY, colWidth * 1.5, rowH);
  doc.text(
    invoice.description || "Professional software management fee",
    margin + 3, startY + 5.5
  );
  doc.rect(margin + colWidth * 1.5, startY, colWidth * 0.5, rowH);
  doc.text(
    cleanAmount.toFixed(2),
    margin + colWidth * 2 - 3, startY + 5.5, { align: "right" }
  );

  // Row 2 — GST 18%
  doc.rect(margin, startY + rowH, colWidth * 1.5, rowH);
  doc.text("GST 18%", margin + colWidth * 0.75, startY + rowH + 5.5, { align: "center" });
  doc.rect(margin + colWidth * 1.5, startY + rowH, colWidth * 0.5, rowH);
  doc.text(
    gstAmount.toFixed(2),
    margin + colWidth * 2 - 3, startY + rowH + 5.5, { align: "right" }
  );

  // Row 3 — Total (bold)
  doc.setFont("helvetica", "bold");
  doc.rect(margin, startY + rowH * 2, colWidth * 1.5, rowH);
  doc.text("Total", margin + colWidth * 0.75, startY + rowH * 2 + 5.5, { align: "center" });
  doc.rect(margin + colWidth * 1.5, startY + rowH * 2, colWidth * 0.5, rowH);
  doc.text(
    totalAmount.toFixed(2),
    margin + colWidth * 2 - 3, startY + rowH * 2 + 5.5, { align: "right" }
  );

  // ─── 5. Bank Details Table ────────────────────────────────────────────────
  const bankY = startY + rowH * 2 + 15;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Bank Details:-", margin, bankY);

  const bRowH = 7;
  const bLabels = ["ACCOUNT NAME", "ACCOUNT NUMBER", "BANK NAME", "BRANCH", "IFSC CODE"];
  const bValues = [bankDetails.name, bankDetails.accNo, bankDetails.bank, bankDetails.branch, bankDetails.ifsc];

  doc.setFontSize(10);
  bLabels.forEach((label, i) => {
    const y = bankY + 5 + i * bRowH;
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y, colWidth * 0.8, bRowH, "FD");
    doc.setFont("helvetica", "normal");
    doc.text(label, margin + 5, y + 4.5);

    doc.setFillColor(...headerFill);
    doc.rect(margin + colWidth * 0.8, y, colWidth * 1.2, bRowH, "FD");
    doc.text(bValues[i], margin + colWidth * 1.4, y + 4.5, { align: "center" });
  });

  // ─── 6. QR + Signature ───────────────────────────────────────────────────
  const footerTop = bankY + 5 + bLabels.length * bRowH + 5;

  // QR code
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, "PNG", margin, footerTop + 5, 35, 35);
  }

  // "For The H Enterprises" right-aligned
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("For The H Enterprises", pageWidth - margin, footerTop + 10, { align: "right" });

  // Signature image
  if (signatureDataUrl) {
    doc.addImage(signatureDataUrl, "PNG", pageWidth - margin - 45, footerTop + 15, 45, 18);
  }

  doc.setFont("helvetica", "normal");
  doc.text("Authorized Signature", pageWidth - margin, footerTop + 38, { align: "right" });

  // ─── 7. Page Footer ───────────────────────────────────────────────────────
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(yourCompany.name, pageWidth / 2, pageHeight - 18, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    `${yourCompany.address} , ${yourCompany.city}`,
    pageWidth / 2, pageHeight - 13, { align: "center" }
  );
  doc.text(
    `Mobile : ${yourCompany.mobile} ; Email : ${yourCompany.email}`,
    pageWidth / 2, pageHeight - 8, { align: "center" }
  );

  return { doc, qrDataUrl: qrDataUrl ?? "", logoDataUrl: logoDataUrl ?? "", signatureDataUrl: signatureDataUrl ?? "", totalAmount, cleanAmount };
};
