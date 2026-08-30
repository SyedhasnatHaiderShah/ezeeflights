const fs = require('fs');
const path = require('path');

const newTranslations = {
  // PopularPackages
  "CURATED FOR YOU": "CURATED FOR YOU",
  "Popular Packages": "Popular Packages",
  "View all packages": "View all packages",
  "Days": "Days",
  "Book Package →": "Book Package →",

  // ExploreByTheme
  "Travel Your Way": "Travel Your Way",
  "Find trips that match your vibe": "Find trips that match your vibe",

  // AirlinePartners
  "Our Airline Partners": "Our Airline Partners",
  "No airline partners found yet. Seed backend mock data to populate this section.": "No airline partners found yet. Seed backend mock data to populate this section.",

  // Newsletter
  "✉ STAY IN THE LOOP": "✉ STAY IN THE LOOP",
  "Get the Best Deals in Your Inbox": "Get the Best Deals in Your Inbox",
  "Join 2M+ travelers who never miss a deal": "Join 2M+ travelers who never miss a deal",
  "Enter your email": "Enter your email",
  "Subscribe": "Subscribe",
  "Unsubscribe anytime · No spam · Privacy protected": "Unsubscribe anytime · No spam · Privacy protected",

  // Footer & Links
  "About Us": "About Us",
  "Careers": "Careers",
  "Press": "Press",
  "Blog": "Blog",
  "Contact Us": "Contact Us",
  "FAQ": "FAQ",
  "Help Center": "Help Center",
  "Track Booking": "Track Booking",
  "Refunds Policy": "Refunds Policy",
  "Terms of Service": "Terms of Service",
  "Privacy Policy": "Privacy Policy",
  "Download on": "Download on",
  "App Store": "App Store",
  "Google Play": "Google Play",
  "Company": "Company",
  "Products": "Products",
  "Support": "Support",
  "Your journey begins with us": "Your journey begins with us",
  "945 Taraval Street, San Francisco, CA 94116 United States of America": "945 Taraval Street, San Francisco, CA 94116 United States of America",
  "24×7 Available": "24×7 Available",
  "17th floor 1703 Venture Zone Business Center Fahidi Heights Khalid Bin Al Waleed Street Bur Dubai 44320": "17th floor 1703 Venture Zone Business Center Fahidi Heights Khalid Bin Al Waleed Street Bur Dubai 44320",
  "Our Global Sites": "Our Global Sites",
  "Download our App": "Download our App",
  "Booking travels made easy on the go.": "Booking travels made easy on the go.",
  "100,000+ Happy Users": "100,000+ Happy Users",
  "All rights reserved.": "All rights reserved.",
  "SSL SECURED": "SSL SECURED"
};

const translationsDir = path.join(__dirname, 'apps', 'frontend', 'translations');

// Read all JSON files in the translations directory
fs.readdirSync(translationsDir).forEach(file => {
  if (file.endsWith('.json')) {
    const filePath = path.join(translationsDir, file);
    let current = {};
    try {
      current = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      console.error(`Error reading ${file}`, e);
    }
    
    // Merge keeping existing translations, adding new keys
    const merged = { ...newTranslations, ...current };
    
    fs.writeFileSync(filePath, JSON.stringify(merged, null, 2), 'utf8');
    console.log(`Updated ${file}`);
  }
});

console.log("All missing keys appended to translation JSON files successfully!");
