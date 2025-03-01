'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { plex } from '@/app/fonts/plex';
import { motion } from 'framer-motion';
import { FaPlay } from "react-icons/fa";
import { useEffect, useState } from 'react';
import BSIcon from '../../../public/newSVG/BS.svg';
import MastoIcon from '../../../public/newSVG/masto.svg';
import { GlobalStats } from '@/lib/types/stats';

const formatNumber = (num: number | undefined | null): string => {
  if (num === undefined || num === null) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

interface ReconnexionOptionsProps {
  onAutomatic: () => void;
  onManual: () => void;
  globalStats?: GlobalStats;
}

export default function ReconnexionOptions({ onAutomatic, onManual, globalStats }: ReconnexionOptionsProps) {
  const t = useTranslations('ReconnexionOptions');

  console.log("****************************************",globalStats)

  // Calculate total connections safely
  const totalConnections = globalStats ? 
    (globalStats.connections?.followers || 0) + (globalStats.connections?.following || 0) : 0;

  // Get other stats safely
  const mappings = globalStats?.connections?.withHandle || 0;
  const sources = globalStats?.users?.onboarded || 0;

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto">
      <div className="w-full bg-[#2a39a9] p-4 rounded-lg">
        <h2 className={`${plex.className} text-xl text-white font-bold mb-12 text-center`}>
          {t('title')}
        </h2>
        <div className="flex flex-col space-y-8 max-w-3xl mx-auto">
          {/* First option */}
          <div className="flex items-center gap-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAutomatic}
              className="flex-1 rounded-full bg-[#d6356f] text-white py-4 px-6 font-bold  flex items-center justify-center gap-3"
            >
              {t('buttons.automatic')}
              <FaPlay className="text-sm" />
            </motion.button>
            <div className="text-white text-2xl">›</div>
            <div className={`${plex.className} text-sm text-white flex-1`}>
              {t('descriptions.automatic')}
            </div>
          </div>

          {/* Second option */}
          <div className="flex items-center gap-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onManual}
              className="flex-1 rounded-full bg-white text-[#2a39a9] py-4 px-6 font-bold hover:bg-gray-50 transition-colors"
            >
              {t('buttons.manual')}
            </motion.button>
            <div className="text-white text-2xl">›</div>
            <div className={`${plex.className} text-sm text-white flex-1`}>
              {t('descriptions.manual')}
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}