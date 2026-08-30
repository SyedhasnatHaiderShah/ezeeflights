const fs = require('fs');
const path = require('path');

const translations = {
  // Hero
  "Find Your Perfect": "Find Your Perfect",
  "Journey": "Journey",
  "Search 500+ airlines. Compare prices. Book in Seconds.": "Search 500+ airlines. Compare prices. Book in Seconds.",
  "#1 Flight Booking Platform": "#1 Flight Booking Platform",
  "Happy Travelers": "Happy Travelers",
  "Airlines": "Airlines",
  "Countries": "Countries",
  "Rating": "Rating",
  "Happy Guests": "Happy Guests",
  "Hotel Partners": "Hotel Partners",
  "Destinations": "Destinations",
  "Guest Rating": "Guest Rating",
  "Happy Renters": "Happy Renters",
  "Rental Partners": "Rental Partners",
  "Service Regions": "Service Regions",
  "Driver Rating": "Driver Rating",
  "Package Partners": "Package Partners",
  "Trip Rating": "Trip Rating",
  "Happy Riders": "Happy Riders",
  "Transfer Partners": "Transfer Partners",
  "Service Cities": "Service Cities",
  "Service Rating": "Service Rating",

  // Recent Searches
  "Show Recent Searches": "Show Recent Searches",
  "(Guest)": "(Guest)",
  "Recent Searches": "Recent Searches",
  "From": "From",
  "To": "To",

  // Header
  "Welcome back!": "Welcome back!",
  "You have successfully signed in to your account.": "You have successfully signed in to your account.",
  "Notifications": "Notifications",
  "Mark all read": "Mark all read",
  "All caught up! Check back later for new alerts.": "All caught up! Check back later for new alerts.",
  "Saved Favorites": "Saved Favorites",
  "View All": "View All",
  "No favorites yet. Save flights and destinations to see them here.": "No favorites yet. Save flights and destinations to see them here.",
  "Saved Item": "Saved Item",
  "Explore": "Explore",
  "More": "More",
  "Featured": "Featured",
  "Explore Top Bundles": "Explore Top Bundles",
  "Ask Ezee": "Ask Ezee",

  // Booking Form
  "Flights": "Flights",
  "Hotels": "Hotels",
  "Cars": "Cars",
  "Packages": "Packages",
  "Transfers": "Transfers",
  "Insurance": "Insurance",
  "Experiences": "Experiences",
  "one-way": "one-way",
  "round-trip": "round-trip",
  "multi-city": "multi-city",
  "From Where?": "From Where?",
  "To Where?": "To Where?",
  "Depart": "Depart",
  "+ Add Another Flight": "+ Add Another Flight",
  "Search Flights →": "Search Flights →"
};

const languages = ["en", "tr", "ar", "fr", "hi", "es", "et", "de", "zh", "ur", "tl"];
const translationsDir = path.join(__dirname, 'apps', 'frontend', 'translations');

for (const lang of languages) {
  const filePath = path.join(translationsDir, `${lang}.json`);
  let current = {};
  if (fs.existsSync(filePath)) {
    current = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  
  // Merge new translations, keeping existing ones
  const merged = { ...translations, ...current };
  
  fs.writeFileSync(filePath, JSON.stringify(merged, null, 2), 'utf8');
}

console.log("Translations successfully updated across all files!");
