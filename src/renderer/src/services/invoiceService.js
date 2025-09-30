import api from './api';

const getInvoices = async () => {
    const response = await api.get('/invoices');
    return response.data;
}

const getInvoiceById = async (id) => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
}

const getInvoicePrintData = async (id) => {
    const response = await api.get(`/invoices/${id}/print`);
    return response.data;
}

const createInvoice = async (invoiceData) => {
    const response = await api.post('/invoices', invoiceData);
    return response.data;
}

const updateInvoice = async (id, invoiceData) => {
    const response = await api.put(`/invoices/${id}`, invoiceData);
    return response.data;
}

const deleteInvoice = async (id) => {
    const response = await api.delete(`/invoices/${id}`);
    return response.data;
}

const markAsPaid = async (id) => {
    const response = await api.put(`/invoices/${id}/pay`);
    return response.data;
}

const markAsUnpaid = async (id) => {
    const response = await api.put(`/invoices/${id}/unpay`);
    return response.data;
}

// Single invoice print
const printInvoice = async (invoiceId) => {
    try {
        // Get print data from backend (HTML template comes from backend)
        const { printHTML } = await getInvoicePrintData(invoiceId);
       
        // Check if we're in Electron
        if (window.api && window.api.isElectron) {
            // Use Electron's native print functionality
            const result = await window.api.print(printHTML, {
                silent: false,
                printBackground: true,
                margins: {
                    marginType: 'default'
                }
            });
            return { success: result };
        } else {
            // Fallback to web browser print
            const printWindow = window.open('', '_blank');
            printWindow.document.write(printHTML);
            printWindow.document.close();
            printWindow.focus();
           
            setTimeout(() => {
                printWindow.print();
            }, 500);
           
            return { success: true };
        }
    } catch (error) {
        console.error('Print error:', error);
        throw error;
    }
}

// Batch print multiple invoices
const printMultipleInvoices = async (invoiceIds) => {
    try {
        const printPromises = invoiceIds.map(id => getInvoicePrintData(id));
        const printDataArray = await Promise.all(printPromises);
       
        // Combine all HTML with proper page breaks (keeping original HTML from backend)
        const combinedHTML = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <title>Impression Multiple - ${invoiceIds.length} Factures</title>
                    <style>
                        body { 
                            margin: 0; 
                            font-family: Arial, sans-serif; 
                        }
                        .page-break { 
                            page-break-after: always; 
                            page-break-inside: avoid;
                        }
                        .page-break:last-child { 
                            page-break-after: avoid; 
                        }
                        @page { 
                            margin: 15mm; 
                            size: A4;
                        }
                        @media print {
                            body { -webkit-print-color-adjust: exact; }
                        }
                    </style>
                </head>
                <body>
                    ${printDataArray.map((data, index) => `
                        <div class="page-break">
                            ${data.printHTML
                                .replace(/<!DOCTYPE html>.*?<body>/s, '')
                                .replace(/<\/body>.*<\/html>/s, '')
                            }
                        </div>
                    `).join('')}
                </body>
            </html>
        `;
        
        if (window.api && window.api.isElectron) {
            // Use Electron's print() function for batch printing
            const result = await window.api.print(combinedHTML, {
                silent: false,
                printBackground: true,
                margins: {
                    marginType: 'default'
                },
                pageSize: 'A4'
            });
            return { success: result };
        } else {
            // Fallback to web browser print
            const printWindow = window.open('', '_blank');
            printWindow.document.write(combinedHTML);
            printWindow.document.close();
            printWindow.focus();
           
            setTimeout(() => {
                printWindow.print();
            }, 500);
           
            return { success: true };
        }
    } catch (error) {
        console.error('Batch print error:', error);
        throw error;
    }
}

const exportInvoiceToPDF = async (invoiceId, fileName = null) => {
    try {
        const { printHTML } = await getInvoicePrintData(invoiceId);
        
        if (window.api && window.api.isElectron) {
            const result = await window.api.exportPDF(printHTML, {
                defaultFileName: fileName || `facture-${invoiceId}.pdf`
            });
            return result;
        } else {
            // Fallback for web - open print dialog
            const printWindow = window.open('', '_blank');
            printWindow.document.write(printHTML);
            printWindow.document.close();
            setTimeout(() => printWindow.print(), 500);
            return { success: true };
        }
    } catch (error) {
        console.error('PDF export error:', error);
        throw error;
    }
}

// Export multiple invoices to single PDF
const exportMultipleInvoicesToPDF = async (invoiceIds) => {
    try {
        const printPromises = invoiceIds.map(id => getInvoicePrintData(id));
        const printDataArray = await Promise.all(printPromises);
        
        const combinedHTML = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <title>Factures - ${invoiceIds.length} documents</title>
                    <style>
                        body { margin: 0; font-family: Arial, sans-serif; }
                        .page-break { page-break-after: always; page-break-inside: avoid; }
                        .page-break:last-child { page-break-after: avoid; }
                        @page { margin: 15mm; size: A4; }
                        @media print { body { -webkit-print-color-adjust: exact; } }
                    </style>
                </head>
                <body>
                    ${printDataArray.map((data) => `
                        <div class="page-break">
                            ${data.printHTML
                                .replace(/<!DOCTYPE html>.*?<body>/s, '')
                                .replace(/<\/body>.*<\/html>/s, '')
                            }
                        </div>
                    `).join('')}
                </body>
            </html>
        `;
        
        if (window.api && window.api.isElectron) {
            const result = await window.api.exportPDF(combinedHTML, {
                defaultFileName: `factures-${invoiceIds.length}-documents.pdf`
            });
            return result;
        } else {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(combinedHTML);
            printWindow.document.close();
            setTimeout(() => printWindow.print(), 500);
            return { success: true };
        }
    } catch (error) {
        console.error('Batch PDF export error:', error);
        throw error;
    }
}

export default {
    getInvoices,
    getInvoiceById,
    getInvoicePrintData,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    markAsUnpaid,
    markAsPaid,
    printInvoice,
    printMultipleInvoices,
    exportInvoiceToPDF,
    exportMultipleInvoicesToPDF
};