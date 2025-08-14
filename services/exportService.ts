import { ExportFormat } from '../types';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';

const exportAsTxt = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
};

const exportAsDocx = (content: string, fileName: string) => {
    // Clean up markdown for better DOCX readability
    const cleanedContent = content
        .replace(/\|/g, '  |  ') // Add spacing around table pipes
        .replace(/## (.*)/g, '$1\n--------------------') // Simple header styling
        .replace(/\*\*(.*?)\*\*/g, '$1'); // Remove bold markdown

    const paragraphs = cleanedContent.split('\n').map(line => 
        new Paragraph({
            children: [new TextRun(line)],
            spacing: { after: 120 },
        })
    );

    const doc = new Document({
        sections: [{
            properties: {},
            children: paragraphs,
        }],
    });

    Packer.toBlob(doc).then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.docx`;
        a.click();
        URL.revokeObjectURL(url);
    });
};

const exportAsPdf = (contentElement: HTMLElement, fileName: string) => {
    html2canvas(contentElement, { 
        backgroundColor: '#1a202c', // bg-brand-charcoal
        scale: 2 
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        const imgWidth = pdfWidth - 20; // with margin
        const imgHeight = imgWidth / ratio;
        
        let heightLeft = imgHeight;
        let position = 10; // top margin
        
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 20);

        while (heightLeft > 0) {
            position = heightLeft - imgHeight + 10;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= (pdfHeight - 20);
        }

        pdf.save(`${fileName}.pdf`);
    });
};


export const exportContent = (
    format: ExportFormat, 
    content: string, 
    fileName: string,
    contentElement: HTMLElement | null
) => {
    const sanitizedFileName = fileName.replace(/\s+/g, '_');
    switch (format) {
        case ExportFormat.TXT:
            exportAsTxt(content, sanitizedFileName);
            break;
        case ExportFormat.DOCX:
            exportAsDocx(content, sanitizedFileName);
            break;
        case ExportFormat.PDF:
             if (contentElement) {
                exportAsPdf(contentElement, sanitizedFileName);
            } else {
                console.error('Content element not found for PDF export.');
            }
            break;
    }
};