import puppeteer from 'puppeteer';

// Mobile User-Agent to avoid bot detection
const MOBILE_USER_AGENT = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1';

// Timeout configurations
const NAVIGATION_TIMEOUT = 30000;
const WAIT_TIMEOUT = 10000;

export async function scrapeInstagramMedia(url) {
  let browser = null;
  let page = null;

  try {
    console.log('Launching browser...');
    
    // Launch browser with optimized settings
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--single-process'
      ],
      timeout: NAVIGATION_TIMEOUT
    });

    page = await browser.newPage();

    // Set mobile user agent and viewport
    await page.setUserAgent(MOBILE_USER_AGENT);
    await page.setViewport({ 
      width: 375, 
      height: 812, 
      isMobile: true,
      hasTouch: true 
    });

    // Block unnecessary resources to speed up loading
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (['stylesheet', 'font', 'image'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    console.log(`Navigating to: ${url}`);

    // Navigate to the Instagram URL
    const response = await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: NAVIGATION_TIMEOUT
    });

    if (!response || !response.ok()) {
      throw new Error(`Failed to load page: ${response?.status() || 'Unknown error'}`);
    }

    // Wait for the page to load and check if it's accessible
    await page.waitForTimeout(2000);

    // Check if the page is private or requires login
    const isPrivateOrLoginRequired = await page.evaluate(() => {
      const bodyText = document.body.innerText.toLowerCase();
      return bodyText.includes('this account is private') ||
             bodyText.includes('log in to see') ||
             bodyText.includes('sign up to see') ||
             bodyText.includes('login required') ||
             document.querySelector('input[name="username"]') !== null;
    });

    if (isPrivateOrLoginRequired) {
      return {
        success: false,
        error: 'This content is private or requires login to access'
      };
    }

    console.log('Extracting media information...');

    // Extract media information from meta tags and other sources
    const mediaData = await page.evaluate(() => {
      const result = {
        type: null,
        mediaUrl: null,
        thumbnailUrl: null,
        title: null,
        description: null
      };

      // Try to get video URL from og:video meta tag
      const videoMeta = document.querySelector('meta[property="og:video"], meta[property="og:video:url"]');
      if (videoMeta) {
        result.mediaUrl = videoMeta.getAttribute('content');
        result.type = 'video';
      }

      // Try to get image URL from og:image meta tag
      if (!result.mediaUrl) {
        const imageMeta = document.querySelector('meta[property="og:image"]');
        if (imageMeta) {
          result.mediaUrl = imageMeta.getAttribute('content');
          result.type = 'image';
        }
      }

      // Get thumbnail (usually the same as og:image for images)
      const thumbnailMeta = document.querySelector('meta[property="og:image"]');
      if (thumbnailMeta) {
        result.thumbnailUrl = thumbnailMeta.getAttribute('content');
      }

      // Get title
      const titleMeta = document.querySelector('meta[property="og:title"]');
      if (titleMeta) {
        result.title = titleMeta.getAttribute('content');
      }

      // Get description
      const descMeta = document.querySelector('meta[property="og:description"]');
      if (descMeta) {
        result.description = descMeta.getAttribute('content');
      }

      // Try alternative methods if meta tags don't work
      if (!result.mediaUrl) {
        // Look for video elements
        const videoElement = document.querySelector('video source, video');
        if (videoElement) {
          result.mediaUrl = videoElement.src || videoElement.getAttribute('src');
          result.type = 'video';
        }
      }

      if (!result.mediaUrl) {
        // Look for image elements in specific Instagram containers
        const imgElement = document.querySelector('article img, div[role="img"] img, img[style*="object-fit"]');
        if (imgElement) {
          result.mediaUrl = imgElement.src || imgElement.getAttribute('src');
          result.type = 'image';
        }
      }

      return result;
    });

    console.log('Extracted media data:', mediaData);

    if (!mediaData.mediaUrl) {
      return {
        success: false,
        error: 'Could not extract media URL from this Instagram post'
      };
    }

    // Determine content type and estimate size
    let contentType = 'unknown';
    let estimatedSize = 'Unknown';

    if (mediaData.type === 'video') {
      contentType = 'video';
      estimatedSize = '2-10 MB'; // Typical range for Instagram videos
    } else if (mediaData.type === 'image') {
      contentType = 'image';
      estimatedSize = '200-800 KB'; // Typical range for Instagram images
    }

    // Determine post type based on URL
    let postType = 'post';
    if (url.includes('/reel/')) {
      postType = 'reel';
    } else if (url.includes('/stories/')) {
      postType = 'story';
    } else if (url.includes('/p/')) {
      postType = 'post';
    }

    const result = {
      success: true,
      data: {
        type: contentType,
        postType: postType,
        url: mediaData.mediaUrl,
        thumbnail: mediaData.thumbnailUrl || mediaData.mediaUrl,
        title: mediaData.title || `Instagram ${postType}`,
        description: mediaData.description || '',
        size: estimatedSize,
        originalUrl: url
      }
    };

    console.log('Scraping completed successfully:', result);
    return result;

  } catch (error) {
    console.error('Scraping error:', error);
    
    let errorMessage = 'Failed to scrape Instagram content';
    
    if (error.message.includes('net::ERR_NAME_NOT_RESOLVED')) {
      errorMessage = 'Invalid URL or network error';
    } else if (error.message.includes('Navigation timeout')) {
      errorMessage = 'Page took too long to load';
    } else if (error.message.includes('net::ERR_ABORTED')) {
      errorMessage = 'Request was blocked or aborted';
    }

    return {
      success: false,
      error: errorMessage
    };
  } finally {
    // Clean up resources
    try {
      if (page) {
        await page.close();
      }
      if (browser) {
        await browser.close();
      }
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }
  }
}