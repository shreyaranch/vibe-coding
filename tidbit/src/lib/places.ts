export const COUNTRIES = [
  "Canada", "United States", "United Kingdom", "India", "Australia", "Ireland", "New Zealand", "Germany", "France", "Spain",
  "Italy", "Netherlands", "Sweden", "Brazil", "Mexico", "Japan", "South Korea", "Singapore", "South Africa", "Nigeria", "Kenya",
  "United Arab Emirates", "Philippines", "Pakistan", "Bangladesh",
];

export const REGIONS: Record<string, string[]> = {
  Canada: ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Nova Scotia", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan"],
  "United States": ["California", "Florida", "Illinois", "Massachusetts", "New York", "Texas", "Washington"],
  "United Kingdom": ["England", "Northern Ireland", "Scotland", "Wales"],
  India: ["Delhi", "Karnataka", "Maharashtra", "Tamil Nadu", "Telangana", "West Bengal"],
};

/** Fictional towns used by the demo content, so the Local feed has stories to show. */
export const DEMO_CITIES: { city: string; region: string; country: string }[] = [
  { city: "Port Avalon", region: "Ontario", country: "Canada" },
  { city: "Maple Crossing", region: "Ontario", country: "Canada" },
  { city: "Cedarbrook", region: "British Columbia", country: "Canada" },
  { city: "Saint-Lumière", region: "Quebec", country: "Canada" },
  { city: "Harbor Point", region: "California", country: "United States" },
  { city: "Brightwater", region: "New York", country: "United States" },
  { city: "Red Mesa", region: "Texas", country: "United States" },
  { city: "Ashford Vale", region: "England", country: "United Kingdom" },
  { city: "Glenmoray", region: "Scotland", country: "United Kingdom" },
  { city: "Silverline City", region: "Karnataka", country: "India" },
];
