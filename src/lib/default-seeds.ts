export const defaultTraditions = [
  {
    key: "hindu",
    name: "Hindu",
    description: "Traditional Hindu wedding celebrations",
    seedTasks: JSON.stringify([
      { title: "Book Mehndi Artist", category: "ceremonies", ceremonyName: "Mehndi" },
      { title: "Buy Wedding Lehenga & Sherwani", category: "apparel", ceremonyName: "Mandap Pheras" },
      { title: "Hire Dhol Players & DJ", category: "music", ceremonyName: "Sangeet" },
      { title: "Arrange Catering & Sweets (Mithai)", category: "catering", ceremonyName: "Reception" },
      { title: "Select Mandap Decorator", category: "decor", ceremonyName: "Mandap Pheras" },
    ]),
    seedCeremonies: JSON.stringify([
      { name: "Mehndi", description: "Traditional henna pre-wedding celebration", offsetDays: -2, startHour: 14, startMin: 0, endHour: 18, endMin: 0, isFoodServed: false },
      { name: "Haldi", description: "Traditional cleansing ceremony", offsetDays: -1, startHour: 10, startMin: 0, endHour: 13, endMin: 0, isFoodServed: false },
      { name: "Sangeet", description: "Musical celebration night", offsetDays: -1, startHour: 18, startMin: 0, endHour: 22, endMin: 0, isFoodServed: false },
      { name: "Mandap Pheras", description: "Main Vedic wedding ceremony rituals around the holy fire", offsetDays: 0, startHour: 10, startMin: 0, endHour: 14, endMin: 0, isFoodServed: true },
      { name: "Reception", description: "Grand wedding dinner reception", offsetDays: 0, startHour: 19, startMin: 0, endHour: 23, endMin: 0, isFoodServed: true },
    ]),
  },
  {
    key: "muslim",
    name: "Muslim",
    description: "Traditional Muslim wedding celebrations",
    seedTasks: JSON.stringify([
      { title: "Coordinate with Qazi & Print Nikah Nama", category: "ceremonies", ceremonyName: "Nikah" },
      { title: "Purchase Wedding Attire (Sherwani/Gharara)", category: "apparel", ceremonyName: "Nikah" },
      { title: "Select Stage & Floral Decorator", category: "decor", ceremonyName: "Valima" },
      { title: "Book Catering Menu for Valima Feast", category: "catering", ceremonyName: "Valima" },
    ]),
    seedCeremonies: JSON.stringify([
      { name: "Manjha", description: "Traditional pre-wedding ceremonies", offsetDays: -2, startHour: 16, startMin: 0, endHour: 20, endMin: 0, isFoodServed: false },
      { name: "Nikah", description: "Official marriage contract ceremony", offsetDays: 0, startHour: 11, startMin: 0, endHour: 13, endMin: 0, isFoodServed: true },
      { name: "Valima", description: "Post-wedding grand feast reception", offsetDays: 1, startHour: 19, startMin: 0, endHour: 23, endMin: 0, isFoodServed: true },
    ]),
  },
  {
    key: "sikh",
    name: "Sikh",
    description: "Traditional Sikh wedding celebrations",
    seedTasks: JSON.stringify([
      { title: "Book Gurdwara & Coordinate with Ragis", category: "venue", ceremonyName: "Anand Karaj" },
      { title: "Purchase Rumalla Sahib for Guru Granth Sahib", category: "ceremonies", ceremonyName: "Anand Karaj" },
      { title: "Finalize Langar or Catering Menu", category: "catering", ceremonyName: "Anand Karaj" },
      { title: "Buy Anand Karaj Bridal/Groom Suit", category: "apparel", ceremonyName: "Anand Karaj" },
    ]),
    seedCeremonies: JSON.stringify([
      { name: "Maiya", description: "Traditional pre-wedding cleansing ceremonies", offsetDays: -1, startHour: 10, startMin: 0, endHour: 13, endMin: 0, isFoodServed: false },
      { name: "Anand Karaj", description: "Holy wedding ceremony at the Gurdwara", offsetDays: 0, startHour: 9, startMin: 0, endHour: 13, endMin: 0, isFoodServed: true },
      { name: "Reception", description: "Post-wedding dinner party celebration", offsetDays: 0, startHour: 18, startMin: 0, endHour: 23, endMin: 0, isFoodServed: true },
    ]),
  },
  {
    key: "christian",
    name: "Christian",
    description: "Traditional Christian wedding celebrations",
    seedTasks: JSON.stringify([
      { title: "Secure Church Venue & Priest", category: "venue", ceremonyName: "Church Ceremony" },
      { title: "Purchase Wedding Dress & Tuxedo", category: "apparel", ceremonyName: "Church Ceremony" },
      { title: "Order Wedding Cake & Floral Bouquets", category: "catering", ceremonyName: "Reception" },
      { title: "Hire Wedding Choir & Organist", category: "music", ceremonyName: "Church Ceremony" },
    ]),
    seedCeremonies: JSON.stringify([
      { name: "Rehearsal Dinner", description: "Formal dinner with family and bridal party", offsetDays: -1, startHour: 18, startMin: 0, endHour: 21, endMin: 0, isFoodServed: true },
      { name: "Church Ceremony", description: "Marriage ceremony in the church", offsetDays: 0, startHour: 14, startMin: 0, endHour: 16, endMin: 0, isFoodServed: false },
      { name: "Reception", description: "Evening reception celebration with cake and dancing", offsetDays: 0, startHour: 18, startMin: 0, endHour: 23, endMin: 0, isFoodServed: true },
    ]),
  },
  {
    key: "secular",
    name: "Secular",
    description: "Non-religious or secular wedding celebrations",
    seedTasks: JSON.stringify([
      { title: "Select Secular Celebrant", category: "ceremonies", ceremonyName: "Vows" },
      { title: "Write Wedding Vows", category: "other", ceremonyName: "Vows" },
      { title: "Arrange Catering & Open Bar", category: "catering", ceremonyName: "Reception" },
      { title: "Coordinate Photographer/Videographer Contracts", category: "other", ceremonyName: "Reception" },
    ]),
    seedCeremonies: JSON.stringify([
      { name: "Toast", description: "Ice-breaker drinks with incoming guests", offsetDays: -1, startHour: 18, startMin: 0, endHour: 20, endMin: 0, isFoodServed: true },
      { name: "Vows", description: "Ceremonial reading of wedding vows", offsetDays: 0, startHour: 16, startMin: 0, endHour: 17, endMin: 30, isFoodServed: false },
      { name: "Reception", description: "Dinner, toast, and dancing", offsetDays: 0, startHour: 18, startMin: 0, endHour: 23, endMin: 30, isFoodServed: true },
    ]),
  },
];

export const defaultCategories = [
  {
    key: "venue",
    name: "Venue",
    followUpQuestions: JSON.stringify([
      {
        id: "venueType",
        label: "Venue Preference",
        type: "select",
        options: ["Indoor Ballroom", "Outdoor Lawn/Garden", "Beachside", "Temple/Church"]
      },
      {
        id: "estimatedGuests",
        label: "Estimated Guest Count",
        type: "text"
      }
    ])
  },
  {
    key: "catering",
    name: "Catering",
    followUpQuestions: JSON.stringify([
      {
        id: "dietaryType",
        label: "Dietary Option",
        type: "select",
        options: ["Vegetarian", "Non-Vegetarian", "Both/All-inclusive"]
      },
      {
        id: "serviceStyle",
        label: "Service Style",
        type: "select",
        options: ["Buffet", "Plated Service", "Family Style", "Food Stations"]
      }
    ])
  },
  {
    key: "decor",
    name: "Decor",
    followUpQuestions: JSON.stringify([
      {
        id: "colorScheme",
        label: "Color Theme/Palette",
        type: "text"
      },
      {
        id: "floralSetup",
        label: "Floral Setup Required?",
        type: "select",
        options: ["Yes, extensive", "Minimal floral", "No floral"]
      }
    ])
  },
  {
    key: "apparel",
    name: "Apparel",
    followUpQuestions: JSON.stringify([
      {
        id: "fittingRequired",
        label: "Fitting Session Required?",
        type: "select",
        options: ["Yes", "No"]
      }
    ])
  },
  {
    key: "invitations",
    name: "Invitations",
    followUpQuestions: JSON.stringify([])
  },
  {
    key: "music",
    name: "Music",
    followUpQuestions: JSON.stringify([
      {
        id: "entertainmentType",
        label: "Entertainment Type",
        type: "select",
        options: ["DJ", "Live Band", "Classical Instrumentalists", "Acoustic Soloist"]
      }
    ])
  },
  {
    key: "rituals",
    name: "Rituals",
    followUpQuestions: JSON.stringify([])
  },
  {
    key: "other",
    name: "Other",
    followUpQuestions: JSON.stringify([])
  }
];
