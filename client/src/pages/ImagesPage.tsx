import { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, Sparkles, Download, Trash2, X, Maximize2, Loader2 
} from 'lucide-react';
import { api } from '../services/api';
import { GeneratedImage } from '../types';
import toast from 'react-hot-toast';

const STYLES = [
  'Realistic', 'Anime', 'Oil Painting', 'Digital Art', 
  'Watercolor', '3D Render', 'Pixel Art', 'Sketch'
];

export default function ImagesPage() {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Realistic');
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const data = await api.getImages();
      setImages(data);
    } catch (error) {
      toast.error('Failed to load images');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const newImg = await api.generateImage(prompt, selectedStyle);
      setImages(prev => [newImg, ...prev]);
      setPrompt('');
      toast.success('Image generated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      // @ts-ignore
      if (api.deleteImage) await api.deleteImage(id);
    } catch {
      // It might just be local storage fallback
    }
    
    setImages(prev => prev.filter(img => img._id !== id));
    if (selectedImage?._id === id) setSelectedImage(null);
    toast.success('Image deleted');
  };

  const handleDownload = (img: GeneratedImage, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Create an anchor tag and trigger download
    const a = document.createElement('a');
    a.href = img.url;
    a.download = `generated-${Date.now()}.png`; // Provide a default filename
    a.target = '_blank'; // Fallback if download attribute fails
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Downloading image...');
  };

  return (
    <div className="h-full flex flex-col relative animate-fadeIn">
      {/* Header & Generation Panel - Fixed top */}
      <div className="bg-surface-900/80 backdrop-blur-xl border-b border-white/5 p-6 md:px-8 z-10 sticky top-0 shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              Image Generator <span className="badge bg-primary-500/20 text-primary-300 border border-primary-500/20">Beta</span>
            </h1>
            <p className="text-gray-400">Describe an image and our AI will create it.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 glass px-4 py-2 rounded-lg text-sm text-gray-300">
            <ImageIcon size={16} className="text-pink-400" />
            <span className="font-bold text-white">{images.length}</span> images generated
          </div>
        </div>

        <div className="glass rounded-2xl p-4 md:p-6 border border-white/10 focus-within:border-primary-500/40 transition-colors">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A futuristic city at sunset with flying cars, cyberpunk style..."
            className="w-full bg-transparent resize-none text-gray-200 placeholder:text-gray-500 focus:outline-none text-base"
            rows={2}
          />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pt-4 border-t border-white/5">
            <div className="flex flex-wrap items-center gap-2">
              {STYLES.map(style => (
                <button
                  key={style}
                  onClick={() => setSelectedStyle(style)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors border ${
                    selectedStyle === style 
                      ? 'bg-primary-600/20 text-primary-300 border-primary-500/30' 
                      : 'bg-surface-800 text-gray-400 border-white/5 hover:text-gray-200 hover:bg-surface-700'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
            
            <button
              id="generate-image-btn"
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="btn-primary whitespace-nowrap self-end sm:self-auto"
            >
              {isGenerating ? (
                <><Loader2 size={16} className="animate-spin" /> Generating...</>
              ) : (
                <><Sparkles size={16} /> Generate</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="flex-1 overflow-y-auto chat-scroll p-6 md:p-8">
        {isGenerating && (
          <div className="mb-8 glass rounded-2xl p-8 flex flex-col items-center justify-center text-center animate-pulse-slow">
            <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center mb-4">
              <Sparkles size={32} className="text-primary-400 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Creating your masterpiece...</h3>
            <p className="text-gray-400 italic">"{prompt}"</p>
          </div>
        )}

        {isLoading ? (
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`shimmer rounded-2xl w-full break-inside-avoid ${i % 2 === 0 ? 'h-64' : 'h-80'}`}></div>
            ))}
          </div>
        ) : images.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {images.map(img => (
              <div 
                key={img._id} 
                className="glass rounded-2xl overflow-hidden group cursor-pointer relative break-inside-avoid border border-white/10 hover:border-primary-500/50 transition-all duration-300"
                onClick={() => setSelectedImage(img)}
              >
                <img 
                  src={img.url} 
                  alt={img.prompt} 
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge bg-black/50 backdrop-blur-md text-gray-200 border border-white/10">
                      {img.style}
                    </span>
                    <span className="badge bg-black/50 backdrop-blur-md text-gray-400 border border-white/10 text-[10px]">
                      {new Date(img.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-white text-sm font-medium line-clamp-2 mb-4 drop-shadow-md">
                    {img.prompt}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => handleDownload(img, e)}
                      className="btn-primary flex-1 justify-center py-2 text-sm bg-primary-600/80 backdrop-blur-md"
                    >
                      <Download size={16} /> Download
                    </button>
                    <button 
                      onClick={(e) => handleDelete(img._id, e)}
                      className="p-2 rounded-lg bg-red-500/80 backdrop-blur-md text-white hover:bg-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                {/* Expand icon (top right) */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 size={14} />
                </div>
              </div>
            ))}
          </div>
        ) : !isGenerating && (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 rounded-full bg-surface-800 flex items-center justify-center mb-6">
              <ImageIcon size={48} className="text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No images yet</h2>
            <p className="text-gray-400 max-w-md mb-8">
              Describe anything you can imagine in the text box above, and watch our AI bring it to life instantly.
            </p>
            
            <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
              {[
                'A cute cat astronaut exploring Mars',
                'Minimalist logo for a coffee shop',
                'Cyberpunk city alleyway raining neon',
                'Hyperrealistic bowl of ramen'
              ].map(example => (
                <button
                  key={example}
                  onClick={() => setPrompt(example)}
                  className="px-4 py-2 rounded-full glass text-sm text-gray-300 hover:text-white hover:bg-surface-700 transition-colors"
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-fadeIn"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="max-w-5xl w-full bg-surface-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col lg:flex-row"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-full lg:w-2/3 bg-black flex items-center justify-center">
              <img 
                src={selectedImage.url} 
                alt={selectedImage.prompt} 
                className="w-full max-h-[70vh] lg:max-h-[85vh] object-contain"
              />
            </div>
            
            <div className="w-full lg:w-1/3 p-6 md:p-8 flex flex-col h-full bg-surface-900">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Details</h3>
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="p-2 rounded-full bg-surface-800 text-gray-400 hover:text-white hover:bg-surface-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="flex-1">
                <div className="mb-6">
                  <p className="text-sm text-gray-400 mb-2 uppercase tracking-wider font-semibold">Prompt</p>
                  <p className="text-gray-200 leading-relaxed bg-surface-800 p-4 rounded-xl border border-white/5">
                    {selectedImage.prompt}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div>
                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Style</p>
                    <p className="font-medium text-white">{selectedImage.style}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Date</p>
                    <p className="font-medium text-white">{new Date(selectedImage.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Resolution</p>
                    <p className="font-medium text-white">{selectedImage.width} × {selectedImage.height}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Model</p>
                    <p className="font-medium text-white">Imagen 3</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-auto pt-6 border-t border-white/5">
                <button 
                  onClick={() => handleDownload(selectedImage)}
                  className="btn-primary flex-1 justify-center py-3"
                >
                  <Download size={18} /> Download High-Res
                </button>
                <button 
                  onClick={() => handleDelete(selectedImage._id)}
                  className="p-3 rounded-xl bg-surface-800 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors border border-white/5"
                  title="Delete image"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
