import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  real,
  primaryKey,
  uniqueIndex,
  index,
  pgEnum,
  jsonb,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccountType } from "next-auth/adapters";

// ═══════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════

export const purchaseTypeEnum = pgEnum("purchase_type", [
  "buy",
  "rent",
  "auction",
]);
export const purchaseStatusEnum = pgEnum("purchase_status", [
  "pending",
  "completed",
  "refunded",
  "cancelled",
]);
export const notificationTypeEnum = pgEnum("notification_type", [
  "follow",
  "like",
  "comment",
  "purchase",
  "rent",
  "auction_bid",
  "auction_won",
  "message",
  "system",
]);

// ═══════════════════════════════════════════
// AUTH.JS TABLES
// ═══════════════════════════════════════════

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  username: text("username").unique(),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  password: text("password"),
  bio: text("bio"),
  location: text("location"),
  website: text("website"),
  coverImage: text("cover_image"),
  twitterHandle: text("twitter_handle"),
  instagramHandle: text("instagram_handle"),
  isPremium: boolean("is_premium").default(false).notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeConnectId: text("stripe_connect_id"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
);

// ═══════════════════════════════════════════
// MARKETPLACE TABLES
// ═══════════════════════════════════════════

export const categories = pgTable("category", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").unique().notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description"),
  coverImage: text("cover_image"),
});

export const photos = pgTable(
  "photo",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    description: text("description"),
    slug: text("slug").notNull(),

    // Storage URLs
    originalUrl: text("original_url").notNull(),
    watermarkedUrl: text("watermarked_url"),
    thumbnailUrl: text("thumbnail_url").notNull(),

    // Dimensions
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    fileSize: integer("file_size").notNull(),
    mimeType: text("mime_type").notNull(),

    // EXIF metadata
    camera: text("camera"),
    lens: text("lens"),
    aperture: text("aperture"),
    shutterSpeed: text("shutter_speed"),
    iso: text("iso"),
    focalLength: text("focal_length"),
    dateTaken: timestamp("date_taken", { mode: "date" }),
    locationTaken: text("location_taken"),
    hideLocation: boolean("hide_location").default(false).notNull(),

    // Monetization
    forSale: boolean("for_sale").default(false).notNull(),
    salePrice: real("sale_price"),
    forRent: boolean("for_rent").default(false).notNull(),
    rentPriceMonthly: real("rent_price_monthly"),
    forAuction: boolean("for_auction").default(false).notNull(),
    auctionStartBid: real("auction_start_bid"),
    auctionEndDate: timestamp("auction_end_date", { mode: "date" }),

    // Counters (denormalized for perf)
    viewCount: integer("view_count").default(0).notNull(),
    likeCount: integer("like_count").default(0).notNull(),
    downloadCount: integer("download_count").default(0).notNull(),

    // Relations
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    categoryId: text("category_id").references(() => categories.id),

    // Status
    isPublished: boolean("is_published").default(true).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),

    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (photo) => ({
    userIdx: index("photo_user_idx").on(photo.userId),
    categoryIdx: index("photo_category_idx").on(photo.categoryId),
    slugIdx: uniqueIndex("photo_slug_idx").on(photo.slug),
    createdAtIdx: index("photo_created_at_idx").on(photo.createdAt),
  })
);

export const tags = pgTable("tag", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").unique().notNull(),
  slug: text("slug").unique().notNull(),
});

export const photoTags = pgTable(
  "photo_tag",
  {
    photoId: text("photo_id")
      .notNull()
      .references(() => photos.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (pt) => ({
    pk: primaryKey({ columns: [pt.photoId, pt.tagId] }),
  })
);

export const licenses = pgTable("license", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  photoId: text("photo_id")
    .notNull()
    .references(() => photos.id, { onDelete: "cascade" }),
});

export const follows = pgTable(
  "follow",
  {
    followerId: text("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followingId: text("following_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (f) => ({
    pk: primaryKey({ columns: [f.followerId, f.followingId] }),
    followerIdx: index("follow_follower_idx").on(f.followerId),
    followingIdx: index("follow_following_idx").on(f.followingId),
  })
);

export const likes = pgTable(
  "like",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    photoId: text("photo_id")
      .notNull()
      .references(() => photos.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (l) => ({
    pk: primaryKey({ columns: [l.userId, l.photoId] }),
  })
);

export const comments = pgTable(
  "comment",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    text: text("text").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    photoId: text("photo_id")
      .notNull()
      .references(() => photos.id, { onDelete: "cascade" }),
    parentId: text("parent_id"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (c) => ({
    photoIdx: index("comment_photo_idx").on(c.photoId),
  })
);

export const collections = pgTable("collection", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(true).notNull(),
  coverPhotoId: text("cover_photo_id"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const collectionPhotos = pgTable(
  "collection_photo",
  {
    collectionId: text("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    photoId: text("photo_id")
      .notNull()
      .references(() => photos.id, { onDelete: "cascade" }),
    addedAt: timestamp("added_at", { mode: "date" }).defaultNow().notNull(),
  },
  (cp) => ({
    pk: primaryKey({ columns: [cp.collectionId, cp.photoId] }),
  })
);

export const purchases = pgTable(
  "purchase",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    photoId: text("photo_id")
      .notNull()
      .references(() => photos.id),
    buyerId: text("buyer_id")
      .notNull()
      .references(() => users.id),
    sellerId: text("seller_id")
      .notNull()
      .references(() => users.id),
    licenseId: text("license_id").references(() => licenses.id),
    type: purchaseTypeEnum("type").notNull(),
    price: real("price").notNull(),
    platformFee: real("platform_fee").notNull(),
    sellerEarnings: real("seller_earnings").notNull(),
    status: purchaseStatusEnum("status").default("pending").notNull(),
    stripePaymentId: text("stripe_payment_id"),
    rentStartDate: timestamp("rent_start_date", { mode: "date" }),
    rentEndDate: timestamp("rent_end_date", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (p) => ({
    buyerIdx: index("purchase_buyer_idx").on(p.buyerId),
    sellerIdx: index("purchase_seller_idx").on(p.sellerId),
  })
);

export const auctionBids = pgTable(
  "auction_bid",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    photoId: text("photo_id")
      .notNull()
      .references(() => photos.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    amount: real("amount").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (ab) => ({
    photoIdx: index("auction_bid_photo_idx").on(ab.photoId),
  })
);

export const notifications = pgTable(
  "notification",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    actorId: text("actor_id").references(() => users.id, {
      onDelete: "set null",
    }),
    type: notificationTypeEnum("type").notNull(),
    message: text("message").notNull(),
    photoId: text("photo_id").references(() => photos.id, {
      onDelete: "cascade",
    }),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (n) => ({
    userIdx: index("notification_user_idx").on(n.userId),
    unreadIdx: index("notification_unread_idx").on(n.userId, n.isRead),
  })
);

// ═══════════════════════════════════════════
// RELATIONS
// ═══════════════════════════════════════════

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  photos: many(photos),
  likes: many(likes),
  comments: many(comments),
  collections: many(collections),
  purchases: many(purchases, { relationName: "buyer" }),
  sales: many(purchases, { relationName: "seller" }),
  followers: many(follows, { relationName: "following" }),
  following: many(follows, { relationName: "follower" }),
  notifications: many(notifications, { relationName: "recipient" }),
  auctionBids: many(auctionBids),
}));

export const photosRelations = relations(photos, ({ one, many }) => ({
  user: one(users, { fields: [photos.userId], references: [users.id] }),
  category: one(categories, {
    fields: [photos.categoryId],
    references: [categories.id],
  }),
  tags: many(photoTags),
  licenses: many(licenses),
  likes: many(likes),
  comments: many(comments),
  purchases: many(purchases),
  auctionBids: many(auctionBids),
  collectionPhotos: many(collectionPhotos),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  photos: many(photos),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  photoTags: many(photoTags),
}));

export const photoTagsRelations = relations(photoTags, ({ one }) => ({
  photo: one(photos, { fields: [photoTags.photoId], references: [photos.id] }),
  tag: one(tags, { fields: [photoTags.tagId], references: [tags.id] }),
}));

export const licensesRelations = relations(licenses, ({ one }) => ({
  photo: one(photos, { fields: [licenses.photoId], references: [photos.id] }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: "follower",
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: "following",
  }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, { fields: [likes.userId], references: [users.id] }),
  photo: one(photos, { fields: [likes.photoId], references: [photos.id] }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, { fields: [comments.userId], references: [users.id] }),
  photo: one(photos, { fields: [comments.photoId], references: [photos.id] }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "replies",
  }),
  replies: many(comments, { relationName: "replies" }),
}));

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  user: one(users, { fields: [collections.userId], references: [users.id] }),
  photos: many(collectionPhotos),
}));

export const collectionPhotosRelations = relations(
  collectionPhotos,
  ({ one }) => ({
    collection: one(collections, {
      fields: [collectionPhotos.collectionId],
      references: [collections.id],
    }),
    photo: one(photos, {
      fields: [collectionPhotos.photoId],
      references: [photos.id],
    }),
  })
);

export const purchasesRelations = relations(purchases, ({ one }) => ({
  photo: one(photos, { fields: [purchases.photoId], references: [photos.id] }),
  buyer: one(users, {
    fields: [purchases.buyerId],
    references: [users.id],
    relationName: "buyer",
  }),
  seller: one(users, {
    fields: [purchases.sellerId],
    references: [users.id],
    relationName: "seller",
  }),
  license: one(licenses, {
    fields: [purchases.licenseId],
    references: [licenses.id],
  }),
}));

export const auctionBidsRelations = relations(auctionBids, ({ one }) => ({
  photo: one(photos, {
    fields: [auctionBids.photoId],
    references: [photos.id],
  }),
  user: one(users, { fields: [auctionBids.userId], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
    relationName: "recipient",
  }),
  actor: one(users, {
    fields: [notifications.actorId],
    references: [users.id],
  }),
  photo: one(photos, {
    fields: [notifications.photoId],
    references: [photos.id],
  }),
}));
