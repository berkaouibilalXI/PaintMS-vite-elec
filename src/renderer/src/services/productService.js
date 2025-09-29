import api from './api';

const getProducts = async () => {
    const response = await api.get('/products');
    return response.data;
}

const getProductById = async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
}

const createProduct = async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
}

const updateProduct = async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
}

const deleteProduct = async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
}

export default {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};