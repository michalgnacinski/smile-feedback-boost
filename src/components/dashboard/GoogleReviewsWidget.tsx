import { useEffect, useState } from "react";
import { Star, MessageSquare, ExternalLink, Award, User, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Review {
  authorName: string;
  authorPhoto?: string;
  rating: number;
  text: string;
  relativeTime: string;
  publishTime?: string | number | null;
}

interface Props {
  slug: string;
  googleReviewLink?: string | null;
}

export function GoogleReviewsWidget({ slug, googleReviewLink }: Props) {
  const [data, setData] = useState<{
    hasPlaceId: boolean;
    rating: number;
    totalReviews: number;
    reviews: Review[];
  }>({
    hasPlaceId: false,
    rating: 5.0,
    totalReviews: 0,
    reviews: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/restaurant/${slug}/google-reviews`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData && typeof resData === "object") {
          setData({
            hasPlaceId: Boolean(resData.hasPlaceId),
            rating: typeof resData.rating === "number" ? resData.rating : 5.0,
            totalReviews: typeof resData.totalReviews === "number" ? resData.totalReviews : 0,
            reviews: Array.isArray(resData.reviews) ? resData.reviews : [],
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Błąd ładowania opinii:", err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="py-6 text-center text-xs text-muted-foreground animate-pulse">
          Ładowanie statystyk wizytówki Google...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. KAFELKI PODSUMOWANIA WIZYTÓWKI GOOGLE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Średnia ocena w Google</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-white">
                  {data.rating > 0 ? data.rating.toFixed(1) : "5.0"}
                </span>
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-3.5 ${
                        i < Math.round(data.rating || 5) ? "fill-amber-400" : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="size-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Award className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Wszystkie opinie Google</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-white">{data.totalReviews}</span>
                <span className="text-xs text-muted-foreground">recenzji</span>
              </div>
            </div>
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <MessageSquare className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. LISTA OSTATNICH OPINII GOOGLE */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="size-4 text-amber-400" />
              Ostatnie recenzje z Google
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Opinie pobierane na żywo z profilu Google Maps
            </p>
          </div>
          {googleReviewLink && (
            <Button variant="ghost" size="sm" asChild className="text-xs gap-1.5">
              <a href={googleReviewLink} target="_blank" rel="noreferrer">
                Zobacz profil <ExternalLink className="size-3" />
              </a>
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {data.reviews.length > 0 ? (
            data.reviews.map((rev, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-background/50 border border-border/60 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="size-7 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0">
                      {rev.authorName ? rev.authorName.charAt(0).toUpperCase() : <User className="size-3.5" />}
                    </div>
                    <span className="font-semibold text-foreground text-xs sm:text-sm">
                      {rev.authorName}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">{rev.relativeTime}</span>
                </div>

                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-3 ${
                        i < rev.rating ? "fill-amber-400" : "text-muted-foreground/20"
                      }`}
                    />
                  ))}
                </div>

                {rev.text && (
                  <p className="text-muted-foreground leading-relaxed italic">
                    "{rev.text}"
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="py-4 text-center space-y-1">
              <p className="text-xs font-medium text-foreground">Brak nowych opinii tekstowych do wyświetlenia</p>
              <p className="text-[11px] text-muted-foreground">
                Gdy goście zaczną wystawiać oceny przez kody QR, pojawią się one w tym miejscu.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}