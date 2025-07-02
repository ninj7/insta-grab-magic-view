
import React from 'react';
import { Download, Play, Image as ImageIcon, Eye, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface ResultCardProps {
  result: {
    type: 'video' | 'image' | 'story';
    url: string;
    thumbnail: string;
    title: string;
    size: string;
  };
}

const ResultCard = ({ result }: ResultCardProps) => {
  const handleDownload = () => {
    // In a real app, this would trigger the actual download
    toast.success('Download started!');
  };

  const getIcon = () => {
    switch (result.type) {
      case 'video':
        return Play;
      case 'image':
        return ImageIcon;
      case 'story':
        return Eye;
      default:
        return FileText;
    }
  };

  const getGradient = () => {
    switch (result.type) {
      case 'video':
        return 'from-purple-500 to-purple-700';
      case 'image':
        return 'from-pink-500 to-pink-700';
      case 'story':
        return 'from-orange-500 to-orange-700';
      default:
        return 'from-gray-500 to-gray-700';
    }
  };

  const Icon = getIcon();

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-[inset_0_2px_10px_rgba(0,0,0,0.1),0_4px_20px_rgba(0,0,0,0.05)] border border-white/20">
      <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
        {/* Preview */}
        <div className="relative group cursor-pointer">
          <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
            <img
              src={result.thumbnail}
              alt={result.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className={`p-3 rounded-full bg-gradient-to-br ${getGradient()} shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Info */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2 mb-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${getGradient()} shadow-md`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-600 capitalize">
              Instagram {result.type}
            </span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{result.title}</h3>
          <p className="text-gray-600 mb-4">Size: {result.size}</p>
          
          <button
            onClick={handleDownload}
            className={`px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center space-x-2 mx-auto md:mx-0 bg-gradient-to-r ${getGradient()} hover:shadow-xl`}
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>

        {/* Download Stats */}
        <div className="text-center">
          <div className="bg-white/50 rounded-2xl p-4 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)]">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              Ready
            </div>
            <div className="text-sm text-gray-600 mt-1">
              High Quality
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
