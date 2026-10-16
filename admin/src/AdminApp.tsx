import { Navigate, Route, Routes } from "react-router-dom";
import AdminContacts from "../Contacts";
import AdminFeedbacks from "../Feedbacks";
import AdminGuard from "./AdminGuard";
import AdminInvitation from "./AdminInvitation";
import AdminLogin from "./AdminLogin";
import AdminSignup from "./AdminSignup";
import NotFound from "./NotFound";

export default function AdminApp() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/signup" element={<AdminSignup />} />
      <Route element={<AdminGuard />}>
        <Route path="/" element={<AdminContacts />} />
        <Route path="/contacts" element={<AdminContacts />} />
        <Route path="/feedback" element={<AdminFeedbacks />} />
        <Route path="/invite" element={<AdminInvitation />} />
      </Route>
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}