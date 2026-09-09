// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import Home from './pages/General/Home';

// Auth Pages
import LoginForm from './pages/Auth/LoginForm';
import Register from './pages/Auth/Register';
import ResetPassword from './pages/Auth/ResetPassword';

// Student Pages
import StudentDashboard from './pages/Student/StudentDashboard';
import ViewAssignments from './pages/Student/ViewAssignments';
import SubmitAssignment from './pages/Student/SubmitAssignment';
import DownStudyMaterial from './pages/Student/DownStudyMaterial';
import StudentFeedback from './pages/Student/StudentFeedback';
import MyProfile from './pages/Student/MyProfile';
import ChangePassword from './pages/Student/ChangePassword';
import ContactAdmin from './pages/Student/ContactAdmin';
import Courses from './pages/Student/Courses';
import PersonalNotes from './pages/Student/PersonalNotes';
import GlobalSearch from './pages/Student/GlobalSearch';
import Quizzes from './pages/Student/Quizzes';
import Bookmarks from './pages/Student/Bookmarks';
import ProgressTracking from './pages/Student/ProgressTracking';
import NotificationsFeed from './pages/Student/NotificationsFeed';
import AICoach from './pages/Student/AICoach';
import AIRecommendations from './pages/Student/AIRecommendations';
import WeakTopicDetector from './pages/Student/WeakTopicDetector';
import StudentQuestions from './pages/Student/StudentQuestions';
import ApplyLeave from './pages/Student/ApplyLeave';

// Teacher Pages
import TeacherDashboard from './pages/Teacher/TeacherDashboard';
import CreateAssignment from './pages/Teacher/CreateAssignment';
import ViewSubmissions from './pages/Teacher/ViewSubmissions';
import ManageCourses from './pages/Teacher/ManageCourses';
import CreateCourse from './pages/Teacher/CreateCourse';
import ManageStudents from './pages/Teacher/ManageStudents';
import ManageAssignments from './pages/Teacher/ManageAssignments';
import TeacherQuestions from './pages/Teacher/TeacherQuestions';
import TeacherLeaves from './pages/Teacher/TeacherLeaves';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManagement from './pages/Admin/UserManagement';
import NotificationManagement from './pages/Admin/NotificationManagement';
import EnquiryManagement from './pages/Admin/EnquiryManagement';
import UploadStudyMaterial from './pages/Admin/UploadStudyMaterial';
import ViewFeedback from './pages/Admin/ViewFeedback';
import ViewMessages from './pages/Admin/ViewMessages';
import SendEmail from './pages/Admin/SendEmail';
import PlatformAnalytics from './pages/Admin/PlatformAnalytics';
import SystemHealth from './pages/Admin/SystemHealth';
import LeaveManagement from './pages/Admin/LeaveManagement';

// Common Components & Pages
import ErrorBoundary from './components/common/ErrorBoundary';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ErrorBoundary>
      <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<Register />} />
          <Route path="/registration" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Student Routes - Protected */}
          <Route
            path="/student/*"
            element={
              <ProtectedRoute requiredRole="student">
                <Routes>
                  <Route path="/" element={<StudentDashboard />} />
                  <Route path="/ai-coach" element={<AICoach />} />
                  <Route path="/ai-recommendations" element={<AIRecommendations />} />
                  <Route path="/weak-topics" element={<WeakTopicDetector />} />
                  <Route path="/courses" element={<Courses />} />
                  <Route path="/quizzes" element={<Quizzes />} />
                  <Route path="/progress" element={<ProgressTracking />} />
                  <Route path="/bookmarks" element={<Bookmarks />} />
                  <Route path="/notifications-feed" element={<NotificationsFeed />} />
                  <Route path="/notes" element={<PersonalNotes />} />
                  <Route path="/search" element={<GlobalSearch />} />
                  <Route path="/assignments" element={<ViewAssignments />} />
                  <Route path="/submit/:assignmentId" element={<SubmitAssignment />} />
                  <Route path="/questions" element={<StudentQuestions />} />
                  <Route path="/study-material" element={<DownStudyMaterial />} />
                  <Route path="/feedback" element={<StudentFeedback />} />
                  <Route path="/profile" element={<MyProfile />} />
                  <Route path="/change-password" element={<ChangePassword />} />
                  <Route path="/contact-admin" element={<ContactAdmin />} />
                  <Route path="/leave" element={<ApplyLeave />} />
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
                  <Route path="/students" element={<ManageStudents />} />
                  <Route path="/courses" element={<ManageCourses />} />
                  <Route path="/create-course" element={<CreateCourse />} />
                  <Route path="/assignments" element={<ManageAssignments />} />
                  <Route path="/create-assignment" element={<CreateAssignment />} />
                  <Route path="/submissions/:assignmentId" element={<ViewSubmissions />} />
                  <Route path="/questions" element={<TeacherQuestions />} />
                  <Route path="/leave" element={<TeacherLeaves />} />
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
                  <Route path="/analytics" element={<PlatformAnalytics />} />
                  <Route path="/health" element={<SystemHealth />} />
                  <Route path="/users" element={<UserManagement />} />
                  <Route path="/notifications" element={<NotificationManagement />} />
                  <Route path="/enquiries" element={<EnquiryManagement />} />
                  <Route path="/study-material" element={<UploadStudyMaterial />} />
                  <Route path="/leaves" element={<LeaveManagement />} />
                  <Route path="/feedback" element={<ViewFeedback />} />
                  <Route path="/messages" element={<ViewMessages />} />
                  <Route path="/send-email" element={<SendEmail />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
    </ErrorBoundary>
  );
}

export default App;