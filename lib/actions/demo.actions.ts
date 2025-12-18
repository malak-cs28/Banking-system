"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "../appwrite";
import { parseStringify } from "../utils";

// Seed demo transactions for presentation
export const seedDemoTransactions = async ({ userId, bankId }: { userId: string; bankId: string }) => {
  try {
    const { database } = await createAdminClient();

    const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
    const APPWRITE_TRANSACTION_COLLECTION_ID = process.env.APPWRITE_TRANSACTION_COLLECTION_ID!;

    // Sample transactions for demo
    const demoTransactions = [
      {
        name: "Starbucks Coffee",
        amount: -5.50,
        channel: "online",
        category: "Food and Drink",
        senderBankId: bankId,
        receiverBankId: "",
        type: "debit",
      },
      {
        name: "Amazon Purchase",
        amount: -89.99,
        channel: "online",
        category: "Shopping",
        senderBankId: bankId,
        receiverBankId: "",
        type: "debit",
      },
      {
        name: "Salary Deposit",
        amount: 3500.00,
        channel: "other",
        category: "Transfer",
        senderBankId: "",
        receiverBankId: bankId,
        type: "credit",
      },
      {
        name: "Uber Ride",
        amount: -12.75,
        channel: "online",
        category: "Travel",
        senderBankId: bankId,
        receiverBankId: "",
        type: "debit",
      },
      {
        name: "Netflix Subscription",
        amount: -15.99,
        channel: "online",
        category: "Entertainment",
        senderBankId: bankId,
        receiverBankId: "",
        type: "debit",
      },
      {
        name: "Grocery Store",
        amount: -125.43,
        channel: "in store",
        category: "Food and Drink",
        senderBankId: bankId,
        receiverBankId: "",
        type: "debit",
      },
      {
        name: "Freelance Payment",
        amount: 850.00,
        channel: "online",
        category: "Transfer",
        senderBankId: "",
        receiverBankId: bankId,
        type: "credit",
      },
      {
        name: "Gas Station",
        amount: -45.20,
        channel: "in store",
        category: "Travel",
        senderBankId: bankId,
        receiverBankId: "",
        type: "debit",
      },
      {
        name: "Restaurant",
        amount: -67.50,
        channel: "in store",
        category: "Food and Drink",
        senderBankId: bankId,
        receiverBankId: "",
        type: "debit",
      },
      {
        name: "Investment Return",
        amount: 250.00,
        channel: "other",
        category: "Transfer",
        senderBankId: "",
        receiverBankId: bankId,
        type: "credit",
      },
    ];

    const createdTransactions = await Promise.all(
      demoTransactions.map(async (transaction) => {
        const transactionDate = new Date();
        // Spread transactions over the last 30 days
        const daysAgo = Math.floor(Math.random() * 30);
        transactionDate.setDate(transactionDate.getDate() - daysAgo);

        return await database.createDocument(
          APPWRITE_DATABASE_ID,
          APPWRITE_TRANSACTION_COLLECTION_ID,
          ID.unique(),
          {
            ...transaction,
            $createdAt: transactionDate.toISOString(),
          }
        );
      })
    );

    return parseStringify({ success: true, count: createdTransactions.length });
  } catch (error) {
    console.error("Error seeding demo transactions:", error);
    return parseStringify({ success: false, error: String(error) });
  }
};

// Clear all transactions for a user (for resetting demo)
export const clearDemoTransactions = async ({ bankId }: { bankId: string }) => {
  try {
    const { database } = await createAdminClient();

    const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
    const APPWRITE_TRANSACTION_COLLECTION_ID = process.env.APPWRITE_TRANSACTION_COLLECTION_ID!;

    // Get all transactions for this bank
    const senderTransactions = await database.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_TRANSACTION_COLLECTION_ID,
      [Query.equal("senderBankId", bankId)]
    );

    const receiverTransactions = await database.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_TRANSACTION_COLLECTION_ID,
      [Query.equal("receiverBankId", bankId)]
    );

    // Delete all transactions
    const allTransactions = [
      ...senderTransactions.documents,
      ...receiverTransactions.documents,
    ];

    await Promise.all(
      allTransactions.map((transaction) =>
        database.deleteDocument(
          APPWRITE_DATABASE_ID,
          APPWRITE_TRANSACTION_COLLECTION_ID,
          transaction.$id
        )
      )
    );

    return parseStringify({ success: true, deleted: allTransactions.length });
  } catch (error) {
    console.error("Error clearing demo transactions:", error);
    return parseStringify({ success: false, error: String(error) });
  }
};

