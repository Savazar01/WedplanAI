import { db } from "@/db/client";
import { weddings, tasks, rituals, guests, vendors, kanbanColumns, cateringMenus } from "@/db/schema";

export async function seedSampleWedding(userId: string): Promise<string> {
  const weddingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const weddingId = await db.transaction(async (tx) => {
    const [wedding] = await tx
      .insert(weddings)
      .values({
        userId,
        partnerA: "Rahul",
        partnerB: "Priya",
        tradition: "hindu",
        weddingDate,
        budget: 5000000,
        guestCount: 250,
        location: "Udaipur, Rajasthan",
        locationName: "The Grand Palace",
        street: "Lake Pichola Road",
        city: "Udaipur",
        state: "Rajasthan",
        country: "India",
        pincode: "313001",
        showcaseTitleFont: "Playfair Display",
        isSample: true,
        description:
          "🎉 Sample Wedding — Explore all features of WedPlanAI! This sample Hindu wedding includes tasks, rituals, guests with RSVPs, vendors, and budget tracking to help you understand the app.",
      })
      .returning({ id: weddings.id });

    const id = wedding.id;

    // Seed default planning board columns
    const [todoCol, inProgressCol, doneCol] = await tx.insert(kanbanColumns).values([
      {
        weddingId: id,
        name: "To-Do",
        type: "todo",
        color: "#6771ab",
        position: 0,
      },
      {
        weddingId: id,
        name: "In Progress",
        type: "in_progress",
        color: "#f59e0b",
        position: 1,
      },
      {
        weddingId: id,
        name: "Done",
        type: "done",
        color: "#22c55e",
        position: 2,
      },
    ]).returning();

    if (!todoCol || !inProgressCol || !doneCol) {
      throw new Error("Failed to insert default columns for sample wedding");
    }

    const todoColId = todoCol.id;
    const inProgressColId = inProgressCol.id;
    const doneColId = doneCol.id;

    const now = new Date();

    const location = "Udaipur, Rajasthan";

    const mehndiStart = new Date(weddingDate);
    mehndiStart.setDate(mehndiStart.getDate() - 2);
    mehndiStart.setHours(14, 0, 0, 0);
    const mehndiEnd = new Date(mehndiStart);
    mehndiEnd.setHours(18, 0, 0, 0);

    const haldiStart = new Date(weddingDate);
    haldiStart.setDate(haldiStart.getDate() - 1);
    haldiStart.setHours(10, 0, 0, 0);
    const haldiEnd = new Date(haldiStart);
    haldiEnd.setHours(13, 0, 0, 0);

    const sangeetStart = new Date(weddingDate);
    sangeetStart.setDate(sangeetStart.getDate() - 1);
    sangeetStart.setHours(18, 0, 0, 0);
    const sangeetEnd = new Date(sangeetStart);
    sangeetEnd.setHours(22, 0, 0, 0);

    const pherasStart = new Date(weddingDate);
    pherasStart.setHours(10, 0, 0, 0);
    const pherasEnd = new Date(pherasStart);
    pherasEnd.setHours(14, 0, 0, 0);

    const receptionStart = new Date(weddingDate);
    receptionStart.setHours(19, 0, 0, 0);
    const receptionEnd = new Date(receptionStart);
    receptionEnd.setHours(23, 0, 0, 0);

    const [mehndi, haldi, sangeet, pheras, reception] = await tx.insert(rituals).values([
      {
        weddingId: id,
        name: "Mehndi",
        description: "Traditional henna ceremony with family and friends",
        startTime: mehndiStart,
        endTime: mehndiEnd,
        location,
        isCustom: false,
      },
      {
        weddingId: id,
        name: "Haldi",
        description: "Traditional turmeric cleansing ceremony",
        startTime: haldiStart,
        endTime: haldiEnd,
        location,
        isCustom: false,
      },
      {
        weddingId: id,
        name: "Sangeet",
        description: "Musical celebration with dance performances",
        startTime: sangeetStart,
        endTime: sangeetEnd,
        location,
        isCustom: false,
      },
      {
        weddingId: id,
        name: "Mandap Pheras",
        description: "Main Vedic wedding ceremony around the holy fire",
        startTime: pherasStart,
        endTime: pherasEnd,
        location,
        isCustom: false,
        isFoodServed: true,
      },
      {
        weddingId: id,
        name: "Reception",
        description: "Grand wedding dinner reception",
        startTime: receptionStart,
        endTime: receptionEnd,
        location,
        isCustom: false,
        isFoodServed: true,
      },
    ]).returning();

    // Insert catering menu
    const [sampleMenu] = await tx.insert(cateringMenus).values({
      weddingId: id,
      ceremonyId: reception.id,
      cuisine: "North Indian Royal Buffet",
      guestCount: 250,
      appetizers: "Paneer Tikka, Hara Bhara Kebab, Chicken Tikka",
      mainCourses: "Butter Chicken, Dal Makhani, Paneer Butter Masala, Assorted Naans, Biryani",
      desserts: "Gulab Jamun with Vanilla Ice Cream, Moong Dal Halwa",
      drinks: "Virgin Mojitos, Masala Cola, Mineral Water",
      notes: "10% purely vegan options required. Jain counter to be set up separately.",
    }).returning();

    await tx.insert(tasks).values([
      {
        weddingId: id,
        columnId: todoColId,
        title: "Book Mehndi Artist",
        status: "todo",
        category: "ceremonies",
        isCustom: false,
        position: 0,
        dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      },
      {
        weddingId: id,
        columnId: inProgressColId,
        title: "Buy Wedding Lehenga & Sherwani",
        status: "in_progress",
        category: "apparel",
        isCustom: false,
        position: 1,
        dueDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
      },
      {
        weddingId: id,
        columnId: todoColId,
        title: "Hire Dhol Players & DJ",
        status: "todo",
        category: "music",
        isCustom: false,
        position: 2,
        dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      },
      {
        weddingId: id,
        columnId: todoColId,
        title: "Select Mandap Decorator",
        status: "todo",
        category: "decor",
        isCustom: false,
        position: 3,
        dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        weddingId: id,
        columnId: doneColId,
        title: "Finalize Guest List",
        status: "done",
        category: "invitations",
        isCustom: false,
        position: 4,
        dueDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        weddingId: id,
        columnId: doneColId,
        title: "Order Wedding Invitations",
        status: "done",
        category: "invitations",
        isCustom: false,
        position: 5,
        dueDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        weddingId: id,
        columnId: inProgressColId,
        title: "Book Photographer & Videographer",
        status: "in_progress",
        category: "other",
        isCustom: false,
        position: 6,
        dueDate: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
      },
      {
        weddingId: id,
        columnId: todoColId,
        title: "Arrange Catering Menu Tasting",
        status: "todo",
        category: "catering",
        isCustom: false,
        position: 7,
        dueDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
        cateringMenuId: sampleMenu.id,
      },
      {
        weddingId: id,
        columnId: todoColId,
        title: "Confirm Honeymoon Booking",
        status: "backlog",
        category: "other",
        isCustom: false,
        position: 8,
        dueDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
      },
      {
        weddingId: id,
        columnId: inProgressColId,
        title: "Wedding Dress Final Fitting",
        status: "in_progress",
        category: "apparel",
        isCustom: false,
        position: 9,
        dueDate: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000),
      },
    ]);

    await tx.insert(guests).values([
      {
        weddingId: id,
        name: "Amit Sharma",
        email: "amit@example.com",
        phone: "9876543210",
        rsvpStatus: "attending",
        plusOneCount: 1,
        dietaryRestrictions: "Vegetarian",
      },
      {
        weddingId: id,
        name: "Neha Patel",
        email: "neha@example.com",
        phone: "9876543211",
        rsvpStatus: "attending",
        plusOneCount: 0,
        dietaryRestrictions: null,
      },
      {
        weddingId: id,
        name: "Vikram Singh",
        email: "vikram@example.com",
        phone: "9876543212",
        rsvpStatus: "declined",
        plusOneCount: 0,
        dietaryRestrictions: null,
      },
      {
        weddingId: id,
        name: "Ananya Gupta",
        email: "ananya@example.com",
        phone: "9876543213",
        rsvpStatus: "pending",
        plusOneCount: 1,
        dietaryRestrictions: "No dairy",
      },
      {
        weddingId: id,
        name: "Rajesh Kumar",
        email: "rajesh@example.com",
        phone: "9876543214",
        rsvpStatus: "attending",
        plusOneCount: 2,
        dietaryRestrictions: null,
      },
      {
        weddingId: id,
        name: "Priya Mehta",
        email: "priya.m@example.com",
        phone: "9876543215",
        rsvpStatus: "pending",
        plusOneCount: 0,
        dietaryRestrictions: "Vegetarian",
      },
      {
        weddingId: id,
        name: "Suresh Reddy",
        email: "suresh@example.com",
        phone: "9876543216",
        rsvpStatus: "attending",
        plusOneCount: 1,
        dietaryRestrictions: null,
      },
      {
        weddingId: id,
        name: "Deepa Iyer",
        email: "deepa@example.com",
        phone: "9876543217",
        rsvpStatus: "declined",
        plusOneCount: 0,
        dietaryRestrictions: "Gluten free",
      },
    ]);

    await tx.insert(vendors).values([
      {
        weddingId: id,
        name: "Royal Caterers",
        category: "catering",
        contactPerson: "Mr. Sharma",
        phone: "9876500001",
        email: "royal@catering.com",
        totalCost: 800000,
        paidAmount: 300000,
        paymentStatus: "partially_paid",
        notes: "North Indian, South Indian, and Chinese cuisine",
      },
      {
        weddingId: id,
        name: "Lens & Light Photography",
        category: "photography",
        contactPerson: "Vikram Joshi",
        phone: "9876500002",
        email: "vikram@lenslight.com",
        totalCost: 150000,
        paidAmount: 150000,
        paymentStatus: "paid",
        notes: "Wedding package includes 2 photographers",
      },
      {
        weddingId: id,
        name: "FloraDeco Studio",
        category: "decoration",
        contactPerson: "Meera Kapoor",
        phone: "9876500003",
        email: "meera@floradeco.com",
        totalCost: 400000,
        paidAmount: 100000,
        paymentStatus: "partially_paid",
        notes: "Mandap and stage decoration",
      },
      {
        weddingId: id,
        name: "Melody Makers DJ",
        category: "music",
        contactPerson: "Arun Verma",
        phone: "9876500004",
        email: "arun@melodymakers.com",
        totalCost: 75000,
        paidAmount: 0,
        paymentStatus: "unpaid",
        notes: "DJ setup for Sangeet and Reception",
      },
      {
        weddingId: id,
        name: "Elegant Couture",
        category: "apparel",
        contactPerson: "Mrs. Patel",
        phone: "9876500005",
        email: "patel@elegant.com",
        totalCost: 250000,
        paidAmount: 250000,
        paymentStatus: "paid",
        notes:
          "Bridal Lehenga, Groom Sherwani, and family outfits",
      },
    ]);

    return id;
  });

  return weddingId;
}
