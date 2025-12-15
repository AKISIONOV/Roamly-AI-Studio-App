import React from 'react';
import { TripItinerary } from '../types';
import { MapPin, Clock, DollarSign, ArrowLeft } from 'lucide-react';
import { ActivityChart } from './ActivityChart';
import { TimelineViz } from './TimelineViz';
import { Button } from './Button';

interface ItineraryViewProps {
  itinerary: TripItinerary;
  onBack: () => void;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({ itinerary, onBack }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 container mx-auto px-4 py-8 max-w-5xl">
      <Button variant="ghost" onClick={onBack} className="mb-6 pl-0 hover:bg-transparent hover:text-primary-600">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
      </Button>

      {/* Header Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="h-48 md:h-64 relative bg-gray-200">
           <img 
            src={`https://picsum.photos/1200/400?random=${itinerary.destination.length}`} 
            alt={itinerary.destination}
            className="w-full h-full object-cover"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-8">
             <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{itinerary.tripTitle}</h1>
             <p className="text-white/90 text-lg flex items-center gap-2">
               <MapPin className="h-5 w-5" /> {itinerary.destination} • {itinerary.duration}
             </p>
           </div>
        </div>
        <div className="p-8 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Trip Summary</h2>
            <p className="text-gray-600 leading-relaxed text-lg">{itinerary.summary}</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <ActivityChart data={itinerary.estimatedBudget} />
          </div>
        </div>
      </div>

      {/* Days List */}
      <div className="space-y-12 relative">
        {itinerary.days.map((day, dayIndex) => (
          <div key={day.dayNumber} className="relative pl-0 md:pl-12">
            {/* Timeline connector visual (D3) */}
            <TimelineViz count={day.activities.length} />

            <div className="mb-6">
              <span className="inline-block px-4 py-1 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm mb-2">
                Day {day.dayNumber}
              </span>
              <h3 className="text-2xl font-bold text-gray-900">{day.theme}</h3>
            </div>

            <div className="space-y-6">
              {day.activities.map((activity, actIndex) => (
                <div 
                  key={actIndex} 
                  className="group bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:border-primary-200 relative z-10"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="flex items-center gap-1.5 text-sm font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                          <Clock className="h-3.5 w-3.5" />
                          {activity.time}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getTypeColor(activity.type)}`}>
                          {activity.type}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                        {activity.activity}
                      </h4>
                      <p className="text-gray-600 text-sm mb-3">{activity.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {activity.location}
                        </span>
                        <span className="flex items-center gap-0.5" title="Estimated Cost">
                          {[...Array(5)].map((_, i) => (
                            <DollarSign 
                              key={i} 
                              className={`h-3 w-3 ${i < activity.costEstimate ? 'text-green-600' : 'text-gray-300'}`} 
                            />
                          ))}
                        </span>
                      </div>
                    </div>
                    <div className="w-full md:w-32 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                       <img 
                        src={`https://picsum.photos/200/200?random=${dayIndex * 10 + actIndex}`} 
                        alt={activity.activity}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                       />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper for pill colors
const getTypeColor = (type: string) => {
  switch(type) {
    case 'Food': return 'bg-orange-50 text-orange-600 border-orange-100';
    case 'Nature': return 'bg-green-50 text-green-600 border-green-100';
    case 'Culture': return 'bg-purple-50 text-purple-600 border-purple-100';
    case 'Relaxation': return 'bg-blue-50 text-blue-600 border-blue-100';
    case 'Sightseeing': return 'bg-red-50 text-red-600 border-red-100';
    default: return 'bg-gray-50 text-gray-600 border-gray-100';
  }
};
