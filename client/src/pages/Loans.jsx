// import {
//   ArrowRight,
//   Building2,
//   Car,
//   CheckCircle2,
//   Clock3,
//   FileCheck2,
//   Heart,
//   Home,
//   Percent,
//   ShieldCheck,
//   Users,
//   Wallet,
// } from "lucide-react";
// import { Link } from "react-router-dom";

// const benefits = [
//   {
//     title: "Quick Approval",
//     description: "Get a decision within hours and funds within days.",
//     icon: Clock3,
//   },
//   {
//     title: "Competitive Rates",
//     description: "Rates are tailored to your application and credit profile.",
//     icon: Percent,
//   },
//   {
//     title: "Simple Process",
//     description: "A straightforward application with minimal paperwork.",
//     icon: FileCheck2,
//   },
//   {
//     title: "Secure & Confidential",
//     description: "Your application is handled with care and privacy.",
//     icon: ShieldCheck,
//   },
// ];

// const loanTypes = [
//   {
//     title: "Personal Home Loans",
//     description: "Finance a home purchase or improvement project.",
//     icon: Home,
//   },
//   {
//     title: "Automobile Loans",
//     description: "Explore flexible financing for your next vehicle.",
//     icon: Car,
//   },
//   {
//     title: "Business Loans",
//     description: "Find financing options to support business growth.",
//     icon: Building2,
//   },
//   {
//     title: "Joint Mortgage",
//     description: "Apply with a co-borrower and share responsibility.",
//     icon: Users,
//   },
//   {
//     title: "Secured Overdraft",
//     description: "Request short-term access to funds with asset backing.",
//     icon: Wallet,
//   },
//   {
//     title: "Health Finance",
//     description: "Plan for eligible healthcare and medical expenses.",
//     icon: Heart,
//   },
// ];

// const steps = [
//   {
//     number: "01",
//     title: "Apply Online",
//     description:
//       "Complete the application with your details and loan requirements.",
//   },
//   {
//     number: "02",
//     title: "Quick Review",
//     description:
//       "Our team reviews your application and may request more information.",
//   },
//   {
//     number: "03",
//     title: "Approval & Disbursement",
//     description:
//       "Eligible applications can proceed to final review and disbursement.",
//   },
// ];

// const faqs = [
//   {
//     question: "What documents do I need to apply?",
//     answer:
//       "You may need identification, proof of income, and address verification. Additional documents depend on the selected facility.",
//   },
//   {
//     question: "How long does approval take?",
//     answer:
//       "Standard applications are typically processed within 1–3 business days, depending on verification requirements.",
//   },
// ];

// export default function Loans() {
//   return (
//     <div className="space-y-10 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
//       <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b1a3a] via-[#12366f] to-[#1d4ed8] px-6 py-10 text-white shadow-xl sm:px-10 sm:py-14">
//         <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border-[45px] border-white/5" />
//         <div className="relative max-w-2xl">
//           <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
//             Financing built around your goals
//           </p>
//           <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
//             Loan Services
//           </h1>
//           <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
//             Financial solutions to help you achieve your goals. Explore
//             available facilities and submit an application for review.
//           </p>
//           <Link
//             to="/loan-application"
//             className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0b3b8c] transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-900"
//           >
//             Apply for a Loan
//             <ArrowRight size={16} />
//           </Link>
//         </div>
//       </section>

     

//       <section aria-labelledby="loan-benefits-title">
//         <SectionHeading
//           eyebrow="Why choose us"
//           title="Why Choose Our Loan Services"
//           id="loan-benefits-title"
//         />
//         <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
//           {benefits.map(({ title, description, icon: Icon }) => (
//             <article
//               key={title}
//               className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
//             >
//               <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0b3b8c]">
//                 <Icon size={20} />
//               </span>
//               <h3 className="mt-4 text-sm font-bold text-slate-900">{title}</h3>
//               <p className="mt-2 text-sm leading-6 text-slate-600">
//                 {description}
//               </p>
//             </article>
//           ))}
//         </div>
//       </section>

//       <section id="loan-types" aria-labelledby="loan-types-title">
//         <div className="flex flex-wrap items-end justify-between gap-3">
//           <SectionHeading
//             eyebrow="Find the right fit"
//             title="Available Loan Types"
//             id="loan-types-title"
//           />
//           <a
//             href="#loan-types"
//             className="inline-flex items-center gap-1 text-sm font-semibold text-[#0b3b8c] hover:underline"
//           >
//             View all loan options
//             <ArrowRight size={15} />
//           </a>
//         </div>
//         <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
//           {loanTypes.map(({ title, description, icon: Icon }) => (
//             <article
//               key={title}
//               className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
//             >
//               <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
//                 <Icon size={20} />
//               </span>
//               <div>
//                 <h3 className="text-sm font-bold text-slate-900">{title}</h3>
//                 <p className="mt-1.5 text-sm leading-6 text-slate-600">
//                   {description}
//                 </p>
//               </div>
//             </article>
//           ))}
//         </div>
//       </section>

//       <section aria-labelledby="loan-steps-title">
//         <SectionHeading
//           eyebrow="From request to review"
//           title="How It Works"
//           id="loan-steps-title"
//         />
//         <div className="mt-5 grid gap-4 lg:grid-cols-3">
//           {steps.map(({ number, title, description }) => (
//             <article
//               key={number}
//               className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
//             >
//               <span className="text-sm font-bold tracking-widest text-blue-700">
//                 {number}
//               </span>
//               <h3 className="mt-3 text-base font-bold text-slate-900">
//                 {title}
//               </h3>
//               <p className="mt-2 text-sm leading-6 text-slate-600">
//                 {description}
//               </p>
//             </article>
//           ))}
//         </div>
//       </section>

//       <section id="faqs" aria-labelledby="loan-faq-title">
//         <div className="flex flex-wrap items-end justify-between gap-3">
//           <SectionHeading
//             eyebrow="Helpful information"
//             title="Frequently Asked Questions"
//             id="loan-faq-title"
//           />
//           <a
//             href="#faqs"
//             className="inline-flex items-center gap-1 text-sm font-semibold text-[#0b3b8c] hover:underline"
//           >
//             View all FAQs
//             <ArrowRight size={15} />
//           </a>
//         </div>
//         <div className="mt-5 grid gap-4 md:grid-cols-2">
//           {faqs.map(({ question, answer }) => (
//             <article
//               key={question}
//               className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
//             >
//               <h3 className="text-sm font-bold text-slate-900">{question}</h3>
//               <p className="mt-2 text-sm leading-6 text-slate-600">{answer}</p>
//             </article>
//           ))}
//         </div>
//       </section>

//       <section className="rounded-3xl border border-blue-100 bg-blue-50 px-6 py-8 text-center sm:px-10">
//         <CheckCircle2 className="mx-auto text-blue-700" size={26} />
//         <h2 className="mt-3 text-xl font-bold text-slate-900">
//           Ready to get started?
//         </h2>
//         <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
//           Apply now to submit your loan request for review.
//         </p>
//         <Link
//           to="/loan-application"
//           className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0b3b8c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#092f70]"
//         >
//           Apply for a Loan
//           <ArrowRight size={16} />
//         </Link>
//       </section>
//     </div>
//   );
// }

// function SectionHeading({ eyebrow, title, id }) {
//   return (
//     <div>
//       <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-700">
//         {eyebrow}
//       </p>
//       <h2 id={id} className="mt-1 text-xl font-bold text-slate-900">
//         {title}
//       </h2>
//     </div>
//   );
// }

// function InfoIcon() {
//   return (
//     <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800">
//       <ShieldCheck size={15} />
//     </span>
//   );
// }


import {
  ArrowRight,
  Building2,
  Car,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileCheck2,
  Heart,
  Home,
  Percent,
  ShieldCheck,
  Users,
  Wallet,
  Landmark,
  BadgeCheck,
  Headphones,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {motion} from "framer-motion";

const benefits = [
  {
    title: "Straightforward Process",
    description:
      "A clear application process designed to make requesting financing simple.",
    icon: FileCheck2,
  },
  {
    title: "Personalised Options",
    description:
      "Explore financing options based on your needs and application details.",
    icon: Percent,
  },
  {
    title: "Secure Applications",
    description:
      "Your personal information is handled with appropriate security measures.",
    icon: ShieldCheck,
  },
  {
    title: "Dedicated Support",
    description:
      "Get assistance throughout your application and review process.",
    icon: Headphones,
  },
];

const loanTypes = [
  {
    title: "Personal Home Loans",
    description:
      "Explore financing for home purchases, renovations and property improvements.",
    icon: Home,
    tag: "Personal",
  },
  {
    title: "Automobile Loans",
    description:
      "Find financing options to help you purchase your next vehicle.",
    icon: Car,
    tag: "Personal",
  },
  {
    title: "Business Loans",
    description:
      "Access financing solutions designed to support business development and expansion.",
    icon: Building2,
    tag: "Business",
  },
  {
    title: "Joint Mortgage",
    description:
      "Explore property financing with a co-borrower and shared responsibility.",
    icon: Users,
    tag: "Property",
  },
  {
    title: "Secured Overdraft",
    description: "Request short-term financing backed by eligible assets.",
    icon: Wallet,
    tag: "Flexible",
  },
  {
    title: "Health Finance",
    description: "Explore financial support for eligible healthcare expenses.",
    icon: Heart,
    tag: "Personal",
  },
];

const steps = [
  {
    number: "01",
    title: "Choose Your Loan",
    description:
      "Explore available financing options and select the facility that meets your needs.",
    icon: FileCheck2,
  },
  {
    number: "02",
    title: "Submit Your Application",
    description:
      "Provide the required information and supporting documents for assessment.",
    icon: ShieldCheck,
  },
  {
    number: "03",
    title: "Review & Decision",
    description:
      "Your application is assessed, and the outcome is communicated through your account.",
    icon: BadgeCheck,
  },
];

const faqs = [
  {
    question: "What documents do I need to apply?",
    answer:
      "You may need a valid identification document, proof of income and address verification. Additional documentation may be required depending on the loan facility.",
  },
  {
    question: "How long does the application process take?",
    answer:
      "Processing times depend on the loan type, completeness of your application and verification requirements. You can monitor your application status through your account.",
  },
  {
    question: "Can I apply for more than one loan?",
    answer:
      "Eligibility for multiple facilities depends on your existing obligations, application details and the institution's lending criteria.",
  },
  {
    question: "How will I know if my loan is approved?",
    answer:
      "You will receive an update through your registered account when your application has been reviewed and a decision has been made.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0 },
};

export default function Loans() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <main className="min-h-screen bg-[#f6f8fc] pb-12">
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#071b38]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(37,99,235,0.22),transparent_35%)]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:px-10 lg:py-24">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.7 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-4 py-2 text-xs font-semibold tracking-wide text-blue-200">
              <Sparkles size={14} />
              FINANCING SOLUTIONS
            </div>

            <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-[58px]">
              Move forward with
              <span className="text-blue-400"> confidence.</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-8 text-slate-300">
              Whether you're planning a home purchase, growing your business or
              managing important expenses, explore financing solutions designed
              around your goals.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                to="/loan-application"
                className="group inline-flex items-center gap-3 rounded-xl bg-blue-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition duration-300 hover:-translate-y-1 hover:bg-blue-500"
              >
                Start Your Application
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <a
                href="#loan-types"
                className="inline-flex items-center rounded-xl border border-white/20 px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Explore Loan Options
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-300">
              <span className="flex items-center gap-2">
                <ShieldCheck size={17} className="text-blue-400" />
                Secure applications
              </span>
              <span className="flex items-center gap-2">
                <LockKeyhole size={17} className="text-blue-400" />
                Confidential information
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94, x: 25 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute -inset-5 rounded-[35px] bg-blue-500/10 blur-2xl" />

            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur-sm">
              <img
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=85"
                alt="Modern residential property"
                className="h-[300px] w-full rounded-2xl object-cover sm:h-[390px]"
              />

              <div className="absolute bottom-7 left-7 right-7 rounded-2xl border border-white/30 bg-white/95 p-5 shadow-xl backdrop-blur-xl sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Financing that fits your plans
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-[#102542]">
                      Your next chapter starts here.
                    </h3>
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <Landmark size={24} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="relative z-10 mx-auto -mt-1 max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-3 sm:p-8">
          {[
            {
              icon: ShieldCheck,
              title: "Security First",
              text: "Your information matters.",
            },
            {
              icon: Clock3,
              title: "Clear Processes",
              text: "Know what to expect.",
            },
            {
              icon: Headphones,
              title: "Customer Support",
              text: "Assistance when needed.",
            },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <item.icon size={22} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BENEFITS */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
            The difference
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#102542] sm:text-4xl">
            A better way to approach financing
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-500">
            A structured experience that keeps you informed from the moment you
            apply through the review process.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {benefits.map(({ title, description, icon: Icon }, index) => (
            <motion.article
              key={title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group rounded-2xl border border-slate-200/80 bg-white p-6 transition-all duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white">
                <Icon size={23} />
              </div>
              <h3 className="mt-6 text-base font-bold text-[#102542]">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                {description}
              </p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* LOAN TYPES */}
      <section
        id="loan-types"
        className="border-y border-slate-200 bg-white py-20"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                Explore your options
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#102542] sm:text-4xl">
                Financing for life's priorities
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500">
                Discover our range of financing categories and find an option
                that aligns with your plans.
              </p>
            </div>
            <span className="text-sm font-semibold text-slate-400">
              06 Financing Categories
            </span>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {loanTypes.map(({ title, description, icon: Icon, tag }, index) => (
              <motion.article
                key={title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ delay: index * 0.08 }}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-[#fafcff] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaf1ff] text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white">
                    <Icon size={26} />
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {tag}
                  </span>
                </div>

                <h3 className="mt-7 text-lg font-bold text-[#102542]">
                  {title}
                </h3>
                <p className="mt-3 min-h-[72px] text-sm leading-7 text-slate-500">
                  {description}
                </p>

                <Link
                  to="/loan-application"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-700 transition group-hover:gap-3"
                >
                  Apply for this loan
                  <ArrowRight size={16} />
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
            Simple and transparent
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#102542] sm:text-4xl">
            How the process works
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500">
            Three clear steps to get your financing application underway.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map(({ number, title, description, icon: Icon }, index) => (
            <motion.article
              key={number}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ delay: index * 0.15 }}
              className="relative rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <Icon size={25} />
                </div>
                <span className="text-4xl font-bold text-slate-100">
                  {number}
                </span>
              </div>
              <h3 className="mt-7 text-lg font-bold text-[#102542]">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                {description}
              </p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-y border-slate-200 bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              Need clarification?
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-[#102542] sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mt-5 text-sm leading-7 text-slate-500">
              Find answers to common questions about our financing options and
              application process.
            </p>
            <div className="mt-8 flex items-center gap-3 rounded-xl bg-blue-50 p-4">
              <Headphones className="shrink-0 text-blue-700" size={23} />
              <div>
                <p className="text-sm font-bold text-[#102542]">
                  Need more assistance?
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Contact our customer support team.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {faqs.map(({ question, answer }, index) => (
              <div
                key={question}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                  aria-expanded={openFaq === index}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="text-sm font-bold text-[#102542]">
                    {question}
                  </span>
                  <ChevronDown
                    size={19}
                    className={`shrink-0 text-blue-700 transition-transform duration-300 ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`grid transition-all duration-300 ${
                    openFaq === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-7 text-slate-500">
                      {answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-7xl px-5 pt-20 sm:px-8 lg:px-10">
        <div className="relative overflow-hidden rounded-[28px] bg-[#09234b] px-7 py-14 text-center sm:px-12 sm:py-16">
          <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full border-[45px] border-white/[0.04]" />
          <div className="absolute -bottom-40 -left-20 h-80 w-80 rounded-full border-[45px] border-blue-400/[0.06]" />

          <div className="relative mx-auto max-w-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-blue-300">
              <Landmark size={27} />
            </div>

            <h2 className="mt-6 text-3xl font-bold text-white sm:text-4xl">
              Take the next step towards your goals.
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-blue-100/75">
              Explore your financing options and submit an application through
              our secure application process.
            </p>

            <Link
              to="/loan-application"
              className="mt-9 inline-flex items-center gap-3 rounded-xl bg-white px-7 py-4 text-sm font-bold text-[#09234b] transition hover:-translate-y-1 hover:bg-blue-50"
            >
              Begin Your Application
              <ArrowRight size={17} />
            </Link>

            <p className="mt-6 text-xs text-blue-200/60">
              All applications are subject to eligibility assessment and
              approval.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
