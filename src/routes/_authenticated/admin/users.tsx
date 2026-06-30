import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { listAllUsers, setPlanOverride, banUser } from "@/lib/admin/admin.users.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: AdminUsers,
});

function AdminUsers() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const limit = 25;
  const list = useServerFn(listAllUsers);
  const setOverride = useServerFn(setPlanOverride);
  const ban = useServerFn(banUser);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", query, page],
    queryFn: () => list({ data: { limit, offset: page * limit, query: query || undefined } }),
  });

  const overrideMut = useMutation({
    mutationFn: (input: { email: string; plan: "free" | "starter" | "pro" | "premium" | null }) =>
      setOverride({ data: input }),
    onSuccess: () => {
      toast.success("Plano atualizado");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const banMut = useMutation({
    mutationFn: (input: { userId: string; ban: boolean }) => ban({ data: input }),
    onSuccess: () => {
      toast.success("Status atualizado");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Controle de usuários</h1>
        <p className="text-sm text-muted-foreground">
          {data ? `${data.totalCount} usuários no total` : "Carregando…"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input
            placeholder="Buscar por email, nome..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(0); }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Carregando…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground border-b">
                  <tr>
                    <th className="p-2">Usuário</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Criado</th>
                    <th className="p-2">Locations</th>
                    <th className="p-2">Plano (override)</th>
                    <th className="p-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.users.map((u) => (
                    <tr key={u.id} className="border-b last:border-0">
                      <td className="p-2 flex items-center gap-2">
                        {u.imageUrl && <img src={u.imageUrl} className="h-6 w-6 rounded-full" alt="" />}
                        <span>{[u.firstName, u.lastName].filter(Boolean).join(" ") || "—"}</span>
                        {u.banned && <Badge variant="destructive">Banido</Badge>}
                      </td>
                      <td className="p-2">{u.email}</td>
                      <td className="p-2">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="p-2">{u.locationCount}</td>
                      <td className="p-2">
                        <Select
                          value={u.planOverride ?? "_none"}
                          onValueChange={(v) =>
                            u.email && overrideMut.mutate({
                              email: u.email,
                              plan: v === "_none" ? null : (v as "free" | "starter" | "pro" | "premium"),
                            })
                          }
                        >
                          <SelectTrigger className="h-8 w-32"><SelectValue placeholder="—" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_none">Nenhum</SelectItem>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="starter">Starter</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <Button
                          size="sm"
                          variant={u.banned ? "outline" : "destructive"}
                          onClick={() => banMut.mutate({ userId: u.id, ban: !u.banned })}
                        >
                          {u.banned ? "Reativar" : "Banir"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-between items-center mt-4">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              Anterior
            </Button>
            <span className="text-xs text-muted-foreground">Página {page + 1}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={!data || (page + 1) * limit >= (data.totalCount ?? 0)}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}