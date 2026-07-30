import { useEffect, useRef, useState } from "react";
import { Download, ExternalLink } from "lucide-react";

interface Props {
  locationName: string;
  city: string;
  googleReviewUrl?: string | null;
}

function buildGoogleReviewUrl(name: string, city: string): string {
  const query = encodeURIComponent(`${name} ${city}`);
  return `https://search.google.com/local/writereview?query=${query}`;
}

export function QRCodeCard({ locationName, city, googleReviewUrl }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [url, setUrl] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const reviewUrl =
      googleReviewUrl || buildGoogleReviewUrl(locationName, city);
    setUrl(reviewUrl);

    import("qrcode").then((QRCode) => {
      if (!canvasRef.current) return;
      QRCode.toCanvas(canvasRef.current, reviewUrl, {
        width: 180,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      }).catch(() => setError(true));
    });
  }, [locationName, city, googleReviewUrl]);

  function handleDownload() {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `qr-${locationName.toLowerCase().replace(/\s+/g, "-")}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col items-center gap-4">
      <div className="text-center">
        <div className="font-display text-sm font-semibold text-foreground leading-snug">
          {locationName}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">{city}</div>
      </div>

      <div className="rounded-lg border border-border bg-white p-2 shadow-sm">
        {error ? (
          <div className="h-[180px] w-[180px] flex items-center justify-center text-xs text-muted-foreground">
            Erro ao gerar QR
          </div>
        ) : (
          <canvas ref={canvasRef} className="block" />
        )}
      </div>

      <p className="text-[11px] text-center text-muted-foreground px-2">
        Peça ao cliente escanear para deixar uma avaliação no Google
      </p>

      <div className="flex gap-2 w-full">
        <button
          onClick={handleDownload}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground"
        >
          <Download className="h-3 w-3" /> Download PNG
        </button>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground"
        >
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
