import jsPDF from 'jspdf';
import { Note } from '../types/Note';

export const exportToPDF = async (note: Note) => {
  try {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const margin = 20;
    const lineHeight = 7;
    let currentY = margin;

    // Set font
    pdf.setFont('helvetica', 'normal');

    // Title
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    const title = note.title || 'Untitled Note';
    pdf.text(title, margin, currentY);
    currentY += lineHeight * 2;

    // Metadata
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    
    const createdDate = note.createdAt.toLocaleDateString();
    const updatedDate = note.updatedAt.toLocaleDateString();
    pdf.text(`Created: ${createdDate}`, margin, currentY);
    currentY += lineHeight;
    pdf.text(`Updated: ${updatedDate}`, margin, currentY);
    currentY += lineHeight * 2;

    if (note.category) {
      pdf.text(`Category: ${note.category}`, margin, currentY);
      currentY += lineHeight * 2;
    }

    // Content
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    
    const content = note.content || 'No content';
    const lines = pdf.splitTextToSize(content, pageWidth - 2 * margin);
    
    for (let i = 0; i < lines.length; i++) {
      if (currentY + lineHeight > pdf.internal.pageSize.height - margin) {
        pdf.addPage();
        currentY = margin;
      }
      pdf.text(lines[i], margin, currentY);
      currentY += lineHeight;
    }

    // Save the PDF
    const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
    pdf.save(fileName);
    
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return false;
  }
};

export const exportToTXT = (note: Note) => {
  try {
    const title = note.title || 'Untitled Note';
    const content = note.content || 'No content';
    const createdDate = note.createdAt.toLocaleDateString();
    const updatedDate = note.updatedAt.toLocaleDateString();
    
    let txtContent = `${title}\n`;
    txtContent += `${'='.repeat(title.length)}\n\n`;
    txtContent += `Created: ${createdDate}\n`;
    txtContent += `Updated: ${updatedDate}\n`;
    
    if (note.category) {
      txtContent += `Category: ${note.category}\n`;
    }
    
    txtContent += `\n${content}`;

    // Create and download the file
    const blob = new Blob([txtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error exporting to TXT:', error);
    return false;
  }
};

export const exportAllNotesToTXT = (notes: Note[]) => {
  try {
    let allContent = 'All Notes Export\n';
    allContent += '================\n\n';
    
    notes.forEach((note, index) => {
      const title = note.title || 'Untitled Note';
      const content = note.content || 'No content';
      const createdDate = note.createdAt.toLocaleDateString();
      
      allContent += `${index + 1}. ${title}\n`;
      allContent += `Created: ${createdDate}\n`;
      if (note.category) {
        allContent += `Category: ${note.category}\n`;
      }
      allContent += `${'-'.repeat(50)}\n`;
      allContent += `${content}\n\n`;
      allContent += `${'='.repeat(50)}\n\n`;
    });

    const blob = new Blob([allContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `all_notes_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error exporting all notes to TXT:', error);
    return false;
  }
};
