import { getChatById } from '@/app/actions/chat';
import { ChatInterface } from './ChatInterface';
import { notFound } from 'next/navigation';

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getChatById(id);

  if (!result.success || !result.chat) {
    notFound();
  }

  return (
    <ChatInterface
      chat={result.chat}
      messages={result.messages || []}
      currentUserId={result.currentUserId!}
    />
  );
}