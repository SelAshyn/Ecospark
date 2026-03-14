'use client';

import { useState, useRef, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Sprout, Wrench, Send, Loader2, Camera, X, Sparkles, BookOpen, MessageCircle } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Footer from '@/components/Footer';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
}

const quickTopics = [
  { icon: Sprout, label: 'Composting Guide', prompt: 'How do I make compost from kitchen waste and farm residue? Give me step-by-step instructions.' },
  { icon: Wrench, label: 'Tool Repair Guide', prompt: 'How can I repair common farming tools like broken hoe handles or damaged irrigation pipes using local materials?' },
  { icon: BookOpen, label: 'Crop Rotation', prompt: 'What is crop rotation and how can I implement it on my small farm to improve soil health?' },
  { icon: MessageCircle, label: 'Natural Pest Control', prompt: 'How can I control pests naturally without using chemical pesticides? Give me organic solutions.' },
  { icon: Sprout, label: 'Water Conservation', prompt: 'What are the best water conservation techniques for farming in Nepal during dry season?' },
  { icon: Wrench, label: 'Mulching Benefits', prompt: 'How does mulching help my crops and what materials can I use for mulching in Nepal?' },
  { icon: BookOpen, label: 'Green Manure', prompt: 'What is green manure and which plants should I grow to naturally fertilize my soil?' },
  { icon: MessageCircle, label: 'Vermicomposting', prompt: 'How do I start vermicomposting at home? What are the benefits and how do I maintain it?' },
  { icon: Sprout, label: 'Intercropping Tips', prompt: 'What is intercropping and which crops grow well together in Nepal? Give me practical combinations.' },
  { icon: Wrench, label: 'Rainwater Harvesting', prompt: 'How can I collect and store rainwater for irrigation? What simple systems can I build?' },
  { icon: BookOpen, label: 'Organic Fertilizers', prompt: 'What organic fertilizers can I make at home from farm waste? Give me recipes and application methods.' },
  { icon: MessageCircle, label: 'Soil Testing', prompt: 'How can I test my soil health without expensive equipment? What signs should I look for?' },
];

export default function FarmAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = 'Ecospark | Farm Assistant';

    // Force scroll to top immediately
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic',
    });

    // Ensure scroll to top after a short delay (after AOS initializes)
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 100);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() && !selectedImage) return;

    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      image: selectedImage || undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('message', textToSend);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await fetch('/api/farm-assistant', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response,
        }]);
      } else {
        // Show specific error message from API
        const errorMsg = data.error || 'Sorry, I encountered an error. Please try again.';
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Error: ${errorMsg}\n\nPlease check:\n1. Your GEMINI_API_KEY is set in .env.local\n2. The API key is valid\n3. You have API quota remaining`,
        }]);
      }
    } catch (error: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Connection error: ${error.message || 'Could not connect to the assistant'}\n\nPlease ensure:\n1. Your development server is running\n2. The API route is accessible\n3. Your internet connection is stable`,
      }]);
    } finally {
      setLoading(false);
      removeImage();
    }
  };

  const handleQuickTopic = (prompt: string) => {
    setInput(prompt);
    sendMessage(prompt);
  };

  return (
    <div className="min-h-screen bg-[#040d07] overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(45,106,79,0.12),transparent_70%)]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(82,183,136,0.08),transparent_70%)]" />
      </div>

      <Navbar />

      <div className="relative z-10 pt-28 pb-24 px-6">
        <div className="max-w-5xl mx-auto">

          <div className="mb-10" data-aos="fade-up">
            <div className="inline-flex items-center gap-2 bg-[rgba(45,106,79,0.2)] border border-[rgba(82,183,136,0.3)] px-4 py-1.5 rounded-full text-[0.75rem] font-semibold tracking-[0.1em] uppercase text-[#95d5b2] mb-5">
              <Sparkles size={12} />
              AI-Powered Assistant
            </div>
            <h1 className="font-serif text-[clamp(2.5rem,6vw,4.5rem)] font-black text-white leading-none tracking-[-0.02em] mb-4">
              Farm{' '}
              <em className="not-italic bg-gradient-to-br from-[#74c69d] via-[#52b788] to-[#d4a853] bg-clip-text text-transparent">
                Assistant
              </em>
            </h1>
            <p className="text-lg text-[rgba(183,228,199,0.6)] max-w-2xl leading-relaxed">
              Get instant AI-powered advice on sustainable farming, crop diseases, tool repairs, and more. Upload photos for visual diagnosis.
            </p>
          </div>

          {messages.length === 0 && (
            <>
              <div className="mb-6" data-aos="fade-up" data-aos-delay="100">
                <h2 className="font-serif text-[1.5rem] font-bold text-white mb-2">
                  Popular Topics
                </h2>
                <p className="text-[rgba(183,228,199,0.5)]">
                  Click any topic below to get instant advice, or type your own question
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10" data-aos="fade-up" data-aos-delay="100">
                {quickTopics.map((topic, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickTopic(topic.prompt)}
                    className="group relative bg-gradient-to-br from-[rgba(13,35,24,0.8)] to-[rgba(7,21,16,0.9)] border border-[rgba(82,183,136,0.12)] rounded-2xl p-5 text-left hover:border-[rgba(82,183,136,0.3)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] transition-all duration-300"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-[rgba(45,106,79,0.2)] border border-[rgba(82,183,136,0.2)] group-hover:bg-[rgba(45,106,79,0.35)] transition-all duration-300">
                        <topic.icon size={20} className="text-[#74c69d]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-serif text-[1rem] font-bold text-white mb-1 group-hover:text-[#95d5b2] transition-colors duration-300">
                          {topic.label}
                        </h3>
                        <p className="text-[0.8rem] text-[rgba(183,228,199,0.4)] leading-relaxed line-clamp-2">
                          {topic.prompt}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="relative bg-gradient-to-br from-[rgba(13,35,24,0.8)] to-[rgba(7,21,16,0.9)] border border-[rgba(82,183,136,0.15)] rounded-2xl overflow-hidden" data-aos="fade-up" data-aos-delay="200">

            <div className="h-[500px] overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="p-6 rounded-full bg-[rgba(45,106,79,0.2)] border border-[rgba(82,183,136,0.2)] mb-6">
                    <Sparkles size={48} className="text-[#74c69d]" />
                  </div>
                  <h3 className="font-serif text-[1.5rem] font-bold text-white mb-3">
                    How can I help you today?
                  </h3>
                  <p className="text-[rgba(183,228,199,0.5)] max-w-md">
                    Ask me anything about sustainable farming, crop care, tool repairs, or upload a photo for visual diagnosis.
                  </p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-[#40916c] to-[#74c69d] text-[#040d07]'
                          : 'bg-[rgba(13,35,24,0.9)] border border-[rgba(82,183,136,0.2)] text-white'
                      }`}
                    >
                      {msg.image && (
                        <img
                          src={msg.image}
                          alt="Uploaded"
                          className="w-full rounded-xl mb-3 max-h-[200px] object-cover"
                        />
                      )}
                      <p className="text-[0.95rem] leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ))
              )}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[rgba(13,35,24,0.9)] border border-[rgba(82,183,136,0.2)] rounded-2xl p-4">
                    <Loader2 size={20} className="text-[#74c69d] animate-spin" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-[rgba(82,183,136,0.15)] p-4">
              {selectedImage && (
                <div className="relative inline-block mb-3">
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="w-24 h-24 rounded-xl object-cover border-2 border-[rgba(82,183,136,0.3)]"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#ef4444] text-white flex items-center justify-center hover:bg-[#dc2626] transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <div className="flex gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 rounded-xl bg-[rgba(13,35,24,0.7)] border border-[rgba(82,183,136,0.2)] text-[#74c69d] hover:bg-[rgba(45,106,79,0.3)] hover:border-[rgba(82,183,136,0.4)] transition-all duration-200"
                  title="Upload image"
                >
                  <Camera size={20} />
                </button>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !loading && sendMessage()}
                  placeholder="Ask about farming, repairs, diseases..."
                  disabled={loading}
                  className="flex-1 px-5 py-3 rounded-xl bg-[rgba(13,35,24,0.7)] border border-[rgba(82,183,136,0.2)] text-white placeholder-[rgba(183,228,199,0.3)] focus:outline-none focus:border-[rgba(82,183,136,0.5)] transition-all duration-200"
                />

                <button
                  onClick={() => sendMessage()}
                  disabled={loading || (!input.trim() && !selectedImage)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-br from-[#40916c] to-[#74c69d] text-[#040d07] font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_28px_rgba(116,198,157,0.4)] transition-all duration-200"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10" data-aos="fade-up" data-aos-delay="300">
            <div className="bg-gradient-to-br from-[rgba(13,35,24,0.7)] to-[rgba(7,21,16,0.9)] border border-[rgba(82,183,136,0.15)] rounded-2xl p-6">
              <Sprout size={32} className="text-[#74c69d] mb-4" />
              <h3 className="font-serif text-[1.1rem] font-bold text-white mb-2">Sustainable Practices</h3>
              <p className="text-[0.875rem] text-[rgba(183,228,199,0.5)]">
                Learn composting, crop rotation, intercropping, green manure, and water conservation techniques.
              </p>
            </div>

            <div className="bg-gradient-to-br from-[rgba(13,35,24,0.7)] to-[rgba(7,21,16,0.9)] border border-[rgba(82,183,136,0.15)] rounded-2xl p-6">
              <Wrench size={32} className="text-[#74c69d] mb-4" />
              <h3 className="font-serif text-[1.1rem] font-bold text-white mb-2">DIY Solutions</h3>
              <p className="text-[0.875rem] text-[rgba(183,228,199,0.5)]">
                Fix tools, build rainwater systems, make organic fertilizers using local materials.
              </p>
            </div>

            <div className="bg-gradient-to-br from-[rgba(13,35,24,0.7)] to-[rgba(7,21,16,0.9)] border border-[rgba(82,183,136,0.15)] rounded-2xl p-6">
              <Camera size={32} className="text-[#74c69d] mb-4" />
              <h3 className="font-serif text-[1.1rem] font-bold text-white mb-2">Visual Diagnosis</h3>
              <p className="text-[0.875rem] text-[rgba(183,228,199,0.5)]">
                Upload photos of crops, pests, or tools for AI-powered analysis and solutions.
              </p>
            </div>
          </div>

          {messages.length === 0 && (
            <div className="mt-10 bg-gradient-to-br from-[rgba(13,35,24,0.7)] to-[rgba(7,21,16,0.9)] border border-[rgba(82,183,136,0.15)] rounded-2xl p-8" data-aos="fade-up" data-aos-delay="400">
              <h2 className="font-serif text-[1.8rem] font-bold text-white mb-6 text-center">
                Key Sustainable Farming Methods
              </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[rgba(45,106,79,0.3)] border border-[rgba(82,183,136,0.3)] flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-[#74c69d] font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Composting</h4>
                    <p className="text-[0.875rem] text-[rgba(183,228,199,0.5)]">
                      Turn kitchen and farm waste into nutrient-rich fertilizer. Reduces waste and improves soil health naturally.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[rgba(45,106,79,0.3)] border border-[rgba(82,183,136,0.3)] flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-[#74c69d] font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Crop Rotation</h4>
                    <p className="text-[0.875rem] text-[rgba(183,228,199,0.5)]">
                      Alternate crops each season to prevent soil depletion, reduce pests, and break disease cycles.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[rgba(45,106,79,0.3)] border border-[rgba(82,183,136,0.3)] flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-[#74c69d] font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Mulching</h4>
                    <p className="text-[0.875rem] text-[rgba(183,228,199,0.5)]">
                      Cover soil with organic materials to retain moisture, suppress weeds, and regulate temperature.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[rgba(45,106,79,0.3)] border border-[rgba(82,183,136,0.3)] flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-[#74c69d] font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Intercropping</h4>
                    <p className="text-[0.875rem] text-[rgba(183,228,199,0.5)]">
                      Grow multiple crops together to maximize space, improve biodiversity, and natural pest control.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[rgba(45,106,79,0.3)] border border-[rgba(82,183,136,0.3)] flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-[#74c69d] font-bold text-sm">5</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Green Manure</h4>
                    <p className="text-[0.875rem] text-[rgba(183,228,199,0.5)]">
                      Grow nitrogen-fixing plants like beans and plow them back into soil as natural fertilizer.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[rgba(45,106,79,0.3)] border border-[rgba(82,183,136,0.3)] flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-[#74c69d] font-bold text-sm">6</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Water Conservation</h4>
                    <p className="text-[0.875rem] text-[rgba(183,228,199,0.5)]">
                      Use drip irrigation, rainwater harvesting, and proper timing to reduce water waste by 60%.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[rgba(45,106,79,0.3)] border border-[rgba(82,183,136,0.3)] flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-[#74c69d] font-bold text-sm">7</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Natural Pest Control</h4>
                    <p className="text-[0.875rem] text-[rgba(183,228,199,0.5)]">
                      Use neem oil, companion planting, and beneficial insects instead of chemical pesticides.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[rgba(45,106,79,0.3)] border border-[rgba(82,183,136,0.3)] flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-[#74c69d] font-bold text-sm">8</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Vermicomposting</h4>
                    <p className="text-[0.875rem] text-[rgba(183,228,199,0.5)]">
                      Use earthworms to convert organic waste into high-quality compost rich in nutrients.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[rgba(45,106,79,0.3)] border border-[rgba(82,183,136,0.3)] flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-[#74c69d] font-bold text-sm">9</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Soil Testing</h4>
                    <p className="text-[0.875rem] text-[rgba(183,228,199,0.5)]">
                      Regularly check soil pH and nutrients to apply only what's needed, avoiding waste.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[rgba(45,106,79,0.3)] border border-[rgba(82,183,136,0.3)] flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-[#74c69d] font-bold text-sm">10</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Organic Fertilizers</h4>
                    <p className="text-[0.875rem] text-[rgba(183,228,199,0.5)]">
                      Make fertilizers from cow dung, chicken manure, and plant waste instead of buying chemicals.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
