import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { scrapeInstagramMedia } from './scraper.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:8080', 'http://localhost:3000', 'http://localhost:5173']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

app.use(limiter);
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Main scraping endpoint
app.post('/api/scrape', async (req, res) => {
  try {
    const { url } = req.body;

    // Validate URL
    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        error: 'URL is required and must be a string'
      });
    }

    // Check if it's an Instagram URL
    if (!url.includes('instagram.com')) {
      return res.status(400).json({
        error: 'Please provide a valid Instagram URL'
      });
    }

    // Clean and normalize URL
    const cleanUrl = url.trim().split('?')[0]; // Remove query parameters
    
    console.log(`Scraping Instagram URL: ${cleanUrl}`);

    const result = await scrapeInstagramMedia(cleanUrl);

    if (!result.success) {
      return res.status(400).json({
        error: result.error || 'Failed to extract media from Instagram URL'
      });
    }

    res.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Scraping error:', error);
    
    res.status(500).json({
      error: 'Internal server error while processing the request'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    error: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Instagram scraper backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 Scrape endpoint: http://localhost:${PORT}/api/scrape`);
});