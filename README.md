# AI Visibility Tracker

A comprehensive tool to track your brand's visibility in AI search results. Built for the Writesonic Engineering Challenge.

![AI Visibility Tracker](https://img.shields.io/badge/Next.js-14-black)
![MongoDB](https://img.shields.io/badge/MongoDB-green)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-blue)

## 🎯 Overview

When someone asks ChatGPT "What's the best CRM for startups?", some brands get mentioned. Most don't. This tool helps brands understand:

- **Are we visible in AI search?**
- **Who's beating us?**
- **What's the sentiment around our brand?**

## ✨ Features

### Core Functionality
- 🏢 **Brand Profile Management** - Add and manage brand details (name, website, category, competitors)
- 🔍 **AI Query Generation** - Automatically generate relevant search queries using ChatGPT
- ✏️ **Custom Queries** - Add your own queries to track
- 📊 **AI Analysis** - Analyze AI responses to identify brand mentions, rankings, and sentiment
- 📈 **Visibility Dashboard** - Key metrics including visibility score, sentiment, and ranking

### Dashboard Features
- **Visibility Score** - Percentage of prompts where your brand appears
- **Answers Mentioned** - Total count of AI answers mentioning your brand
- **Average Rank** - Your typical position when mentioned
- **Sentiment Analysis** - Positive, negative, or neutral mentions
- **Rank Distribution** - How often you appear as 1st, 2nd, 3rd choice
- **Leaderboard** - Compare your brand against competitors
- **Top Citations** - Most cited sources in AI responses
- **Historical Tracking** - Track visibility trends over time

## ⚠️ Important Note: OpenAI API & Demo Mode

**Note regarding OpenAI API Keys:**
Due to credit card availability issues, a valid paid OpenAI API key could not be maintained for this submission. However, the application is fully functional!

I have implemented two robust fallback mechanisms to ensure you can test the application thoroughly:

1.  **Mock Data Engine (Demo Mode)**:
    - If the API key is invalid or quota is exceeded, the system automatically switches to a high-fidelity mock engine.
    - It generates realistic queries and Markdown-formatted AI responses based on your brand's category.
    - It performs "fuzzy matching" to correctly identify your brand (e.g., matching "HubSpot Inc" to "HubSpot") and calculates sentiment/rankings locally.

2.  **Web Crawler (Bonus Feature)**:
    - You can opt to use the **"Use Crawler (Beta)"** feature in the dashboard.
    - This launches a real browser (Puppeteer) to visit ChatGPT's web UI, types your query, and extracts the *actual* response from the free version of ChatGPT.
    - This bypasses the API entirely!

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- OpenAI API Key

### Installation

1. **Clone the repository**
```bash
cd ai-visibility-tracker
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
MONGODB_URI=mongodb://localhost:27017/ai-visibility-tracker
OPENAI_API_KEY=your_openai_api_key_here
JWT_SECRET=your_jwt_secret_key_here
```

4. **Start the development server**
```bash
npm run dev
```

5. **Open the application**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Flow

1. **Create a Brand Profile**
   - Enter brand name, website, and category
   - Optionally add competitors and keywords

2. **Generate Queries**
   - Click "Generate AI Queries" to create relevant search prompts
   - Add custom queries manually if needed

3. **Run Analysis**
   - Click "Run Analysis" to process pending queries
   - The system will query ChatGPT and analyze responses

4. **View Dashboard**
   - See visibility metrics and rankings
   - Compare against competitors in the leaderboard
   - Review cited sources

## 🔌 API Endpoints

### Brands
- `GET /api/brands` - List all brands
- `POST /api/brands` - Create a brand
- `GET /api/brands/[id]` - Get brand details
- `PUT /api/brands/[id]` - Update brand
- `DELETE /api/brands/[id]` - Delete brand

### Queries
- `GET /api/brands/[id]/queries` - List queries for a brand
- `POST /api/brands/[id]/queries` - Generate or add queries

### Analysis
- `POST /api/brands/[id]/analyze` - Run analysis on pending queries
- `GET /api/brands/[id]/dashboard` - Get dashboard metrics
- `GET /api/brands/[id]/results` - Get detailed results
- `GET /api/brands/[id]/history` - Get historical data

### External API Call (for Postman)
```bash
# Run analysis for a brand
POST http://localhost:3000/api/brands/{brandId}/analyze
Content-Type: application/json

# Optional: Analyze specific query
{
  "queryId": "query_id_here"
}
```

## 🏗️ Architecture

```
src/
├── pages/
│   ├── api/              # API routes (backend)
│   │   ├── brands/       # Brand CRUD & related operations
│   │   └── queries/      # Query management
│   ├── brand/            # Brand-related pages
│   │   ├── new.js        # Create brand form
│   │   └── [id]/         # Brand dashboard pages
│   └── index.js          # Home page
├── models/               # MongoDB schemas
│   ├── Brand.js
│   ├── Query.js
│   └── AnalysisResult.js
├── lib/                  # Utilities
│   ├── mongodb.js        # Database connection
│   └── openai.js         # OpenAI integration
└── styles/
    └── globals.css       # Tailwind + custom styles
```

## 🎨 Design Decisions

1. **Next.js with Pages Router** - Simple, production-ready, single codebase for frontend and backend
2. **MongoDB** - Flexible schema for varied analysis data
3. **Tailwind CSS** - Rapid UI development matching Writesonic's modern aesthetic
4. **OpenAI GPT-4o-mini** - Cost-effective, fast, accurate for query generation and analysis
5. **Server-side Analysis** - Background processing for better UX

## 📊 Metrics Calculation

### Visibility Score
```
Visibility = (Answers Mentioned / Total Prompts) × 100
```

### Sentiment Score
```
Sentiment = (Positive Mentions / Total Mentions) × 100
```

### Average Rank
```
Average Rank = Sum of ranks / Number of ranked mentions
```

## 🔮 Future Improvements

1. **Multi-Platform Support** - Add Perplexity, Claude, Gemini analysis
2. **Web Crawling** - Implement Puppeteer for real ChatGPT UI crawling (bonus feature)
3. **Scheduled Analysis** - Cron jobs for automatic periodic tracking
4. **Email Reports** - Weekly visibility reports
5. **Team Collaboration** - Multi-user support with roles
6. **Export Features** - PDF/CSV reports
7. **Webhook Notifications** - Alert when visibility changes significantly

## ⚠️ Assumptions

1. OpenAI API responses are representative of ChatGPT behavior
2. Brand mentions are case-insensitive
3. Sentiment is determined by context surrounding brand mention
4. Citations include both inline and footer references

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Recharts
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **AI**: OpenAI GPT-4o-mini
- **Icons**: Lucide React

## 📝 License

MIT License - Feel free to use and modify.

---

Build by Harsh Kumar Das for the Writesonic Engineering Challenge
