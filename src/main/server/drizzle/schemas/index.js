import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { sql, relations} from 'drizzle-orm';

// Client table
export const clients = sqliteTable('Client', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  phone: text('phone'),
  address: text('address'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull()
});

// Product table
export const products = sqliteTable('Product', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  price: real('price').notNull(),
  unit: text('unit').default('unité'),
  description: text('description'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull()
});

// Invoice table
export const invoices = sqliteTable('Invoice', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  invoiceNumber: text('invoiceNumber').unique().notNull(),
  clientId: integer('clientId').notNull().references(() => clients.id),
  date: integer('date', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  dueDate: integer('dueDate', { mode: 'timestamp' }),
  paid: integer('paid', { mode: 'boolean' }).default(false).notNull(),
  total: real('total').default(0).notNull(),
  note: text('note'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull()
}, (table) => ({
  clientIdIdx: index('Invoice_clientId_idx').on(table.clientId),
  dateIdx: index('Invoice_date_idx').on(table.date)
}));

// InvoiceItem table
export const invoiceItems = sqliteTable('InvoiceItem', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  invoiceId: integer('invoiceId').notNull().references(() => invoices.id),
  productId: integer('productId').notNull().references(() => products.id),
  quantity: integer('quantity').default(1).notNull(),
  unitPrice: real('unitPrice').notNull(),
  total: real('total').default(0).notNull()
}, (table) => ({
  invoiceIdIdx: index('InvoiceItem_invoiceId_idx').on(table.invoiceId),
  productIdIdx: index('InvoiceItem_productId_idx').on(table.productId)
}));

// User table
export const users = sqliteTable('User', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  name: text('name'),
  loginType: text('loginType').default('email').notNull(),
  username: text('username').unique(),
  theme: text('theme').default('light').notNull(),
  language: text('language').default('fr').notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull()
});

// UserActivityLog table
export const userActivityLogs = sqliteTable('UserActivityLog', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('userId').references(() => users.id),
  action: text('action').notNull(),
  details: text('details'), // JSON string
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull()
}, (table) => ({
  userIdIdx: index('UserActivityLog_userId_idx').on(table.userId),
  createdAtIdx: index('UserActivityLog_createdAt_idx').on(table.createdAt)
}));

// Relations
export const clientsRelations = relations(clients, ({ many }) => ({
  invoices: many(invoices)
}));

export const productsRelations = relations(products, ({ many }) => ({
  invoiceItems: many(invoiceItems)
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id]
  }),
  items: many(invoiceItems)
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id]
  }),
  product: one(products, {
    fields: [invoiceItems.productId],
    references: [products.id]
  })
}));

export const usersRelations = relations(users, ({ many }) => ({
  activityLogs: many(userActivityLogs)
}));

export const userActivityLogsRelations = relations(userActivityLogs, ({ one }) => ({
  user: one(users, {
    fields: [userActivityLogs.userId],
    references: [users.id]
  })
}));