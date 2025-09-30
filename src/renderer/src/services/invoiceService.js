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

// Enhanced print function that works in both Electron and Web
// Single invoice print
const printInvoice = async (invoiceId) => {
    try {
        // Get print data from backend
        const { printHTML } = await getInvoicePrintData(invoiceId);
       
        // Check if we're in Electron
        if (window.electronAPI && window.electronAPI.isElectron) {
            // Use Electron's native print functionality with print()
            const result = await window.electronAPI.print(printHTML, {
                silent: false, // Show print dialog
                printBackground: true, // Print background colors/images
                margins: {
                    marginType: 'default' // or 'none', 'printableArea', 'custom'
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
       
        // Combine all HTML with proper page breaks
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
        
        if (window.electronAPI && window.electronAPI.isElectron) {
            // Use Electron's print() function for batch printing
            const result = await window.electronAPI.print(combinedHTML, {
                silent: false, // Show print dialog so user can verify
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
    printMultipleInvoices
};