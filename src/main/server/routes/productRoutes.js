const express = require('express');
 export const router =  express.Router();
import  {getAllProducts, createProduct, editProduct, deleteProduct} from '../controllers/productController'

router.get('/', getAllProducts);
router.post('/', createProduct);
router.put('/:id', editProduct);
router.delete('/:id', deleteProduct);

export const productRoutes = router;