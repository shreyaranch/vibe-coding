import { StrictMode, Suspense, lazy, useEffect, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import "@fontsource-variable/inter";
import "@fontsource-variable/manrope";
import "./index.css";
import { ApiError } from "./lib/api";
import { SignUpPromptProvider, applyAppearance, getAppearance, isGuestMode, useAppearance, useMe } from "./lib/session";
import { AppShell } from "./components/AppShell";
import { SignUpPromptSheet } from "./components/Sheets";
import { Spinner } from "./components/ui";
import Home from "./pages/Home";

applyAppearance(getAppearance());

const Welcome = lazy(() => import("./pages/Welcome"));
const Auth = lazy(() => import("./pages/Auth"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Discover = lazy(() => import("./pages/Discover"));
const SearchPage = lazy(() => import("./pages/Search"));
const Topic = lazy(() => import("./pages/Topic"));
const PostDetail = lazy(() => import("./pages/PostDetail"));
const Article = lazy(() => import("./pages/Article"));
const Profile = lazy(() => import("./pages/Profile"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const Saved = lazy(() => import("./pages/Saved"));
const PublisherProfile = lazy(() => import("./pages/PublisherProfile"));
const Inbox = lazy(() => import("./pages/Inbox"));
const SettingsPage = lazy(() => import("./pages/Settings"));
const Create = lazy(() => import("./pages/Create"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (n, e) => !(e instanceof ApiError && e.status >= 400 && e.status < 500) && n < 2,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

function Loading() {
  return <div className="flex h-full min-h-[50vh] items-center justify-center"><Spinner /></div>;
}

/** First visit goes to Welcome; signed-in readers who haven't finished onboarding go there. */
function Gate({ children }: { children: ReactNode }) {
  const { me, loading } = useMe();
  const loc = useLocation();
  if (loading) return <div className="flex h-dvh items-center justify-center bg-navy"><Spinner className="text-white" /></div>;
  if (me && !me.onboarded) return <Navigate to="/onboarding" replace />;
  if (!me && !isGuestMode() && loc.pathname === "/" && !loc.search) return <Navigate to="/welcome" replace />;
  return <>{children}</>;
}

function RequireUser({ children }: { children: ReactNode }) {
  const { me } = useMe();
  const loc = useLocation();
  if (!me) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname)}`} replace />;
  return <>{children}</>;
}

function ScrollReset() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.getElementById("main")?.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

function App() {
  useAppearance();
  return (
    <>
      <ScrollReset />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/signup" element={<Auth mode="signup" />} />
          <Route path="/onboarding" element={<RequireUser><Onboarding /></RequireUser>} />
          <Route element={<Gate><AppShell /></Gate>}>
            <Route index element={<Home />} />
            <Route path="discover" element={<Discover />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="topic/:slug" element={<Topic />} />
            <Route path="post/:id" element={<PostDetail />} />
            <Route path="article/:id" element={<Article />} />
            <Route path="u/:username" element={<Profile />} />
            <Route path="profile" element={<ProfileRedirect />} />
            <Route path="profile/edit" element={<RequireUser><EditProfile /></RequireUser>} />
            <Route path="saved" element={<RequireUser><Saved /></RequireUser>} />
            <Route path="p/:handle" element={<PublisherProfile />} />
            <Route path="inbox" element={<Inbox />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="create" element={<Create />} />
            <Route path="admin" element={<RequireUser><Admin /></RequireUser>} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
      <SignUpPromptSheet />
      <Toaster position="top-center" theme="system" richColors closeButton />
    </>
  );
}

function ProfileRedirect() {
  const { me } = useMe();
  if (!me) return <Navigate to="/login?next=/profile" replace />;
  return <Navigate to={`/u/${me.username}`} replace />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SignUpPromptProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SignUpPromptProvider>
    </QueryClientProvider>
  </StrictMode>,
);
