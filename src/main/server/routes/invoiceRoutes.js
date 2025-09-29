const express = require('express');
 const router = express.Router();
import {getAllInvoices, 
    createInvoice, 
    markInvoiceAsPaid, 
    deleteInvoice, 
    markInvoiceAsUnpaid, 
    updateInvoice,
    getInvoicePrintData}  from '../controllers/invoiceController'

router.get('/', getAllInvoices);
router.post('/', createInvoice);
router.put('/:id/pay', markInvoiceAsPaid);
router.put('/:id/unpay', markInvoiceAsUnpaid);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);
router.get('/:id/print', getInvoicePrintData)

export const invoiceRoutes = router;