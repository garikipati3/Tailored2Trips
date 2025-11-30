const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed cost categories
  const costCategories = [
    { code: 'FLIGHT', label: 'Flights' },
    { code: 'HOTEL', label: 'Accommodation' },
    { code: 'FOOD', label: 'Food & Dining' },
    { code: 'TRANSPORT', label: 'Local Transportation' },
    { code: 'ACTIVITY', label: 'Activities & Tours' },
    { code: 'SHOPPING', label: 'Shopping' },
    { code: 'MISC', label: 'Miscellaneous' }
  ];

  for (const category of costCategories) {
    await prisma.costCategory.upsert({
      where: { code: category.code },
      update: {},
      create: category
    });
  }

  // Seed some badges
  const badges = [
    {
      code: 'FIRST_TRIP',
      name: 'First Trip',
      description: 'Created your first trip',
      iconUrl: null
    },
    {
      code: 'EXPLORER',
      name: 'Explorer',
      description: 'Visited 5 different countries',
      iconUrl: null
    },
    {
      code: 'PLANNER',
      name: 'Master Planner',
      description: 'Created a detailed itinerary with 10+ items',
      iconUrl: null
    }
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { code: badge.code },
      update: {},
      create: badge
    });
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });