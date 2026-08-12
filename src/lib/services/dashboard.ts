export async function getRestaurantDashboardData({ data: slug }: { data: string }) {
  // Symulowane opóźnienie sieciowe (200ms) dla płynnego efektu ładowania
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Wracamy dane zgodne ze strukturą naszej bazy NeonDB
  return {
    restaurantName: "Pizzeria La Torre",
    googleReviewLink: "https://g.page/r/ExampleID/review",
    stats: {
      totalScans: 10,
      totalClicks: 6,
      conversionRate: "60.0%",
      estimatedReviews: 5,
    },
    chartData: [
      { date: "01.08", skany: 2 },
      { date: "02.08", skany: 1 },
      { date: "03.08", skany: 3 },
      { date: "04.08", skany: 0 },
      { date: "05.08", skany: 4 },
    ],
    tables: [
      {
        id: "1",
        label: "Stolik #01",
        codeIdentifier: "pizzeria-la-torre-stolik01",
        scans: 8,
        clicks: 5,
        conversion: "62.5%",
        url: "https://dajopinie.pl/r/pizzeria-la-torre-stolik01",
      },
      {
        id: "2",
        label: "Bar / Lada",
        codeIdentifier: "pizzeria-la-torre-bar",
        scans: 2,
        clicks: 1,
        conversion: "50.0%",
        url: "https://dajopinie.pl/r/pizzeria-la-torre-bar",
      },
    ],
  };
}