import puppeteer from 'puppeteer';

export async function scrapeInstagramMedia(url) {
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Set viewport
    await page.setViewport({ width: 1366, height: 768 });
    
    // Navigate to the Instagram URL
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for content to load
    await page.waitForTimeout(3000);
    
    // Extract media information
    const mediaData = await page.evaluate(() => {
      const result = {
        type: 'unknown',
        mediaUrls: [],
        caption: '',
        username: '',
        timestamp: null
      };
      
      try {
        // Try to find video elements
        const videos = document.querySelectorAll('video');
        if (videos.length > 0) {
          result.type = 'video';
          videos.forEach(video => {
            if (video.src) {
              result.mediaUrls.push(video.src);
            }
          });
        }
        
        // Try to find image elements
        const images = document.querySelectorAll('img[src*="instagram"]');
        if (images.length > 0 && result.mediaUrls.length === 0) {
          result.type = 'image';
          images.forEach(img => {
            if (img.src && !img.src.includes('profile') && !img.src.includes('avatar')) {
              result.mediaUrls.push(img.src);
            }
          });
        }
        
        // Try to extract caption
        const captionElements = document.querySelectorAll('[data-testid="post-caption"]');
        if (captionElements.length > 0) {
          result.caption = captionElements[0].textContent || '';
        }
        
        // Try to extract username
        const usernameElements = document.querySelectorAll('a[href*="/"]');
        for (const element of usernameElements) {
          const href = element.getAttribute('href');
          if (href && href.match(/^\/[^\/]+\/?$/)) {
            result.username = href.replace(/\//g, '');
            break;
          }
        }
        
      } catch (error) {
        console.error('Error extracting media data:', error);
      }
      
      return result;
    });
    
    return {
      success: true,
      data: mediaData
    };
    
  } catch (error) {
    console.error('Scraping error:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}