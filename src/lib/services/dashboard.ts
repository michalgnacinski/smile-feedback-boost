// 💡 Ustaw na 'false', aby pobierać żywe dane z bazy NeonDB!
export const DEMO_MODE = false;

export async function getRestaurantDashboardData(params?: { data?: string }) {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("dajopinie_token") : null;
    const slug = params?.data;
    
    // Budujemy relatywny URL do Vercel Serverless API
    const url = slug ? `/api/dashboard?slug=${encodeURIComponent(slug)}` : "/api/dashboard";

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Błąd serwera: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Błąd pobierania danych dashboardu:", error);
    throw error;
  }
}