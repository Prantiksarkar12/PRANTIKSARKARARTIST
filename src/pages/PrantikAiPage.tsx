import React from 'react';
import { PrantikUserChat } from '../components/ai/PrantikUserChat';

interface PrantikAiPageProps {
  onBackToSite: () => void;
}

export const PrantikAiPage: React.FC<PrantikAiPageProps> = ({ onBackToSite }) => {
  return (
    <div className="pt-16 min-h-screen bg-[#050505]">
      <PrantikUserChat onBackToSite={onBackToSite} />
    </div>
  );
};
