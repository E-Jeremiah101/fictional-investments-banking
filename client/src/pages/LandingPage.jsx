import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  LineChart,
  Globe2,
  Lock,
  BarChart3,
  Users,
  CheckCircle2,
  ChevronDown,
  Play,
  Briefcase,
  Handshake,
  Landmark,
  Menu,
  X,
} from "lucide-react";

// ---------- Directional scroll-reveal hook ----------
function useInView(options = { threshold: 0.15, once: true }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (options.once) observer.unobserve(node);
        } else if (!options.once) {
          setInView(false);
        }
      },
      { threshold: options.threshold, rootMargin: "0px 0px -80px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [options.threshold, options.once]);

  return [ref, inView];
}

// dir: "up" | "left" | "right"
function Reveal({
  children,
  delay = 0,
  dir = "up",
  distance = 32,
  className = "",
}) {
  const [ref, inView] = useInView();
  const offset =
    dir === "left"
      ? `translateX(-${distance}px)`
      : dir === "right"
        ? `translateX(${distance}px)`
        : `translateY(${distance}px)`;

  return (
    <div
      ref={ref}
      className={`transform-gpu transition-all duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
        inView ? "opacity-100" : "opacity-0"
      } ${className}`}
      style={{
        transform: inView ? "translate3d(0,0,0)" : offset,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function Counter({ end, prefix = "", suffix = "", duration = 1800 }) {
  const [ref, inView] = useInView();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = null;
    let frame;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(end * eased));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [inView, end, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function LandingPage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const total =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const progress = total > 0 ? (window.scrollY / total) * 100 : 0;
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.add("scroll-smooth");
    return () => document.documentElement.classList.remove("scroll-smooth");
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Close mobile menu when tapping outside the header
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onClick = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", onClick);
    return () => document.removeEventListener("pointerdown", onClick);
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900 antialiased">
      <div
        className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-500 transition-transform duration-150"
        style={{ transform: `scaleX(${scrollProgress / 100})` }}
        aria-hidden="true"
      />

      {/* Nav */}
      <header
        ref={headerRef}
        className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#0b1a3a]/85 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
              <Building2 size={18} />
            </div>
            <div>
              <p className="text-[14px] font-bold leading-tight tracking-tight text-white">
                PrimeStone Capital
              </p>
              <p className="text-[10px] leading-tight text-slate-400">
                Investment Banking
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-[13px] font-medium text-slate-300 md:flex">
            <a href="#platform" className="transition hover:text-white">
              Platform
            </a>
            <a href="#products" className="transition hover:text-white">
              Products
            </a>
            <a href="#trust" className="transition hover:text-white">
              Trust
            </a>
            <a href="#insights" className="transition hover:text-white">
              Insights
            </a>
          </nav>

          {/* Desktop auth buttons */}
          <div className="hidden items-center gap-2 md:flex">
            <Link
              to="/login"
              className="rounded-lg px-3.5 py-2 text-[13px] font-medium text-slate-200 transition hover:bg-white/5 hover:text-white"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-white px-4 py-2 text-[13px] font-semibold text-[#0b1a3a] transition hover:bg-blue-50"
            >
              Open account
            </Link>
          </div>

          {/* Mobile: primary action + menu toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              to="/register"
              className="rounded-lg bg-white px-3.5 py-2 text-[12.5px] font-semibold text-[#0b1a3a] transition hover:bg-blue-50"
            >
              Open account
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              className="rounded-lg border border-white/15 p-2 text-slate-200 transition hover:bg-white/5"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown panel */}
        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-[#0b1a3a] md:hidden">
            <div className="mx-auto max-w-7xl px-4 py-4">
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-[13px] font-semibold text-white transition hover:bg-white/10"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center rounded-xl bg-white px-4 py-3 text-[13px] font-semibold text-[#0b1a3a] transition hover:bg-blue-50"
                >
                  Open account
                </Link>
              </div>
              <nav className="mt-3 grid gap-1">
                {[
                  { label: "Platform", href: "#platform" },
                  { label: "Products", href: "#products" },
                  { label: "Trust", href: "#trust" },
                  { label: "Insights", href: "#insights" },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-[13px] font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#0b1a3a] pt-16">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=2400&q=80&auto=format&fit=crop"
            alt=""
            className="h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0b1a3a] via-[#0b1a3a]/90 to-[#122a5c]/80" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Copy */}
            <div>
              <Reveal dir="left" distance={28}>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-medium text-blue-200 backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />A
                  private banking experience
                </div>
              </Reveal>

              <Reveal dir="left" delay={120}>
                <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-white md:text-5xl lg:text-6xl">
                  A disciplined home
                  <br />
                  for considered
                  <br />
                  <span className="bg-gradient-to-r from-blue-300 via-blue-200 to-emerald-300 bg-clip-text text-transparent">
                    capital.
                  </span>
                </h1>
              </Reveal>

              <Reveal dir="left" delay={220}>
                <p className="mt-6 max-w-xl text-[15px] leading-7 text-slate-300 md:text-base">
                  PrimeStone Capital is a private investment platform for
                  clients who value clarity over noise. Curated portfolios,
                  institutional research, and dedicated advisory — built around
                  your objectives.
                </p>
              </Reveal>

              <Reveal dir="left" delay={320}>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    to="/register"
                    className="group inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-[13.5px] font-semibold text-[#0b1a3a] shadow-lg shadow-black/20 transition hover:bg-blue-50"
                  >
                    Open an account
                    <ArrowRight
                      size={15}
                      className="transition group-hover:translate-x-0.5"
                    />
                  </Link>
                  <a
                    href="#platform"
                    className="group inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-[13.5px] font-semibold text-white backdrop-blur transition hover:bg-white/10"
                  >
                    <Play size={14} />
                    Explore the platform
                  </a>
                </div>
              </Reveal>

              <Reveal dir="left" delay={420}>
                <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-[11.5px] font-medium text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-emerald-400" />
                    Regulated custody
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Globe2 size={13} className="text-blue-300" />
                    40+ global markets
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users size={13} className="text-violet-300" />
                    12,000+ private clients
                  </span>
                </div>
              </Reveal>
            </div>

            {/* Portfolio card */}
            <Reveal dir="right" delay={300} distance={40}>
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-blue-500/30 via-transparent to-emerald-500/20 blur-2xl" />
                <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10.5px] font-semibold uppercase tracking-wider text-blue-200">
                        Portfolio value
                      </p>
                      <p className="mt-1.5 text-3xl font-bold tracking-tight text-white tabular-nums">
                        $248,390.12
                      </p>
                      <p className="mt-1 text-[10.5px] text-slate-400">
                        As of 12 Nov 2026 · 09:41 GMT
                      </p>
                    </div>
                    <div className="flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-1 text-[11px] font-semibold text-emerald-300">
                      <TrendingUp size={11} />
                      +18.42%
                    </div>
                  </div>

                  <div className="mt-5 h-24">
                    <svg
                      viewBox="0 0 400 100"
                      preserveAspectRatio="none"
                      className="h-full w-full"
                    >
                      <defs>
                        <linearGradient
                          id="heroFill"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#34d399"
                            stopOpacity="0.35"
                          />
                          <stop
                            offset="100%"
                            stopColor="#34d399"
                            stopOpacity="0"
                          />
                        </linearGradient>
                      </defs>
                      <polygon
                        points="0,100 0,70 40,65 80,55 120,60 160,45 200,50 240,30 280,35 320,20 360,25 400,10 400,100"
                        fill="url(#heroFill)"
                      />
                      <polyline
                        points="0,70 40,65 80,55 120,60 160,45 200,50 240,30 280,35 320,20 360,25 400,10"
                        fill="none"
                        stroke="#34d399"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
                    {[
                      { l: "YTD return", v: "+$38,290" },
                      { l: "Risk", v: "Balanced" },
                      { l: "Allocation", v: "12 assets" },
                    ].map((row) => (
                      <div key={row.l}>
                        <p className="text-[9.5px] font-semibold uppercase tracking-wider text-slate-400">
                          {row.l}
                        </p>
                        <p className="mt-1 text-[13px] font-semibold tabular-nums text-white">
                          {row.v}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="relative flex justify-center pb-8">
          <a
            href="#platform"
            className="flex animate-bounce flex-col items-center gap-1 text-slate-400 transition hover:text-white"
            aria-label="Scroll down"
          >
            <span className="text-[10px] uppercase tracking-widest">
              Scroll
            </span>
            <ChevronDown size={16} />
          </a>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4 md:px-8 md:py-14">
          {[
            {
              label: "Assets under management",
              value: 4.8,
              prefix: "$",
              suffix: "B+",
            },
            { label: "Private clients", value: 12400, suffix: "+" },
            { label: "Markets covered", value: 40, suffix: "+" },
            { label: "Years of expertise", value: 22, suffix: "" },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <div>
                <p className="text-2xl font-bold tracking-tight text-[#0b1a3a] tabular-nums md:text-3xl">
                  <Counter
                    end={s.value}
                    prefix={s.prefix || ""}
                    suffix={s.suffix || ""}
                  />
                </p>
                <p className="mt-1.5 text-[11.5px] font-medium uppercase tracking-wider text-slate-500">
                  {s.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Returning-client CTA */}
        <div className="mx-auto max-w-7xl px-4 pb-10 md:px-8">
          <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row">
            <p className="text-[13px] text-slate-600">
              Already a PrimeStone Capital client?
            </p>
            <div className="flex gap-2">
              <Link
                to="/login"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-[12.5px] font-semibold text-[#0b1a3a] transition hover:bg-slate-100"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-[#0b1a3a] px-4 py-2 text-[12.5px] font-semibold text-white transition hover:bg-[#132a5a]"
              >
                Open account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM */}
      <section id="platform" className="bg-[#f6f8fb] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <Reveal dir="left" distance={40}>
              <div className="relative overflow-hidden rounded-3xl">
                <img
                  src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=80&auto=format&fit=crop"
                  alt="Two professionals shaking hands"
                  className="h-[480px] w-full object-cover transition duration-[1200ms] hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1a3a]/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 rounded-xl border border-white/20 bg-black/40 p-4 backdrop-blur-md">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-200">
                    Partnership
                  </p>
                  <p className="mt-1.5 text-[13px] font-semibold text-white">
                    A relationship-first approach to capital
                  </p>
                </div>
              </div>
            </Reveal>

            <div>
              <Reveal dir="right">
                <p className="text-[11px] font-bold uppercase tracking-widest text-blue-700">
                  The platform
                </p>
              </Reveal>
              <Reveal dir="right" delay={80}>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0b1a3a] md:text-4xl">
                  Built around relationships. <br />
                  Refined by discipline.
                </h2>
              </Reveal>
              <Reveal dir="right" delay={160}>
                <p className="mt-4 max-w-lg text-[15px] leading-7 text-slate-600">
                  PrimeStone Capital pairs the rigor of an investment bank with
                  the accessibility of modern digital wealth. Every client works
                  with a dedicated advisor and has full visibility into their
                  portfolio at all times.
                </p>
              </Reveal>

              <div className="mt-8 space-y-3">
                {[
                  {
                    icon: Briefcase,
                    title: "Dedicated advisory",
                    body: "A named investment specialist for every client.",
                  },
                  {
                    icon: LineChart,
                    title: "Live market intelligence",
                    body: "Streaming pricing and curated desk research, continuously.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Regulated custody",
                    body: "Assets held with regulated custodians and audited annually.",
                  },
                ].map((f, i) => (
                  <Reveal key={f.title} dir="right" delay={220 + i * 70}>
                    <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-200">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <f.icon size={17} />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-[#0b1a3a]">
                          {f.title}
                        </p>
                        <p className="mt-0.5 text-[12.5px] leading-5 text-slate-600">
                          {f.body}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              <Reveal dir="right" delay={480}>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to="/register"
                    className="group inline-flex items-center gap-2 rounded-xl bg-[#0b1a3a] px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#132a5a]"
                  >
                    Open an account
                    <ArrowRight
                      size={14}
                      className="transition group-hover:translate-x-0.5"
                    />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[13px] font-semibold text-[#0b1a3a] transition hover:bg-slate-50"
                  >
                    Sign in
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Small feature grid */}
          <div className="mt-20 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: BarChart3,
                title: "Performance analytics",
                body: "Track returns, risk and allocation with dashboards trusted by professional portfolio managers.",
                color: "bg-amber-50 text-amber-600",
              },
              {
                icon: Globe2,
                title: "Global market access",
                body: "Invest across 40+ markets from one account — with local settlement and multi-currency support.",
                color: "bg-sky-50 text-sky-600",
              },
              {
                icon: Lock,
                title: "Security by design",
                body: "256-bit encryption, multi-factor authentication and segregated custody at every layer.",
                color: "bg-violet-50 text-violet-600",
              },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 80}>
                <div className="group h-full rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/5">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${f.color}`}
                  >
                    <f.icon size={20} />
                  </div>
                  <h3 className="mt-5 text-[15px] font-bold text-[#0b1a3a]">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-6 text-slate-600">
                    {f.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Reveal dir="left">
                <p className="text-[11px] font-bold uppercase tracking-widest text-blue-700">
                  Our products
                </p>
              </Reveal>
              <Reveal dir="left" delay={80}>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0b1a3a] md:text-4xl">
                  Portfolios composed with purpose.
                </h2>
              </Reveal>
              <Reveal dir="left" delay={160}>
                <p className="mt-4 max-w-lg text-[15px] leading-7 text-slate-600">
                  Every portfolio we offer is constructed by our investment
                  committee around a specific objective — growth, income, or
                  concentrated opportunity. Choose the one that matches your
                  time horizon.
                </p>
              </Reveal>

              <div className="mt-8 space-y-3">
                {[
                  {
                    name: "Growth Portfolio",
                    desc: "Diversified global equities with quarterly rebalancing.",
                    tag: "Balanced risk",
                  },
                  {
                    name: "Income Portfolio",
                    desc: "Fixed income and dividend-focused holdings for steady yield.",
                    tag: "Conservative",
                  },
                  {
                    name: "Opportunities Fund",
                    desc: "Concentrated positions in high-conviction thematic ideas.",
                    tag: "Higher risk",
                  },
                ].map((p, i) => (
                  <Reveal key={p.name} dir="left" delay={220 + i * 80}>
                    <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:bg-blue-50/30">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <CheckCircle2 size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[14px] font-bold text-[#0b1a3a]">
                            {p.name}
                          </p>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                            {p.tag}
                          </span>
                        </div>
                        <p className="mt-1 text-[12.5px] leading-5 text-slate-600">
                          {p.desc}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              <Reveal dir="left" delay={500}>
                <Link
                  to="/register"
                  className="group mt-8 inline-flex items-center gap-2 text-[13.5px] font-semibold text-blue-700 hover:text-blue-900"
                >
                  Request a portfolio review
                  <ArrowRight
                    size={14}
                    className="transition group-hover:translate-x-0.5"
                  />
                </Link>
              </Reveal>
            </div>

            <Reveal dir="right" distance={40} delay={150}>
              <div className="relative overflow-hidden rounded-3xl">
                <img
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=80&auto=format&fit=crop"
                  alt="Investment team reviewing portfolios"
                  className="h-[520px] w-full object-cover transition duration-[1200ms] hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1a3a]/50 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 rounded-xl border border-white/20 bg-white/10 p-3.5 backdrop-blur-md">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-100">
                    Our desk
                  </p>
                  <p className="mt-1 text-[13px] font-semibold text-white">
                    Institutional research, delivered daily
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section
        id="trust"
        className="relative overflow-hidden bg-[#0b1a3a] py-20 md:py-28"
      >
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=2000&q=80&auto=format&fit=crop"
            alt="Professional team"
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b1a3a] via-[#0b1a3a]/95 to-[#0b1a3a]/80" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Reveal dir="left">
                <p className="text-[11px] font-bold uppercase tracking-widest text-blue-300">
                  Trust & security
                </p>
              </Reveal>
              <Reveal dir="left" delay={80}>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
                  Trusted by those who measure success in decades, not quarters.
                </h2>
              </Reveal>
              <Reveal dir="left" delay={160}>
                <p className="mt-4 text-[15px] leading-7 text-slate-300">
                  We operate with the risk controls, custody standards and
                  reporting rigor of a private investment bank — and we make
                  every one of them visible to you.
                </p>
              </Reveal>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  "Regulated asset custody",
                  "Independent annual audit",
                  "Segregated client accounts",
                  "24/7 portfolio monitoring",
                ].map((item, i) => (
                  <Reveal key={item} dir="left" delay={220 + i * 60}>
                    <div className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 backdrop-blur">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span className="text-[12.5px] font-medium text-slate-200">
                        {item}
                      </span>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            <Reveal dir="right" delay={200} distance={40}>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
                    <Landmark size={18} />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-white">
                      Security posture
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Continuously monitored
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3.5">
                  {[
                    { label: "Encryption", value: "256-bit AES", pct: 100 },
                    { label: "System uptime", value: "99.99%", pct: 99 },
                    { label: "Fraud prevention", value: "Real-time", pct: 96 },
                  ].map((row) => (
                    <div key={row.label}>
                      <div className="flex items-center justify-between text-[11.5px]">
                        <span className="font-medium text-slate-300">
                          {row.label}
                        </span>
                        <span className="font-semibold text-white">
                          {row.value}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-blue-400"
                          style={{ width: `${row.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 border-t border-white/10 pt-4">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-blue-300 transition hover:text-blue-200"
                  >
                    Access your account
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* INSIGHTS / TESTIMONIALS */}
      <section id="insights" className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Reveal>
              <p className="text-[11px] font-bold uppercase tracking-widest text-blue-700">
                Client voices
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0b1a3a] md:text-4xl">
                Why our clients stay.
              </h2>
            </Reveal>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              {
                quote:
                  "What I value most is the candor. Every decision is explained, every risk is named. That is rarer than it should be.",
                name: "Adaeze Okonkwo",
                role: "Private investor · Lagos",
                initials: "AO",
              },
              {
                quote:
                  "Twenty years with a traditional broker, and I finally have the transparency I always asked for. The reporting is exceptional.",
                name: "Michael Chen",
                role: "Retired fund manager · Singapore",
                initials: "MC",
              },
              {
                quote:
                  "The research desk is concise and genuinely actionable. It feels like having an analyst on retainer.",
                name: "Sara Al-Hassan",
                role: "Family office director · Dubai",
                initials: "SA",
              },
            ].map((t, i) => (
              <Reveal
                key={t.name}
                delay={i * 100}
                dir={i === 0 ? "left" : i === 2 ? "right" : "up"}
              >
                <figure className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/5">
                  <blockquote className="text-[13.5px] leading-6 text-slate-700">
                    “{t.quote}”
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-800 text-[11px] font-bold text-white">
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-[12.5px] font-semibold text-[#0b1a3a]">
                        {t.name}
                      </p>
                      <p className="text-[11px] text-slate-500">{t.role}</p>
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HANDSHAKE / PARTNERSHIP CTA */}
      <section className="relative overflow-hidden bg-white py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <Reveal dir="left" distance={40}>
              <div className="relative overflow-hidden rounded-3xl">
                <img
                  src="https://images.unsplash.com/photo-1573497491208-6b1acb260507?w=1200&q=80&auto=format&fit=crop"
                  alt="Two business professionals shaking hands"
                  className="h-[440px] w-full object-cover transition duration-[1200ms] hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1a3a]/40 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 rounded-xl border border-white/20 bg-black/40 px-3.5 py-2.5 backdrop-blur-md">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-200">
                    Partnership
                  </p>
                  <p className="mt-0.5 text-[12.5px] font-semibold text-white">
                    A long-term relationship, not a transaction
                  </p>
                </div>
              </div>
            </Reveal>

            <div>
              <Reveal dir="right">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600">
                  <Handshake size={12} />
                  Start a relationship
                </div>
              </Reveal>
              <Reveal dir="right" delay={100}>
                <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#0b1a3a] md:text-4xl">
                  Wealth is built
                  <br />
                  one considered decision at a time.
                </h2>
              </Reveal>
              <Reveal dir="right" delay={180}>
                <p className="mt-4 max-w-lg text-[15px] leading-7 text-slate-600">
                  Open your PrimeStone Capital account in minutes and speak with
                  a dedicated advisor. No minimums, no hidden fees — just a
                  clear path forward.
                </p>
              </Reveal>
              <Reveal dir="right" delay={260}>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to="/register"
                    className="group inline-flex items-center gap-2 rounded-xl bg-[#0b1a3a] px-6 py-3 text-[13.5px] font-semibold text-white transition hover:bg-[#132a5a]"
                  >
                    Open an account
                    <ArrowRight
                      size={15}
                      className="transition group-hover:translate-x-0.5"
                    />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-[13.5px] font-semibold text-[#0b1a3a] transition hover:bg-slate-50"
                  >
                    Sign in
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-[#0b1a3a] text-slate-300">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Building2 size={16} />
                </div>
                <div>
                  <p className="text-[13px] font-bold leading-tight text-white">
                    PrimeStone Capital
                  </p>
                  <p className="text-[10px] leading-tight text-slate-400">
                    Investment Banking
                  </p>
                </div>
              </div>
              <p className="mt-4 text-[12px] leading-5 text-slate-400">
                A private home for considered capital. Built on discipline,
                transparency and long-term relationships.
              </p>
            </div>

            {[
              {
                title: "Platform",
                items: ["Portfolios", "Research", "Analytics", "Pricing"],
              },
              {
                title: "Company",
                items: ["About", "Careers", "Press", "Contact"],
              },
              {
                title: "Legal",
                items: ["Privacy", "Terms", "Disclosures", "Security"],
              },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-[11px] font-bold uppercase tracking-widest text-white">
                  {col.title}
                </p>
                <ul className="mt-3 space-y-2">
                  {col.items.map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-[12.5px] text-slate-400 transition hover:text-white"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Footer auth CTA */}
          <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:flex-row sm:items-center">
            <p className="text-[13px] text-slate-300">
              Ready to open your PrimeStone Capital account?
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/login"
                className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-[12.5px] font-semibold text-white transition hover:bg-white/10"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-white px-4 py-2 text-[12.5px] font-semibold text-[#0b1a3a] transition hover:bg-blue-50"
              >
                Open account
              </Link>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-[11px] text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>
              © {new Date().getFullYear()} PrimeStone Capital. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
