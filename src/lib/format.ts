const countryCurrencyMap: Record<string, string> = {
  "India": "INR", "USA": "USD", "United States": "USD", "UK": "GBP",
  "United Kingdom": "GBP", "Canada": "CAD", "Australia": "AUD",
  "UAE": "AED", "Singapore": "SGD", "Malaysia": "MYR",
  "Pakistan": "PKR", "Bangladesh": "BDT", "Sri Lanka": "LKR",
  "Nepal": "NPR", "Maldives": "MVR", "Indonesia": "IDR",
  "Thailand": "THB", "Japan": "JPY", "China": "CNY",
  "South Africa": "ZAR", "Nigeria": "NGN", "Kenya": "KES",
  "Germany": "EUR", "France": "EUR", "Italy": "EUR", "Spain": "EUR",
  "Brazil": "BRL", "Mexico": "MXN", "Argentina": "ARS",
  "Saudi Arabia": "SAR", "Qatar": "QAR", "Kuwait": "KWD",
  "New Zealand": "NZD", "South Korea": "KRW", "Russia": "RUB",
  "Turkey": "TRY", "Switzerland": "CHF", "Sweden": "SEK",
  "Norway": "NOK", "Netherlands": "EUR", "Belgium": "EUR",
  "Portugal": "EUR", "Greece": "EUR", "Ireland": "EUR",
  "Denmark": "DKK", "Poland": "PLN", "Czech Republic": "CZK",
  "Hungary": "HUF", "Romania": "RON", "Egypt": "EGP",
  "Morocco": "MAD", "Vietnam": "VND", "Philippines": "PHP",
};

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${day}-${month}-${year} ${hours}.${minutes} ${ampm}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}.${minutes} ${ampm}`;
}

export function getCurrencyForCountry(country: string): string {
  return countryCurrencyMap[country] || "INR";
}

export function formatCurrency(amount: number, country: string): string {
  const currency = getCurrencyForCountry(country);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
