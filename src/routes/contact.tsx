import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MessageSquare, HelpCircle } from "lucide-react";
import { StaticPage } from "@/components/site/StaticPage";
import { useApp } from "@/lib/providers";

const content = {
  en: {
    eyebrow: "Contact",
    title: "Get in touch.",
    subtitle: "We typically reply within one business day.",
    channels: [
      { icon: "mail", title: "General", desc: "Product, partnerships and everything else.", email: "contato@branchly.com.br" },
      { icon: "chat", title: "Sales", desc: "Pricing, demos and enterprise plans.", email: "sales@branchly.com.br" },
      { icon: "help", title: "Support", desc: "Help with your account or integrations.", email: "suporte@branchly.com.br" },
    ],
    form: {
      title: "Send a message",
      name: "Your name",
      email: "Your email",
      subject: "Subject",
      message: "Message",
      send: "Send message",
      sent: "Message sent! We'll get back to you soon.",
    },
  },
  pt: {
    eyebrow: "Contato",
    title: "Entre em contato.",
    subtitle: "Respondemos normalmente em até um dia útil.",
    channels: [
      { icon: "mail", title: "Geral", desc: "Produto, parcerias e tudo mais.", email: "contato@branchly.com.br" },
      { icon: "chat", title: "Vendas", desc: "Preços, demos e planos empresariais.", email: "sales@branchly.com.br" },
      { icon: "help", title: "Suporte", desc: "Ajuda com sua conta ou integrações.", email: "suporte@branchly.com.br" },
    ],
    form: {
      title: "Envie uma mensagem",
      name: "Seu nome",
      email: "Seu e-mail",
      subject: "Assunto",
      message: "Mensagem",
      send: "Enviar mensagem",
      sent: "Mensagem enviada! Entraremos em contato em breve.",
    },
  },
};

const ICONS: Record<string, typeof Mail> = {
  mail: Mail,
  chat: MessageSquare,
  help: HelpCircle,
};

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Branchly" },
      { name: "description", content: "Contact Branchly: sales, support and general inquiries." },
    ],
    links: [{ rel: "canonical", href: "https://branchly.com.br/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { locale } = useApp();
  const c = content[locale];
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { name, email, subject, message } = form;
    const body = encodeURIComponent(`Nome: ${name}\n\n${message}`);
    const sub = encodeURIComponent(subject || `[Branchly Contact] ${name}`);
    window.location.href = `mailto:contato@branchly.com.br?subject=${sub}&body=${body}&from=${encodeURIComponent(email)}`;
    setSent(true);
  }

  return (
    <StaticPage eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle}>
      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        {c.channels.map((ch) => {
          const Icon = ICONS[ch.icon] ?? Mail;
          return (
            <a
              key={ch.title}
              href={`mailto:${ch.email}`}
              className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-6 transition hover:border-accent/50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Icon className="h-4 w-4" />
              </div>
              <div className="font-medium text-foreground">{ch.title}</div>
              <p className="text-sm text-muted-foreground">{ch.desc}</p>
              <span className="mt-auto text-xs text-accent group-hover:underline">{ch.email}</span>
            </a>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-card p-8 md:p-10">
        <h2 className="font-display mb-6 text-xl font-semibold text-foreground">{c.form.title}</h2>
        {sent ? (
          <p className="text-sm text-emerald-500">{c.form.sent}</p>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">{c.form.name}</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">{c.form.email}</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-foreground">{c.form.subject}</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-foreground">{c.form.message}</label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
              >
                {c.form.send}
              </button>
            </div>
          </form>
        )}
      </div>
    </StaticPage>
  );
}
