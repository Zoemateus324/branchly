"use client";

import React, { useState, useEffect, useRef } from "react";

// Types for the dynamic simulator
type SimulationStep = {
  title: string;
  duration: string;
  description: string;
  status: "pending" | "active" | "completed";
};

type SimulatorScenario = {
  id: string;
  icon: React.ReactNode;
  title: string;
  badge: string;
  severity: "high" | "medium" | "low";
  description: string;
  steps: Omit<SimulationStep, "status">[];
};

export default function HomePage() {
  // Navigation tabs for the interactive dashboard preview
  const [activeTab, setActiveTab] = useState<"reviewbot" | "ia-replies" | "instagram-sync">("reviewbot");

  // FAQ Accordion active item
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Dynamic Simulator State
  const [selectedScenario, setSelectedScenario] = useState<string>("filter-bad");
  const [simulationActive, setSimulationActive] = useState<boolean>(false);
  const [simSteps, setSimSteps] = useState<SimulationStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const simTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Visitor interactive inputs inside the simulator
  const [userInputReview, setUserInputReview] = useState("");
  const [userInputInstaPost, setUserInputInstaPost] = useState("");

  // Define the simulator scenarios based on actual Branchly features
  const scenarios: SimulatorScenario[] = [
    {
      id: "filter-bad",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2M6.34 5.34l1.41 1.41m2.83 2.83l1.41 1.41m2.83 2.83l1.41 1.41M17.66 17.66l1.41 1.41M17.66 5.34l-1.41 1.41m-2.83 2.83l-1.41 1.41m-2.83 2.83l-1.41 1.41M6.34 17.66l-1.41-1.41" />
        </svg>
      ),
      title: "ReviewBot: Crítica Negativa (1 a 3★)",
      badge: "Crise Contida",
      severity: "high",
      description: "Um cliente escaneia o QR Code na mesa/balcão e dá nota 2 estrelas relatando demora no atendimento.",
      steps: [
        { title: "Escaneamento QR Code", duration: "0.5s", description: "Cliente escaneia o QR Code dinâmico do estabelecimento." },
        { title: "Entrada de Nota (2 Estrelas)", duration: "1.5s", description: "O sistema detecta avaliação insatisfatória (1-3 estrelas) e ativa o filtro inteligente." },
        { title: "Retenção no Supabase", duration: "3.0s", description: "A avaliação ruim é retida no banco interno. O redirecionamento ao Google Maps é bloqueado." },
        { title: "Alerta de Crise Privada", duration: "4.2s", description: "O gerente local recebe notificação no WhatsApp: 'Mesa 4 insatisfeita! Resolva agora!'" },
        { title: "Resolução Local", duration: "5.5s", description: "O gerente corrige o problema na mesa. Crise neutralizada antes de ir para a internet." }
      ]
    },
    {
      id: "filter-good",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "ReviewBot: Avaliação Positiva (4 ou 5★)",
      badge: "Local SEO Up",
      severity: "low",
      description: "Um cliente avalia com 5 estrelas elogiando a experiência e a comida.",
      steps: [
        { title: "Escaneamento QR Code", duration: "0.5s", description: "Cliente escaneia o QR Code dinâmico no balcão da filial." },
        { title: "Filtro Ativado (5 Estrelas)", duration: "1.5s", description: "O sistema identifica nota máxima (4-5 estrelas) qualificada para SEO Local." },
        { title: "Redirecionamento ao Google", duration: "2.8s", description: "O cliente é enviado automaticamente ao perfil oficial do Google Maps para registrar o elogio público." },
        { title: "Motor de IA (Gemini)", duration: "4.0s", description: "Gemini monitora a nova avaliação do Google e gera resposta personalizada em segundos." },
        { title: "SEO Otimizado no Mapa", duration: "5.2s", description: "Resposta inclui palavras-chave regionais da filial, elevando o ranqueamento orgânico." }
      ]
    },
    {
      id: "insta-sync",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: "Automação de Presença Digital (Instagram)",
      badge: "SEO 100% Autônomo",
      severity: "medium",
      description: "A empresa posta uma foto no Instagram de um novo produto e a IA replica no Google e Pinterest com SEO Local.",
      steps: [
        { title: "Captura de Post Instagram", duration: "0.6s", description: "O Branchly monitora o feed e captura nova postagem da marca." },
        { title: "Reescrita Local por IA", duration: "1.8s", description: "A inteligência artificial lê a legenda original e a reescreve injetando termos regionais de busca." },
        { title: "Publicação no Google Maps", duration: "3.0s", description: "O conteúdo é publicado de forma 100% autônoma na seção 'Novidades' do Google Meu Negócio." },
        { title: "Indexação no Pinterest", duration: "4.2s", description: "A imagem e o texto localizado são pinados no Pinterest com links diretos da loja." },
        { title: "Tráfego Regional Elevado", duration: "5.5s", description: "A filial conquista maior presença de busca por intenções de serviços na sua vizinhança." }
      ]
    }
  ];

  // Initialize and handle the crisis simulation loops
  useEffect(() => {
    const scenario = scenarios.find(s => s.id === selectedScenario);
    if (scenario) {
      setSimSteps(scenario.steps.map(step => ({ ...step, status: "pending" })));
      setSimulationActive(false);
      setCurrentStepIndex(-1);
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    }
  }, [selectedScenario]);

  const startSimulation = () => {
    if (simTimerRef.current) clearInterval(simTimerRef.current);
    
    setSimulationActive(true);
    setCurrentStepIndex(0);
    
    // Inject dynamic user reviews/posts into step descriptions if they provided them
    let adjustedSteps = [...scenarios.find(s => s.id === selectedScenario)!.steps];
    if (selectedScenario === "filter-bad" && userInputReview.trim() !== "") {
      adjustedSteps[1] = { ...adjustedSteps[1], description: `Feedback digitado pelo cliente: "${userInputReview}"` };
    } else if (selectedScenario === "filter-good" && userInputReview.trim() !== "") {
      adjustedSteps[2] = { ...adjustedSteps[2], description: `Cliente redirecionado ao Google com elogio: "${userInputReview}"` };
    } else if (selectedScenario === "insta-sync" && userInputInstaPost.trim() !== "") {
      adjustedSteps[1] = { ...adjustedSteps[1], description: `IA otimiza o post "${userInputInstaPost.substring(0, 40)}..." com termos de SEO Local.` };
    }

    setSimSteps(adjustedSteps.map((step, idx) => ({
      ...step,
      status: idx === 0 ? "active" : "pending"
    })));

    let currentIdx = 0;
    
    simTimerRef.current = setInterval(() => {
      currentIdx++;
      if (currentIdx < adjustedSteps.length) {
        setCurrentStepIndex(currentIdx);
        setSimSteps(prev => 
          prev.map((step, idx) => {
            if (idx < currentIdx) return { ...step, status: "completed" };
            if (idx === currentIdx) return { ...step, status: "active" };
            return { ...step, status: "pending" };
          })
        );
      } else {
        setCurrentStepIndex(currentIdx);
        setSimSteps(prev => prev.map(step => ({ ...step, status: "completed" })));
        setSimulationActive(false);
        if (simTimerRef.current) clearInterval(simTimerRef.current);
      }
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    };
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="bg-[#030712] text-gray-100 min-h-screen font-sans antialiased overflow-x-hidden">
      {/* Dynamic Ambient Glow Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[800px] right-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-[400px] left-10 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* HEADER & NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#030712]/75 border-b border-gray-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/30">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white leading-tight">
                Branchly
              </span>
              <span className="text-[10px] font-semibold text-blue-400 tracking-wider uppercase">Reputação & SEO Local</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#solucao" className="hover:text-white transition-colors">ReviewBot</a>
            <a href="#simulador" className="hover:text-white transition-colors">Simulador de Filtro</a>
            <a href="#diferenciais" className="hover:text-white transition-colors">IA & Presença</a>
            <a href="#precos" className="hover:text-white transition-colors">Preços</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            <a href="/sign-in" className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-4 py-2">
              Entrar
            </a>
            <a
              href="/sign-in"
              className="text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/20 hover:shadow-blue-500/35 transition-all scale-100 active:scale-98"
            >
              Começar Grátis
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28">
        <section id="hero" className="text-center max-w-4xl mx-auto">
          {/* Trust Badge Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-900 border border-gray-800 text-xs font-medium text-blue-400 mb-8 animate-fade-in shadow-inner">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Filtro de avaliações ativo: Protegendo 150+ redes B2B
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.1] md:leading-[1.15]">
            Domine o Google Maps. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-indigo-400">
              Filtre Notas Ruins
            </span>{" "}
            e Cresça com IA.
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg md:text-xl text-gray-400 font-normal leading-relaxed mb-10 max-w-3xl mx-auto">
            O Branchly unifica <strong>Filtro Inteligente de Avaliações (ReviewBot)</strong>, <strong>Respostas de IA</strong> personalizadas pelo Gemini e <strong>Sincronização de posts do Instagram</strong> convertidos em SEO Local para todas as suas filiais.
          </p>

          {/* Double CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a
              href="/sign-in"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.35)] transition-all flex items-center justify-center gap-2 group scale-100 active:scale-98"
            >
              Experimentar Grátis no Balcão
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a
              href="#simulador"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold text-gray-300 hover:text-white bg-gray-900/60 hover:bg-gray-900 border border-gray-800 hover:border-gray-700 backdrop-blur-sm transition-all flex items-center justify-center gap-2"
            >
              Testar QR Code Interativo
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
            </a>
          </div>

          {/* Social Proof Badges */}
          <div className="border-t border-gray-900 pt-10">
            <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-6">
              Plataforma desenhada para Redes, Franquias, Comércio Local e Agências
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-center opacity-65 grayscale hover:grayscale-0 hover:opacity-85 transition-all duration-300 max-w-3xl mx-auto text-gray-400 text-sm font-semibold tracking-wider">
              <div className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-gray-950 border border-gray-900/80">
                <span className="text-xs font-black text-amber-500">4.9 ★</span>
                <span>NO GOOGLE MAPS</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-gray-950 border border-gray-900/80">
                <span className="text-xs font-black text-blue-400">STRIPE</span>
                <span>PAGAMENTO SEGURO</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-gray-950 border border-gray-900/80">
                <span className="text-xs font-black text-teal-400">GEMINI IA</span>
                <span>RESPOSTAS 24/7</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-gray-950 border border-gray-900/80">
                <span className="text-xs font-black text-emerald-400">SUPABASE</span>
                <span>DADOS BLINDADOS</span>
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE DASHBOARD PREVIEW */}
        <section id="solucao" className="mt-24 md:mt-32">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-blue-500 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full">
              Painel de Controle Unificado
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white mt-4 mb-4">
              Gerencie a Reputação de Todas as Lojas em Um Só Lugar
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Navegue pelos módulos interativos do nosso painel e veja as estatísticas de satisfação e SEO local atualizadas em tempo real.
            </p>
          </div>

          <div className="bg-[#0b0f19] border border-gray-800/80 rounded-2xl shadow-2xl overflow-hidden max-w-5xl mx-auto backdrop-blur-md">
            {/* Dashboard Tabs Bar */}
            <div className="flex border-b border-gray-800 bg-[#060a13] px-4 pt-4 gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab("reviewbot")}
                className={`px-4 py-3 text-sm font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
                  activeTab === "reviewbot"
                    ? "border-blue-500 bg-[#0b0f19] text-white"
                    : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-900/30"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h.01M16 16h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ReviewBot & Filtro Inteligente
              </button>
              <button
                onClick={() => setActiveTab("ia-replies")}
                className={`px-4 py-3 text-sm font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
                  activeTab === "ia-replies"
                    ? "border-blue-500 bg-[#0b0f19] text-white"
                    : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-900/30"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Respostas Automáticas (Gemini IA)
              </button>
              <button
                onClick={() => setActiveTab("instagram-sync")}
                className={`px-4 py-3 text-sm font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
                  activeTab === "instagram-sync"
                    ? "border-blue-500 bg-[#0b0f19] text-white"
                    : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-900/30"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Automação Instagram → Google Posts
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6 md:p-8 min-h-[380px] flex flex-col justify-between">
              {/* Tab 1: ReviewBot (Filtro) */}
              {activeTab === "reviewbot" && (
                <div className="space-y-6">
                  {/* Metric Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-[#121826] border border-gray-800 p-4 rounded-xl flex items-center gap-4">
                      <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 font-semibold uppercase">QR Codes Gerados</div>
                        <div className="text-xl font-bold text-white">412 Unidades</div>
                        <div className="text-xs text-emerald-400">Mesas & Balcões ativos</div>
                      </div>
                    </div>

                    <div className="bg-[#121826] border border-gray-800 p-4 rounded-xl flex items-center gap-4">
                      <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 font-semibold uppercase">Nota Média Local</div>
                        <div className="text-xl font-bold text-white">4.9 ★</div>
                        <div className="text-xs text-emerald-400 flex items-center gap-0.5">
                          <span>↑ 0.6 desde adesão</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#121826] border border-gray-800 p-4 rounded-xl flex items-center gap-4">
                      <div className="p-3 bg-rose-500/10 rounded-lg text-rose-400">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 font-semibold uppercase">Crises Evitadas</div>
                        <div className="text-xl font-bold text-white">142 Notas Ruins</div>
                        <div className="text-xs text-emerald-400">Retidas no Supabase local</div>
                      </div>
                    </div>
                  </div>

                  {/* Active Feedbacks Log Table */}
                  <div className="bg-[#0e1320] border border-gray-800/80 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 bg-[#111726] border-b border-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider flex justify-between items-center">
                      <span>Últimos Feedbacks do QR Code</span>
                      <span className="text-[10px] text-blue-400 font-mono">Filtro Ativo</span>
                    </div>
                    <div className="divide-y divide-gray-800/60">
                      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-3">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                          <div>
                            <span className="font-semibold text-white">Filial Campinas</span>
                            <span className="text-gray-500 mx-2">•</span>
                            <span className="text-gray-400">"Demorou 25 minutos para trazer a conta."</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold font-mono">
                            2 ★ RETIDO INTERNO
                          </span>
                          <span className="text-gray-500 text-xs">Há 2 min</span>
                        </div>
                      </div>

                      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-3">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <div>
                            <span className="font-semibold text-white">Filial Jardins</span>
                            <span className="text-gray-500 mx-2">•</span>
                            <span className="text-gray-400">"Comida deliciosa e garçom atencioso!"</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold font-mono">
                            5 ★ ENVIADO GOOGLE MAPS
                          </span>
                          <span className="text-gray-500 text-xs">Há 12 min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Respostas IA (Gemini) */}
              {activeTab === "ia-replies" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-800 pb-3">
                    <div>
                      <h4 className="font-bold text-white text-base">Automação de Respostas Google Meu Negócio</h4>
                      <span className="text-xs text-gray-500">Motor de IA: Gemini-1.5-Pro • Otimização de SEO Local</span>
                    </div>
                    <span className="px-3 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-full text-xs font-semibold mt-2 sm:mt-0">
                      Monitorando 24h
                    </span>
                  </div>

                  <div className="bg-[#121826]/40 p-4 border border-gray-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="font-semibold text-white">Nova Avaliação Pública no Google Maps (Filial Salvador):</span>
                      <span>5 Estrelas • Cliente Lucas A.</span>
                    </div>
                    <p className="text-xs text-gray-300 italic bg-[#030712] p-3 rounded-lg border border-gray-800">
                      "Excelente hamburgueria em Salvador, o hambúrguer artesanal é incrível e o molho de alho é divino."
                    </p>

                    <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold pt-1">
                      <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Resposta Gerada Automaticamente com Foco em SEO Local:
                    </div>

                    <div className="text-xs text-gray-400 bg-teal-950/20 p-3 rounded-lg border border-teal-900/30 leading-relaxed">
                      "Olá, Lucas! Muito obrigado pelo feedback. Nos empenhamos para ser a **melhor hamburgueria de Salvador** e ficamos muito orgulhosos em saber que adorou nosso **hambúrguer artesanal**! Esperamos você na nossa loja física para provar outras delícias da casa em breve. Abraços do time da filial!"
                    </div>

                    <div className="text-[10px] text-gray-500 flex gap-4">
                      <span>Otimizado para: "hamburgueria em Salvador", "hambúrguer artesanal"</span>
                      <span className="text-emerald-400">✓ Respondido no Google Meu Negócio</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Instagram Sync */}
              {activeTab === "instagram-sync" && (
                <div className="flex flex-col md:flex-row gap-6 items-stretch">
                  <div className="w-full md:w-1/2 bg-gray-950 border border-gray-800 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-2">Original do Instagram</span>
                      <div className="flex gap-3 items-center mb-3">
                        <div className="w-8 h-8 rounded-lg bg-pink-600 flex items-center justify-center text-white">📸</div>
                        <span className="text-xs font-bold text-white">@cafe_do_bairro</span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed bg-[#121826] p-3 rounded border border-gray-850">
                        "Nova fornada de croissants quentinhos saindo do forno! Venha experimentar com nosso café coado especial."
                      </p>
                    </div>
                    <span className="text-[10px] text-pink-400 font-mono mt-4 block">Gatilho: Novo post do Instagram detectado</span>
                  </div>

                  <div className="w-full md:w-1/2 bg-slate-950 border border-teal-950 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block mb-2">Reescrita de SEO Local (Publicado)</span>
                      <div className="flex gap-3 items-center mb-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">G</div>
                        <span className="text-xs font-bold text-white">Google Meu Negócio & Pinterest</span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed bg-teal-950/10 p-3 rounded border border-teal-900/30">
                        "Procurando o **melhor café da manhã em Pinheiros**? ☕ Nova fornada de croissants quentinhos saindo do forno no Café do Bairro! Venha provar nosso **café especial em São Paulo, SP** ou faça seu pedido local."
                      </p>
                    </div>
                    <div className="text-[10px] text-gray-500 flex items-center justify-between mt-4">
                      <span>Otimizado para Pinheiros, SP</span>
                      <span className="text-emerald-400 font-bold">✓ Indexado nos buscadores</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom bar of active tab container */}
              <div className="mt-6 border-t border-gray-800/60 pt-4 flex items-center justify-between text-xs text-gray-500">
                <span>Plataforma Branchly v2.4 • Base em nuvem blindada</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Conexão Supabase Segura
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* CRISIS / REVIEW FILTER SIMULATOR SECTION */}
        <section id="simulador" className="mt-28 md:mt-36 border-t border-gray-900 pt-20">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-blue-500 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full">
              Simulador de Conversão Prática
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white mt-4 mb-4">
              Veja o Filtro e Resposta do Branchly em Ação
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Digite uma crítica (1★ a 3★) ou um elogio (4★ ou 5★) na caixa abaixo para assistir o ReviewBot proteger ou impulsionar sua marca em tempo real.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Box: Scenarios Selection & Visitor Input */}
            <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  1. Escolha o Cenário e Digite a Avaliação
                </span>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedScenario("filter-bad")}
                    className={`flex-1 py-2 px-3 text-xs font-bold border rounded-lg transition-all ${
                      selectedScenario === "filter-bad"
                        ? "bg-[#0f172a] border-rose-500/80 text-rose-400"
                        : "bg-[#070a13] border-gray-800 text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    Crítica (1-3★)
                  </button>
                  <button
                    onClick={() => setSelectedScenario("filter-good")}
                    className={`flex-1 py-2 px-3 text-xs font-bold border rounded-lg transition-all ${
                      selectedScenario === "filter-good"
                        ? "bg-[#0f172a] border-emerald-500/80 text-emerald-400"
                        : "bg-[#070a13] border-gray-800 text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    Elogio (4-5★)
                  </button>
                  <button
                    onClick={() => setSelectedScenario("insta-sync")}
                    className={`flex-1 py-2 px-3 text-xs font-bold border rounded-lg transition-all ${
                      selectedScenario === "insta-sync"
                        ? "bg-[#0f172a] border-pink-500/80 text-pink-400"
                        : "bg-[#070a13] border-gray-800 text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    Instagram Sync
                  </button>
                </div>

                {/* Visitor Text inputs */}
                {selectedScenario !== "insta-sync" ? (
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 block font-semibold">Exemplo de Feedback (Opcional):</label>
                    <textarea
                      value={userInputReview}
                      onChange={(e) => setUserInputReview(e.target.value)}
                      placeholder={
                        selectedScenario === "filter-bad"
                          ? "Ex: Comida excelente mas o atendimento foi horrível e lento."
                          : "Ex: Lugar maravilhoso em Campinas! O hambúrguer de costela é espetacular."
                      }
                      rows={3}
                      className="w-full bg-gray-950 border border-gray-800 p-3 rounded-lg text-xs focus:outline-none focus:border-blue-500 text-white placeholder-gray-600 transition-colors"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 block font-semibold">Legenda do Instagram (Opcional):</label>
                    <textarea
                      value={userInputInstaPost}
                      onChange={(e) => setUserInputInstaPost(e.target.value)}
                      placeholder="Ex: Saindo pão de queijo quentinho com queijo da canastra na nossa loja física de Pinheiros!"
                      rows={3}
                      className="w-full bg-gray-950 border border-gray-800 p-3 rounded-lg text-xs focus:outline-none focus:border-blue-500 text-white placeholder-gray-600 transition-colors"
                    />
                  </div>
                )}
              </div>

              {/* Start Simulation Action Button */}
              <button
                onClick={startSimulation}
                disabled={simulationActive}
                className={`w-full py-4 px-6 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-2 ${
                  simulationActive
                    ? "bg-blue-900/30 text-blue-400/70 border border-blue-800/40 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 cursor-pointer"
                }`}
              >
                {simulationActive ? (
                  <>
                    <span className="w-5 h-5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin mr-1" />
                    Simulando Fluxo B2B...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                    Testar Algoritmo do Filtro
                  </>
                )}
              </button>
            </div>

            {/* Right Box: Simulation Steps Log (Live Feed) */}
            <div className="lg:col-span-7 bg-[#0b0f19]/70 border border-gray-800 rounded-2xl p-6 md:p-8 flex flex-col justify-between backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div>
                <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block">Status da Ação em Tempo Real</span>
                    <h3 className="font-bold text-white text-base">Algoritmo de Triagem de Reputação</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400 block font-semibold">Gatilho: {scenarios.find(s => s.id === selectedScenario)?.badge}</span>
                  </div>
                </div>

                {/* Vertical Timeline */}
                <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-800/80">
                  {simSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className={`relative pl-8 flex items-start gap-4 transition-all duration-500 ${
                        step.status === "pending"
                          ? "opacity-35 grayscale"
                          : step.status === "active"
                          ? "opacity-100"
                          : "opacity-85"
                      }`}
                    >
                      {/* Timeline Dot/Icon */}
                      <span className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        step.status === "completed"
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : step.status === "active"
                          ? "bg-[#030712] border-blue-500 text-blue-400 scale-110 shadow-md shadow-blue-500/20"
                          : "bg-gray-900 border-gray-800 text-gray-600"
                      }`}>
                        {step.status === "completed" ? (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeWidth={3.5} d="M5 13l4 4L19 7" /></svg>
                        ) : step.status === "active" ? (
                          <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
                        ) : (
                          <span className="w-1.5 h-1.5 bg-gray-800 rounded-full" />
                        )}
                      </span>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-bold transition-all ${
                            step.status === "active" ? "text-blue-400" : "text-white"
                          }`}>
                            {step.title}
                          </h4>
                          <span className="text-[10px] font-mono text-gray-500 bg-gray-900 px-2 py-0.5 rounded border border-gray-800/50">
                            {step.duration}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status bar */}
              <div className="mt-8 border-t border-gray-800/50 pt-4 flex items-center justify-between text-[11px] text-gray-500">
                <span>Plataforma integrada com WhatsApp Business & Supabase</span>
                <span>Processado de forma síncrona</span>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES GRID SECTION */}
        <section id="diferenciais" className="mt-28 md:mt-36 border-t border-gray-900 pt-20">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-3 py-1 rounded-full">
              Funcionalidades Avançadas
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white mt-4 mb-4">
              Recursos desenhados para Crescer suas Vendas
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Nossa tecnologia blinda seu negócio local de notas injustas, enquanto promove seu perfil orgânico no Google Maps e Pinterest automaticamente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="bg-gradient-to-b from-[#0b0f19] to-[#040811] border border-gray-800/80 rounded-2xl p-6 md:p-8 hover:border-gray-700/80 hover:shadow-xl hover:shadow-blue-500/5 transition-all group scale-100 hover:scale-[1.02]">
              <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h.01M16 16h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-3">ReviewBot e Filtro 1-3★</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                QR Code dinâmico que filtra avaliações insatisfeitas. Críticas viram feedbacks internos sigilosos salvos no Supabase, enquanto elogios de 4-5 estrelas vão ao ar no Google Maps.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-gradient-to-b from-[#0b0f19] to-[#040811] border border-gray-800/80 rounded-2xl p-6 md:p-8 hover:border-gray-700/80 hover:shadow-xl hover:shadow-emerald-500/5 transition-all group scale-100 hover:scale-[1.02]">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Respostas com Gemini IA</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Nossa IA responde automaticamente a cada nova nota pública, gerando mensagens exclusivas com palavras-chave estratégicas para elevar o ranqueamento orgânico da loja física no mapa.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-gradient-to-b from-[#0b0f19] to-[#040811] border border-gray-800/80 rounded-2xl p-6 md:p-8 hover:border-gray-700/80 hover:shadow-xl hover:shadow-purple-500/5 transition-all group scale-100 hover:scale-[1.02]">
              <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 10.742L19.782 2.2a1 1 0 011.518.843v17.914a1 1 0 01-1.518.843L8.684 13.258a1 1 0 010-1.516z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 9H3a2 2 0 00-2 2v2a2 2 0 002 2h2" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Instagram Auto-SEO</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Capturamos seus novos posts no Instagram de forma 100% automatizada, traduzimos a legenda em um texto riquíssimo em SEO geolocalizado e publicamos no Google Meu Negócio e Pinterest.
              </p>
            </div>
          </div>
        </section>

        {/* PRICING PLANS GRID */}
        <section id="precos" className="mt-28 md:mt-36 border-t border-gray-900 pt-20">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full">
              Tabela de Preços e Escala
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white mt-4 mb-4">
              Planos Inteligentes para Qualquer Tamanho de Negócio
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Gerencie uma ou múltiplas filiais sob a mesma conta. Nossos planos escalam perfeitamente conforme sua empresa cresce (Stripe integrado).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {/* Plan 1 */}
            <div className="bg-[#0b0f19]/60 border border-gray-800 rounded-3xl p-8 flex flex-col justify-between hover:border-gray-700 transition-all">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Startup B2B</span>
                <h3 className="text-xl font-bold text-white mt-1 mb-4">Plano Inicial</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-3xl font-black text-white">R$ 49,90</span>
                  <span className="text-xs text-gray-500 ml-1">/ mês</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-6 border-b border-gray-800 pb-4">
                  Perfeito para pequenas lojas locais e comércios de bairro iniciarem o monitoramento.
                </p>
                <ul className="space-y-3.5 text-xs text-gray-300">
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-400">✓</span> 1 Filial Inclusa
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-400">✓</span> ReviewBot com QR Code
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-400">✓</span> Filtro de Nota 1-3★ no Supabase
                  </li>
                  <li className="flex items-center gap-2.5 text-gray-500">
                    <span>✗</span> Respostas Automáticas Gemini IA
                  </li>
                  <li className="flex items-center gap-2.5 text-gray-500">
                    <span>✗</span> Sincronização automática do Instagram
                  </li>
                </ul>
              </div>
              <a href="/sign-in" className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-850 border border-gray-800 text-center font-bold text-xs text-white rounded-xl mt-8 transition-colors">
                Contratar Plano Inicial
              </a>
            </div>

            {/* Plan 2: Recommended */}
            <div className="bg-gradient-to-b from-[#0e172a] to-[#080d19] border-2 border-blue-500/80 rounded-3xl p-8 flex flex-col justify-between hover:shadow-xl hover:shadow-blue-500/5 relative">
              <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-blue-500 text-white font-bold text-[10px] uppercase rounded-full tracking-wider">
                MAIS RECOMENDADO
              </span>
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Franquia & Redes</span>
                <h3 className="text-xl font-bold text-white mt-1 mb-4">Plano Crescimento</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-3xl font-black text-white">R$ 189,90</span>
                  <span className="text-xs text-gray-500 ml-1">/ mês</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-6 border-b border-gray-800/80 pb-4">
                  Completo para franquias, restaurantes e marcas em expansão com inteligência integrada.
                </p>
                <ul className="space-y-3.5 text-xs text-gray-300">
                  <li className="flex items-center gap-2.5 font-bold text-white">
                    <span className="text-emerald-400">✓</span> Até 5 Filiais Inclusas
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-400">✓</span> ReviewBot com QR Code Ilimitado
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-400">✓</span> Filtro de Nota 1-3★ no Supabase
                  </li>
                  <li className="flex items-center gap-2.5 text-blue-400 font-semibold">
                    <span className="text-emerald-400">✓</span> Respostas com Gemini IA (100% Automático)
                  </li>
                  <li className="flex items-center gap-2.5 text-teal-400">
                    <span className="text-emerald-400">✓</span> Sincronização automatizada do Instagram
                  </li>
                </ul>
              </div>
              <a href="/sign-in" className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-center font-bold text-xs text-white rounded-xl mt-8 transition-colors shadow-md shadow-blue-500/20">
                Começar Teste de 14 dias
              </a>
            </div>

            {/* Plan 3 */}
            <div className="bg-[#0b0f19]/60 border border-gray-800 rounded-3xl p-8 flex flex-col justify-between hover:border-gray-700 transition-all">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Multi-Lojas / Agência</span>
                <h3 className="text-xl font-bold text-white mt-1 mb-4">Plano Escala</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-3xl font-black text-white">R$ 349,90</span>
                  <span className="text-xs text-gray-500 ml-1">/ mês</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-6 border-b border-gray-800 pb-4">
                  O painel definitivo para redes corporativas B2B e agências de tráfego local/SEO.
                </p>
                <ul className="space-y-3.5 text-xs text-gray-300">
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-400">✓</span> Até 10 Filiais Inclusas
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-400">✓</span> ReviewBot com QR Code Ilimitado
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-400">✓</span> Filtro de Nota 1-3★ no Supabase
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-400">✓</span> Respostas IA Otimizadas (Alta Prioridade)
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="text-emerald-400">✓</span> Instagram Sync Completo (Pinterest & Google)
                  </li>
                  <li className="flex items-center gap-2.5 font-bold text-purple-400">
                    <span className="text-emerald-400">✓</span> Integração White-label e Multi-Contas
                  </li>
                </ul>
              </div>
              <a href="/sign-in" className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-850 border border-gray-800 text-center font-bold text-xs text-white rounded-xl mt-8 transition-colors">
                Contratar Plano Escala
              </a>
            </div>
          </div>

          {/* Additional Branch Pricing */}
          <div className="max-w-xl mx-auto text-center mt-12 bg-blue-950/15 border border-blue-900/30 rounded-2xl p-4">
            <span className="text-xs font-semibold text-blue-400">
              💡 Precisa de mais unidades? Adicione filiais extras por apenas <strong>R$ 29,90/mês</strong> por loja adicional.
            </span>
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section id="depoimentos" className="mt-28 md:mt-36 border-t border-gray-900 pt-20">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-400/10 px-3 py-1 rounded-full">
              Prova Social de Sucesso
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white mt-4 mb-4">
              Quem Usa Domina a Presença Orgânica Regional
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Veja como proprietários de comércios e gestores de agências B2B escalaram seu tráfego local no Google Maps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-[#0b0f19]/40 border border-gray-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-sm relative">
              <span className="absolute top-6 right-6 text-6xl font-serif text-gray-800 select-none pointer-events-none">“</span>
              <p className="text-sm md:text-base text-gray-300 italic mb-6 relative z-10 leading-relaxed">
                "O ReviewBot foi uma revolução para as nossas 4 filiais de restaurante. Antes, qualquer cliente com pressa ou mal-entendido postava 1 estrela no Google Maps e arruinava nossa nota. Hoje, esses feedbacks são resolvidos privadamente pelo nosso gerente, e nossa nota pública subiu de 4.1 para 4.9!"
              </p>
              <div className="flex items-center gap-3 border-t border-gray-800/60 pt-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-sm border border-blue-500/25">
                  MC
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Mateus Cavalcanti</span>
                  <span className="text-[10px] text-gray-500 block">Proprietário da Rede Temaki Premium</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0b0f19]/40 border border-gray-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-sm relative">
              <span className="absolute top-6 right-6 text-6xl font-serif text-gray-800 select-none pointer-events-none">“</span>
              <p className="text-sm md:text-base text-gray-300 italic mb-6 relative z-10 leading-relaxed">
                "Como agência de tráfego, gerencio 15 localizações de clientes locais. O Branchly reduziu nosso esforço operacional a zero. A automação do Instagram → Google Meu Negócio mantém os perfis sempre ativos, e as respostas automáticas de IA com Gemini multiplicaram as visitas dos perfis no mapa em 300%."
              </p>
              <div className="flex items-center gap-3 border-t border-gray-800/60 pt-4">
                <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-400 font-bold flex items-center justify-center text-sm border border-teal-500/25">
                  SF
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Sophia Fonseca</span>
                  <span className="text-[10px] text-gray-500 block">Fundadora da Agência Vortex Marketing</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="mt-28 md:mt-36 border-t border-gray-900 pt-20">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full">
              Dúvidas Frequentes
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white mt-4 mb-4">
              Perguntas Respondidas
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Tudo o que você precisa saber sobre o ReviewBot, SEO local de filiais e segurança.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "Como funciona a triagem do ReviewBot na prática?",
                a: "Disponibilizamos um QR Code exclusivo para cada uma de suas filiais. Quando o cliente escaneia no balcão ou na mesa, abre-se uma tela otimizada no celular solicitando a nota. Se for 4 ou 5, enviamos ele com 1 clique para o link oficial do Google Maps. Se for 1, 2 ou 3 estrelas, abrimos um formulário interno privado para capturar a crítica e enviamos um alerta ao gerente no mesmo instante via WhatsApp, mantendo a reclamação em ambiente fechado."
              },
              {
                q: "As respostas de IA do Gemini são seguras e profissionais?",
                a: "Sim! O motor do Gemini-1.5-Pro é configurado com diretrizes de tom e restrições rígidas. Ele responde com extrema simpatia, agradece o cliente e, de forma natural, injeta as palavras-chave de serviços da sua cidade/bairro na resposta, garantindo ranqueamento de SEO Local sem parecer artificial ou robótico."
              },
              {
                q: "Como o Branchly monitora o Instagram?",
                a: "Integramos de forma segura com o perfil do Instagram da sua marca. Sempre que um novo post entra no feed, nossa inteligência artificial lê a legenda original, reescreve com foco em termos regionais de intenção de busca para Google e posta nos feeds de posts do Google Meu Negócio e Pinterest."
              },
              {
                q: "Como é cobrada a adição de filiais extras?",
                a: "Nossos planos base possuem franquias de filiais inclusas (1, 5 ou 10). Se você exceder esse número, o Stripe cobra automaticamente o acréscimo de R$ 29,90/mês por cada filial adicional cadastrada no painel, ideal para agências que gerenciam múltiplas localizações de forma elástica."
              }
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#0b0f19]/40 border border-gray-800 rounded-xl overflow-hidden backdrop-blur-sm transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-5 flex items-center justify-between font-bold text-white hover:text-blue-400 transition-colors gap-4"
                >
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  <span className={`p-1 bg-gray-800 rounded-lg text-gray-400 transition-transform duration-300 ${
                    openFaq === idx ? "rotate-180 text-blue-400" : ""
                  }`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    openFaq === idx ? "max-h-[250px] border-t border-gray-800/40" : "max-h-0"
                  }`}
                >
                  <p className="p-5 text-xs sm:text-sm text-gray-400 leading-relaxed bg-[#0b0f19]/25">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section className="mt-28 md:mt-36 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-3xl blur-3xl pointer-events-none -z-10" />

          <div className="bg-gradient-to-b from-[#0b0f19] to-[#040811] border border-gray-800 rounded-3xl p-8 md:p-12 text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-44 h-44 bg-blue-500/10 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-44 h-44 bg-indigo-500/10 rounded-full blur-[80px]" />

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4 relative z-10">
              Assuma o Controle Orgânico das suas Filiais
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-8 text-sm sm:text-base relative z-10">
              Junte-se a dezenas de franquias e comércios locais que crescem sua nota no Google Maps e blindam sua reputação com o Branchly. Teste gratuito por 14 dias.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 mb-6">
              <a
                href="/sign-in"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/35 transition-all scale-100 active:scale-98"
              >
                Cadastrar Minhas Filiais Grátis
              </a>
              <a
                href="#simulador"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold text-gray-300 hover:text-white bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all"
              >
                Falar com Especialista
              </a>
            </div>

            <p className="text-xs text-gray-500">
              Sem cartão de crédito • Implantação rápida • Integrado via Stripe & Supabase
            </p>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#02050c] border-t border-gray-900 py-12 text-gray-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-bold text-sm text-white">Branchly</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#solucao" className="hover:text-gray-300 transition-colors">Termos B2B</a>
            <a href="#solucao" className="hover:text-gray-300 transition-colors">Política de Privacidade</a>
            <a href="#solucao" className="hover:text-gray-300 transition-colors">Stripe Billing</a>
          </div>

          <div>
            &copy; {new Date().getFullYear()} Branchly Inc. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}