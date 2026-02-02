import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import routePath from './routePath';

// Auth Pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));

// Dashboard
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));

// Users
const UsersListPage = lazy(() => import('@/pages/users/UsersListPage'));

// Roles
const RolesListPage = lazy(() => import('@/pages/roles/RolesListPage'));
const RolesFormPage = lazy(() => import('@/pages/roles/RolesFormPage'));

// Members
const MembersListPage = lazy(() => import('@/pages/members/MembersListPage'));
const CandidatesListPage = lazy(() => import('@/pages/members/CandidatesListPage'));
const EmployersListPage = lazy(() => import('@/pages/members/EmployersListPage'));

// Moderation
const ModerationListPage = lazy(() => import('@/pages/moderation/ModerationListPage'));

const allRoutes = [
  // Auth routes (no layout)
  {
    path: routePath.AUTH.LOGIN,
    element: <LoginPage />,
    isAuthRoute: true,
  },

  // Protected routes (with app layout)
  {
    path: routePath.DASHBOARD,
    element: <DashboardPage />,
  },
  {
    path: routePath.USER.LIST,
    element: <UsersListPage />,
  },
  {
    path: routePath.ROLE.LIST,
    element: <RolesListPage />,
  },
  {
    path: routePath.ROLE.CREATE,
    element: <RolesFormPage />,
  },
  {
    path: routePath.ROLE.EDIT,
    element: <RolesFormPage />,
  },
  {
    path: routePath.MEMBER.LIST,
    element: <MembersListPage />,
  },
  {
    path: routePath.MEMBER.CANDIDATES,
    element: <CandidatesListPage />,
  },
  {
    path: routePath.MEMBER.EMPLOYERS,
    element: <EmployersListPage />,
  },
  {
    path: routePath.MODERATION.LIST,
    element: <ModerationListPage />,
  },

  // Redirect root to dashboard
  {
    path: '/',
    element: <Navigate replace to={routePath.DASHBOARD} />,
    noWrapper: true,
  },

  // Catch all 404
  {
    path: '*',
    element: <Navigate replace to={routePath.DASHBOARD} />,
    noWrapper: true,
  },
];

export default allRoutes;
