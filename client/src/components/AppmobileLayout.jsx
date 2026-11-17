// import { useState, useEffect } from "react";
// import { NavLink, useNavigate, useLocation } from "react-router-dom";
// import {
//   ArrowDownToLine,
//   Settings,
//   TrendingUp,
//   Home,
// } from "lucide-react";
// import { useAuth } from "../context/AuthContext";

// // Bottom bar — the 4 most-used mobile tabs
// const mobileNav = [
//   { label: "Home", to: "/dashboard", icon: Home, end: true },
//   { label: "Invest", to: "/investments", icon: TrendingUp },
//   { label: "Deposit", to: "/deposit", icon: ArrowDownToLine },
//   { label: "Settings", to: "/my-requests", icon: Settings },
// ];

// export default function AppmobileLayout({ children }) {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { user } = useAuth();

//   const path = location.pathname;
//   const tab = new URLSearchParams(location.search).get("tab") || "overview";

//   const mobileIsActive = (to) => {
//     if (to === "/dashboard") {
//       return path === "/dashboard" && !location.search;
//     }
//     return path === to || path.startsWith(`${to}/`);
//   };

//   const activeMobileIndex = Math.max(
//     0,
//     mobileNav.findIndex(({ to }) => mobileIsActive(to)),
//   );

//   return (
//     <div className="min-h-screen bg-[#f6f8fb] text-slate-800">
//       {/* Main */}
//       <div>

//         <main className="">
//           <div className="mx-auto max-w-7xl">{children}</div>
//         </main>
//       </div>

//       {/* Mobile floating bottom navigation */}
//       <nav
//         aria-label="Primary"
//         className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
//       >
//         <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/40 bg-white/70 shadow-lg shadow-slate-900/10 backdrop-blur-xl">
//           {/* Sliding active pill */}
//           <div
//             className="pointer-events-none transition-transform duration-300 ease-out"
//             style={{
//               transform: `translateX(${activeMobileIndex * 100}%)`,
//             }}
//             aria-hidden="true"
//           />

//           <ul className="relative grid grid-cols-4">
//             {mobileNav.map(({ label, to, icon: Icon, end }, index) => {
//               const active = mobileIsActive(to);
//               return (
//                 <li key={label}>
//                   <NavLink
//                     to={to}
//                     end={end}
//                     className="group flex flex-col items-center justify-center gap-0.5 py-2.5 transition"
//                   >
//                     <span
//                       className={`flex h-7 w-7 items-center justify-center transition-colors duration-300 ${
//                         active ? "text-blue-500" : "text-slate-500"
//                       }`}
//                     >
//                       <Icon
//                         size={18}
//                         strokeWidth={
//                           active || index === activeMobileIndex ? 2.4 : 2
//                         }

//                       />
//                     </span>
//                     <span
//                       className={`text-[10px] font-semibold tracking-tight transition-colors duration-300 ${
//                         active ? "text-blue-500" : "text-slate-500"
//                       }`}
//                     >
//                       {label}
//                     </span>
//                   </NavLink>
//                 </li>
//               );
//             })}
//           </ul>
//         </div>
//       </nav>
//     </div>
//   );
// }

import { NavLink, useLocation } from "react-router-dom";
import {
  ArrowDownToLine,
  CreditCard,
  Settings,
  TrendingUp,
  Home,
} from "lucide-react";

const mobileNav = [
  { label: "Home", to: "/dashboard", icon: Home, end: true },
  { label: "Invest", to: "/investments", icon: TrendingUp },
  { label: "Deposit", to: "/deposit", icon: ArrowDownToLine },
  { label: "Cards", to: "/cards", icon: CreditCard },
  { label: "Settings", to: "/settings", icon: Settings },
];

export default function AppmobileLayout({ children }) {
  const location = useLocation();
  const path = location.pathname;

  
  const mobileIsActive = (to, end) => {
    if (end) return path === to;
    return path === to || path.startsWith(`${to}/`);
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-800">
      <main>
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
      >
        <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/40 bg-white/70 shadow-lg shadow-slate-900/10 backdrop-blur-xl">
          <ul className="relative grid grid-cols-5">
            {mobileNav.map(({ label, to, icon: Icon, end }) => {
              const active = mobileIsActive(to, end);

              return (
                <li key={label}>
                  <NavLink
                    to={to}
                    end={end}
                    className="group flex flex-col items-center justify-center gap-0.5 py-2.5 transition"
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center transition-colors duration-300 ${
                        active ? "text-[#1e3a8a]" : "text-black-200"
                      }`}
                    >
                      <Icon
                        size={18}
                        strokeWidth={active ? 2.4 : 2}
                        color="currentColor" // ✅ explicit, defeats any global svg { color } rule
                      />
                    </span>

                    <span
                      className={`text-[10px] font-semibold tracking-tight transition-colors duration-300 ${
                        active ? "text-[#1e3a8a]" : "text-black-200"
                      }`}
                    >
                      {label}
                    </span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </div>
  );
}