import React, { useState } from 'react';
import SocialContextDecoder from './components/SocialContextDecoder';
import NumberListeningTrainer from './components/NumberListeningTrainer';
import SemanticPrecisionAI from './components/SemanticPrecisionAI';

function App() {
  const [activeTab, setActiveTab] = useState('decoder');

  const tabs = [
    { id: 'decoder', label: 'Slang Decoder', icon: '🗣️' },
    { id: 'numbers', label: 'Number Lab', icon: '📞' },
    { id: 'semantic', label: 'Word Precision', icon: '🎯' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            <span className="text-red-600">Mandarin</span> Survival Kit
          </h1>
          <p className="text-sm text-gray-500 mt-1">Real-world Chinese for real situations</p>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-white border-b sticky top-[72px] z-40">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'decoder' && <SocialContextDecoder />}
        {activeTab === 'numbers' && <NumberListeningTrainer />}
        {activeTab === 'semantic' && <SemanticPrecisionAI />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>Built for learners who want to sound natural, not textbook-perfect.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
