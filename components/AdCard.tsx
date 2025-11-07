import React from 'react';
import { Ad } from '../types';

interface AdCardProps {
  ad: Ad;
}

const AdCard: React.FC<AdCardProps> = ({ ad }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
      <img src={ad.marketingImage} alt={ad.productTitle} className="w-full h-64 object-cover" />
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2 text-indigo-400">{ad.productTitle}</h3>
        <p className="text-gray-300 italic mb-3">"{ad.caption}"</p>
        <div className="flex flex-wrap gap-2">
          {ad.hashtags.map((tag, index) => (
            <span key={index} className="bg-indigo-700/50 text-indigo-200 text-xs px-2 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdCard;