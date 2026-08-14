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

  const token = localStorage.getItem("dajopinie_token");
  const url = data ? `/api/dashboard?slug=${encodeURIComponent(data)}` : "/api/dashboard";
  const res = await fetch(url, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  if (!res.ok) throw new Error("Błąd pobierania dashboardu");
  return res.json();
}