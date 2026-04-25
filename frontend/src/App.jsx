import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import CreateAppointment from './pages/CreateAppointment';
import EditAppointment from './pages/EditAppointment';
import Queue from './pages/Queue';
import QueueArchive from './pages/QueueArchive';
import Doctors from './pages/Doctors';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#F5F4F0]">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
            <Route path="/appointments/new" element={<ProtectedRoute><CreateAppointment /></ProtectedRoute>} />
            <Route path="/appointments/:id/edit" element={<ProtectedRoute><EditAppointment /></ProtectedRoute>} />
            <Route path="/queue" element={<ProtectedRoute><Queue /></ProtectedRoute>} />
            <Route path="/queue/archive" element={
              <ProtectedRoute roles={['staff', 'admin']}><QueueArchive /></ProtectedRoute>
            } />
            <Route path="/doctors" element={
              <ProtectedRoute roles={['admin']}><Doctors /></ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
