import { relations } from "drizzle-orm";

import {
    pgTable,
    pgEnum,
    text,
    timestamp,
    boolean,
    index,
    uniqueIndex,
    uuid,
    integer,
} from "drizzle-orm/pg-core";

// ============================================================
// 1. ENUMS
// ============================================================

export const startupStatusEnum = pgEnum("startup_status", [
    "draft",
    "submitted",
    "under_review",
    "approved",
    "rejected",
    "archived",
]);

export const documentTypeEnum = pgEnum("document_type", [
    "pitch_deck",
    "business_plan",
    "financial_model",
    "incorporation_certificate",
    "nda",
    "contract",
    "other",
]);

export const agreementTypeEnum = pgEnum("agreement_type", [
    "nda",
    "contract",
]);

export const agreementStatusEnum = pgEnum("agreement_status", [
    "draft",
    "sent",
    "viewed",
    "partially_signed",
    "signed",
    "declined",
    "expired",
    "voided",
]);

export const signatureStatusEnum = pgEnum("signature_status", [
    "pending",
    "signed",
    "declined",
]);

export const signerRoleEnum = pgEnum("signer_role", [
    "startup_representative",
    "platform_admin",
]);


// ============================================================
// 2. BETTER AUTH - USER
// ============================================================

export const user = pgTable("user", {
    id: text("id").primaryKey(),

    name: text("name").notNull(),

    email: text("email").notNull().unique(),

    emailVerified: boolean("email_verified")
        .default(false)
        .notNull(),

    image: text("image"),

    createdAt: timestamp("created_at")
        .defaultNow()
        .notNull(),

    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),

    // Better Auth Admin Plugin
    role: text("role"),

    banned: boolean("banned").default(false),

    banReason: text("ban_reason"),

    banExpires: timestamp("ban_expires"),
});


// ============================================================
// 3. BETTER AUTH - SESSION
// ============================================================

export const session = pgTable(
    "session",
    {
        id: text("id").primaryKey(),

        expiresAt: timestamp("expires_at").notNull(),

        token: text("token").notNull().unique(),

        createdAt: timestamp("created_at")
            .defaultNow()
            .notNull(),

        updatedAt: timestamp("updated_at")
            .$onUpdate(() => new Date())
            .notNull(),

        ipAddress: text("ip_address"),

        userAgent: text("user_agent"),

        userId: text("user_id")
            .notNull()
            .references(() => user.id, {
                onDelete: "cascade",
            }),

        // Better Auth Admin Plugin
        impersonatedBy: text("impersonated_by"),
    },
    (table) => [
        index("session_userId_idx").on(table.userId),
    ],
);


// ============================================================
// 4. BETTER AUTH - ACCOUNT
// ============================================================

export const account = pgTable(
    "account",
    {
        id: text("id").primaryKey(),

        accountId: text("account_id").notNull(),

        providerId: text("provider_id").notNull(),

        userId: text("user_id")
            .notNull()
            .references(() => user.id, {
                onDelete: "cascade",
            }),

        accessToken: text("access_token"),

        refreshToken: text("refresh_token"),

        idToken: text("id_token"),

        accessTokenExpiresAt: timestamp("access_token_expires_at"),

        refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),

        scope: text("scope"),

        password: text("password"),

        createdAt: timestamp("created_at")
            .defaultNow()
            .notNull(),

        updatedAt: timestamp("updated_at")
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        index("account_userId_idx").on(table.userId),
    ],
);


// ============================================================
// 5. BETTER AUTH - VERIFICATION
// ============================================================

export const verification = pgTable(
    "verification",
    {
        id: text("id").primaryKey(),

        identifier: text("identifier").notNull(),

        value: text("value").notNull(),

        expiresAt: timestamp("expires_at").notNull(),

        createdAt: timestamp("created_at")
            .defaultNow()
            .notNull(),

        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        index("verification_identifier_idx").on(table.identifier),
    ],
);


// ============================================================
// 6. STARTUP
// ============================================================

export const startup = pgTable(
    "startup",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        createdByUserId: text("created_by_user_id")
            .notNull()
            .references(() => user.id, {
                onDelete: "restrict",
            }),

        name: text("name").notNull(),

        slug: text("slug").notNull().unique(),

        legalName: text("legal_name"),

        description: text("description"),

        website: text("website"),

        industry: text("industry"),

        stage: text("stage"),

        teamSize: integer("team_size"),

        country: text("country"),

        state: text("state"),

        city: text("city"),

        logoKey: text("logo_key"),

        status: startupStatusEnum("status")
            .default("draft")
            .notNull(),

        onboardingCompletedAt: timestamp("onboarding_completed_at"),

        submittedAt: timestamp("submitted_at"),

        createdAt: timestamp("created_at")
            .defaultNow()
            .notNull(),

        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        index("startup_creator_idx").on(table.createdByUserId),

        index("startup_status_idx").on(table.status),
    ],
);


// ============================================================
// 7. STARTUP DOCUMENTS
// ============================================================

export const startupDocument = pgTable(
    "startup_document",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        startupId: uuid("startup_id")
            .notNull()
            .references(() => startup.id, {
                onDelete: "cascade",
            }),

        uploadedByUserId: text("uploaded_by_user_id")
            .references(() => user.id, {
                onDelete: "set null",
            }),

        documentType: documentTypeEnum("document_type")
            .notNull(),

        fileName: text("file_name").notNull(),

        storageKey: text("storage_key").notNull().unique(),

        mimeType: text("mime_type").notNull(),

        sizeBytes: integer("size_bytes").notNull(),

        createdAt: timestamp("created_at")
            .defaultNow()
            .notNull(),

        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        index("startup_document_startup_idx").on(table.startupId),

        index("startup_document_uploader_idx").on(table.uploadedByUserId),
    ],
);


// ============================================================
// 8. STARTUP AGREEMENTS (NDA / CONTRACT)
// ============================================================

export const startupAgreement = pgTable(
    "startup_agreement",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        startupId: uuid("startup_id")
            .notNull()
            .references(() => startup.id, {
                onDelete: "cascade",
            }),

        documentId: uuid("document_id")
            .references(() => startupDocument.id, {
                onDelete: "set null",
            }),

        createdByUserId: text("created_by_user_id")
            .references(() => user.id, {
                onDelete: "set null",
            }),

        type: agreementTypeEnum("type").notNull(),

        title: text("title").notNull(),

        version: integer("version")
            .default(1)
            .notNull(),

        status: agreementStatusEnum("status")
            .default("draft")
            .notNull(),

        sentAt: timestamp("sent_at"),

        viewedAt: timestamp("viewed_at"),

        fullySignedAt: timestamp("fully_signed_at"),

        expiresAt: timestamp("expires_at"),

        voidedAt: timestamp("voided_at"),

        createdAt: timestamp("created_at")
            .defaultNow()
            .notNull(),

        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        index("startup_agreement_startup_idx").on(table.startupId),

        index("startup_agreement_status_idx").on(table.status),

        uniqueIndex("startup_agreement_version_idx").on(
            table.startupId,
            table.type,
            table.version,
        ),
    ],
);


// ============================================================
// 9. AGREEMENT SIGNATURES
// ============================================================

export const agreementSignature = pgTable(
    "agreement_signature",
    {
        id: uuid("id")
            .defaultRandom()
            .primaryKey(),

        agreementId: uuid("agreement_id")
            .notNull()
            .references(() => startupAgreement.id, {
                onDelete: "cascade",
            }),

        signerUserId: text("signer_user_id")
            .references(() => user.id, {
                onDelete: "set null",
            }),

        signerName: text("signer_name").notNull(),

        signerEmail: text("signer_email").notNull(),

        signerRole: signerRoleEnum("signer_role").notNull(),

        status: signatureStatusEnum("status")
            .default("pending")
            .notNull(),

        // Whether this person must sign the agreement
        isRequired: boolean("is_required")
            .default(true)
            .notNull(),

        signedAt: timestamp("signed_at"),

        declinedAt: timestamp("declined_at"),

        // External e-signature provider references
        signatureProvider: text("signature_provider"),

        providerEnvelopeId: text("provider_envelope_id"),

        providerSignerId: text("provider_signer_id"),

        createdAt: timestamp("created_at")
            .defaultNow()
            .notNull(),

        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        index("agreement_signature_agreement_idx").on(table.agreementId),

        index("agreement_signature_user_idx").on(table.signerUserId),

        uniqueIndex("agreement_signature_email_idx").on(
            table.agreementId,
            table.signerEmail,
        ),
    ],
);


// ============================================================
// 10. USER RELATIONS
// ============================================================

export const userRelations = relations(user, ({ many }) => ({
    sessions: many(session),

    accounts: many(account),

    startups: many(startup),

    uploadedDocuments: many(startupDocument),

    createdAgreements: many(startupAgreement),

    agreementSignatures: many(agreementSignature),
}));


// ============================================================
// 11. SESSION RELATIONS
// ============================================================

export const sessionRelations = relations(session, ({ one }) => ({
    user: one(user, {
        fields: [session.userId],
        references: [user.id],
    }),
}));


// ============================================================
// 12. ACCOUNT RELATIONS
// ============================================================

export const accountRelations = relations(account, ({ one }) => ({
    user: one(user, {
        fields: [account.userId],
        references: [user.id],
    }),
}));


// ============================================================
// 13. STARTUP RELATIONS
// ============================================================

export const startupRelations = relations(startup, ({ one, many }) => ({
    createdBy: one(user, {
        fields: [startup.createdByUserId],
        references: [user.id],
    }),

    documents: many(startupDocument),

    agreements: many(startupAgreement),
}));


// ============================================================
// 14. STARTUP DOCUMENT RELATIONS
// ============================================================

export const startupDocumentRelations = relations(
    startupDocument,
    ({ one, many }) => ({
        startup: one(startup, {
            fields: [startupDocument.startupId],
            references: [startup.id],
        }),

        uploadedBy: one(user, {
            fields: [startupDocument.uploadedByUserId],
            references: [user.id],
        }),

        agreements: many(startupAgreement),
    }),
);


// ============================================================
// 15. STARTUP AGREEMENT RELATIONS
// ============================================================

export const startupAgreementRelations = relations(
    startupAgreement,
    ({ one, many }) => ({
        startup: one(startup, {
            fields: [startupAgreement.startupId],
            references: [startup.id],
        }),

        document: one(startupDocument, {
            fields: [startupAgreement.documentId],
            references: [startupDocument.id],
        }),

        createdBy: one(user, {
            fields: [startupAgreement.createdByUserId],
            references: [user.id],
        }),

        signatures: many(agreementSignature),
    }),
);


// ============================================================
// 16. AGREEMENT SIGNATURE RELATIONS
// ============================================================

export const agreementSignatureRelations = relations(
    agreementSignature,
    ({ one }) => ({
        agreement: one(startupAgreement, {
            fields: [agreementSignature.agreementId],
            references: [startupAgreement.id],
        }),

        signer: one(user, {
            fields: [agreementSignature.signerUserId],
            references: [user.id],
        }),
    }),
);