import { pgTable, text, timestamp, uuid, varchar, integer, decimal, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// User roles: USER, ADMIN
// USER: Can add properties and explore LIVE properties
// ADMIN: Can manage all properties, assign verification, approve/reject
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }),
  profilePic: text('profile_pic'),
  role: varchar('role', { length: 50 }).notNull().default('USER'), // USER | ADMIN
  phone: varchar('phone', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  clerkIdIdx: index('clerk_id_idx').on(table.clerkId),
  roleIdx: index('role_idx').on(table.role),
}));

// Property status flow:
// 1. USER uploads property → PENDING_ADMIN_REVIEW
// 2. ADMIN assigns verifier → VERIFICATION_IN_PROGRESS
// 3. ADMIN reviews and approves → LIVE (or REJECTED)
export const properties = pgTable('properties', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  address: text('address').notNull(),
  locationLat: decimal('location_lat', { precision: 10, scale: 8 }),
  locationLng: decimal('location_lng', { precision: 11, scale: 8 }),
  rent: integer('rent').notNull(), // Monthly rent
  amenities: text('amenities').array().default([]), // ["WiFi", "Parking", "AC"]
  images: text('images').array().default([]), // User uploaded images
  verifiedImages: text('verified_images').array().default([]), // Admin uploaded verified images after verification
  propertyType: varchar('property_type', { length: 50 }).notNull(), // room | flat | house
  status: varchar('status', { length: 50 }).notNull().default('PENDING_ADMIN_REVIEW'), // PENDING_ADMIN_REVIEW | VERIFICATION_IN_PROGRESS | LIVE | REJECTED
  
  // Property owner (USER who uploaded)
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  ownerContact: varchar('owner_contact', { length: 100 }).notNull(), // Required contact details
  
  // Verification tracking
  assignedVerifier: varchar('assigned_verifier', { length: 255 }), // Name of staff assigned to verify
  verificationStartDate: timestamp('verification_start_date'), // When verification was assigned
  verificationEndDate: timestamp('verification_end_date'), // When admin completed review
  estimatedDays: integer('estimated_days'), // Admin can set estimated days for verification
  
  // Admin management
  adminNotes: text('admin_notes'), // Internal notes for tracking
  rejectionReason: text('rejection_reason'), // Reason if property is rejected
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  statusIdx: index('status_idx').on(table.status),
  ownerIdx: index('owner_idx').on(table.ownerId),
  typeIdx: index('type_idx').on(table.propertyType),
}));

// Chat between user and property owner
export const chats = pgTable('chats', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  propertyId: uuid('property_id').references(() => properties.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('chat_user_idx').on(table.userId),
  ownerIdx: index('chat_owner_idx').on(table.ownerId),
  propertyIdx: index('chat_property_idx').on(table.propertyId),
}));

// Messages in a chat
export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  chatId: uuid('chat_id').references(() => chats.id, { onDelete: 'cascade' }).notNull(),
  senderId: uuid('sender_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  text: text('text').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  chatIdx: index('message_chat_idx').on(table.chatId),
  senderIdx: index('message_sender_idx').on(table.senderId),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  properties: many(properties),
  chatsAsUser: many(chats, { relationName: 'userChats' }),
  chatsAsOwner: many(chats, { relationName: 'ownerChats' }),
  messages: many(messages),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  owner: one(users, {
    fields: [properties.ownerId],
    references: [users.id],
  }),
  chats: many(chats),
}));

export const chatsRelations = relations(chats, ({ one, many }) => ({
  user: one(users, {
    fields: [chats.userId],
    references: [users.id],
    relationName: 'userChats',
  }),
  owner: one(users, {
    fields: [chats.ownerId],
    references: [users.id],
    relationName: 'ownerChats',
  }),
  property: one(properties, {
    fields: [chats.propertyId],
    references: [properties.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));
