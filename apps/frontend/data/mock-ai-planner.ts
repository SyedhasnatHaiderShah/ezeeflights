export interface ItineraryActivity {
  id: string;
  time: string;
  duration: string;
  title: string;
  description: string;
  type: 'activity' | 'transport' | 'meal' | 'buffer';
  category?: string;
  location?: string;
  bufferAfter?: string;
}

export interface ItineraryDay {
  day: number;
  date: string;
  slots: {
    morning: ItineraryActivity[];
    afternoon: ItineraryActivity[];
    evening: ItineraryActivity[];
  };
}

export interface SmartAlert {
  id: string;
  type: 'holiday' | 'delay' | 'tip';
  message: string;
  day?: number;
}

export interface FullItinerary {
  id: string;
  title: string;
  destination: string;
  duration: string;
  days: ItineraryDay[];
  alerts: SmartAlert[];
}

export const MOCK_ITINERARY: FullItinerary = {
  id: 'itinerary-bali-001',
  title: 'Spiritual Escape in Ubud & Beach Vibes in Seminyak',
  destination: 'Bali, Indonesia',
  duration: '6 Nights, 7 Days',
  days: [
    {
      day: 1,
      date: 'Monday, May 12',
      slots: {
        morning: [
          {
            id: 'act-1-1',
            time: '09:00 AM',
            duration: '2h',
            title: 'Arrival & Airport Transfer',
            description: 'Meet driver at Ngurah Rai International Airport (DPS) arrival hall.',
            type: 'transport',
            bufferAfter: '45m buffer for traffic'
          }
        ],
        afternoon: [
          {
            id: 'act-1-2',
            time: '02:00 PM',
            duration: '1h',
            title: 'Hotel Check-in',
            description: 'Luxury Villa Ubud. Welcome drink and orientation.',
            type: 'activity',
            category: 'Accommodation'
          },
          {
            id: 'act-1-3',
            time: '04:00 PM',
            duration: '2h',
            title: 'Campuhan Ridge Walk',
            description: 'Easy sunset trek through lush greenery and rice fields.',
            type: 'activity',
            category: 'Nature'
          }
        ],
        evening: [
          {
            id: 'act-1-4',
            time: '07:30 PM',
            duration: '1.5h',
            title: 'Dinner at Locavore',
            description: 'Modern Indonesian fine dining experience.',
            type: 'meal',
            category: 'Dining',
            location: 'Ubud Center'
          }
        ]
      }
    },
    {
      day: 2,
      date: 'Tuesday, May 13',
      slots: {
        morning: [
          {
            id: 'act-2-1',
            time: '08:30 AM',
            duration: '3h',
            title: 'Tegalalang Rice Terrace',
            description: 'Explore the iconic terraced hills and giant swings.',
            type: 'activity',
            category: 'Sightseeing'
          }
        ],
        afternoon: [
          {
            id: 'act-2-2',
            time: '12:30 PM',
            duration: '1.5h',
            title: 'Lunch at Clear Cafe',
            description: 'Healthy and organic bowls with garden views.',
            type: 'meal',
            category: 'Dining'
          },
          {
            id: 'act-2-3',
            time: '03:00 PM',
            duration: '2.5h',
            title: 'Holy Water Temple (Tirta Empul)',
            description: 'Experience a traditional purification ritual.',
            type: 'activity',
            category: 'Culture',
            bufferAfter: '30m travel time'
          }
        ],
        evening: [
          {
            id: 'act-2-4',
            time: '07:00 PM',
            duration: '2h',
            title: 'Traditional Kecak Dance',
            description: 'Mesmerizing fire dance performance at Ubud Palace.',
            type: 'activity',
            category: 'Arts'
          }
        ]
      }
    },
    {
      day: 3,
      date: 'Wednesday, May 14',
      slots: {
        morning: [
          {
            id: 'act-3-1',
            time: '09:00 AM',
            duration: '2h',
            title: 'Ubud Monkey Forest',
            description: 'Sacred sanctuary with over 1000 long-tailed macaques.',
            type: 'activity',
            category: 'Wildlife'
          }
        ],
        afternoon: [
          {
            id: 'act-3-2',
            time: '01:00 PM',
            duration: '4h',
            title: 'Balinese Cooking Class',
            description: 'Learn to cook traditional dishes in a farm setting.',
            type: 'activity',
            category: 'Experience'
          }
        ],
        evening: [
          {
            id: 'act-3-3',
            time: '08:00 PM',
            duration: '1.5h',
            title: 'Relaxation Massage',
            description: 'Traditional Balinese massage at Karsa Spa.',
            type: 'activity',
            category: 'Wellness'
          }
        ]
      }
    }
  ],
  alerts: [
    {
      id: 'alert-1',
      type: 'holiday',
      message: 'Nyepi Eve: Local celebrations may cause road closures in the afternoon.',
      day: 3
    },
    {
      id: 'alert-2',
      type: 'delay',
      message: 'Flight QR960 delayed by 1.5h. Airport transfer time auto-adjusted.',
      day: 1
    },
    {
      id: 'alert-3',
      type: 'tip',
      message: 'Dress Code: Please remember to wear a sarong for temple visits on Day 2.',
    }
  ]
};
