# Mandarin Survival Kit

A practical Chinese learning tool built from **real pain points** discovered in Reddit communities like r/ChineseLanguage and r/LearnChinese.

## The Problem

After analyzing hundreds of Reddit posts, we found that learners consistently struggle with:

1. **Slang Confusion** - "Is it safe to say 我靠 to my coworker?"
2. **Number Listening** - "I can never catch phone numbers when natives speak fast"
3. **Synonym Paralysis** - "What's the difference between 喜爱 and 喜欢?"

Textbooks don't teach this. We built a tool that does.

---

## Features

### 1. Social Context Decoder
Decode Chinese slang and understand the **social risk** before you use it.

- **Emotional Thermometer**: See the emotional weight (Surprise 70%, Anger 20%)
- **Risk Level Badges**: Safe / Friends Only / Use with Caution
- **Real Scenarios**: Gaming context vs. Daily life context
- **Reddit Source**: Every entry traced back to community discussions

### 2. Number Listening Lab
Train your ear for fast-spoken Chinese phone numbers.

- **Realistic Scenarios**: "Delivery driver calling" with background noise
- **Visual Feedback**: Incorrect digits highlighted in real-time
- **Common Traps**: Warnings for confusing pairs like "7 vs 1" and "6 vs 9"
- **Sound Effects**: Ding for correct, buzz for wrong
- **Progress Tracking**: Score saved locally - pick up where you left off

### 3. Semantic Precision AI
Stop sounding like a textbook. Choose the right synonym.

- **Side-by-Side Comparison**: Formality, intensity, usage context
- **KD Score**: Keyword difficulty from SEO research
- **Reddit Consensus**: What native speakers actually recommend
- **Natural Language Checker**: Paste a sentence, get suggestions

---

## Tech Stack

- **React 18** - Component-based UI
- **Tailwind CSS** - Mobile-first responsive design
- **Web Audio API** - Sound effects without external files
- **LocalStorage** - Progress persistence
- **Vercel** - One-click deployment

---

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm start

# Build for production
npm run build
```

---

## Deploy to Vercel

### Option 1: Vercel CLI
```bash
npm i -g vercel
vercel
```

### Option 2: GitHub Integration
1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Click Deploy

---

## Data Source

All slang terms, scenarios, and synonym comparisons are sourced from:
- r/ChineseLanguage
- r/LearnChinese
- r/LearnChineseYourself
- Semrush organic keyword research

The mock data in `src/data/mockData.json` can be expanded with more entries.

---

## Roadmap

- [ ] Add more slang terms (target: 50+)
- [ ] Real audio files for number trainer
- [ ] User-submitted slang suggestions
- [ ] Spaced repetition for vocabulary
- [ ] Dark mode

---

## Contributing

Found a slang term we're missing? Open an issue with:
- The term and pinyin
- Context where you heard it
- Your confusion or question

---

## License

MIT

---

**Built for learners who want to sound natural, not textbook-perfect.**
