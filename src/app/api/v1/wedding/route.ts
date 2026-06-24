import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { weddings, kanbanColumns, ceremonies, tasks, cateringMenus, weddingTraditions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import {
  validateApiKey,
  unauthorizedResponse,
  notFoundResponse,
  errorResponse,
} from '../auth-helper';

export async function GET(request: NextRequest) {
  try {
    const auth = await validateApiKey(request);
    if (!auth) return unauthorizedResponse();

    const [wedding] = await db
      .select()
      .from(weddings)
      .where(eq(weddings.id, auth.weddingId))
      .limit(1);

    if (!wedding) return notFoundResponse('Wedding');

    return Response.json(wedding);
  } catch (error) {
    console.error('[GET /api/v1/wedding]', error);
    return errorResponse('Failed to fetch wedding details.');
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await validateApiKey(request);
    if (!auth) return unauthorizedResponse();

    const body = await request.json();

    const allowedFields = [
      'partnerA',
      'partnerB',
      'weddingDate',
      'tradition',
      'location',
      'locationName',
      'street',
      'city',
      'state',
      'country',
      'pincode',
      'budget',
      'guestCount',
      'description',
      'themeFont',
      'themePrimary',
      'themeSecondary',
      'themeBackground',
      'themeDarkPrimary',
      'themeDarkSecondary',
      'themeDarkBackground',
      'logoUrl',
      'logoData',
      'showcaseFont',
      'showcaseTitleFont',
      'showcasePrimary',
      'showcaseSecondary',
      'showcaseBackground',
      'showcaseHeroUrl',
      'showcaseHeroData',
      'showcaseWelcomeText',
      'showcaseDetails',
      'showcaseSubtitle',
      'showcaseTitle',
      'showcaseDescription',
      'showcaseRsvpTitle',
      'showcaseRsvpDescription',
      'showcaseGiftUrl',
      'showcaseGiftTitle',
      'showcaseGiftDescription',
    ] as const;

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        if (field === 'weddingDate') {
          updates[field] = body[field] ? new Date(body[field]) : null;
        } else {
          updates[field] = body[field];
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse('No valid fields provided for update.', 400);
    }

    const [updated] = await db
      .update(weddings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(weddings.id, auth.weddingId))
      .returning();

    if (!updated) return notFoundResponse('Wedding');

    return Response.json(updated);
  } catch (error) {
    console.error('[PUT /api/v1/wedding]', error);
    return errorResponse('Failed to update wedding details.');
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await validateApiKey(request);
    if (!auth) return unauthorizedResponse();

    const sourceWedding = await db
      .select()
      .from(weddings)
      .where(eq(weddings.id, auth.weddingId))
      .limit(1);
    if (!sourceWedding[0]) return notFoundResponse('Source wedding');

    const body = await request.json();
    const {
      partnerA,
      partnerB,
      tradition,
      weddingDate,
      budget,
      guestCount,
      location,
      locationName,
      street,
      city,
      state,
      country,
      pincode,
      description,
    } = body;

    if (!partnerA || typeof partnerA !== 'string') return errorResponse('partnerA is required.', 400);
    if (!partnerB || typeof partnerB !== 'string') return errorResponse('partnerB is required.', 400);
    if (!tradition || typeof tradition !== 'string') return errorResponse('tradition is required.', 400);
    if (!weddingDate) return errorResponse('weddingDate is required.', 400);
    if (!location || typeof location !== 'string') return errorResponse('location is required.', 400);

    let newlyCreatedWeddingId: string | null = null;

    await db.transaction(async (tx) => {
      const [insertedWedding] = await tx.insert(weddings).values({
        userId: sourceWedding[0].userId,
        partnerA,
        partnerB,
        tradition,
        weddingDate: new Date(weddingDate),
        budget: budget ?? 1000000,
        guestCount: guestCount ?? 150,
        location,
        locationName: locationName ?? null,
        street: street ?? null,
        city: city ?? null,
        state: state ?? null,
        country: country ?? 'India',
        pincode: pincode ?? null,
        description: description ?? null,
      }).returning();

      if (!insertedWedding) throw new Error('Failed to insert wedding');
      newlyCreatedWeddingId = insertedWedding.id;
      const weddingId = insertedWedding.id;

      const [todoCol] = await tx.insert(kanbanColumns).values([
        { weddingId, name: 'To-Do', type: 'todo', color: '#6771ab', position: 0 },
        { weddingId, name: 'In Progress', type: 'in_progress', color: '#f59e0b', position: 1 },
        { weddingId, name: 'Done', type: 'done', color: '#22c55e', position: 2 },
      ]).returning();
      if (!todoCol) throw new Error('Failed to insert default columns');
      const todoColumnId = todoCol.id;

      let seedRituals: {
        name: string; description?: string; offsetDays?: number;
        startHour?: number; startMin?: number; endHour?: number; endMin?: number;
        location?: string; startTime?: string | null; endTime?: string | null;
        isFoodServed?: boolean;
      }[] = [];

      let seedTasks: { title: string; category: string; ceremonyName?: string | null }[] = [];

      const [dbTradition] = await tx
        .select()
        .from(weddingTraditions)
        .where(eq(weddingTraditions.key, tradition))
        .limit(1);

      if (dbTradition && dbTradition.seedCeremonies) {
        try { seedRituals = JSON.parse(dbTradition.seedCeremonies); } catch { /* ignore */ }
      }
      if (dbTradition && dbTradition.seedTasks) {
        try { seedTasks = JSON.parse(dbTradition.seedTasks); } catch { /* ignore */ }
      }

      if (seedRituals.length === 0) {
        const defaultSets: Record<string, typeof seedRituals> = {
          hindu: [
            { name: 'Mehndi', description: 'Traditional henna pre-wedding celebration', offsetDays: -2, startHour: 14, startMin: 0, endHour: 18, endMin: 0 },
            { name: 'Haldi', description: 'Traditional cleansing ceremony', offsetDays: -1, startHour: 10, startMin: 0, endHour: 13, endMin: 0 },
            { name: 'Sangeet', description: 'Musical celebration night', offsetDays: -1, startHour: 18, startMin: 0, endHour: 22, endMin: 0 },
            { name: 'Mandap Pheras', description: 'Main Vedic wedding ceremony rituals around the holy fire', offsetDays: 0, startHour: 10, startMin: 0, endHour: 14, endMin: 0, isFoodServed: true },
            { name: 'Reception', description: 'Grand wedding dinner reception', offsetDays: 0, startHour: 19, startMin: 0, endHour: 23, endMin: 0, isFoodServed: true },
          ],
          muslim: [
            { name: 'Manjha', description: 'Traditional pre-wedding ceremonies', offsetDays: -2, startHour: 16, startMin: 0, endHour: 20, endMin: 0 },
            { name: 'Nikah', description: 'Official marriage contract ceremony', offsetDays: 0, startHour: 11, startMin: 0, endHour: 13, endMin: 0, isFoodServed: true },
            { name: 'Valima', description: 'Post-wedding grand feast reception', offsetDays: 1, startHour: 19, startMin: 0, endHour: 23, endMin: 0, isFoodServed: true },
          ],
          sikh: [
            { name: 'Maiya', description: 'Traditional pre-wedding cleansing ceremonies', offsetDays: -1, startHour: 10, startMin: 0, endHour: 13, endMin: 0 },
            { name: 'Anand Karaj', description: 'Holy wedding ceremony at the Gurdwara', offsetDays: 0, startHour: 9, startMin: 0, endHour: 13, endMin: 0, isFoodServed: true },
            { name: 'Reception', description: 'Post-wedding dinner party celebration', offsetDays: 0, startHour: 18, startMin: 0, endHour: 23, endMin: 0, isFoodServed: true },
          ],
          christian: [
            { name: 'Rehearsal Dinner', description: 'Formal dinner with family and bridal party', offsetDays: -1, startHour: 18, startMin: 0, endHour: 21, endMin: 0, isFoodServed: true },
            { name: 'Church Ceremony', description: 'Marriage ceremony in the church', offsetDays: 0, startHour: 14, startMin: 0, endHour: 16, endMin: 0 },
            { name: 'Reception', description: 'Evening reception celebration with cake and dancing', offsetDays: 0, startHour: 18, startMin: 0, endHour: 23, endMin: 0, isFoodServed: true },
          ],
          secular: [
            { name: 'Toast', description: 'Ice-breaker drinks with incoming guests', offsetDays: -1, startHour: 18, startMin: 0, endHour: 20, endMin: 0, isFoodServed: true },
            { name: 'Vows', description: 'Ceremonial reading of wedding vows', offsetDays: 0, startHour: 16, startMin: 0, endHour: 17, endMin: 30 },
            { name: 'Reception', description: 'Dinner, toast, and dancing', offsetDays: 0, startHour: 18, startMin: 0, endHour: 23, endMin: 30, isFoodServed: true },
          ],
        };
        seedRituals = defaultSets[tradition] || [];
      }

      if (seedTasks.length === 0) {
        const defaultTaskSets: Record<string, typeof seedTasks> = {
          hindu: [
            { title: 'Book Mehndi Artist', category: 'ceremonies', ceremonyName: 'Mehndi' },
            { title: 'Buy Wedding Lehenga & Sherwani', category: 'apparel', ceremonyName: 'Mandap Pheras' },
            { title: 'Hire Dhol Players & DJ', category: 'music', ceremonyName: 'Sangeet' },
            { title: 'Arrange Catering & Sweets (Mithai)', category: 'catering', ceremonyName: 'Reception' },
            { title: 'Select Mandap Decorator', category: 'decor', ceremonyName: 'Mandap Pheras' },
          ],
          muslim: [
            { title: 'Coordinate with Qazi & Print Nikah Nama', category: 'ceremonies', ceremonyName: 'Nikah' },
            { title: 'Purchase Wedding Attire (Sherwani/Gharara)', category: 'apparel', ceremonyName: 'Nikah' },
            { title: 'Select Stage & Floral Decorator', category: 'decor', ceremonyName: 'Valima' },
            { title: 'Book Catering Menu for Valima Feast', category: 'catering', ceremonyName: 'Valima' },
          ],
          sikh: [
            { title: 'Book Gurdwara & Coordinate with Ragis', category: 'venue', ceremonyName: 'Anand Karaj' },
            { title: 'Purchase Rumalla Sahib for Guru Granth Sahib', category: 'ceremonies', ceremonyName: 'Anand Karaj' },
            { title: 'Finalize Langar or Catering Menu', category: 'catering', ceremonyName: 'Anand Karaj' },
            { title: 'Buy Anand Karaj Bridal/Groom Suit', category: 'apparel', ceremonyName: 'Anand Karaj' },
          ],
          christian: [
            { title: 'Secure Church Venue & Priest', category: 'venue', ceremonyName: 'Church Ceremony' },
            { title: 'Purchase Wedding Dress & Tuxedo', category: 'apparel', ceremonyName: 'Church Ceremony' },
            { title: 'Order Wedding Cake & Floral Bouquets', category: 'catering', ceremonyName: 'Reception' },
            { title: 'Hire Wedding Choir & Organist', category: 'music', ceremonyName: 'Church Ceremony' },
          ],
          secular: [
            { title: 'Select Secular Celebrant', category: 'ceremonies', ceremonyName: 'Vows' },
            { title: 'Write Wedding Vows', category: 'other', ceremonyName: 'Vows' },
            { title: 'Arrange Catering & Open Bar', category: 'catering', ceremonyName: 'Reception' },
            { title: 'Coordinate Photographer/Videographer Contracts', category: 'other', ceremonyName: 'Reception' },
          ],
        };
        seedTasks = defaultTaskSets[tradition] || seedTasks;
      }

      const weddingDateObj = new Date(weddingDate);
      let insertedRituals: { id: string; name: string; isFoodServed: boolean }[] = [];

      if (seedRituals.length > 0) {
        const ritualsToInsert = seedRituals.map((r) => {
          let startTime: Date;
          let endTime: Date;
          if (r.startTime && r.endTime) {
            startTime = new Date(r.startTime);
            endTime = new Date(r.endTime);
          } else {
            const baseDate = new Date(weddingDateObj);
            baseDate.setDate(baseDate.getDate() + (r.offsetDays ?? 0));
            startTime = new Date(baseDate);
            startTime.setHours(r.startHour ?? 9, r.startMin ?? 0, 0, 0);
            endTime = new Date(baseDate);
            endTime.setHours(r.endHour ?? 17, r.endMin ?? 0, 0, 0);
          }
          const hasFood = typeof r.isFoodServed === 'boolean'
            ? r.isFoodServed
            : /reception|valima|pheras|feast/i.test(r.name);
          return {
            weddingId,
            name: r.name,
            description: r.description || '',
            startTime,
            endTime,
            location: r.location || location || '',
            isFoodServed: hasFood,
          };
        });
        insertedRituals = await tx.insert(ceremonies).values(ritualsToInsert).returning();

        for (const ritual of insertedRituals) {
          if (ritual.isFoodServed) {
            await tx.insert(cateringMenus).values({
              weddingId,
              ceremonyId: ritual.id,
              cuisine: 'Traditional Buffet',
              guestCount: guestCount ?? 150,
              appetizers: 'Assorted Starters',
              mainCourses: 'Signature Main Course Dishes, Breads, and Rice',
              desserts: 'Traditional Dessert Specialties',
              drinks: 'Juices, Mocktails, and Water',
              notes: 'Default seeded menu. Edit this to customize your menu.',
            });
          }
        }
      }

      if (seedTasks.length > 0) {
        const tasksToInsert = seedTasks.map((t, idx) => {
          let ceremonyId: string | null = null;
          if (t.ceremonyName) {
            const matched = insertedRituals.find(
              (r) => r.name.toLowerCase() === t.ceremonyName!.toLowerCase()
            );
            if (matched) ceremonyId = matched.id;
          }
          return {
            weddingId,
            columnId: todoColumnId,
            title: t.title,
            status: 'todo',
            category: t.category,
            position: idx,
            ceremonyId,
          };
        });
        await tx.insert(tasks).values(tasksToInsert);
      }
    });

    if (!newlyCreatedWeddingId) return errorResponse('Failed to create wedding.');

    const [createdWedding] = await db
      .select()
      .from(weddings)
      .where(eq(weddings.id, newlyCreatedWeddingId))
      .limit(1);

    return Response.json(createdWedding, { status: 201 });
  } catch (error) {
    console.error('[POST /api/v1/wedding]', error);
    return errorResponse('Failed to create wedding.');
  }
}
