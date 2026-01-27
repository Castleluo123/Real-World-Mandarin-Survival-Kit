import React, { useState } from 'react';
import mockData from '../data/mockData.json';

const SocialContextDecoder = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const found = mockData.slang_decoder.find(item =>
      item.term.includes(searchTerm.trim())
    );
    setResult(found || 'not_found');
    setIsLoading(false);
  };

  const getRiskBadge = (level) => {
    const isLow = level.toLowerCase().includes('safe');
    const isMedium = level.toLowerCase().includes('medium');
    const isHigh = level.toLowerCase().includes('high') || level.toLowerCase().includes('offensive');

    let styles = 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (isLow) styles = 'bg-green-100 text-green-800 border-green-200';
    if (isHigh) styles = 'bg-red-100 text-red-800 border-red-200';

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${styles}`}>
        {level}
      </span>
    );
  };

  const EmotionThermometer = ({ emotions }) => {
    const colors = {
      Surprise: 'bg-blue-500',
      Anger: 'bg-red-500',
      Admiration: 'bg-purple-500',
      Interest: 'bg-teal-500',
      Excitement: 'bg-green-500',
      Frustration: 'bg-orange-500',
    };

    return (
      <div className="space-y-3">
        <h4 className="font-medium text-gray-700">Emotional Thermometer</h4>
        {Object.entries(emotions).map(([emotion, value]) => (
          <div key={emotion} className="flex items-center gap-3">
            <span className="w-24 text-sm text-gray-600">{emotion}</span>
            <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${colors[emotion] || 'bg-gray-400'} transition-all duration-500`}
                style={{ width: `${value * 100}%` }}
              />
            </div>
            <span className="w-12 text-sm text-gray-500 text-right">{Math.round(value * 100)}%</span>
          </div>
        ))}
      </div>
    );
  };

  const quickSearchTerms = ['我靠', '正妹'];

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Context Decoder</h2>
        <p className="text-gray-600 mb-4">
          Decode Chinese slang and understand when it's safe to use.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter a slang term (e.g., 我靠)"
            className="input-field flex-1"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="btn-primary whitespace-nowrap"
          >
            {isLoading ? 'Analyzing...' : 'Decode'}
          </button>
        </div>

        <div className="mt-4">
          <span className="text-sm text-gray-500">Try: </span>
          {quickSearchTerms.map((term) => (
            <button
              key={term}
              onClick={() => {
                setSearchTerm(term);
                setTimeout(() => {
                  const found = mockData.slang_decoder.find(item => item.term.includes(term));
                  setResult(found || 'not_found');
                }, 100);
              }}
              className="ml-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {result && result !== 'not_found' && (
        <div className="card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{result.term}</h3>
              <p className="text-sm text-gray-500">Frequency Rank: #{result.frequency_rank}</p>
            </div>
            {getRiskBadge(result.risk_level)}
          </div>

          <EmotionThermometer emotions={result.emotions} />

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-700 mb-2">Social Risk Level</h4>
            <p className="text-gray-600">{result.risk_level}</p>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-3">Usage Scenarios</h4>
            <div className="space-y-3">
              {result.scenarios.map((scenario, idx) => (
                <div key={idx} className="bg-white border rounded-lg p-4">
                  <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs rounded mb-2">
                    {scenario.context}
                  </span>
                  <p className="text-gray-700">{scenario.meaning}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-500">
              Source: <span className="text-orange-600">{result.reddit_source}</span>
            </p>
          </div>
        </div>
      )}

      {result === 'not_found' && (
        <div className="card text-center py-8">
          <p className="text-gray-500">Term not found in our database.</p>
          <p className="text-sm text-gray-400 mt-2">Try one of the suggested terms above.</p>
        </div>
      )}
    </div>
  );
};

export default SocialContextDecoder;
