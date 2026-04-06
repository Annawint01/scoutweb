import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GatekeeperPage from "@/pages/GatekeeperPage";
import LandingPage from "@/pages/LandingPage";
import ApplicationPage from "@/pages/ApplicationPage";
import PaymentPage from "@/pages/PaymentPage";
import ConfirmationPage from "@/pages/ConfirmationPage";
import AdminPage from "@/pages/AdminPage";

function App() {
  return (
    <div>
      <div className="noise-overlay" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<GatekeeperPage />} />
          <Route path="/home" element={<LandingPage />} />
          <Route path="/apply" element={<ApplicationPage />} />
          <Route path="/payment/:appId" element={<PaymentPage />} />
          <Route path="/confirmation/:appId" element={<ConfirmationPage />} />
          <Route path="/council-access" element={<AdminPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;