// frontend/src/App.jsx
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import PageLoader from './components/common/PageLoader';

// Public Pages
const Home = lazy(() => import('./pages/General/Home'));

// Auth Pages
const LoginForm = lazy(() => import('./pages/Auth/LoginForm'));
const Register = lazy(() => import('./pages/Auth/Register'));
const ResetPassword = lazy(() => import('./pages/Auth/ResetPassword'));

// Student Pages
const StudentDashboard = lazy(() => import('./pages/Student/StudentDashboard'));
const ViewAssignments = lazy(() => import('./pages/Student/ViewAssignments'));
const SubmitAssignment = lazy(() => import('./pages/Student/SubmitAssignment'));
const DownStudyMaterial = lazy(() => import('./pages/Student/DownStudyMaterial'));
const StudentFeedback = lazy(() => import('./pages/Student/StudentFeedback'));
const Courses = lazy(() => import('./pages/Student/Courses'));
const PersonalNotes = lazy(() => import('./pages/Student/PersonalNotes'));
const GlobalSearch = lazy(() => import('./pages/Student/GlobalSearch'));
const Quizzes = lazy(() => import('./pages/Student/Quizzes'));
const Bookmarks = lazy(() => import('./pages/Student/Bookmarks'));
const ProgressTracking = lazy(() => import('./pages/Student/ProgressTracking'));
const NotificationsFeed = lazy(() => import('./pages/Student/NotificationsFeed'));
const AICoach = lazy(() => import('./pages/Student/AICoach'));
const AIRecommendations = lazy(() => import('./pages/Student/AIRecommendations'));
const WeakTopicDetector = lazy(() => import('./pages/Student/WeakTopicDetector'));
const StudentQuestions = lazy(() => import('./pages/Student/StudentQuestions'));
const ApplyLeave = lazy(() => import('./pages/Student/ApplyLeave'));
const ContactAdmin = lazy(() => import('./pages/Student/ContactAdmin'));

// Teacher Pages
const TeacherDashboard = lazy(() => import('./pages/Teacher/TeacherDashboard'));
const CreateAssignment = lazy(() => import('./pages/Teacher/CreateAssignment'));
const ViewSubmissions = lazy(() => import('./pages/Teacher/ViewSubmissions'));
const ManageCourses = lazy(() => import('./pages/Teacher/ManageCourses'));
const CreateCourse = lazy(() => import('./pages/Teacher/CreateCourse'));
const ManageStudents = lazy(() => import('./pages/Teacher/ManageStudents'));
const ManageAssignments = lazy(() => import('./pages/Teacher/ManageAssignments'));
const TeacherQuestions = lazy(() => import('./pages/Teacher/TeacherQuestions'));
const TeacherLeaves = lazy(() => import('./pages/Teacher/TeacherLeaves'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/Admin/UserManagement'));
const NotificationManagement = lazy(() => import('./pages/Admin/NotificationManagement'));
const EnquiryManagement = lazy(() => import('./pages/Admin/EnquiryManagement'));
const UploadStudyMaterial = lazy(() => import('./pages/Admin/UploadStudyMaterial'));
const ViewFeedback = lazy(() => import('./pages/Admin/ViewFeedback'));
const ViewMessages = lazy(() => import('./pages/Admin/ViewMessages'));
const SendEmail = lazy(() => import('./pages/Admin/SendEmail'));
const PlatformAnalytics = lazy(() => import('./pages/Admin/PlatformAnalytics'));
const SystemHealth = lazy(() => import('./pages/Admin/SystemHealth'));
const LeaveManagement = lazy(() => import('./pages/Admin/LeaveManagement'));

// Settings & Common Pages
const Settings = lazy(() => import('./pages/Common/Settings'));
const Attendance = lazy(() => import('./pages/Common/Attendance'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
        <AuthProvider>
        <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<Register />} />
          <Route path="/registration" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Universal Settings Route */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

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
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Settings />} />
                  <Route path="/change-password" element={<Settings />} />
                  <Route path="/contact-admin" element={<ContactAdmin />} />
                  <Route path="/leave" element={<ApplyLeave />} />
                  <Route path="/attendance" element={<Attendance />} />
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
                  <Route path="/attendance" element={<Attendance />} />
                  <Route path="/settings" element={<Settings />} />
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
                  <Route path="/students" element={<ManageStudents />} />
                  <Route path="/notifications" element={<NotificationManagement />} />
                  <Route path="/enquiries" element={<EnquiryManagement />} />
                  <Route path="/study-material" element={<UploadStudyMaterial />} />
                  <Route path="/leaves" element={<LeaveManagement />} />
                  <Route path="/attendance" element={<Attendance />} />
                  <Route path="/feedback" element={<ViewFeedback />} />
                  <Route path="/messages" element={<ViewMessages />} />
                  <Route path="/send-email" element={<SendEmail />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* Universal Protected Attendance Route */}
          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <Attendance />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
        </AuthProvider>
      </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
