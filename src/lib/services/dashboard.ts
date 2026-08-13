// 💡 Ustaw na 'false', aby pobierać żywe dane z bazy NeonDB!
export const DEMO_MODE = false;

export async function getRestaurantDashboardData({ data: slug }: { data: string }) {
  if (DEMO_MODE) {
    return {
      restaurantName: "Pizzeria La Torre (Tryb DEMO)",
      googleReviewLink: "https://g.page/r/ExampleID/review",
      subscription: {
        status: "TRIAL",
        trialDaysLeft: 9,
        trialEndsAt: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      },
      stats: {
        totalScans: 248,
        totalClicks: 164,
        conversionRate: "66.1%",
        estimatedReviews: 28,
      },
      chartData: [
        { date: "01.08", skany: 12 },
        { date: "02.08", skany: 22 },
      ],
      tables: [],
    };
  }

  const response = await fetch(`/api/dashboard/${slug}`);
  if (!response.ok) {
    throw new Error("Błąd pobierania danych z API NeonDB");
  }
  return await response.json();
}