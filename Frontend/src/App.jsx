// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth Pages
import LoginForm from './pages/Auth/LoginForm';
import ResetPassword from './pages/Auth/ResetPassword';

// Student Pages
import StudentDashboard from './pages/Student/StudentDashboard';
import ViewAssignments from './pages/Student/ViewAssignments';
import SubmitAssignment from './pages/Student/SubmitAssignment';
import StudentFeedback from './pages/Student/StudentFeedback';
import ContactAdmin from './pages/Student/ContactAdmin';

// Teacher Pages
import TeacherDashboard from './pages/Teacher/TeacherDashboard';
import CreateAssignment from './pages/Teacher/CreateAssignment';
import ViewSubmissions from './pages/Teacher/ViewSubmissions';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManagement from './pages/Admin/UserManagement';
import ViewFeedback from './pages/Admin/ViewFeedback';
import ViewMessages from './pages/Admin/ViewMessages';

// Common Pages
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Student Routes - Protected */}
          <Route
            path="/student/*"
            element={
              <ProtectedRoute requiredRole="student">
                <Routes>
                  <Route path="/" element={<StudentDashboard />} />
                  <Route path="/assignments" element={<ViewAssignments />} />
                  <Route path="/submit/:assignmentId" element={<SubmitAssignment />} />
                  <Route path="/feedback" element={<StudentFeedback />} />
                  <Route path="/contact-admin" element={<ContactAdmin />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* Teacher Routes - Protected */}
          <Route
            path="/teacher/*"
            element={
              <ProtectedRoute requiredRole="teacher">
                <Routes>
                  <Route path="/" element={<TeacherDashboard />} />
                  <Route path="/create-assignment" element={<CreateAssignment />} />
                  <Route path="/submissions/:assignmentId" element={<ViewSubmissions />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes - Protected */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredRole="admin">
                <Routes>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="/users" element={<UserManagement />} />
                  <Route path="/feedback" element={<ViewFeedback />} />
                  <Route path="/messages" element={<ViewMessages />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;