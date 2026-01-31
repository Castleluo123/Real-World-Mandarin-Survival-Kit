import React, { useState } from 'react';
import slangData from '../data/slang.json';

const SocialContextDecoder = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const getRiskColor = (level) => {
    if (level <= 2) return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' };
    if (level <= 4) return { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' };
    return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' };
  };

  const getRiskLabel = (level) => {
    if (level <= 2) return 'Safe';
    if (level <= 4) return 'Caution';
    return 'Danger';
  };

  const filteredSlang = slangData.filter(item =>
    item.phrase.includes(searchTerm) ||
    item.pinyin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.hidden_meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Slang Decoder</h2>
        <p className="text-gray-600 mb-4">
          Decode Chinese slang and understand when it's safe to use.
        </p>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by phrase, pinyin, or meaning..."
          className="input-field w-full"
        />

        <div className="mt-4 flex gap-2 text-sm">
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded">1-2: Safe</span>
          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">3-4: Caution</span>
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded">5: Danger</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredSlang.map((item, index) => {
          const colors = getRiskColor(item.risk_level);
          return (
            <div key={index} className="card">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{item.phrase}</h3>
                  <p className="text-sm text-gray-500">{item.pinyin}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${colors.bg} ${colors.text} ${colors.border}`}>
                  {getRiskLabel(item.risk_level)} ({item.risk_level})
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase">Literal</span>
                  <p className="text-gray-700">{item.literal}</p>
                </div>

                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase">Hidden Meaning</span>
                  <p className="text-gray-900 font-medium">{item.hidden_meaning}</p>
                </div>

                <div className={`mt-3 p-3 rounded-lg ${colors.bg}`}>
                  <span className={`text-xs font-medium uppercase ${colors.text}`}>Usage Tip</span>
                  <p className={`text-sm ${colors.text}`}>{item.usage_tip}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSlang.length === 0 && (
        <div className="card text-center py-8">
          <p className="text-gray-500">No slang terms found matching your search.</p>
          <p className="text-sm text-gray-400 mt-2">Try a different search term.</p>
        </div>
      )}
    </div>
  );
};

export default SocialContextDecoder;
