import { BrowserRouter, Routes, Route } from "react-router-dom" 
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Register from "./pages/Register"
import InterviewSetup from "./pages/InterviewSetup"
import Interview from "./pages/Interview"
import InterviewResults from "./pages/InterviewResults"
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />}/>
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/interview/setup" element={<ProtectedRoute><InterviewSetup /></ProtectedRoute>} />
        <Route path="/interview/:id" element={<ProtectedRoute><Interview /></ProtectedRoute>} />
        <Route path="/interview/:id/results" element={<ProtectedRoute><InterviewResults /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App