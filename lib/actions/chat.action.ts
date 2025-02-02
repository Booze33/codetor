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

export const createMessage = async (chat_id: string, user_id: string, content: string) => {
  try {
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    })

    const { database } = await createAdminClient();

    const userMessage = await database.createDocument(
      DATABASE_ID!,
      MESSAGE_COLLECTION_ID!,
      ID.unique(),
      {
        chat_id: chat_id,
        user_id: user_id,
        sender: 'user',
        content: content,
        created_at: new Date(),
      }
    );

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an experienced senior software developer and a mentor with expertise across multiple programming languages and development frameworks. Your role is to help users break down complex coding projects into manageable tasks and provide guidance on how to approach each task effectively. When a user presents a project idea or coding challenge: First, analyze the overall scope and requirements of the project. then break down the project into a logical sequence of specific, actionable tasks. For each task: -Provide a clear description -Estimate relative complexity (beginner/intermediate/advanced) -Identify dependencies on other tasks. For each task, instead of providing complete solutions, offer: - Conceptual guidance on approaching the problem - Recommendations for relevant libraries, frameworks, or tools - Links to documentation or learning resources when appropriate - Pseudocode or high-level implementation strategies - Questions to help the user think through edge cases Suggest ways to test and validate each component as it's developed. When the user gets stuck: - Ask clarifying questions to understand their specific challenge. - Provide progressively more detailed hints rather than immediate solutions. -Explain underlying concepts and patterns to build deeper understanding. Encourage good development practices like version control, testing, documentation, and code organization. Your goal is to empower users to develop their own solutions while providing just enough guidance to keep them moving forward. Focus on building their problem-solving skills rather than solving problems for them."
        },
        {
          role: "user",
          content: `Here is my task:\n${content}. Please guide me accordingly.`
        }
      ]
    });

    const aiMessageContent = aiResponse.choices[0].message.content;

    const aiTitleResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a title generating bot. use the content to generate the best short title for the chat"
        },
        {
          role: "user",
          content: `Here is the content ${content}, Please genrate the best title.`
        }
      ]
    });

    const newTitle = aiTitleResponse.choices[0].message.content;

    const aiMessage = await database.createDocument(
      DATABASE_ID!,
      MESSAGE_COLLECTION_ID!,
      ID.unique(),
      {
        chat_id: chat_id,
        user_id: user_id,
        sender: 'ai',
        content: aiMessageContent,
        created_at: new Date(),
      }
    );

    const chat = await getChat(chat_id);

    if (chat.length > 0 && chat[0].title === "New Chat") {
      await database.updateDocument(
        DATABASE_ID!,
        CHAT_COLLECTION_ID!,
        chat[0].$id,
        {
          title: newTitle,
        }
      );
    }

    return parseStringify([userMessage, aiMessage])
  } catch (error) {
    console.error("Error creating message:", error)
  }
}