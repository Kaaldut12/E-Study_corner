// backend/src/constants/permissions.js

export const ALL_PERMISSIONS = [
  { id: 'manage_users', label: 'Manage Users', category: 'Administration', description: 'Create, update, and manage user accounts and access levels' },
  { id: 'manage_roles', label: 'Manage Roles', category: 'Administration', description: 'Assign and customize platform permissions and roles' },
  { id: 'create_courses', label: 'Create Courses', category: 'Academics', description: 'Design and publish new courses and syllabus' },
  { id: 'manage_courses', label: 'Manage Courses', category: 'Academics', description: 'Edit existing courses, lessons, and content' },
  { id: 'upload_materials', label: 'Upload Materials', category: 'Resources', description: 'Upload notes, reference books, and PDFs' },
  { id: 'download_materials', label: 'Download Materials', category: 'Resources', description: 'Access and download study resources' },
  { id: 'create_assignments', label: 'Create Assignments', category: 'Academics', description: 'Publish homework, assignments, and deadlines' },
  { id: 'submit_assignments', label: 'Submit Assignments', category: 'Academics', description: 'Upload homework and coursework answers' },
  { id: 'grade_submissions', label: 'Grade Submissions', category: 'Academics', description: 'Review student work, assign marks, and give feedback' },
  { id: 'take_quizzes', label: 'Take Quizzes', category: 'Examinations', description: 'Participate in interactive quizzes and tests' },
  { id: 'manage_quizzes', label: 'Manage Quizzes', category: 'Examinations', description: 'Create quizzes, question banks, and answer keys' },
  { id: 'manage_notifications', label: 'Broadcast Notifications', category: 'Communication', description: 'Send campus and batch-wide announcements' },
  { id: 'view_analytics', label: 'View Analytics', category: 'Administration', description: 'Access academic progress and platform statistics' },
  { id: 'access_ai_coach', label: 'Access AI Coach', category: 'Learning Tools', description: 'Use AI personalized coaching and study tips' },
  { id: 'manage_enquiries', label: 'Manage Enquiries', category: 'Communication', description: 'Respond to student support tickets and enquiries' }
];

export const DEFAULT_ROLE_PERMISSIONS = {
  superadmin: ALL_PERMISSIONS.map(p => p.id),
  admin: [
    'manage_users',
    'manage_roles',
    'manage_courses',
    'upload_materials',
    'download_materials',
    'manage_quizzes',
    'manage_notifications',
    'view_analytics',
    'manage_enquiries'
  ],
  teacher: [
    'create_courses',
    'manage_courses',
    'upload_materials',
    'download_materials',
    'create_assignments',
    'grade_submissions',
    'manage_quizzes',
    'manage_notifications',
    'view_analytics'
  ],
  student: [
    'download_materials',
    'submit_assignments',
    'take_quizzes',
    'access_ai_coach'
  ]
};

export const getDefaultPermissions = (role) => {
  if (role === 'superadmin') return DEFAULT_ROLE_PERMISSIONS.superadmin;
  if (role === 'admin') return [...DEFAULT_ROLE_PERMISSIONS.admin];
  if (role === 'teacher') return [...DEFAULT_ROLE_PERMISSIONS.teacher];
  return [...DEFAULT_ROLE_PERMISSIONS.student];
};
