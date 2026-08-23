import {
  pgTable,
  text,
  timestamp,
  boolean,
  serial,
  integer,
  bigint, 
  jsonb,
  uniqueIndex,
  index,
  varchar,
} from 'drizzle-orm/pg-core'

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),  
  // Employee information fields
  phone: varchar('phone', { length: 20 }),
  employeeNumber: varchar('employeeNumber', { length: 50 }),
  department: varchar('department', { length: 100 }),
  jobTitle: varchar('jobTitle', { length: 100 }),
  employmentStatus: varchar('employmentStatus', { length: 50 }).default('active'),
  lastLogin: timestamp('lastLogin'),
  profilePhoto: text('profilePhoto'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- App tables: Multi-tenant Legal Workspace SaaS ---------------------

// Organizations (Law Firms)
export const organization = pgTable('organization', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(), // Organization owner
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  logo: text('logo'),
  description: text('description'),
  subscription: varchar('subscription', { length: 50 }).default('free').notNull(), // free, pro, enterprise
  storageLimit: bigint('storageLimit', { mode: 'number' }).default(5368709120),
  storageUsed: integer('storageUsed').default(0),
  maxUsers: integer('maxUsers').default(5),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// Organization Members
export const organizationMember = pgTable('organizationMember', {
  id: text('id').primaryKey(),
  organizationId: text('organizationId').notNull(),
  userId: text('userId').notNull(),
  role: varchar('role', { length: 20 }).default('member').notNull(), // owner, admin, member
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// Clients
export const client = pgTable('client', {
  id: text('id').primaryKey(),
  organizationId: text('organizationId').notNull(),
  userId: text('userId').notNull(), // Created by user
  assignedAdvocateId: text('assignedAdvocateId'), // Assigned lawyer/advocate
  partnerId: text('partnerId'), // Partner in charge
  
  // Basic information
  name: text('name').notNull(),
  email: text('email'),
  phone: varchar('phone', { length: 20 }),
  
  // Type and categorization
  clientType: varchar('clientType', { length: 20 }).default('individual').notNull(), // individual, corporate
  
  // Individual fields
  fullName: text('fullName'),
  nationalId: varchar('nationalId', { length: 50 }),
  passport: varchar('passport', { length: 50 }),
  dateOfBirth: timestamp('dateOfBirth'),
  occupation: varchar('occupation', { length: 100 }),
  preferredCommunication: varchar('preferredCommunication', { length: 50 }), // sms, email, whatsapp
  
  // Corporate fields
  companyName: text('companyName'),
  registrationNumber: varchar('registrationNumber', { length: 50 }),
  kraPin: varchar('kraPin', { length: 50 }),
  contactPerson: text('contactPerson'),
  industry: varchar('industry', { length: 100 }),
  
  // Address information
  physicalAddress: text('physicalAddress'),
  postalAddress: text('postalAddress'),
  city: text('city'),
  country: text('country'),
  zipCode: varchar('zipCode', { length: 20 }),
  
  // Financial
  outstandingBalance: integer('outstandingBalance').default(0), // in cents
  
  // Status and metadata
  status: varchar('status', { length: 20 }).default('active').notNull(), // active, inactive, archived
  notes: text('notes'),
  
  // Tracking
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})


// Client Activity Timeline
export const clientActivity = pgTable('clientActivity', {
  id: text('id').primaryKey(),
  organizationId: text('organizationId').notNull(),
  clientId: text('clientId').notNull(),
  userId: text('userId'), // User who performed action
  activityType: varchar('activityType', { length: 50 }).notNull(), // client_created, matter_opened, invoice_generated, payment_received, document_uploaded, court_attendance, email_sent, sms_sent, matter_closed
  title: text('title').notNull(),
  description: text('description'),
  metadata: jsonb('metadata'), // Additional details specific to activity
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Cases/Matters
export const case_ = pgTable('case', {
  id: text('id').primaryKey(),
  organizationId: text('organizationId').notNull(),
  userId: text('userId').notNull(),
  clientId: text('clientId').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  caseNumber: text('caseNumber'),
  caseType: varchar('caseType', { length: 50 }).notNull(), // litigation, corporate, property, etc
  agreedFee: integer('agreedFee').default(0).notNull(), // in cents
  status: varchar('status', { length: 20 }).default('open').notNull(), // open, closed, on-hold
  priority: varchar('priority', { length: 10 }).default('medium').notNull(), // low, medium, high
  courtName: text('courtName'),
  judge: text('judge'),
  opponent: text('opponent'),
  startDate: timestamp('startDate'),
  targetDate: timestamp('targetDate'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})


// Invoices
export const invoice = pgTable('invoice', {
  id: text('id').primaryKey(),
  organizationId: text('organizationId').notNull(),
  clientId: text('clientId').notNull(),
  caseId: text('caseId'),
  invoiceNumber: varchar('invoiceNumber', { length: 50 }).notNull(),
  amount: integer('amount').notNull(), // in cents
  tax: integer('tax').default(0),
  total: integer('total').notNull(),
  status: varchar('status', { length: 20 }).default('draft').notNull(), // draft, sent, paid, overdue, cancelled
  issueDate: timestamp('issueDate').notNull(),
  dueDate: timestamp('dueDate'),
  paidDate: timestamp('paidDate'),
  description: text('description'),
  notes: text('notes'),
  createdBy: text('createdBy').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// Payments
export const payment = pgTable('payment', {
  id: text('id').primaryKey(),
  organizationId: text('organizationId').notNull(),
  invoiceId: text('invoiceId').notNull(),
  clientId: text('clientId').notNull(),
  amount: integer('amount').notNull(), // in cents
  paymentMethod: varchar('paymentMethod', { length: 50 }).notNull(), // bank_transfer, check, cash, card, mobile_money
  referenceNumber: varchar('referenceNumber', { length: 100 }),
  status: varchar('status', { length: 20 }).default('pending').notNull(), // pending, confirmed, failed
  paymentDate: timestamp('paymentDate').notNull(),
  confirmedDate: timestamp('confirmedDate'),
  notes: text('notes'),
  createdBy: text('createdBy').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Receipts
export const receipt = pgTable('receipt', {
  id: text('id').primaryKey(),
  organizationId: text('organizationId').notNull(),
  paymentId: text('paymentId').notNull(),
  clientId: text('clientId').notNull(),
  receiptNumber: varchar('receiptNumber', { length: 50 }).notNull(),
  amount: integer('amount').notNull(),
  receiptDate: timestamp('receiptDate').notNull(),
  fileUrl: text('fileUrl'), // PDF receipt file
  notes: text('notes'),
  createdBy: text('createdBy').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Documents
export const document = pgTable('document', {
  id: text('id').primaryKey(),
  organizationId: text('organizationId').notNull(),
  userId: text('userId').notNull(),
  caseId: text('caseId'),
  title: text('title').notNull(),
  description: text('description'),
  fileUrl: text('fileUrl').notNull(),
  fileName: text('fileName').notNull(),
  fileSize: integer('fileSize'),
  fileType: varchar('fileType', { length: 20 }),
  documentType: varchar('documentType', { length: 50 }), // contract, motion, evidence, etc
  visibility: varchar('visibility', { length: 20 }).default('private').notNull(), // private, team, client
  version: integer('version').default(1),
  isArchived: boolean('isArchived').default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// Document Sharing
export const documentShare = pgTable('documentShare', {
  id: text('id').primaryKey(),
  documentId: text('documentId').notNull(),
  sharedWith: text('sharedWith').notNull(), // userId or clientId
  sharedBy: text('sharedBy').notNull(),
  permission: varchar('permission', { length: 20 }).default('view').notNull(), // view, edit, comment
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Messages (Communication)
export const message = pgTable('message', {
  id: text('id').primaryKey(),
  organizationId: text('organizationId').notNull(),
  userId: text('userId').notNull(),
  channelId: text('channelId').notNull(),
  content: text('content').notNull(),
  mentions: jsonb('mentions'), // array of mentioned user IDs
  isEdited: boolean('isEdited').default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// Channels (Communication)
export const channel = pgTable('channel', {
  id: text('id').primaryKey(),
  organizationId: text('organizationId').notNull(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  channelType: varchar('channelType', { length: 20 }).default('general').notNull(), // general, case, client, direct
  isPrivate: boolean('isPrivate').default(false),
  caseId: text('caseId'),
  clientId: text('clientId'),
  members: jsonb('members'), // array of member IDs
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// Tasks/Workflow
export const task = pgTable('task', {
  id: text('id').primaryKey(),
  organizationId: text('organizationId').notNull(),
  userId: text('userId').notNull(),
  caseId: text('caseId'),
  title: text('title').notNull(),
  description: text('description'),
  assignedTo: text('assignedTo'),
  status: varchar('status', { length: 20 }).default('todo').notNull(), // todo, in-progress, done
  priority: varchar('priority', { length: 10 }).default('medium').notNull(), // low, medium, high
  dueDate: timestamp('dueDate'),
  reminder: boolean('reminder').default(false),
  reminderTime: timestamp('reminderTime'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// Calendar Events
export const calendarEvent = pgTable('calendarEvent', {
  id: text('id').primaryKey(),
  organizationId: text('organizationId').notNull(),
  userId: text('userId').notNull(),
  caseId: text('caseId'),
  title: text('title').notNull(),
  description: text('description'),
  eventType: varchar('eventType', { length: 30 }).notNull(), // hearing, deadline, meeting, court-date
  startTime: timestamp('startTime').notNull(),
  endTime: timestamp('endTime').notNull(),
  location: text('location'),
  attendees: jsonb('attendees'), // array of attendee IDs/emails
  reminder: boolean('reminder').default(true),
  reminderMinutes: integer('reminderMinutes').default(30),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// Time Tracking
export const timeEntry = pgTable('timeEntry', {
  id: text('id').primaryKey(),
  organizationId: text('organizationId').notNull(),
  userId: text('userId').notNull(),
  caseId: text('caseId'),
  description: text('description').notNull(),
  duration: integer('duration').notNull(), // in minutes
  billableRate: integer('billableRate'), // in cents
  isBillable: boolean('isBillable').default(true),
  date: timestamp('date').notNull().defaultNow(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Activity Log (Audit Trail)
export const activityLog = pgTable('activityLog', {
  id: text('id').primaryKey(),
  organizationId: text('organizationId').notNull(),
  userId: text('userId'),
  entityType: varchar('entityType', { length: 50 }).notNull(), // case, document, task, etc
  entityId: text('entityId').notNull(),
  action: varchar('action', { length: 50 }).notNull(), // created, updated, deleted, shared
  metadata: jsonb('metadata'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})


// --- RBAC Tables (Role-Based Access Control) ---

// Roles
export const role = pgTable('role', {
  id: text('id').primaryKey(),
  organizationId: text('organizationId').notNull(),
  name: varchar('name', { length: 50 }).notNull(), // admin, manager, attorney, paralegal, support
  description: text('description'),
  isSystem: boolean('isSystem').default(false), // system roles cannot be deleted
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// Module/Permission definitions
export const module = pgTable('module', {
  id: text('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(), // dashboard, cases, clients, documents, messaging, calendar, tasks, time-tracking, search, security
  displayName: text('displayName').notNull(),
  description: text('description'),
  icon: text('icon'), // lucide icon name
  order: integer('order').default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Permissions (actions within modules)
export const permission = pgTable('permission', {
  id: text('id').primaryKey(),
  moduleId: text('moduleId').notNull(),
  name: varchar('name', { length: 50 }).notNull(), // view, create, edit, delete, share
  description: text('description'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Role to Permission mapping
export const rolePermission = pgTable('rolePermission', {
  id: text('id').primaryKey(),
  roleId: text('roleId').notNull(),
  permissionId: text('permissionId').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// User credentials (for custom authentication)
export const userCredential = pgTable('userCredential', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  password: text('password').notNull(), // bcryptjs hashed
  isActive: boolean('isActive').default(true),
  isFirstLogin: boolean('isFirstLogin').default(true), // force password change on first login
  lastPasswordChange: timestamp('lastPasswordChange'),
  passwordExpiresAt: timestamp('passwordExpiresAt'),
  failedLoginAttempts: integer('failedLoginAttempts').default(0),
  lockedUntil: timestamp('lockedUntil'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// User to Role mapping (many-to-many)
export const userRole = pgTable('userRole', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  roleId: text('roleId').notNull(),
  organizationId: text('organizationId').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Audit log for authentication events
export const authAuditLog = pgTable('authAuditLog', {
  id: text('id').primaryKey(),
  userId: text('userId'),
  email: text('email'),
  action: varchar('action', { length: 50 }).notNull(), // login, logout, failed-login, password-change, role-change
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  status: varchar('status', { length: 20 }).notNull(), // success, failed
  reason: text('reason'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// --- Document Collaboration Tables ---

// Document Versions (for version control and history)
export const documentVersion = pgTable('documentVersion', {
  id: text('id').primaryKey(),
  documentId: text('documentId').notNull(),
  versionNumber: integer('versionNumber').notNull(),
  fileUrl: text('fileUrl').notNull(),
  fileName: text('fileName').notNull(),
  fileSize: integer('fileSize'),
  changes: text('changes'), // summary of changes
  changedBy: text('changedBy').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Document Locks (prevent simultaneous editing)
export const documentLock = pgTable('documentLock', {
  id: text('id').primaryKey(),
  documentId: text('documentId').notNull().unique(),
  lockedBy: text('lockedBy').notNull(),
  lockedAt: timestamp('lockedAt').notNull().defaultNow(),
  expiresAt: timestamp('expiresAt').notNull(), // 30 minutes default
})

// Document Comments (threaded comments with @mentions)
export const documentComment = pgTable('documentComment', {
  id: text('id').primaryKey(),
  documentId: text('documentId').notNull(),
  userId: text('userId').notNull(),
  content: text('content').notNull(),
  mentions: jsonb('mentions'), // array of mentioned user IDs
  parentCommentId: text('parentCommentId'), // for threaded comments
  resolved: boolean('resolved').default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// Document Activity (comprehensive audit trail)
export const documentActivity = pgTable('documentActivity', {
  id: text('id').primaryKey(),
  documentId: text('documentId').notNull(),
  userId: text('userId').notNull(),
  action: varchar('action', { length: 50 }).notNull(), // view, edit, download, comment, share, lock, unlock, version-created
  details: jsonb('details'), // action-specific details
  ipAddress: text('ipAddress'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Document Collaborators (tracking who works on documents)
export const documentCollaborator = pgTable('documentCollaborator', {
  id: text('id').primaryKey(),
  documentId: text('documentId').notNull(),
  userId: text('userId').notNull(),
  permission: varchar('permission', { length: 20 }).notNull(), // view, edit, comment, manage
  addedBy: text('addedBy').notNull(),
  addedAt: timestamp('addedAt').notNull().defaultNow(),
})

// Note: Indexes should be created via SQL for optimal performance
// CREATE INDEX idx_case_organizationId ON "case"(organizationId);
// CREATE INDEX idx_client_organizationId ON client(organizationId);
// CREATE INDEX idx_document_organizationId ON document(organizationId);
// CREATE INDEX idx_message_channelId ON message(channelId);
// CREATE INDEX idx_task_organizationId ON task(organizationId);
// CREATE INDEX idx_role_organizationId ON role(organizationId);
// CREATE INDEX idx_userRole_userId ON userRole(userId);
// CREATE INDEX idx_userRole_roleId ON userRole(roleId);
// CREATE INDEX idx_rolePermission_roleId ON rolePermission(roleId);
// CREATE INDEX idx_documentVersion_documentId ON documentVersion(documentId);
// CREATE INDEX idx_documentComment_documentId ON documentComment(documentId);
// CREATE INDEX idx_documentActivity_documentId ON documentActivity(documentId);
// CREATE INDEX idx_documentCollaborator_documentId ON documentCollaborator(documentId);
// CREATE INDEX idx_documentCollaborator_userId ON documentCollaborator(userId);
