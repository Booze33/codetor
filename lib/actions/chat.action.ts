'use server';

import { ID, Query } from "node-appwrite";
import { parseStringify } from "../utils";
import { createAdminClient } from "../appwrite";


const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_CHAT_COLLECTION_ID: CHAT_COLLECTION_ID,
} = process.env;

export const createChat = async (user_id: string) => {
  try {
    const { database } = await createAdminClient();
    const chat = await database.createDocument(
      DATABASE_ID!,
      CHAT_COLLECTION_ID!,
      ID.unique(),
      {
        chat_id: ID.unique(),
        user_id: user_id,
        title: 'New Chat',
        created_at: new Date()
      }
    );

    return parseStringify(chat);
  } catch (error) {
    console.error('Error creating chat:', error);
  }
}

export const getChats = async (user_id: string) => {
  try {
    const { database } = await createAdminClient();

    const chat = await database.listDocuments(
      DATABASE_ID!,
      CHAT_COLLECTION_ID!,
      [
        Query.equal('user_id', user_id)
      ]
    );

    const chats = {
      documents: [
        ...chat.documents
      ]
    }

    return parseStringify(chats.documents)
  } catch (error) {
    console.error('Error fetching user chats', error);
  }
}

export const getChat = async (chat_id: string) => {
  try {
    const { database } = await createAdminClient();

    const chat = await database.listDocuments(
      DATABASE_ID!,
      CHAT_COLLECTION_ID!,
      [Query.equal('chat_id', [chat_id])]
    );

    return parseStringify(chat.documents)
  } catch (error) {
    console.error("Error fetching chat:", error);
  }
}