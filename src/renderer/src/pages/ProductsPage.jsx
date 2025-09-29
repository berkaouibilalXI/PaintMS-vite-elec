import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import productService from '../services/productService';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    price: '',
    unit: 'unité'
  });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (product = null) => {
    setEditingProduct(product);
    setFormData(
      product 
        ? { 
            name: product.name || '', 
            description: product.description || '', 
            price: product.price?.toString() || '',
            unit: product.unit || 'unité'
          } 
        : { 
            name: '', 
            description: '', 
            price: '',
            unit: 'unité'
          }
    );
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: '', unit: 'unité' });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Le nom du produit est requis');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) < 0) {
      setError('Le prix doit être un nombre positif');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      
      if (!validateForm()) {
        return;
      }

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        unit: formData.unit.trim() || 'unité'
      };

      console.log('Submitting product data:', productData);

      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, productData);
      } else {
        await productService.createProduct(productData);
      }
      
      await fetchProducts();
      handleClose();
      
    } catch (err) {
      console.error('Error saving product:', err);
      
      if (err.response?.data?.details) {
        setError(`Erreur de validation: ${err.response.data.details.map(d => d.message).join(', ')}`);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Erreur lors de la sauvegarde du produit');
      }
    }
  };

  const handleDeleteClick = (product) => {
    setDeleteDialog({ open: true, product });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.product) return;
    
    try {
      setError(null);
      await productService.deleteProduct(deleteDialog.product.id);
      setDeleteDialog({ open: false, product: null });
      await fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      setDeleteDialog({ open: false, product: null });
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Erreur lors de la suppression du produit');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
    >
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Produits</h2>
          <Button onClick={() => handleOpen()}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter Produit
          </Button>
        </div>
        
        {error && (
          <Alert className="mb-4" variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">Aucun produit trouvé</div>
            <Button onClick={() => handleOpen()}>
              <Plus className="w-4 h-4 mr-2" />
              Créer votre premier produit
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
              <div key={product.id} className="rounded-2xl shadow-md p-6 bg-card border hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold line-clamp-2">{product.name}</h3>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{product.price}</p>
                    <p className="text-sm text-muted-foreground">DZD</p>
                  </div>
                </div>
                
                {product.description && (
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-3">{product.description}</p>
                )}
                
                <p className="text-xs text-muted-foreground mb-4">
                  Unité: {product.unit || 'unité'}
                </p>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleOpen(product)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Modifier
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => handleDeleteClick(product)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Product Dialog */}
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>
                {editingProduct ? 'Modifier Produit' : 'Ajouter Produit'}
              </AlertDialogTitle>
            </AlertDialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom du produit *</Label>
                <Input
                  id="name"
                  placeholder="Nom du produit"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Description du produit"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="price">Prix (DZD) *</Label>
                  <Input
                    id="price"
                    placeholder="0.00"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="unit">Unité</Label>
                  <Input
                    id="unit"
                    placeholder="unité"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <AlertDialogFooter className="mt-6">
              <AlertDialogCancel onClick={handleClose}>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleSubmit}>
                {editingProduct ? 'Modifier' : 'Ajouter'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, product: deleteDialog.product })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer le produit "{deleteDialog.product?.name}" ? 
                Cette action est irréversible et peut échouer si le produit est utilisé dans des factures existantes.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteDialog({ open: false, product: null })}>
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
}

export default ProductsPage;