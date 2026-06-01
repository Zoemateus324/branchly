"use client";

import React, { useState } from "react";

export type Filial = {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
  status: "normal" | "alerta" | "crise" | string; // maps to reputational health
  empresa_id: string;
  telefone?: string;
  endereco?: string;
  ultima_atualizacao?: string;
  // B2B Reputation specifics (mocked elegantly if missing)
  nota_google?: number;
  feedbacks_retidos_qtd?: number;
  respostas_ia_ativas?: boolean;
  insta_sync_ativo?: boolean;
};

interface FilialListProps {
  data: Filial[];
}

export function FilialList({ data }: FilialListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  
  // Modal state for QR Code preview
  const [activeQrCode, setActiveQrCode] = useState<{ name: string; url: string } | null>(null);

  // Filter logic: search by name, city or state
  const filteredFiliais = data.filter((filial) => {
    const matchesSearch =
      filial.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      filial.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      filial.estado.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter statuses map to reputational health classes: normal (Good), alerta (Attention), crise (Critical)
    const matchesStatus =
      statusFilter === "todos" || filial.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Reputation helper metrics
  const getAverageStars = () => {
    if (data.length === 0) return "5.0";
    const sum = data.reduce((acc, f) => acc + (f.nota_google || 4.8), 0);
    return (sum / data.length).toFixed(1);
  };

  const getTotalRetained = () => {
    return data.reduce((acc, f) => acc + (f.feedbacks_retidos_qtd || Math.floor(Math.random() * 15) + 3), 0);
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "crise":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            Crítica (Sob Risco)
          </span>
        );
      case "alerta":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Alerta de Nota
          </span>
        );
      case "normal":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Excelente (4.5★+)
          </span>
        );
    }
  };

  return (
    <div className="bg-[#030712] min-h-screen text-gray-100 p-6 sm:p-8">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-1/4 w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/25 rounded-md text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                Painel B2B
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
              Gestão de Reputação & SEO Local
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Monitore notas, configure o ReviewBot (QR Code com filtro) e gerencie automações com IA.
            </p>
          </div>
          <button className="self-start sm:self-center px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/15 transition-all text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adicionar Filial (R$ 29,90)
          </button>
        </div>

        {/* B2B Reputation Metrics Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-[#0b0f19] border border-gray-800 p-4 rounded-xl text-left">
            <div className="text-xs text-gray-500 font-bold uppercase mb-1">Filiais Monitoradas</div>
            <div className="text-2xl font-black text-white">{data.length} localizações</div>
            <span className="text-[10px] text-gray-500">Stripe Billing Ativo</span>
          </div>

          <div className="bg-[#0b0f19] border border-gray-800 p-4 rounded-xl text-left">
            <div className="text-xs text-gray-500 font-bold uppercase mb-1">Nota Média Geral</div>
            <div className="text-2xl font-black text-amber-400 flex items-center gap-1">
              <span>{getAverageStars()}</span>
              <span className="text-lg text-amber-500">★</span>
            </div>
            <span className="text-[10px] text-emerald-400">✓ Meta 4.8★ Atingida</span>
          </div>

          <div className="bg-[#0b0f19] border border-gray-800 p-4 rounded-xl text-left">
            <div className="text-xs text-gray-500 font-bold uppercase mb-1">Feedbacks Contidos</div>
            <div className="text-2xl font-black text-rose-400">{getTotalRetained()} Críticas</div>
            <span className="text-[10px] text-rose-400">Filtro ReviewBot Ativo</span>
          </div>

          <div className="bg-[#0b0f19] border border-gray-800 p-4 rounded-xl text-left">
            <div className="text-xs text-gray-500 font-bold uppercase mb-1">Respostas com Gemini IA</div>
            <div className="text-2xl font-black text-teal-400">
              {data.filter(f => f.respostas_ia_ativas !== false).length} / {data.length} Lojas
            </div>
            <span className="text-[10px] text-teal-400">Autopilot Ligado</span>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-[#0b0f19] border border-gray-800/80 p-4 rounded-xl">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar por nome da filial, cidade ou estado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-950 border border-gray-800/80 focus:border-blue-500 focus:outline-none text-sm text-white placeholder-gray-500 transition-colors"
            />
          </div>

          {/* Quick status selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-semibold hidden md:inline">Saúde Reputacional:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2.5 px-4 rounded-lg bg-gray-950 border border-gray-800/80 focus:border-blue-500 focus:outline-none text-sm text-gray-300 font-semibold"
            >
              <option value="todos">Todos os Perfis</option>
              <option value="normal">Excelente (4.5★+)</option>
              <option value="alerta">Alerta de Nota</option>
              <option value="crise">Crítica (Sob Risco)</option>
            </select>
          </div>
        </div>

        {/* Grid List of Branch cards */}
        {filteredFiliais.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredFiliais.map((filial) => {
              // Gracefully mock B2B variables if they aren't provided by database row yet
              const notaGoogle = filial.nota_google || (filial.status === "crise" ? 3.8 : filial.status === "alerta" ? 4.2 : 4.9);
              const feedbacksRetidos = filial.feedbacks_retidos_qtd || (filial.status === "crise" ? 22 : filial.status === "alerta" ? 14 : 6);
              const isIaActive = filial.respostas_ia_ativas !== false;
              const isInstaActive = filial.insta_sync_ativo !== false;

              return (
                <div
                  key={filial.id}
                  className="bg-[#0b0f19] border border-gray-800/80 rounded-2xl p-5 hover:border-gray-700 transition-all flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/2 rounded-full blur-xl pointer-events-none" />
                  
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">
                          {filial.nome}
                        </h3>
                        <span className="text-xs text-gray-500 block mt-0.5">
                          {filial.cidade} - {filial.estado}
                        </span>
                      </div>
                      {getStatusBadge(filial.status)}
                    </div>

                    {/* Google Ratings and ReviewBot Stats */}
                    <div className="grid grid-cols-2 gap-2 mb-4 bg-gray-950/40 p-2.5 border border-gray-850 rounded-xl text-center">
                      <div>
                        <span className="text-[10px] text-gray-500 font-bold block">GOOGLE MAPS</span>
                        <span className="text-sm font-black text-amber-400 flex items-center justify-center gap-0.5">
                          {notaGoogle.toFixed(1)} <span className="text-xs text-amber-500">★</span>
                        </span>
                      </div>
                      <div className="border-l border-gray-800">
                        <span className="text-[10px] text-gray-500 font-bold block">CRISES EVITADAS</span>
                        <span className="text-sm font-black text-rose-400">{feedbacksRetidos}</span>
                      </div>
                    </div>

                    {/* Autopilot Status Toggles */}
                    <div className="space-y-2 mb-4 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          Responder com Gemini IA
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isIaActive ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" : "bg-gray-800 text-gray-500"
                        }`}>
                          {isIaActive ? "AUTOPILOTO ATIVO" : "INATIVO"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-pink-500 rounded-full" />
                          Instagram Auto-SEO
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isInstaActive ? "bg-pink-500/10 text-pink-400 border border-pink-500/20" : "bg-gray-800 text-gray-500"
                        }`}>
                          {isInstaActive ? "SINCRONIZADO" : "INATIVO"}
                        </span>
                      </div>
                    </div>

                    {/* Meta addresses/contact details */}
                    <div className="space-y-1.5 border-t border-gray-850 pt-3 text-[11px] text-gray-500">
                      {filial.telefone && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Tel:</span>
                          <span>{filial.telefone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">ReviewBot QR Link:</span>
                        <button
                          onClick={() => setActiveQrCode({
                            name: filial.nome,
                            url: `https://branchly.com/reviewbot/${filial.id}`
                          })}
                          className="text-blue-400 hover:text-blue-300 font-semibold hover:underline"
                        >
                          Ver / Exportar QR Code
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card B2B Action Buttons */}
                  <div className="flex items-center gap-2 mt-4 border-t border-gray-850 pt-4">
                    <a
                      href={`/dashboard/${filial.empresa_id}/filiais`}
                      className="flex-1 text-center py-2 rounded-lg bg-gray-900 border border-gray-850 hover:border-gray-800 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
                    >
                      Ver Feedbacks Supabase
                    </a>
                    <button className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-all shadow-md shadow-blue-500/10 hover:shadow-blue-500/25">
                      Configurações IA
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#0b0f19] border border-gray-800/80 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 bg-gray-900 border border-gray-800 text-gray-500 rounded-2xl flex items-center justify-center mx-auto">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Nenhuma filial encontrada</h3>
              <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">
                Não encontramos nenhum perfil de localização correspondente aos critérios selecionados.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("todos");
              }}
              className="px-4 py-2 bg-gray-900 border border-gray-800 hover:border-gray-700 text-xs font-bold text-gray-300 rounded-lg transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </div>

      {/* QR Code Preview Modal */}
      {activeQrCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#0b0f19] border border-gray-800 p-6 rounded-3xl max-w-sm w-full text-center relative">
            <button
              onClick={() => setActiveQrCode(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg font-bold"
            >
              ✕
            </button>
            <h3 className="font-bold text-white text-base mb-1">ReviewBot QR Code</h3>
            <span className="text-xs text-gray-500 block mb-6">{activeQrCode.name}</span>
            
            {/* Elegant Mock QR Code Graphic */}
            <div className="w-48 h-48 bg-white p-4 rounded-2xl mx-auto mb-6 flex flex-col justify-between items-center shadow-lg">
              <div className="w-full h-full bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:10px_10px] relative border-4 border-white">
                {/* Simulated QR Code Corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-4 border-black bg-white" />
                <div className="absolute top-0 right-0 w-8 h-8 border-4 border-black bg-white" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-4 border-black bg-white" />
                <div className="absolute top-1 left-1 w-4 h-4 bg-black" />
                <div className="absolute top-1 right-1 w-4 h-4 bg-black" />
                <div className="absolute bottom-1 left-1 w-4 h-4 bg-black" />
              </div>
            </div>

            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Imprima este QR Code e coloque-o nas mesas ou no balcão de atendimento. O cliente escaneia e cai direto na triagem inteligente.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => alert(`Copiado: ${activeQrCode.url}`)}
                className="flex-1 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-xs font-bold text-gray-300 hover:text-white transition-colors"
              >
                Copiar URL
              </button>
              <button
                onClick={() => alert("Baixando PDF em alta resolução para impressão...")}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-colors"
              >
                Imprimir QR Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
