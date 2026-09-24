import { Route, Routes } from "react-router-dom";
import { Layout } from "@/components/layout";
import { RequireAdmin, RequireAuth } from "@/components/require-auth";
import AdminPage from "@/pages/admin";
import HomePage from "@/pages/home";
import ListingDetailPage from "@/pages/listing-detail";
import LoginPage from "@/pages/login";
import MyListingsPage from "@/pages/my-listings";
import NewListingPage from "@/pages/new-listing";
import RegisterPage from "@/pages/register";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/listings/:id" element={<ListingDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/listings/new"
          element={
            <RequireAuth>
              <NewListingPage />
            </RequireAuth>
          }
        />
        <Route
          path="/my-listings"
          element={
            <RequireAuth>
              <MyListingsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

function NotFound() {
  return (
    <div className="py-24 text-center">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="mt-2 text-muted-foreground">
        The page you are looking for doesn't exist.
      </p>
    </div>
  );
}
