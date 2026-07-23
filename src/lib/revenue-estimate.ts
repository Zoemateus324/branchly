// Estimates the monthly revenue a local business may be leaving on the
// table due to a reputation gap vs. its category benchmark rating.
//
// This is a *directional marketing estimate*, not a financial guarantee.
// Formula and constants are intentionally simple and documented so they
// can be defended to a skeptical user and easily tuned later:
//
//   conversionLossPct = clamp(starGap * CONVERSION_LOSS_PER_STAR, 0, MAX_LOSS_PCT)
//   monthlyLossBRL    = avgMonthlyCustomers * avgTicketBRL * conversionLossPct
//
// CONVERSION_LOSS_PER_STAR is anchored to the industry figure already
// used elsewhere on this site ("a 0.1 star increase lifts conversion by
// up to 8% in local search" — BrightLocal-style local-search benchmark),
// scaled linearly per full star and capped so the estimate never claims
// an unrealistic majority of customers were lost to rating alone.

export const CATEGORY_BENCHMARK_RATING = 4.5;
const CONVERSION_LOSS_PER_STAR = 0.6; // 0.1★ ≈ 6-8% per published local-search benchmarks
const MAX_LOSS_PCT = 0.45;

interface CategoryDefaults {
  avgTicketBRL: number;
  avgMonthlyCustomers: number;
}

// Order MUST match both `en.simulator.categories` and `pt.simulator.categories`
// in src/lib/i18n/translations.ts — index position is the lookup key so the
// estimate works regardless of which locale the visitor is using.
const CATEGORY_DEFAULTS: CategoryDefaults[] = [
  { avgTicketBRL: 45, avgMonthlyCustomers: 1200 }, // Restaurant
  { avgTicketBRL: 18, avgMonthlyCustomers: 2000 }, // Cafe & Bakery
  { avgTicketBRL: 60, avgMonthlyCustomers: 900 }, // Bar & Nightlife
  { avgTicketBRL: 30, avgMonthlyCustomers: 2500 }, // Fast Food
  { avgTicketBRL: 120, avgMonthlyCustomers: 600 }, // Retail
  { avgTicketBRL: 150, avgMonthlyCustomers: 3000 }, // Supermarket
  { avgTicketBRL: 150, avgMonthlyCustomers: 500 }, // Fashion & Apparel
  { avgTicketBRL: 400, avgMonthlyCustomers: 300 }, // Electronics
  { avgTicketBRL: 200, avgMonthlyCustomers: 400 }, // Healthcare
  { avgTicketBRL: 350, avgMonthlyCustomers: 150 }, // Dental Clinic
  { avgTicketBRL: 180, avgMonthlyCustomers: 250 }, // Veterinary
  { avgTicketBRL: 120, avgMonthlyCustomers: 350 }, // Beauty & Wellness
  { avgTicketBRL: 80, avgMonthlyCustomers: 400 }, // Hair Salon
  { avgTicketBRL: 200, avgMonthlyCustomers: 200 }, // Spa
  { avgTicketBRL: 100, avgMonthlyCustomers: 300 }, // Gym & Fitness
  { avgTicketBRL: 300, avgMonthlyCustomers: 200 }, // Automotive
  { avgTicketBRL: 250, avgMonthlyCustomers: 250 }, // Auto Repair
  { avgTicketBRL: 800, avgMonthlyCustomers: 40 }, // Car Dealership
  { avgTicketBRL: 300, avgMonthlyCustomers: 150 }, // Hospitality
  { avgTicketBRL: 350, avgMonthlyCustomers: 200 }, // Hotel
  { avgTicketBRL: 250, avgMonthlyCustomers: 150 }, // Tourism
  { avgTicketBRL: 200, avgMonthlyCustomers: 300 }, // Education
  { avgTicketBRL: 500, avgMonthlyCustomers: 60 }, // Law Firm
  { avgTicketBRL: 300, avgMonthlyCustomers: 100 }, // Accounting
  { avgTicketBRL: 600, avgMonthlyCustomers: 50 }, // Real Estate
  { avgTicketBRL: 1000, avgMonthlyCustomers: 40 }, // Construction
  { avgTicketBRL: 200, avgMonthlyCustomers: 150 }, // Home Services
  { avgTicketBRL: 90, avgMonthlyCustomers: 400 }, // Pet Shop
  { avgTicketBRL: 60, avgMonthlyCustomers: 1500 }, // Pharmacy
  { avgTicketBRL: 100, avgMonthlyCustomers: 300 }, // Other (fallback)
];

const EN_CATEGORIES = [
  "Restaurant",
  "Cafe & Bakery",
  "Bar & Nightlife",
  "Fast Food",
  "Retail",
  "Supermarket",
  "Fashion & Apparel",
  "Electronics",
  "Healthcare",
  "Dental Clinic",
  "Veterinary",
  "Beauty & Wellness",
  "Hair Salon",
  "Spa",
  "Gym & Fitness",
  "Automotive",
  "Auto Repair",
  "Car Dealership",
  "Hospitality",
  "Hotel",
  "Tourism",
  "Education",
  "Law Firm",
  "Accounting",
  "Real Estate",
  "Construction",
  "Home Services",
  "Pet Shop",
  "Pharmacy",
  "Other",
];

const PT_CATEGORIES = [
  "Restaurante",
  "Café & Padaria",
  "Bar & Vida Noturna",
  "Fast Food",
  "Varejo",
  "Supermercado",
  "Moda & Vestuário",
  "Eletrônicos",
  "Saúde",
  "Clínica Odontológica",
  "Veterinária",
  "Beleza & Bem-estar",
  "Salão de Cabeleireiro",
  "Spa",
  "Academia",
  "Automotivo",
  "Oficina Mecânica",
  "Concessionária",
  "Hospitalidade",
  "Hotel",
  "Turismo",
  "Educação",
  "Escritório de Advocacia",
  "Contabilidade",
  "Imóveis",
  "Construção",
  "Serviços Domésticos",
  "Pet Shop",
  "Farmácia",
  "Outro",
];

function categoryIndex(category: string | undefined | null): number {
  if (!category) return -1;
  const en = EN_CATEGORIES.indexOf(category);
  if (en !== -1) return en;
  return PT_CATEGORIES.indexOf(category);
}

export interface RevenueLossEstimate {
  monthlyLossBRL: number;
  avgTicketBRL: number;
  avgMonthlyCustomers: number;
  starGap: number;
  benchmarkRating: number;
}

/**
 * Estimates monthly revenue lost to a below-benchmark rating.
 * Returns null when we don't have a real Google rating to compare
 * (never fabricate a number without input data).
 */
export function estimateMonthlyLoss(
  rating: number | null,
  category: string | undefined | null,
): RevenueLossEstimate | null {
  if (rating === null) return null;
  const idx = categoryIndex(category);
  const defaults =
    idx >= 0
      ? CATEGORY_DEFAULTS[idx]
      : CATEGORY_DEFAULTS[CATEGORY_DEFAULTS.length - 1];
  const starGap = Math.max(0, CATEGORY_BENCHMARK_RATING - rating);
  if (starGap <= 0) {
    return {
      monthlyLossBRL: 0,
      avgTicketBRL: defaults.avgTicketBRL,
      avgMonthlyCustomers: defaults.avgMonthlyCustomers,
      starGap: 0,
      benchmarkRating: CATEGORY_BENCHMARK_RATING,
    };
  }
  const conversionLossPct = Math.min(
    starGap * CONVERSION_LOSS_PER_STAR,
    MAX_LOSS_PCT,
  );
  const monthlyLossBRL = Math.round(
    defaults.avgMonthlyCustomers * defaults.avgTicketBRL * conversionLossPct,
  );
  return {
    monthlyLossBRL,
    avgTicketBRL: defaults.avgTicketBRL,
    avgMonthlyCustomers: defaults.avgMonthlyCustomers,
    starGap: Math.round(starGap * 10) / 10,
    benchmarkRating: CATEGORY_BENCHMARK_RATING,
  };
}
