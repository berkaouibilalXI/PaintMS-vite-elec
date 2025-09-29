import React, { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { motion } from "framer-motion";
import { Add, Delete } from "@mui/icons-material";

export default function InvoiceForm({ 
  onSubmit, 
  clients = [], 
  products = [], 
  editingInvoice = null,
  onCancel 
}) {
  const [formData, setFormData] = useState({
    clientId: "",
    note: "",
    items: [{ productId: "", quantity: 1, unitPrice: 0 }]
  });

  // Load editing invoice data
  useEffect(() => {
    if (editingInvoice) {
      setFormData({
        clientId: editingInvoice.clientId?.toString() || "",
        note: editingInvoice.note || "",
        items: editingInvoice.items?.map(item => ({
          productId: item.productId?.toString() || "",
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || 0
        })) || [{ productId: "", quantity: 1, unitPrice: 0 }]
      });
    }
  }, [editingInvoice]);

  const handleClientChange = (e) => {
    setFormData(prev => ({
      ...prev,
      clientId: e.target.value
    }));
  };

  const handleNoteChange = (e) => {
    setFormData(prev => ({
      ...prev,
      note: e.target.value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    
    if (field === "productId") {
      newItems[index][field] = value;
      // Auto-fill unit price when product is selected
      const selectedProduct = products.find(p => p.id.toString() === value);
      if (selectedProduct) {
        newItems[index].unitPrice = selectedProduct.price || 0;
      }
    } else if (field === "quantity") {
      newItems[index][field] = Math.max(1, parseInt(value) || 1);
    } else {
      newItems[index][field] = value;
    }

    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: "", quantity: 1, unitPrice: 0 }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        items: newItems
      }));
    }
  };

  const calculateTotal = () => {
    return formData.items.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
      0
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.clientId) {
      alert("Veuillez sélectionner un client");
      return;
    }

    const validItems = formData.items.filter(
      item => item.productId && item.quantity > 0 && item.unitPrice > 0
    );

    if (validItems.length === 0) {
      alert("Veuillez ajouter au moins un produit valide");
      return;
    }

    // Merge items with same product
    const mergedItems = Object.values(
      validItems.reduce((acc, item) => {
        const productId = parseInt(item.productId);
        if (!acc[productId]) {
          acc[productId] = {
            productId,
            quantity: parseInt(item.quantity) || 1,
            unitPrice: parseFloat(item.unitPrice) || 0,
          };
        } else {
          acc[productId].quantity += parseInt(item.quantity) || 1;
        }
        return acc;
      }, {})
    );

    const submitData = {
      clientId: parseInt(formData.clientId),
      note: formData.note || "",
      items: mergedItems
    };

    onSubmit(submitData);
  };

  const resetForm = () => {
    setFormData({
      clientId: "",
      note: "",
      items: [{ productId: "", quantity: 1, unitPrice: 0 }]
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
    >
      <Card sx={{ maxWidth: 800, mx: "auto", boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            {editingInvoice ? "Modifier la facture" : "Créer une facture"}
          </Typography>
          
          <form onSubmit={handleSubmit}>
            {/* Client Selection */}
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Client</InputLabel>
              <Select
                value={formData.clientId}
                onChange={handleClientChange}
                label="Client"
              >
                {clients.map((client) => (
                  <MenuItem key={client.id} value={client.id.toString()}>
                    {client.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Items Section */}
            <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, fontWeight: 600 }}>
              Produits
            </Typography>
            
            {formData.items.map((item, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 2, alignItems: 'center' }}>
                  {/* Product Selection */}
                  <FormControl fullWidth required>
                    <InputLabel>Produit</InputLabel>
                    <Select
                      value={item.productId}
                      onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                      label="Produit"
                    >
                      {products.map((product) => (
                        <MenuItem key={product.id} value={product.id.toString()}>
                          {product.name} - {product.price?.toFixed(2)} DZD
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Quantity */}
                  <TextField
                    label="Quantité"
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                    inputProps={{ min: 1 }}
                    required
                  />

                  {/* Total */}
                  <TextField
                    label="Total (DZD)"
                    value={(item.quantity * item.unitPrice).toFixed(2)}
                    disabled
                    sx={{ 
                      '& .MuiInputBase-input': { 
                        fontWeight: 'bold',
                        textAlign: 'right'
                      }
                    }}
                  />

                  {/* Remove Button */}
                  <IconButton 
                    onClick={() => removeItem(index)}
                    disabled={formData.items.length === 1}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </Box>
            ))}

            {/* Add Item Button */}
            <Button
              onClick={addItem}
              startIcon={<Add />}
              variant="outlined"
              sx={{ mb: 3 }}
            >
              Ajouter un produit
            </Button>

            {/* Note */}
            <TextField
              label="Note (optionnel)"
              value={formData.note}
              onChange={handleNoteChange}
              fullWidth
              multiline
              rows={3}
              margin="normal"
            />

            <Divider sx={{ my: 2 }} />

            {/* Total */}
            <Typography variant="h6" sx={{ textAlign: 'right', mb: 3, fontWeight: 'bold' }}>
              Total estimé: {calculateTotal().toFixed(2)} DZD
            </Typography>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              {onCancel && (
                <Button 
                  onClick={onCancel} 
                  variant="outlined"
                  sx={{ minWidth: 120 }}
                >
                  Annuler
                </Button>
              )}
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                sx={{ minWidth: 120 }}
              >
                {editingInvoice ? "Modifier" : "Créer"}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}