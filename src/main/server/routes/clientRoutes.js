const express = require('express');
export const router = express.Router();
import  {getAllClients, createClient, editClient, deleteClient}  from '../controllers/clientController'

router.get('/', getAllClients);
router.post('/', createClient);
router.put('/:id', editClient);
router.delete('/:id', deleteClient);


export const clientRoutes = router;
// module.exports = router;