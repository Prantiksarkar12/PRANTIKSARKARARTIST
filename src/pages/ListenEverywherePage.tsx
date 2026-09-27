import React from 'react';
import { ListenEverywhere } from '../components/music/ListenEverywhere';
import { MusicPlatform } from '../types';

interface ListenEverywherePageProps {
  platforms: MusicPlatform[];
  allPlatforms?: MusicPlatform[];
  onNavigateToAdmin?: () => void;
  isAdmin?: boolean;
}

export const ListenEverywherePage: React.FC<ListenEverywherePageProps> = ({
  platforms,
  allPlatforms,
  onNavigateToAdmin,
  isAdmin,
}) => {
  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <ListenEverywhere
        platforms={platforms}
        allPlatforms={allPlatforms}
        onNavigateToAdmin={onNavigateToAdmin}
        isAdmin={isAdmin}
      />
    </div>
  );
};
