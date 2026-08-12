import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Rozpoczynam zasilanie bazy danymi testowymi...');

  // 1. Usunięcie starych danych
  await prisma.analytics_events.deleteMany();
  await prisma.qr_codes.deleteMany();
  await prisma.restaurants.deleteMany();

  // 2. Stworzenie pierwszej restauracji
  const restaurant = await prisma.restaurants.create({
    data: {
      user_id: 'user_demo_123',
      name: 'Pizzeria La Torre',
      slug: 'pizzeria-la-torre',
      google_review_link: 'https://g.page/r/ExampleID/review',
      is_active: true,
    },
  });

  console.log(`✅ Stworzono restaurację: ${restaurant.name} (ID: ${restaurant.id})`);

  // 3. Stworzenie kodów QR dla stolików
  const qrStolik1 = await prisma.qr_codes.create({
    data: {
      restaurant_id: restaurant.id,
      label: 'Stolik #01',
      code_identifier: 'pizzeria-la-torre-stolik01',
    },
  });

  const qrBar = await prisma.qr_codes.create({
    data: {
      restaurant_id: restaurant.id,
      label: 'Bar / Lada',
      code_identifier: 'pizzeria-la-torre-bar',
    },
  });

  console.log('✅ Stworzono kody QR dla stolików');

  // 4. Stworzenie zdarzeń analitycznych
  const now = new Date();
  for (let i = 0; i < 10; i++) {
    const eventDate = new Date(now);
    eventDate.setDate(now.getDate() - Math.floor(i / 2));

    await prisma.analytics_events.create({
      data: {
        qr_code_id: qrStolik1.id,
        event_type: 'SCAN',
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
        created_at: eventDate,
      },
    });

    if (i % 2 === 0) {
      await prisma.analytics_events.create({
        data: {
          qr_code_id: qrStolik1.id,
          event_type: 'CLICK',
          user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
          created_at: eventDate,
        },
      });
    }
  }

  console.log('✅ Zasilono bazę statystykami analitycznymi');
  console.log('🎉 Seedowanie zakończone sukcesem!');
}

main()
  .catch((e) => {
    console.error('❌ Błąd podczas seedowania:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });