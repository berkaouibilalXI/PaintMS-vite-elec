import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {AlertDialog,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogFooter
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import clientService from "../services/clientService";

function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setError(null); // Clear previous errors
      const data = await clientService.getClients();
      // Ensure data is an array, handle different response formats
      if (Array.isArray(data)) {
        setClients(data);
      } else if (data && Array.isArray(data.clients)) {
        // In case API returns {clients: [...]}
        setClients(data.clients);
      } else if (data && Array.isArray(data.data)) {
        // In case API returns {data: [...]}
        setClients(data.data);
      } else {
        // If data is not in expected format, set empty array
        console.warn("Unexpected data format from API:", data);
        setClients([]);
        setError("Format de données inattendu");
      }
    } catch (err) {
      console.error("Error fetching clients:", err);
      setError("Erreur lors du chargement des clients");
      setClients([]); // Ensure clients is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (client = null) => {
    setEditingClient(client);
    setFormData(
      client
        ? { name: client.name, phone: client.phone, address: client.address }
        : { name: "", phone: "", address: "" }
    );
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingClient(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingClient) {
        await clientService.updateClient(editingClient.id, formData);
      } else {
        await clientService.createClient(formData);
      }
      fetchClients();
      handleClose();
    } catch (err) {
      console.error("Error saving client:", err);
      setError("Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      try {
        await clientService.deleteClient(id);
        fetchClients();
      } catch (err) {
        console.error("Error deleting client:", err);
        setError("Erreur lors de la suppression");
      }
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Clients</h2>
          <Button onClick={() => handleOpen()}>Ajouter Client</Button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchClients}
              className="mt-2"
            >
              Réessayer
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Ensure clients is array before mapping */}
          {Array.isArray(clients) && clients.length > 0 ? (
            clients.map((client) => (
              <Card key={client.id}>
                <CardContent className="p-4 space-y-2">
                  <h3 className="text-lg font-semibold">{client.name}</h3>
                  <p className="text-gray-400">{client.phone}</p>
                  <p className="text-gray-500">{client.address}</p>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpen(client)}
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(client.id)}
                    >
                      Supprimer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              {error ? "Impossible de charger les clients" : "Aucun client trouvé"}
            </div>
          )}
        </div>

        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {editingClient ? "Modifier Client" : "Ajouter Client"}
              </AlertDialogTitle>
            </AlertDialogHeader>

            <div className="space-y-3">
              <Input
                placeholder="Nom complet"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <Input
                placeholder="Téléphone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
              <Input
                placeholder="Adresse"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>

            <AlertDialogFooter>
              <Button variant="ghost" onClick={handleClose}>
                Annuler
              </Button>
              <Button onClick={handleSubmit}>
                {editingClient ? "Modifier" : "Ajouter"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
}

export default ClientsPage;