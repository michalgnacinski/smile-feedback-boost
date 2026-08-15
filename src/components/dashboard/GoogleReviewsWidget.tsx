import { useEffect, useState } from "react";
import { Star, MessageSquare, ExternalLink, Award, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/restaurant/${slug}/google-reviews`)
    .then((res) => res.json())
    .then((resData) => {
        if (resData.reviews && Array.isArray(resData.reviews)) {
        resData.reviews.sort((a: Review, b: Review) => {
            const timeA = a.publishTime ? new Date(a.publishTime).getTime() : 0;
            const timeB = b.publishTime ? new Date(b.publishTime).getTime() : 0;
            return timeB - timeA;
        });
        }
        setData(resData);
        setLoading(false);
  })
  .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="py-6 text-center text-xs text-muted-foreground animate-pulse">
          Pobieranie aktualnych opinii z Google Maps...
        </CardContent>
      </Card>
    );
  }

  if (!data?.hasPlaceId) {
    return null; // Jeśli nie ma skonfigurowanego linku, nie wyświetlamy pustej karty
  }

  return (
    <div className="space-y-4">
      {/* KAFELKI PODSUMOWANIA GOOGLE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Średnia ocena w Google</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black">{data.rating.toFixed(1)}</span>
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-3.5 ${
                        i < Math.round(data.rating) ? "fill-amber-400" : "text-muted-foreground/30"
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
                <span className="text-2xl font-black">{data.totalReviews}</span>
                <span className="text-xs text-muted-foreground">recenzji</span>
              </div>
            </div>
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <MessageSquare className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* LISTA OSTATNICH OPINII */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-sm font-bold">Ostatnie recenzje z Google</CardTitle>
            <p className="text-xs text-muted-foreground">Opinie pobierane na żywo z Twojej wizytówki</p>
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
                        {/* Elegancki avatar z pierwszą literą lub ikoną */}
                        <div className="size-7 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0">
                        {rev.authorName ? rev.authorName.charAt(0).toUpperCase() : <User className="size-3.5" />}
                        </div>
                        <span className="font-semibold text-foreground text-xs sm:text-sm">{rev.authorName}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">{rev.relativeTime}</span>
                </div>

                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-3 ${i < rev.rating ? "fill-amber-400" : "text-muted-foreground/20"}`}
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
            <p className="text-xs text-muted-foreground py-2 text-center">
              Brak nowych opinii tekstowych do wyświetlenia.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}