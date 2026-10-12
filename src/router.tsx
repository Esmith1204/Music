import { createBrowserRouter, Link } from "react-router";
import { Layout } from "./components/Layout";
import { CreateRatingPage } from "./pages/CreateRatingPage";
import { MyProfileRedirect, ProfileRoute } from "./pages/ProfilePage";
import { TimelinePage } from "./pages/TimelinePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <TimelinePage /> },
      { path: "rate", element: <CreateRatingPage /> },
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
