import React, { useState } from 'react';
import mockData from '../data/mockData.json';

const SemanticPrecisionAI = () => {
  const [selectedPair, setSelectedPair] = useState(null);
  const [proofText, setProofText] = useState('');
  const [suggestion, setSuggestion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectPair = (pair) => {
    setSelectedPair(pair);
  };

  const handleProofread = async () => {
    if (!proofText.trim()) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    // Simple mock proofreading logic
    let result = {
      original: proofText,
      suggested: proofText,
      reason: "This sentence looks natural! No changes suggested."
    };

    if (proofText.includes('喜爱') && !proofText.includes('文学') && !proofText.includes('艺术')) {
      result = {
        original: proofText,
        suggested: proofText.replace('喜爱', '喜欢'),
        reason: "喜爱 is too formal/literary for casual contexts. 喜欢 is more natural here."
      };
    }

    setSuggestion(result);
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Word Pair Selection */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Semantic Precision AI</h2>
        <p className="text-gray-600 text-sm mb-4">
          Compare synonyms to understand subtle differences in meaning and usage.
        </p>

        <div className="space-y-3">
          {mockData.semantic_precision.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPair(item)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                selectedPair === item
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">{item.pair}</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  KD: {item.kd_score}%
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Results */}
      {selectedPair && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Comparison: {selectedPair.pair}</h3>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* Word 1 - 喜爱 */}
            <div className="p-4 rounded-xl bg-red-50">
              <h4 className="text-xl font-bold text-center text-gray-900 mb-4">喜爱 (Xǐ'ài)</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Formality</span>
                  <span className="text-sm font-medium bg-purple-100 text-purple-800 px-2 py-1 rounded">
                    {selectedPair.comparison.formality.xiai}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Intensity</span>
                  <span className="text-sm font-medium bg-red-100 text-red-800 px-2 py-1 rounded">
                    {selectedPair.comparison.intensity.xiai}
                  </span>
                </div>
              </div>
            </div>

            {/* Word 2 - 喜欢 */}
            <div className="p-4 rounded-xl bg-blue-50">
              <h4 className="text-xl font-bold text-center text-gray-900 mb-4">喜欢 (Xǐhuan)</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Formality</span>
                  <span className="text-sm font-medium bg-gray-100 text-gray-800 px-2 py-1 rounded">
                    {selectedPair.comparison.formality.xihuan}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Intensity</span>
                  <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {selectedPair.comparison.intensity.xihuan}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Reddit Consensus */}
          <div className="border-l-4 border-orange-400 pl-4 py-3 bg-orange-50 rounded-r-lg">
            <p className="text-sm text-gray-500 mb-1">Reddit Consensus:</p>
            <p className="text-gray-700 italic">"{selectedPair.reddit_consensus}"</p>
          </div>
        </div>
      )}

      {/* Proofreading Section */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-2">Natural Language Checker</h3>
        <p className="text-gray-600 text-sm mb-4">
          Paste a sentence and get suggestions for more natural word choices.
        </p>

        <textarea
          value={proofText}
          onChange={(e) => setProofText(e.target.value)}
          placeholder="Type or paste a Chinese sentence (e.g., 我很喜爱吃披萨)"
          className="input-field min-h-[100px] resize-none mb-4"
        />

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-sm text-gray-500">Try: </span>
          <button
            onClick={() => setProofText('我很喜爱吃披萨')}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            我很喜爱吃披萨
          </button>
          <button
            onClick={() => setProofText('我喜爱中国文学')}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            我喜爱中国文学
          </button>
        </div>

        <button
          onClick={handleProofread}
          disabled={isLoading || !proofText.trim()}
          className="btn-primary w-full sm:w-auto"
        >
          {isLoading ? 'Analyzing...' : 'Check Naturalness'}
        </button>

        {suggestion && (
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Original:</p>
                <p className="text-gray-800 font-medium">{suggestion.original}</p>
              </div>

              {suggestion.original !== suggestion.suggested && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Suggested:</p>
                  <p className="text-green-700 font-medium">{suggestion.suggested}</p>
                </div>
              )}

              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Explanation:</p>
                <p className="text-gray-600">{suggestion.reason}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SemanticPrecisionAI;