import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import ApplicationPage from "@/pages/ApplicationPage";
import PaymentPage from "@/pages/PaymentPage";
import ConfirmationPage from "@/pages/ConfirmationPage";

function App() {
  return (
    <div>
      <div className="noise-overlay" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/apply" element={<ApplicationPage />} />
          <Route path="/payment/:appId" element={<PaymentPage />} />
          <Route path="/confirmation/:appId" element={<ConfirmationPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
