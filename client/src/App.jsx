// import {
//   BrowserRouter,
//   Navigate,
//   Route,
//   Routes,
//   Outlet,
// } from "react-router-dom";
// import LandingPage from "./pages/LandingPage";
// import AppLayout from "./components/AppLayout";
// import AppmobileLayout from "./components/AppmobileLayout";
// import AdminLayout from "./components/AdminLayout";
// import { AuthProvider, useAuth } from "./context/AuthContext";
// import ProtectedRoute from "./components/ProtectedRoute";
// import AdminDashboard from "./pages/AdminDashboard";
// import AdminDeposits from "./pages/AdminDeposits";
// import AdminRoute from "./components/AdminRoute";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Dashboard from "./pages/Dashboard";
// import Deposit from "./pages/Deposit";
// import ATMCard from "./pages/ATMCard";
// import ATMCardPayment from "./pages/ATMCardPayment";
// import AdminATMCardReviews from "./pages/AdminATMCardReviews";
// import TaxPin from "./pages/TaxPin";
// import Remittance from "./pages/Remittance";
// import AdminRemittances from "./pages/AdminRemittances";
// import AdminTaxPins from "./pages/AdminTaxPins";
// import AdminUsers from "./pages/AdminUsers";
// import Withdrawal from "./pages/Withdrawal";
// import MyRequests from "./pages/MyRequests";
// import Investments from "./pages/Investments";
// import AdminInvestments from "./pages/AdminInvestments";
// import AdminPaymentInstructions from "./pages/AdminPaymentInstructions";

// function PublicRoute({ children }) {
//   const { user, loading } = useAuth();
//   if (loading) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         Checking your session...
//       </div>
//     );
//   }
//   if (user) return <Navigate to="/dashboard" replace />;
//   return children;
// }

// function AppRoutes() {
//   return (
//     <Routes>
//       <Route path="/" element={<Navigate to="/dashboard" replace />} />

//       {/* Auth */}
//       <Route
//         path="/login"
//         element={
//           <PublicRoute>
//             <Login />
//           </PublicRoute>
//         }
//       />
//       <Route
//         path="/register"
//         element={
//           <PublicRoute>
//             <Register />
//           </PublicRoute>
//         }
//       />

//       {/* Admin — one layout route, children swap only */}
//       <Route
//         element={
//           <ProtectedRoute>
//             <AdminRoute>
//               <AdminLayout />
//             </AdminRoute>
//           </ProtectedRoute>
//         }
//       >
//         <Route path="/admin" element={<AdminDashboard />} />
//         <Route path="/admin/deposits" element={<AdminDeposits />} />
//         <Route path="/admin/atm-cards" element={<AdminATMCardReviews />} />
//         <Route path="/admin/remittances" element={<AdminRemittances />} />
//         <Route path="/admin/tax-pins" element={<AdminTaxPins />} />
//         <Route path="/admin/users" element={<AdminUsers />} />
//         <Route path="/admin/investments" element={<AdminInvestments />} />
//         <Route
//           path="/admin/payment-instructions"
//           element={<AdminPaymentInstructions />}
//         />
//       </Route>

//       {/* User app */}
//       <Route
//         element={
//           <ProtectedRoute>

//               <AppLayout>
//                 <AppmobileLayout>
//                 <Outlet />
//               </AppmobileLayout>
//               </AppLayout>

//           </ProtectedRoute>
//         }
//       >
//         <Route path="/dashboard" element={<Dashboard />} />
//         <Route path="/investments" element={<Investments />} />
//         <Route path="/deposit" element={<Deposit />} />
//         <Route path="/withdrawal" element={<Withdrawal />} />
//         <Route path="/my-requests" element={<MyRequests />} />
//         <Route path="/atm-card" element={<ATMCard />} />
//         <Route path="/atm-card/payment/:id" element={<ATMCardPayment />} />
//         <Route path="/remittance" element={<Remittance />} />
//         <Route path="/tax-pin" element={<TaxPin />} />
//       </Route>

//       <Route path="*" element={<Navigate to="/" replace />} />
//     </Routes>
//   );
// }

// function App() {
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <AppRoutes />
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }

// export default App;
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  Outlet,
} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AppLayout from "./components/AppLayout";
import AppmobileLayout from "./components/AppmobileLayout";
import AdminLayout from "./components/AdminLayout";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import AdminDeposits from "./pages/AdminDeposits";
import AdminRoute from "./components/AdminRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Support from "./pages/Support";
import Settings from "./pages/Settings";
import Deposit from "./pages/Deposit";
import ATMCard from "./pages/ATMCard";
import ATMCardPayment from "./pages/ATMCardPayment";
import AdminATMCardReviews from "./pages/AdminATMCardReviews";
import TaxPin from "./pages/TaxPin";
import Remittance from "./pages/Remittance";
import AdminRemittances from "./pages/AdminRemittances";
import AdminTaxPins from "./pages/AdminTaxPins";
import AdminUsers from "./pages/AdminUsers";
import Withdrawal from "./pages/Withdrawal";
import MyRequests from "./pages/MyRequests";
import Investments from "./pages/Investments";
import AdminInvestments from "./pages/AdminInvestments";
import AdminPaymentInstructions from "./pages/AdminPaymentInstructions";

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Checking your session...
      </div>
    );
  }
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

// Landing route — shows landing for guests, redirects logged-in users
function LandingRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Checking your session...
      </div>
    );
  }
  if (user) return <Navigate to="/dashboard" replace />;
  return <LandingPage />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Landing page at root — public */}
      <Route path="/" element={<LandingRoute />} />

      {/* Auth */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Admin — one layout route, children swap only */}
      <Route
        element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/deposits" element={<AdminDeposits />} />
        <Route path="/admin/atm-cards" element={<AdminATMCardReviews />} />
        <Route path="/admin/remittances" element={<AdminRemittances />} />
        <Route path="/admin/tax-pins" element={<AdminTaxPins />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/investments" element={<AdminInvestments />} />
        <Route
          path="/admin/payment-instructions"
          element={<AdminPaymentInstructions />}
        />
      </Route>

      {/* User app */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout>
              <AppmobileLayout>
                <Outlet />
              </AppmobileLayout>
            </AppLayout>
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/support" element={<Support />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/investments" element={<Investments />} />
        <Route path="/deposit" element={<Deposit />} />
        <Route path="/withdrawal" element={<Withdrawal />} />
        <Route path="/my-requests" element={<MyRequests />} />
        <Route path="/cards" element={<ATMCard />} />
        <Route path="/cards/payment/:id" element={<ATMCardPayment />} />
        <Route path="/remittance" element={<Remittance />} />
        <Route path="/tax-pin" element={<TaxPin />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;