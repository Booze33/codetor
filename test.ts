'use server';

import { ID, Query } from "node-appwrite";
import { parseStringify } from "../utils";
import { createAdminClient } from "../appwrite";
import OpenAI from "openai";

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_CHAT_COLLECTION_ID: CHAT_COLLECTION_ID,
  APPWRITE_MESSAGE_COLLECTION_ID: MESSAGE_COLLECTION_ID,
  NEXT_PUBLIC_OPENAI_API_KEY: OPENAI_API_KEY,
} = process.env;

// Singleton OpenAI client to reduce initialization overhead
const openaiClient = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Centralized error handling
const handleError = (operation: string, error: unknown) => {
  console.error(`Error in ${operation}:`, error);
  return null;
};

// Separate function for generating AI response with context awareness
const generateAIResponse = async (messages: Array<{role: "user" | "assistant", content: string}>) => {
  try {
    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are an experienced senior software developer and a mentor with expertise across multiple programming languages and development frameworks. Your role is to help users break down complex coding projects into manageable tasks and provide guidance on how to approach each task effectively."
        },
        ...messages
      ],
    });
    return response.choices[0].message.content;
  } catch (error) {
    return handleError('generateAIResponse', error);
  }
};

// Separate function for generating chat title
const generateChatTitle = async (content: string) => {
  try {
    const titleResponse = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a title generating bot. Generate the best short title for the chat."
        },
        {
          role: "user",
          content: `Content: ${content}. Generate the best title.`
        }
      ]
    });
    return titleResponse.choices[0].message.content;
  } catch (error) {
    return handleError('generateChatTitle', error);
  }
};

// Optimized chat creation with minimal database calls
export const createChat = async (user_id: string) => {
  try {
    const { database } = await createAdminClient();
    return parseStringify(
      await database.createDocument(
        DATABASE_ID!,
        CHAT_COLLECTION_ID!,
        ID.unique(),
        {
          chat_id: ID.unique(),
          user_id,
          title: 'New Chat',
          created_at: new Date()
        }
      )
    );
  } catch (error) {
    return handleError('createChat', error);
  }
};

// Optimized chat retrieval with direct querying
export const getChats = async (user_id: string) => {
  try {
    const { database } = await createAdminClient();
    const chatResults = await database.listDocuments(
      DATABASE_ID!,
      CHAT_COLLECTION_ID!,
      [Query.equal('user_id', user_id)]
    );
    return parseStringify(chatResults.documents);
  } catch (error) {
    return handleError('getChats', error);
  }
};

// Simplified chat retrieval
export const getChat = async (chat_id: string) => {
  try {
    const { database } = await createAdminClient();
    const chatResults = await database.listDocuments(
      DATABASE_ID!,
      CHAT_COLLECTION_ID!,
      [Query.equal('chat_id', [chat_id])]
    );
    return parseStringify(chatResults.documents);
  } catch (error) {
    return handleError('getChat', error);
  }
};

// Combined message creation and AI response with minimized database calls
export const sendMessage = async (chat_id: string, user_id: string, content: string) => {
  try {
    const { database } = await createAdminClient();
    
    // Create user message
    const userMessage = await database.createDocument(
      DATABASE_ID!,
      MESSAGE_COLLECTION_ID!,
      ID.unique(),
      {
        chat_id,
        user_id,
        sender: "user",
        content,
        created_at: new Date(),
      }
    );

    // Fetch conversation history
    const previousMessages = await database.listDocuments(
      DATABASE_ID!,
      MESSAGE_COLLECTION_ID!,
      [Query.equal("chat_id", chat_id), Query.orderAsc("created_at")]
    );

    const conversationHistory = previousMessages.documents.map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.content
    }));

    // Generate AI response
    const aiMessageContent = await generateAIResponse([
      ...conversationHistory,
      { role: "user", content }
    ]);

    // Create AI message
    const aiMessage = await database.createDocument(
      DATABASE_ID!,
      MESSAGE_COLLECTION_ID!,
      ID.unique(),
      {
        chat_id,
        user_id,
        sender: "ai",
        content: aiMessageContent,
        created_at: new Date(),
      }
    );

    // Update chat title if it's a new chat
    const chat = await getChat(chat_id);
    if (chat && chat.length > 0 && chat[0].title === "New Chat") {
      const newTitle = await generateChatTitle(content);
      
      if (newTitle) {
        await database.updateDocument(
          DATABASE_ID!,
          CHAT_COLLECTION_ID!,
          chat[0].$id,
          { title: newTitle }
        );
      }
    }

    return parseStringify([userMessage, aiMessage]);
  } catch (error) {
    return handleError('sendMessage', error);
  }
};

// Simplified message retrieval
export const getMessages = async (chat_id: string) => {
  try {
    const { database } = await createAdminClient();
    const messages = await database.listDocuments(
      DATABASE_ID!,
      MESSAGE_COLLECTION_ID!,
      [Query.equal("chat_id", chat_id), Query.orderAsc("created_at")]
    );
    return parseStringify(messages.documents);
  } catch (error) {
    return handleError('getMessages', error);
  }
};