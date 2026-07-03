import React from 'react';
import { ChatInterface } from '../../../components/chat/chat-interface';

interface FreelancerChatProps {
  userId: number | null;
}

export const FreelancerChat: React.FC<FreelancerChatProps> = ({ userId }) => {
  if (!userId) return null;

  return (
    <div style={{ height: '100%' }}>
      <ChatInterface userId={userId} userRole="FREELANCER" />
    </div>
  );
};
