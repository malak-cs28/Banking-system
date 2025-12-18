'use server';

import { ID, Query } from "node-appwrite";
import {
  CountryCode,
  ProcessorTokenCreateRequest,
  ProcessorTokenCreateRequestProcessorEnum,
  Products,
} from "plaid";

import { plaidClient } from "../plaid";
import {
  parseStringify,
  extractCustomerIdFromUrl,
  encryptId,
} from "../utils";

import { createAdminClient, createSessionClient } from "../appwrite";
import { cookies } from "next/headers";

import { addFundingSource, createDwollaCustomer } from "./dwolla.actions";

export const signIn = async ({ email, password }: signInProps) => {
  try {
    const { account } = await createAdminClient();

    // Create session for the user
    const session = await account.createEmailPasswordSession(email, password);

    // Set cookie with session secret
    const cookieStore = await cookies();
    cookieStore.set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return parseStringify(session);
  } catch (error) {
    console.error("Error signing in:", error);
    return null;
  }
};

export const signUp = async ({ password, ...userData }: SignUpParams) => {
  let newUserAccount;

  try {
    // Create user in Appwrite
    const { database, account } = await createAdminClient();
    newUserAccount = await account.create(
      ID.unique(),
      userData.email,
      password,
      `${userData.firstName} ${userData.lastName}`
    );

    if (!newUserAccount) throw new Error("Error creating user");

    // Create Dwolla customer
    const dwollaCustomerUrl = await createDwollaCustomer({
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      email: userData.email,
      type: "personal",
      address1: userData.address1 || "",
      city: userData.city || "",
      state: userData.state || "",
      postalCode: userData.postalCode || "",
      dateOfBirth: userData.dateOfBirth || "",
      ssn: userData.ssn || "",
    });

    if (!dwollaCustomerUrl) throw new Error("Error creating dwolla customer");

    const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);

    const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
    const APPWRITE_USER_COLLECTION_ID = process.env.APPWRITE_USER_COLLECTION_ID!;

    // Save user data to database
    const newUser = await database.createDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_USER_COLLECTION_ID,
      ID.unique(),
      {
        ...userData,
        userId: newUserAccount.$id,
        dwollaCustomerUrl,
        dwollaCustomerId,
      }
    );

    // Create session after sign up
    const session = await account.createEmailPasswordSession(
      userData.email,
      password
    );

    const cookieStore = await cookies();
    cookieStore.set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return parseStringify(newUser);
  } catch (error) {
    console.error("Error signing up:", error);

    // Cleanup if user was partially created
    if (newUserAccount?.$id) {
      const { user } = await createAdminClient();
      await user.delete(newUserAccount.$id);
    }

    return null;
  }
};

export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();
    return parseStringify(user);
  } catch (error) {
    return null;
  }
}

export const logoutAccount = async () => {
  try {
    const { account } = await createSessionClient();

    const cookieStore = await cookies();
    cookieStore.delete("appwrite-session");

    await account.deleteSession("current");
  } catch (error) {
    return null;
  }
};

// CREATE PLAID LINK TOKEN
export const createLinkToken = async (user: User) => {
  try {
    const tokenParams = {
      user: {
        client_user_id: user.$id,
      },
      client_name: user.firstName + user.lastName,
      products: ["auth"] as Products[],
      language: "en",
      country_codes: ["US"] as CountryCode[],
    };

    const response = await plaidClient.linkTokenCreate(tokenParams);

    return parseStringify({ linkToken: response.data.link_token });
  } catch (error) {
    console.error("Error creating Plaid link token:", error);
  }
};

// EXCHANGE PLAID PUBLIC TOKEN
export const exchangePublicToken = async ({
  publicToken,
  user,
}: exchangePublicTokenProps) => {
  try {
    // Exchange public token for access token and item ID
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    // Get account info from Plaid
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    const accountData = accountsResponse.data.accounts[0];

    // Create processor token for Dwolla
    const request: ProcessorTokenCreateRequest = {
      access_token: accessToken,
      account_id: accountData.account_id,
      processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum,
    };

    const processorTokenResponse = await plaidClient.processorTokenCreate(request);
    const processorToken = processorTokenResponse.data.processor_token;

    // Add funding source
    const fundingSourceUrl = await addFundingSource({
      dwollaCustomerId: user.dwollaCustomerId,
      processorToken,
      bankName: accountData.name,
    });

    if (!fundingSourceUrl) throw new Error("Funding source creation failed");

    // Create bank account document
    await createBankAccount({
      userId: user.$id,
      bankId: itemId,
      accountId: accountData.account_id,
      accessToken,
      fundingSourceUrl,
      sharaebleId: encryptId(accountData.account_id),
    });

    return parseStringify({ publicTokenExchange: "complete" });
  } catch (error) {
    console.error("Error exchanging public token:", error);
  }
};

export const getUserInfo = async ({ userId }: getUserInfoProps) => {
  try {
    const { database } = await createAdminClient();

    const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
    const APPWRITE_USER_COLLECTION_ID = process.env.APPWRITE_USER_COLLECTION_ID!;

    const user = await database.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_USER_COLLECTION_ID,
      [Query.equal("userId", [userId])]
    );

    if (user.total !== 1) return null;

    return parseStringify(user.documents[0]);
  } catch (error) {
    console.error("Error fetching user info:", error);
    return null;
  }
};

export const createBankAccount = async ({
  accessToken,
  userId,
  accountId,
  bankId,
  fundingSourceUrl,
  sharaebleId,
}: createBankAccountProps) => {
  try {
    const { database } = await createAdminClient();

    const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
    const APPWRITE_BANK_COLLECTION_ID = process.env.APPWRITE_BANK_COLLECTION_ID!;

    const bankAccount = await database.createDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_BANK_COLLECTION_ID,
      ID.unique(),
      {
        accessToken,
        userId,
        accountId,
        bankId,
        fundingSourceUrl,
        sharaebleId,
      }
    );

    return parseStringify(bankAccount);
  } catch (error) {
    console.error("Error creating bank account:", error);
    return null;
  }
};

// Get all bank accounts for user
export const getBanks = async ({ userId }: getBanksProps) => {
  try {
    const { database } = await createAdminClient();

    const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
    const APPWRITE_BANK_COLLECTION_ID = process.env.APPWRITE_BANK_COLLECTION_ID!;

    const banks = await database.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_BANK_COLLECTION_ID,
      [Query.equal("userId", [userId])]
    );

    return parseStringify(banks.documents);
  } catch (error) {
    console.error("Error fetching banks:", error);
    return null;
  }
};

// Get bank account by document ID
export const getBank = async ({ documentId }: getBankProps) => {
  try {
    const { database } = await createAdminClient();

    const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
    const APPWRITE_BANK_COLLECTION_ID = process.env.APPWRITE_BANK_COLLECTION_ID!;

    const bank = await database.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_BANK_COLLECTION_ID,
      [Query.equal("$id", [documentId])]
    );

    if (bank.total !== 1) return null;

    return parseStringify(bank.documents[0]);
  } catch (error) {
    console.error("Error fetching bank:", error);
    return null;
  }
};

// Get bank account by account ID
export const getBankByAccountId = async ({
  accountId,
}: getBankByAccountIdProps) => {
  try {
    const { database } = await createAdminClient();

    const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;
    const APPWRITE_BANK_COLLECTION_ID = process.env.APPWRITE_BANK_COLLECTION_ID!;

    const bank = await database.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_BANK_COLLECTION_ID,
      [Query.equal("accountId", [accountId])]
    );

    if (bank.total !== 1) return null;

    return parseStringify(bank.documents[0]);
  } catch (error) {
    console.error("Error fetching bank by accountId:", error);
    return null;
  }
};
