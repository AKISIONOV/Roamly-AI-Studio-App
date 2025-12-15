import React, { useState, useEffect } from 'react';
import { generateTripItinerary, initializeChat } from './services/geminiService';
import { TripItinerary, ViewState } from './types';
import { ItineraryView } from './components/ItineraryView';
import { ChatAssistant } from './components/ChatAssistant';
import { Button } from './components/Button';
import { Plane, Map, Compass, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [prompt, setPrompt] = useState('');
  const [itinerary, setItinerary] = useState<TripItinerary | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize location for Maps grounding on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          initializeChat({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        () => {
          initializeChat(); // Fallback without location
        }
      );
    } else {
      initializeChat();
    }
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setView(ViewState.LOADING);
    setError(null);

    try {
      const data = await generateTripItinerary(prompt);
      setItinerary(data);
      setView(ViewState.TRIP);
    } catch (e) {
      console.error(e);
      setError("Failed to generate itinerary. Please try again with a different prompt.");
      setView(ViewState.HOME);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-primary-200">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView(ViewState.HOME)}>
            <div className="bg-primary-600 p-1.5 rounded-lg">
              <Compass className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">Roamly</span>
          </div>
          {view === ViewState.TRIP && (
            <Button variant="ghost" size="sm" onClick={() => setView(ViewState.HOME)}>New Trip</Button>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pt-16 min-h-screen flex flex-col">
        
        {view === ViewState.HOME && (
          <div className="flex-1 flex flex-col justify-center items-center px-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            <div className="max-w-3xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight">
                  Where will you <span className="text-primary-600">roam</span> next?
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Your personalized AI travel architect. Design the perfect trip in seconds, from hidden gems to popular landmarks.
                </p>
              </div>

              <div className="bg-white p-2 rounded-2xl shadow-xl border border-gray-100 flex flex-col md:flex-row gap-2 max-w-2xl mx-auto transition-transform focus-within:scale-[1.01]">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Map className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
                    className="block w-full pl-11 pr-4 py-4 rounded-xl border-none text-gray-900 placeholder-gray-400 focus:ring-0 text-lg"
                    placeholder="E.g., 3 days in Kyoto for a foodie..."
                  />
                </div>
                <Button 
                  size="lg" 
                  onClick={handleGenerate} 
                  disabled={!prompt.trim()} 
                  className="rounded-xl shadow-lg shadow-primary-500/30"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Plan Trip
                </Button>
              </div>

              <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-500 pt-4">
                <span className="px-3 py-1 bg-white rounded-full border border-gray-200 shadow-sm">Paris for art lovers</span>
                <span className="px-3 py-1 bg-white rounded-full border border-gray-200 shadow-sm">Hiking in Patagonia</span>
                <span className="px-3 py-1 bg-white rounded-full border border-gray-200 shadow-sm">Weekend in NYC</span>
              </div>
              
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100 animate-in shake">
                  {error}
                </div>
              )}
            </div>
          </div>
        )}

        {view === ViewState.LOADING && (
          <div className="flex-1 flex flex-col justify-center items-center px-4">
            <div className="flex flex-col items-center gap-6 animate-pulse">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-500 rounded-full opacity-20 animate-ping"></div>
                <div className="bg-primary-600 p-4 rounded-full shadow-xl relative z-10">
                  <Plane className="h-12 w-12 text-white animate-bounce" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Crafting your itinerary...</h2>
                <p className="text-gray-500">Checking flights, hotels, and hidden spots.</p>
              </div>
            </div>
          </div>
        )}

        {view === ViewState.TRIP && itinerary && (
          <ItineraryView 
            itinerary={itinerary} 
            onBack={() => setView(ViewState.HOME)} 
          />
        )}
      </main>

      {/* Persistent Chat Assistant */}
      <ChatAssistant />
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Roamly. Powered by Gemini.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
