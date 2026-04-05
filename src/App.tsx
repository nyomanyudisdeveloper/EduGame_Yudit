import { BrowserRouter, Route, Routes } from "react-router-dom";
import DashboardScreen from "./screens/dashboard";
import BeeBotScreen from "./screens/game/beeBot";
import LoginScreen from "./screens/login";
import DetailGameScreen from "./screens/detailGame";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicLayout from "./layout/PublicLayout";
import PrivateLayout from "./layout/privateLayout";
import GameSession from "./screens/gameSession";
import JoinGameScreen from "./screens/joinGame";
import BeeBotTrialScreen from "./screens/game/beeBotTrial";
import GameSessionDetailScreen from "./screens/gameSessionDetail";



const App = () => {// Use VITE_ prefix for Vite
  return (
    <BrowserRouter>
        <Routes>

        {/* PUBLIC ROUTES */}
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/bee-bot/trial" element={<BeeBotTrialScreen />} />
          <Route path="/bee-bot" element={<BeeBotScreen />} />
          <Route path="/join/:sessionId" element={<JoinGameScreen />} />
        </Route>

          {/* PRIVATE ROUTES */}
        <Route element={<PrivateLayout />}>
          <Route path="/detailGame/:id" element={<ProtectedRoute><DetailGameScreen /></ProtectedRoute>} />
          <Route path="/" element={<ProtectedRoute><DashboardScreen /></ProtectedRoute>} />
          <Route path="/game-session" element={<ProtectedRoute><GameSession /></ProtectedRoute>} />
          <Route path="/game-session/:id" element={<ProtectedRoute><GameSessionDetailScreen /></ProtectedRoute>} />
        </Route>

         
          
        </Routes>
    </BrowserRouter>
  );
} 

export default App;