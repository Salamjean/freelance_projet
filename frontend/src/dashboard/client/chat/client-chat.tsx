import React from 'react';
import { ChatInterface } from '../../../components/chat/chat-interface';

interface ClientChatProps {
  userId: number | null;
}

export const ClientChat: React.FC<ClientChatProps> = ({ userId }) => {
  if (!userId) return null;

  return (
    <div style={{  height: '100%' }}>
      <ChatInterface userId={userId} userRole="CLIENT" />
    </div>
  );
};
