# Instagram Scraper Backend

A Node.js + Express backend service that scrapes Instagram media URLs using Puppeteer.

## Features

- Scrapes public Instagram posts, reels, and stories
- Uses mobile User-Agent to avoid bot detection
- Extracts direct media URLs from meta tags
- Handles error cases (private accounts, invalid URLs)
- Rate limiting and security middleware
- No login or API keys required

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on port 3001 by default.

## API Endpoints

### POST /api/scrape

Scrapes media from an Instagram URL.

**Request Body:**
```json
{
  "url": "https://www.instagram.com/p/EXAMPLE_POST_ID/"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "type": "video",
    "postType": "reel",
    "url": "https://scontent.cdninstagram.com/...",
    "thumbnail": "https://scontent.cdninstagram.com/...",
    "title": "Instagram reel",
    "description": "Post description",
    "size": "2-10 MB",
    "originalUrl": "https://www.instagram.com/p/EXAMPLE_POST_ID/"
  }
}
```

**Response (Error):**
```json
{
  "error": "This content is private or requires login to access"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Supported Instagram URLs

- Posts: `https://www.instagram.com/p/POST_ID/`
- Reels: `https://www.instagram.com/reel/REEL_ID/`
- Stories: `https://www.instagram.com/stories/USERNAME/STORY_ID/`

## Error Handling

The service handles various error cases:

- Invalid or malformed URLs
- Private accounts or login-required content
- Network timeouts
- Rate limiting
- Server errors

## Security Features

- CORS protection
- Rate limiting (100 requests per 15 minutes per IP)
- Helmet security headers
- Request size limits
- Input validation

## Environment Variables

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment mode (development/production)

## Limitations

- Only works with public Instagram content
- Subject to Instagram's rate limiting and anti-bot measures
- May break if Instagram changes their HTML structure
- Requires sufficient server resources for Puppeteer

## Integration with Frontend

Update your frontend to call this backend:

```javascript
const response = await fetch('http://localhost:3001/api/scrape', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://www.instagram.com/p/EXAMPLE_POST_ID/'
  })
});

const result = await response.json();
```

## Deployment

For production deployment:

1. Set environment variables
2. Ensure sufficient memory for Puppeteer
3. Consider using a process manager like PM2
4. Set up proper logging and monitoring
5. Configure reverse proxy (nginx) if needed

## Troubleshooting

- If Puppeteer fails to launch, ensure you have the required system dependencies
- For memory issues, consider increasing server resources
- Check logs for specific error messages
- Verify Instagram URLs are public and accessible