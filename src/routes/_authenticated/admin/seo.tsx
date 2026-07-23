import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/seo")({
  component: Page,
});

function Page() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold capitalize">seo</h1>
      <Card>
        <CardHeader>
          <CardTitle>Em breve</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Esta seção faz parte da Fase 2/3 do painel administrativo e será
          habilitada em breve.
        </CardContent>
      </Card>
    </div>
  );
}
