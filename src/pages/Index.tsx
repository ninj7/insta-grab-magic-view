import React, { useState } from 'react';
import { Download, Instagram, Play, Image, Eye } from 'lucide-react';
import { toast } from 'sonner';
import LoadingWave from '../components/LoadingWave';
import ResultCard from '../components/ResultCard';
import { cn } from '@/lib/utils';

const Index = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleDownload = async () => {
    if (!url.trim()) {
      toast.error('Please enter a valid Instagram URL');
      return;
    }

    if (!url.includes('instagram.com')) {
      toast.error('Please enter a valid Instagram URL');
      return;
    }

    setLoading(true);
    
    try {
      // Try to connect to the backend
      const response = await fetch('http://localhost:3001/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setResult({
          type: data.data.type,
          url: data.data.url,
          thumbnail: data.data.thumbnail,
          title: data.data.title,
          size: data.data.size
        });
        toast.success('Content extracted successfully!');
      } else {
        toast.error(data.error || 'Failed to extract content');
      }
    } catch (error) {
      console.error('Scraping error:', error);
      
      if (error.message.includes('fetch')) {
        toast.error('Backend server is not running. Please start the backend first.');
      } else if (error.message.includes('private')) {
        toast.error('This Instagram content is private or requires login');
      } else if (error.message.includes('timeout')) {
        toast.error('Request timed out. Please try again.');
      } else {
        toast.error(error.message || 'Failed to extract content');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setUrl('');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-pink-400 to-orange-400 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 shadow-lg">
              <Instagram className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-4">
            InstaSave
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Download Instagram Reels, Posts, and Stories instantly. Just paste the URL and get your content in seconds.
          </p>
          
          {/* Backend Status Indicator */}
          <div className="mt-4 flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-500">Backend: Ready</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">🚀 Getting Started</h3>
          <div className="space-y-2 text-blue-700">
            <p><strong>1.</strong> Make sure the backend is running:</p>
            <div className="bg-blue-100 rounded-lg p-3 font-mono text-sm">
              cd backend<br/>
              npm install<br/>
              npm run dev
            </div>
            <p><strong>2.</strong> Paste any public Instagram URL (post, reel, or story)</p>
            <p><strong>3.</strong> Click "Extract Content" to get the direct media link</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Input Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-[inset_0_2px_10px_rgba(0,0,0,0.1),0_4px_20px_rgba(0,0,0,0.05)] border border-white/20">
            <div className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste Instagram URL here... (e.g., https://www.instagram.com/p/ABC123/)"
                  className="w-full px-6 py-4 rounded-2xl bg-white/50 border-2 border-transparent focus:border-purple-300 focus:bg-white/80 transition-all duration-300 text-lg placeholder-gray-400 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)]"
                  disabled={loading}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <Play className="w-5 h-5 text-purple-400 animate-pulse" />
                    <Image className="w-5 h-5 text-pink-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                    <Eye className="w-5 h-5 text-orange-400 animate-pulse" style={{ animationDelay: '1s' }} />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleDownload}
                  disabled={loading || !url.trim()}
                  className={cn(
                    "px-8 py-4 rounded-2xl font-semibold text-white shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center space-x-3",
                    loading || !url.trim()
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:shadow-xl hover:shadow-purple-200"
                  )}
                >
                  <Download className="w-5 h-5" />
                  <span>{loading ? 'Extracting...' : 'Extract Content'}</span>
                </button>

                {(url || result) && (
                  <button
                    onClick={handleClear}
                    className="px-6 py-4 rounded-2xl font-semibold text-gray-600 bg-white/50 border-2 border-gray-200 hover:bg-white/80 transition-all duration-300 transform hover:scale-105 active:scale-95"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Loading Animation */}
          {loading && (
            <div className="flex flex-col items-center space-y-6 py-12 animate-fade-in">
              <LoadingWave />
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-700 mb-2">Extracting content...</p>
                <p className="text-gray-500">Using Puppeteer to scrape Instagram media</p>
              </div>
            </div>
          )}

          {/* Result */}
          {result && !loading && (
            <div className="animate-fade-in">
              <ResultCard result={result} />
            </div>
          )}

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            {[
              {
                icon: Play,
                title: 'Instagram Reels',
                description: 'Download any public Instagram Reel in high quality',
                gradient: 'from-purple-400 to-purple-600'
              },
              {
                icon: Image,
                title: 'Posts & Carousels',
                description: 'Save individual posts and carousel images',
                gradient: 'from-pink-400 to-pink-600'
              },
              {
                icon: Eye,
                title: 'Stories',
                description: 'Extract Instagram Stories before they disappear',
                gradient: 'from-orange-400 to-orange-600'
              }
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-[inset_0_2px_10px_rgba(0,0,0,0.1),0_4px_20px_rgba(0,0,0,0.05)] border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;