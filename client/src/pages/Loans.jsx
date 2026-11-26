import {
  ArrowRight,
  Building2,
  Car,
  Check,
  ChevronDown,
  FileCheck2,
  Headphones,
  Heart,
  Home,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const APPLICATION_PATH = "/loan-application";
// Set this to your support route (e.g. "/support") to show a contact link.
const SUPPORT_PATH = "";

const documents = [
  { title: "Valid identification", detail: "A current ID document" },
  { title: "Proof of income", detail: "Shows what you earn" },
  { title: "Address verification", detail: "Confirms where you live" },
];

const loanTypes = [
  {
    title: "Personal Home Loans",
    description: "Buy, renovate or improve a property.",
    icon: Home,
  },
  {
    title: "Automobile Loans",
    description: "Finance the purchase of your next vehicle.",
    icon: Car,
  },
  {
    title: "Business Loans",
    description: "Support your business development and expansion.",
    icon: Building2,
  },
  {
    title: "Joint Mortgage",
    description:
      "Finance a property with a co-borrower and share responsibility.",
    icon: Users,
  },
  {
    title: "Secured Overdraft",
    description: "Short-term financing backed by eligible assets.",
    icon: Wallet,
  },
  {
    title: "Health Finance",
    description: "Support for eligible healthcare expenses.",
    icon: Heart,
  },
];

const steps = [
  {
    title: "Choose your loan",
    description: "Pick the financing option that matches your needs.",
  },
  {
    title: "Submit your application",
    description:
      "Provide the required information and supporting documents for assessment.",
  },
  {
    title: "Get a decision",
    description:
      "We assess your application and share the outcome through your account.",
  },
];

const benefits = [
  {
    title: "Straightforward process",
    description: "A clear application that makes requesting financing simple.",
    icon: FileCheck2,
  },
  {
    title: "Personalised options",
    description: "Financing based on your needs and application details.",
    icon: SlidersHorizontal,
  },
  {
    title: "Secure applications",
    description:
      "Your personal information is handled with appropriate security measures.",
    icon: ShieldCheck,
  },
  {
    title: "Dedicated support",
    description: "Get help throughout your application and review.",
    icon: Headphones,
  },
];

const faqs = [
  {
    question: "What documents do I need to apply?",
    answer:
      "You may need a valid identification document, proof of income and address verification. Additional documents may be required depending on the loan.",
  },
  {
    question: "How long does the application process take?",
    answer:
      "It depends on the loan type, how complete your application is and verification requirements. You can follow your application status in your account.",
  },
  {
    question: "Can I apply for more than one loan?",
    answer:
      "This depends on your existing obligations, your application details and the institution's lending criteria.",
  },
  {
    question: "How will I know if my loan is approved?",
    answer:
      "You will receive an update through your registered account once your application has been reviewed and a decision made.",
  },
];

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

const container = "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8";

export default function Loans() {
  return (
    <main className="min-h-screen bg-slate-50 pb-12 text-slate-600">
      <Hero />
      <LoanOptions />
      <Faq />
      <ClosingCta />
    </main>
  );
}

function Hero() {
  return (
    <section aria-labelledby="loans-title" className=" text-slate-800">
      <div
        className={`${container} grid items-center gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16 lg:py-20`}
      >
      

        <div className="text-slate-600  sm:p-8">
          <h1 className="font-bold text-lg text-slate-800">Find the right loan for your plans</h1>
    
          <ul className="mt-5 divide-y divide-slate-100">
            {documents.map(({ title, detail }) => (
              <li
                key={title}
                className="flex items-start gap-3 py-4 first:pt-0"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Check size={14} strokeWidth={3} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {title}
                  </p>
                  <p className="text-sm">{detail}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="rounded-lg bg-slate-50 p-3 text-sm leading-6">
            Some loans may require additional documents.
          </p>
        </div>
      </div>
    </section>
  );
}

function LoanOptions() {
  return (
    <section
      id="loan-types"
      aria-labelledby="loan-types-title"
      className={`${container} scroll-mt-6 py-5 sm:py-20`}
    >
      <SectionHeading
        id="loan-types-title"
        title="Choose a loan"
        
      />

      <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loanTypes.map(({ title, description, icon: Icon }) => (
          <li key={title}>
            <Link
              to={APPLICATION_PATH}
              state={{ loanType: title }}
              className={`group flex h-full flex-col    p-6 transition hover:shadow-md ${focusRing}`}
            >
            
              <h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3>
              <p className="mt-2 flex-1 text-sm leading-6">{description}</p>
 
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}


function Benefits() {
  return (
    <section
      aria-labelledby="benefits-title"
      className={`${container} py-14 sm:py-20`}
    >
      <SectionHeading id="benefits-title" title="Why apply with us" />

      <ul className="mt-8 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map(({ title, description, icon: Icon }) => (
          <li key={title} className="border-t-2 border-slate-200 pt-5">
            <Icon size={24} aria-hidden="true" className="text-blue-700" />
            <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm leading-6">{description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section
      id="faqs"
      aria-labelledby="faq-title"
      className="border-y border-slate-200 bg-white py-14 sm:py-20"
    >
      <div
        className={`${container} grid gap-8 lg:grid-cols-[1fr_1.6fr] lg:gap-16`}
      >
        <div>
          <SectionHeading
            id="faq-title"
            title="Common questions"
            text="Quick answers about documents, timing and decisions."
          />
          <div className="mt-6 flex items-start gap-3">
            <Headphones
              size={22}
              aria-hidden="true"
              className="shrink-0 text-blue-700"
            />
            <div className="text-sm leading-6">
              <p className="font-semibold text-slate-900">Still need help?</p>
              <p>Our customer support team can assist you.</p>
              {SUPPORT_PATH && (
                <Link
                  to={SUPPORT_PATH}
                  className={`mt-1 inline-block font-semibold text-blue-700 underline ${focusRing}`}
                >
                  Contact support
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {faqs.map(({ question, answer }, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={question}>
                <h3>
                  <button
                    type="button"
                    id={`faq-button-${index}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${index}`}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className={`flex w-full items-center justify-between gap-4 py-5 text-left text-base font-semibold text-slate-900 hover:text-blue-700 ${focusRing}`}
                  >
                    {question}
                    <ChevronDown
                      size={20}
                      aria-hidden="true"
                      className={`shrink-0 text-blue-700 transition-transform motion-reduce:transition-none ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </h3>
                <div
                  id={`faq-panel-${index}`}
                  role="region"
                  aria-labelledby={`faq-button-${index}`}
                  hidden={!isOpen}
                >
                  <p className="max-w-2xl pb-5 text-sm leading-7">{answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section
      aria-labelledby="cta-title"
      className={`${container} pt-14 sm:pt-20`}
    >
      <div className="flex flex-col items-start justify-between gap-6 rounded-2xl p-6 sm:p-10 md:flex-row md:items-center">
        <Link
          to={APPLICATION_PATH}
          className={`inline-flex min-h-12 w-full shrink-0 items-center justify-center rounded-lg bg-[#0b3b8c] px-7 text-sm font-semibold text-white transition-colors hover:bg-blue-800 md:w-auto ${focusRing}`}
        >
          Start an application
        </Link>
      </div>
    </section>
  );
}

function SectionHeading({ id, title, text }) {
  return (
    <div>
      <h2
        id={id}
        className="text-2xl font-bold tracking-tight text-[#0b2545] sm:text-3xl"
      >
        {title}
      </h2>
      {text && <p className="mt-2 text-base leading-7">{text}</p>}
    </div>
  );
}

