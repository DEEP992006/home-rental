'use server';

import { db } from '@/lib/db';
import { chats, messages, users, properties } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, or, and, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Start a new chat between user and property owner
 * Returns existing chat if already exists
 */
export async function startChat(propertyId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Please sign in to start a chat');

    // Get property and owner info
    const property = await db.query.properties.findFirst({
      where: eq(properties.id, propertyId),
    });

    if (!property) {
      throw new Error('Property not found');
    }

    // Check if chat already exists
    const existingChat = await db.query.chats.findFirst({
      where: and(
        eq(chats.userId, user.id),
        eq(chats.propertyId, propertyId)
      ),
    });

    if (existingChat) {
      return { success: true, chat: existingChat };
    }

    // Create new chat
    const [newChat] = await db
      .insert(chats)
      .values({
        userId: user.id,
        ownerId: property.ownerId,
        propertyId,
      })
      .returning();

    revalidatePath('/chats');

    return { success: true, chat: newChat };
  } catch (error) {
    console.error('Error starting chat:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start chat',
    };
  }
}

/**
 * Send a message in a chat
 */
export async function sendMessage(chatId: string, text: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Please sign in to send messages');

    // Verify user is part of this chat
    const chat = await db.query.chats.findFirst({
      where: and(
        eq(chats.id, chatId),
        or(
          eq(chats.userId, user.id),
          eq(chats.ownerId, user.id)
        )
      ),
    });

    if (!chat) {
      throw new Error('Chat not found or access denied');
    }

    const [message] = await db
      .insert(messages)
      .values({
        chatId,
        senderId: user.id,
        text,
      })
      .returning();

    // Update chat's updatedAt
    await db
      .update(chats)
      .set({ updatedAt: new Date() })
      .where(eq(chats.id, chatId));

    revalidatePath(`/chat/${chatId}`);

    return { success: true, message };
  } catch (error) {
    console.error('Error sending message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send message',
    };
  }
}

/**
 * Get all chats for current user
 */
export async function getMyChats() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Please sign in');

    const result = await db.query.chats.findMany({
      where: or(
        eq(chats.userId, user.id),
        eq(chats.ownerId, user.id)
      ),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            profilePic: true,
          },
        },
        owner: {
          columns: {
            id: true,
            name: true,
            profilePic: true,
          },
        },
        property: {
          columns: {
            id: true,
            title: true,
            images: true,
            rent: true,
          },
        },
      },
      orderBy: [desc(chats.updatedAt)],
    });

    return { success: true, chats: result };
  } catch (error) {
    console.error('Error fetching chats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch chats',
      chats: [],
    };
  }
}

/**
 * Get chat by ID with all messages
 */
export async function getChatById(chatId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Please sign in');

    const chat = await db.query.chats.findFirst({
      where: and(
        eq(chats.id, chatId),
        or(
          eq(chats.userId, user.id),
          eq(chats.ownerId, user.id)
        )
      ),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            profilePic: true,
            email: true,
            phone: true,
          },
        },
        owner: {
          columns: {
            id: true,
            name: true,
            profilePic: true,
            email: true,
            phone: true,
          },
        },
        property: true,
      },
    });

    if (!chat) {
      return { success: false, error: 'Chat not found' };
    }

    // Get all messages
    const chatMessages = await db.query.messages.findMany({
      where: eq(messages.chatId, chatId),
      with: {
        sender: {
          columns: {
            id: true,
            name: true,
            profilePic: true,
          },
        },
      },
      orderBy: [messages.createdAt],
    });

    return { 
      success: true, 
      chat,
      messages: chatMessages,
      currentUserId: user.id,
    };
  } catch (error) {
    console.error('Error fetching chat:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch chat',
    };
  }
}