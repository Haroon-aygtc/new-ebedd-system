import { Suspense, lazy } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import InterfaceController from "./components/InterfaceController";
import { Toaster } from "./components/ui/toaster";
import routes from "tempo-routes";

// Lazy load the BrowserDemo component
const BrowserDemo = lazy(() => import("./components/BrowserDemo"));

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        {/* Tempo routes for storyboards */}
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}

        <Routes>
          <Route path="/" element={<InterfaceController />} />
          <Route path="/browser-demo" element={<BrowserDemo />} />
          {/* Add more routes as needed */}
          {import.meta.env.VITE_TEMPO === "true" && (
            <Route path="/tempobook/*" />
          )}
        </Routes>

        <Toaster />
      </>
    </Suspense>
  );
}

export default App;
