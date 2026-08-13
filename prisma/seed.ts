import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Rozpoczynam zasilanie bazy NeonDB danymi testowymi...');

  // 1. Usunięcie starych danych
  await prisma.analytics_events.deleteMany();
  await prisma.qr_codes.deleteMany();
  await prisma.restaurants.deleteMany();
  await prisma.users.deleteMany();

  const now = new Date();
  const trialEnds = new Date(now);
  trialEnds.setDate(now.getDate() + 9);

  // 2. Stworzenie konta demonstracyjnego właściciela w tabeli `users`
  const passwordHash = await bcrypt.hash('haslo123', 10);
  const demoUser = await prisma.users.create({
    data: {
      email: 'wlasciciel@latorre.pl',
      password_hash: passwordHash,
    },
  });

  console.log(`✅ Stworzono użytkownika: ${demoUser.email} (ID: ${demoUser.id})`);

  // 3. Stworzenie restauracji powiązanej z prawidlowym UUID użytkownika
  const restaurant = await prisma.restaurants.create({
    data: {
      user_id: demoUser.id, // 👈 Prawidłowy UUID wygenerowany z bazy!
      name: 'Pizzeria La Torre',
      slug: 'pizzeria-la-torre',
      logo_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=200&fit=crop&crop=faces',
      google_review_link: null, // Początkowo brak linku do opinii Google
      is_active: true,
      subscription_status: 'TRIAL',
      trial_started_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      trial_ends_at: trialEnds,
    },
  });

  console.log(`✅ Stworzono restaurację: ${restaurant.name} (ID: ${restaurant.id})`);

  // 4. Stworzenie kodów QR dla stolików
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

  // 5. Generowanie zdarzeń analitycznych z rozbiciem na ostatnie 14 dni
  for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
    const eventDate = new Date();
    eventDate.setDate(now.getDate() - dayOffset);

    const scansToday = Math.floor(Math.random() * 8) + 3;

    for (let s = 0; s < scansToday; s++) {
      const qrTarget = s % 2 === 0 ? qrStolik1.id : qrBar.id;

      await prisma.analytics_events.create({
        data: {
          qr_code_id: qrTarget,
          event_type: 'SCAN',
          user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
          created_at: eventDate,
        },
      });

      if (Math.random() > 0.4) {
        await prisma.analytics_events.create({
          data: {
            qr_code_id: qrTarget,
            event_type: 'CLICK',
            user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
            created_at: eventDate,
          },
        });
      }
    }
  }

  console.log('✅ Zasilono bazę statystykami analitycznymi z ostatnich 14 dni');
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