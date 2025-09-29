import { BrowserWindow, ipcMain } from 'electron';

function generateInvoiceHTML(invoiceData: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        @page {
          size: A4;
          margin: 20mm;
        }
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
        }
        .invoice-header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
        }
        .invoice-details {
          margin-bottom: 20px;
        }
        .invoice-details p {
          margin: 5px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        .total-row {
          background-color: #f9f9f9;
          font-weight: bold;
        }
        .total {
          text-align: right;
          font-size: 18px;
          font-weight: bold;
          margin-top: 20px;
          padding: 10px;
          background-color: #f0f0f0;
        }
        .note {
          margin-top: 30px;
          padding: 10px;
          background-color: #fffbf0;
          border-left: 3px solid #ffc107;
        }
      </style>
    </head>
    <body>
      <div class="invoice-header">
        <h1>BON DE LIVRAISON / FACTURE</h1>
        <h2>${invoiceData.invoiceNumber}</h2>
      </div>
      
      <div class="invoice-details">
        <p><strong>Client:</strong> ${invoiceData.client?.name || 'N/A'}</p>
        <p><strong>Date:</strong> ${new Date(invoiceData.date).toLocaleDateString('fr-FR')}</p>
        <p><strong>Téléphone:</strong> ${invoiceData.client?.phone || 'N/A'}</p>
        <p><strong>Adresse:</strong> ${invoiceData.client?.address || 'N/A'}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>Produit</th>
            <th>Unité</th>
            <th>Quantité</th>
            <th>Prix Unitaire</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${invoiceData.items?.map((item: any) => `
            <tr>
              <td>${item.product?.name || 'N/A'}</td>
              <td>${item.product?.unit || 'unité'}</td>
              <td>${item.quantity}</td>
              <td>${item.unitPrice.toFixed(2)} DZD</td>
              <td>${item.total.toFixed(2)} DZD</td>
            </tr>
          `).join('') || ''}
          <tr class="total-row">
            <td colspan="4" style="text-align: right;">TOTAL:</td>
            <td><strong>${invoiceData.total?.toFixed(2)} DZD</strong></td>
          </tr>
        </tbody>
      </table>

      ${invoiceData.note ? `
        <div class="note">
          <strong>Note:</strong> ${invoiceData.note}
        </div>
      ` : ''}

      <div style="margin-top: 50px; text-align: center; color: #666; font-size: 12px;">
        <p>Merci pour votre confiance</p>
      </div>
    </body>
    </html>
  `;
}

export function setupPrintHandlers(): void {
  // Print invoice directly to default printer
  ipcMain.handle('print-invoice', async (_event, invoiceData) => {
    try {
      const printWindow = new BrowserWindow({
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        }
      });

      const htmlContent = generateInvoiceHTML(invoiceData);
      await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

      return new Promise((resolve) => {
        printWindow.webContents.on('did-finish-load', () => {
          printWindow.webContents.print(
            {
              silent: true,
              printBackground: true,
              margins: {
                marginType: 'minimum'
              }
            },
            (success, errorType) => {
              printWindow.close();
              if (success) {
                resolve({ success: true });
              } else {
                resolve({ success: false, error: errorType });
              }
            }
          );
        });
      });
    } catch (error: any) {
      console.error('Print error:', error);
      return { success: false, error: error.message };
    }
  });

  // Print with dialog (user chooses printer)
  ipcMain.handle('print-invoice-with-dialog', async (_event, invoiceData) => {
    try {
      const printWindow = new BrowserWindow({
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        }
      });

      const htmlContent = generateInvoiceHTML(invoiceData);
      await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

      return new Promise((resolve) => {
        printWindow.webContents.on('did-finish-load', () => {
          printWindow.webContents.print(
            {
              silent: false,
              printBackground: true
            },
            (success, errorType) => {
              printWindow.close();
              if (success) {
                resolve({ success: true });
              } else {
                resolve({ success: false, error: errorType });
              }
            }
          );
        });
      });
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
}