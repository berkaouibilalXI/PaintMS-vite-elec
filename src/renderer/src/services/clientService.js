import api from "./api";

const getClients = async () => {
    const res = await api.get('/clients');
    return res.data;
}

const createClient = async (clientData) => {
    const res = await api.post('/clients', clientData);
    return res.data;
}

const updateClient = async (clientId, clientData) => {
    const res = await api.put(`/clients/${clientId}`, clientData);
    return res.data;
}

const deleteClient = async (clientId) => {
    const res = await api.delete(`/clients/${clientId}`);
    return res.data;
}

export default {
    getClients,
    createClient,
    updateClient,
    deleteClient
};