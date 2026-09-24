import { Buildings } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout, isLoading, isAdmin } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
            <Buildings className="size-6 text-primary" />
            <span>Myanmar Property Portal</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" nativeButton={false} render={<Link to="/" />}>
              Browse Listings
            </Button>
            {!isLoading && user ? (
              <>
                <Button variant="ghost" nativeButton={false} render={<Link to="/listings/new" />}>
                  Post a Listing
                </Button>
                <Button variant="ghost" nativeButton={false} render={<Link to="/my-listings" />}>
                  My Listings
                </Button>
                {isAdmin && (
                  <Button variant="ghost" nativeButton={false} render={<Link to="/admin" />}>
                    Admin
                  </Button>
                )}
                <span className="hidden text-sm text-muted-foreground sm:inline">
                  Hi, {user.name}
                </span>
                <Button variant="outline" onClick={handleLogout}>
                  Log out
                </Button>
              </>
            ) : !isLoading ? (
              <>
                <Button variant="ghost" nativeButton={false} render={<Link to="/login" />}>
                  Log in
                </Button>
                <Button nativeButton={false} render={<Link to="/register" />}>
                  Sign up
                </Button>
              </>
            ) : null}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        Myanmar Property Portal &mdash; Yangon &middot; Mandalay &middot; Bago
      </footer>
    </div>
  );
}
