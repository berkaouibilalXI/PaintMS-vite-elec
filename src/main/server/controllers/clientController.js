
import { eq, asc, desc, count, like } from 'drizzle-orm';
import { clients, invoices, invoiceItems } from '../drizzle/schemas';
import {db} from "../drizzle"

import { createClientSchema } from "../validations/clientValidation"

// Endpoint te3 les clients: /api/v1/clients

// GET all clients with optional search and pagination
const getAllClients = async (req, res) => {
  try {
    const { search, page = 1, limit = 50, sortBy = 'name', sortOrder = 'asc' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = db.select().from(clients);

    // Add search functionality
    if (search && search.trim()) {
      query = query.where(
        or(
          like(clients.name, `%${search.trim()}%`),
          like(clients.phone, `%${search.trim()}%`),
          like(clients.address, `%${search.trim()}%`)
        )
      );
    }

    // Add sorting
    const sortColumn = clients[sortBy] || clients.name;
    const orderFunction = sortOrder.toLowerCase() === 'desc' ? desc : asc;
    query = query.orderBy(orderFunction(sortColumn));

    // Add pagination
    query = query.limit(parseInt(limit)).offset(offset);

    const allClients = await query;

    // Get total count for pagination info
    let countQuery = db.select({ count: count() }).from(clients);
    if (search && search.trim()) {
      countQuery = countQuery.where(
        or(
          like(clients.name, `%${search.trim()}%`),
          like(clients.phone, `%${search.trim()}%`),
          like(clients.address, `%${search.trim()}%`)
        )
      );
    }
    const totalResult = await countQuery;
    const total = totalResult[0].count;

    if (allClients.length === 0) {
      return res.json({
        clients: [],
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          count: 0,
          totalRecords: total
        },
        message: search ? "Aucun client trouvé pour cette recherche" : "Aucun client trouvé"
      });
    }

    res.json({
      clients: allClients,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: allClients.length,
        totalRecords: total
      }
    });
  } catch (err) {
    console.error("Error getting clients:", err);
    res.status(500).json({ error: err.message });
  }
};

// POST create new client
const createClient = async (req, res) => {
  try {
    console.log("Creating client with data:", req.body);

    // Validation avant tout
    const result = createClientSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Validation échouée",
        details: result.error.errors
      });
    }

    const { name, phone, address } = result.data;

    // Check if client with same name and phone already exists
    if (phone) {
      const existingClient = await db
        .select()
        .from(clients)
        .where(eq(clients.phone, phone))
        .limit(1);

      if (existingClient.length > 0) {
        return res.status(400).json({
          error: "Un client avec ce numéro de téléphone existe déjà"
        });
      }
    }

    const [client] = await db
      .insert(clients)
      .values({
        name: name.trim(),
        phone: phone ? phone.trim() : null,
        address: address ? address.trim() : null,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    res.status(201).json(client);
  } catch (err) {
    console.error("Error creating client:", err);
    res.status(500).json({ error: err.message });
  }
};

// PUT update client
const editClient = async (req, res) => {
  const { id } = req.params;

  try {
    console.log("Updating client:", id, "with data:", req.body);

    const { name, phone, address } = req.body;

    // Basic validation
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Nom est requis' });
    }

    // Check if client exists
    const existingClient = await db
      .select()
      .from(clients)
      .where(eq(clients.id, parseInt(id)))
      .limit(1);

    if (existingClient.length === 0) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    // Check if phone number is already taken by another client
    if (phone && phone.trim()) {
      const phoneCheck = await db
        .select()
        .from(clients)
        .where(eq(clients.phone, phone.trim()))
        .limit(1);

      if (phoneCheck.length > 0 && phoneCheck[0].id !== parseInt(id)) {
        return res.status(400).json({
          error: 'Ce numéro de téléphone est déjà utilisé par un autre client'
        });
      }
    }

    // Build update object
    const updateData = {
      updatedAt: new Date()
    };

    if (name !== undefined) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
    if (address !== undefined) updateData.address = address ? address.trim() : null;

    const [updatedClient] = await db
      .update(clients)
      .set(updateData)
      .where(eq(clients.id, parseInt(id)))
      .returning();

    res.json(updatedClient);
  } catch (err) {
    console.error("Error updating client:", err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE client with foreign key constraint handling
const deleteClient = async (req, res) => {
  const { id } = req.params;

  try {
    console.log("Attempting to delete client:", id);

    // Check if client exists
    const existingClient = await db
      .select()
      .from(clients)
      .where(eq(clients.id, parseInt(id)))
      .limit(1);

    if (existingClient.length === 0) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    // Check if client has any invoices
    const clientInvoices = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        total: invoices.total,
        paid: invoices.paid
      })
      .from(invoices)
      .where(eq(invoices.clientId, parseInt(id)));

    if (clientInvoices.length > 0) {
      const invoiceNumbers = clientInvoices.map(inv => inv.invoiceNumber);
      console.log(`Client ${id} has invoices:`, invoiceNumbers);
      
      return res.status(400).json({
        error: "Impossible de supprimer ce client",
        message: `Ce client a ${clientInvoices.length} facture(s): ${invoiceNumbers.join(', ')}. Supprimez d'abord ces factures.`,
        invoiceCount: clientInvoices.length,
        invoices: clientInvoices
      });
    }

    console.log(`Client ${id} has no invoices, proceeding with deletion`);

    // Delete the client
    const [deletedClient] = await db
      .delete(clients)
      .where(eq(clients.id, parseInt(id)))
      .returning();

    res.json({
      message: 'Client supprimé avec succès',
      client: deletedClient
    });
  } catch (err) {
    console.error("Error deleting client:", err);

    // Handle foreign key constraint errors
    if (err.message && (
      err.message.includes('FOREIGN KEY constraint failed') ||
      err.message.includes('foreign key constraint')
    )) {
      return res.status(400).json({
        error: 'Impossible de supprimer ce client',
        message: 'Ce client est lié à des factures existantes. Supprimez d\'abord les factures de ce client.'
      });
    }

    res.status(500).json({ error: err.message });
  }
};

// GET single client by ID with related data
const getClientById = async (req, res) => {
  const { id } = req.params;

  try {
    // Get client info
    const client = await db
      .select()
      .from(clients)
      .where(eq(clients.id, parseInt(id)))
      .limit(1);

    if (client.length === 0) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    // Get client's invoices
    const clientInvoices = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        date: invoices.date,
        total: invoices.total,
        paid: invoices.paid,
        note: invoices.note
      })
      .from(invoices)
      .where(eq(invoices.clientId, parseInt(id)))
      .orderBy(desc(invoices.date));

    // Calculate statistics
    const stats = {
      totalInvoices: clientInvoices.length,
      totalAmount: clientInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0),
      paidAmount: clientInvoices
        .filter(inv => inv.paid)
        .reduce((sum, inv) => sum + (inv.total || 0), 0),
      unpaidAmount: clientInvoices
        .filter(inv => !inv.paid)
        .reduce((sum, inv) => sum + (inv.total || 0), 0),
      paidInvoices: clientInvoices.filter(inv => inv.paid).length,
      unpaidInvoices: clientInvoices.filter(inv => !inv.paid).length
    };

    res.json({
      client: client[0],
      invoices: clientInvoices,
      statistics: stats
    });
  } catch (err) {
    console.error("Error getting client:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET clients with statistics
const getClientsWithStats = async (req, res) => {
  try {
    const allClients = await db
      .select()
      .from(clients)
      .orderBy(asc(clients.name));

    // Get statistics for each client
    const clientsWithStats = await Promise.all(
      allClients.map(async (client) => {
        const clientInvoices = await db
          .select({
            id: invoices.id,
            total: invoices.total,
            paid: invoices.paid
          })
          .from(invoices)
          .where(eq(invoices.clientId, client.id));

        const stats = {
          totalInvoices: clientInvoices.length,
          totalAmount: clientInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0),
          paidAmount: clientInvoices
            .filter(inv => inv.paid)
            .reduce((sum, inv) => sum + (inv.total || 0), 0),
          unpaidAmount: clientInvoices
            .filter(inv => !inv.paid)
            .reduce((sum, inv) => sum + (inv.total || 0), 0),
          paidInvoices: clientInvoices.filter(inv => inv.paid).length,
          unpaidInvoices: clientInvoices.filter(inv => !inv.paid).length
        };

        return {
          ...client,
          statistics: stats
        };
      })
    );

    res.json(clientsWithStats);
  } catch (err) {
    console.error("Error getting clients with stats:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET top clients by revenue
const getTopClients = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const allClients = await db
      .select()
      .from(clients);

    // Get revenue for each client
    const clientsWithRevenue = await Promise.all(
      allClients.map(async (client) => {
        const clientInvoices = await db
          .select({ total: invoices.total })
          .from(invoices)
          .where(eq(invoices.clientId, client.id));

        const totalRevenue = clientInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

        return {
          ...client,
          totalRevenue,
          invoiceCount: clientInvoices.length
        };
      })
    );

    // Sort by revenue and limit results
    const topClients = clientsWithRevenue
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, parseInt(limit))
      .filter(client => client.totalRevenue > 0); // Only clients with revenue

    res.json(topClients);
  } catch (err) {
    console.error("Error getting top clients:", err);
    res.status(500).json({ error: err.message });
  }
};

export  {
  getAllClients,
  createClient,
  editClient,
  deleteClient,
  getClientById,
  getClientsWithStats,
  getTopClients
};

// import {getPrismaSingletonClient} from "../prisma/utils/prismaClient"
// const prisma = getPrismaSingletonClient()

// const {createClientSchema} = require("../validations/clientValidation");
// const validate = require("../middlewares/validationMiddleware");

// //Endpoint te3 les clients: /api/v1/clients

// //lister ga3 les clients li kynin f la table
// const getAllClients = async (req, res) => {
//   try {
//     const clients = await prisma.client.findMany({
//       orderBy: { name: "asc" },
//     });
//     if (clients.length == 0) {
//       return res.json({
//         Message: "DIR DES CLIENTS W WELLI",
//       });
//     }
//     res.json(clients);
//   } catch (err) {
//     res.status(500).json({error: err.message});
//   }
// };

// //nzidou client
// const createClient = async (req, res) => {
//   //Validation avant tt
//   const result =  createClientSchema.safeParse(req.body);
//   if(!result.success){
//     return res.status(400).json({
//       error:  result.error.errors[0].message
//     });
//   }


//   const { name, phone, address } = result.data;
//   try {
//     const client = await prisma.client.create({
//       data: { name, phone, address },
//     });
//     res.status(201).json(client);
//   } catch (err) {
//     res.status(400).json({error: err.message});
//   }
// };

// //nmodifou client

// const editClient =  async (req, res) => {
//     const { id } = req.params;
//     const { name, phone, address } = req.body;

//     // Validation basique
//     if (!name || name.trim() === '') {
//         return res.status(400).json({ error: 'Nom est requis' });
//     }

//     try {
//         const client = await prisma.client.update({
//             where: { id: parseInt(id) },
//             data: { name: name.trim(), phone, address }
//         });
//         res.json(client);
//     } catch (err) {
//         if (err.code === 'P2025') {
//             return res.status(404).json({ error: 'Client non trouvé' });
//         }
//         res.status(500).json({ error: err.message });
//     }
// };

// //nsupprimou client
// const deleteClient = async (req, res) => {
//     const { id } = req.params;
//     try {
//         const client = await prisma.client.delete({
//             where: {
//                 id: parseInt(id)
//             }
//         });
//         res.json({ message: 'Client supprimé avec succès', client });
//     } catch (err) {
//         if (err.code === 'P2025') {
//             return res.status(404).json({ error: 'Client non trouvé' });
//         }
//         res.status(500).json({ error: err.message });
//     }
// }

// module.exports = {
//     getAllClients,
//     createClient,
//     editClient,
//     deleteClient,
// }