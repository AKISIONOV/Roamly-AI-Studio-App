export interface TripActivity {
  time: string;
  activity: string;
  description: string;
  location: string;
  type: 'Food' | 'Sightseeing' | 'Nature' | 'Relaxation' | 'Culture' | 'Other';
  costEstimate: number; // 1-5 scale
}

export interface DayPlan {
  dayNumber: number;
  theme: string;
  activities: TripActivity[];
}

export interface TripItinerary {
  tripTitle: string;
  destination: string;
  duration: string;
  summary: string;
  days: DayPlan[];
  estimatedBudget: {
    category: string;
    percentage: number;
  }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  groundingLinks?: {
    title: string;
    uri: string;
    source: string;
  }[];
}

export enum ViewState {
  HOME = 'HOME',
  LOADING = 'LOADING',
  TRIP = 'TRIP',
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}
