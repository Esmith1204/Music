import { createBrowserRouter, Link } from "react-router";
import { PublicOnly, RequireAuth, RequireNoProfile } from "./components/AuthGuards";
import { Layout } from "./components/Layout";
import { CreateRatingPage } from "./pages/CreateRatingPage";
import { LoginPage } from "./pages/LoginPage";
import { PeoplePage } from "./pages/PeoplePage";
import { MyProfileRedirect, ProfileRoute } from "./pages/ProfilePage";
import { SignUpPage } from "./pages/SignUpPage";
import { TimelinePage } from "./pages/TimelinePage";
import { WelcomePage } from "./pages/WelcomePage";

export const router = createBrowserRouter([
  { path: "/login", element: <PublicOnly><LoginPage /></PublicOnly> },
  { path: "/signup", element: <PublicOnly><SignUpPage /></PublicOnly> },
  { path: "/welcome", element: <RequireNoProfile><WelcomePage /></RequireNoProfile> },
  {
    path: "/",
    // Everything below requires an account; signed-out visitors land on /login.
    element: (
      <RequireAuth>
        <Layout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <TimelinePage /> },
      { path: "rate", element: <CreateRatingPage /> },
      { path: "people", element: <PeoplePage /> },
      { path: "profile", element: <MyProfileRedirect /> },
      { path: "u/:handle", element: <ProfileRoute /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

function NotFound() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-24 text-center">
      <p className="font-serif text-4xl">Page not found.</p>
      <Link to="/" className="eyebrow mt-8 inline-block bg-ink px-5 py-3 text-paper">
        Back to timeline
      </Link>
    </div>
  );
}
