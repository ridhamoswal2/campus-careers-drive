# College Placement Portal

A professional web-based placement management system for colleges to manage job postings, student applications, and placement processes.

---

## Project Overview

This portal serves two types of users:
- **Students**: Browse jobs, apply for positions, manage profiles, track applications
- **Admins**: Post jobs, manage applications, review candidates, view analytics

---

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase
- **Database**: PostgreSQL
- **Authentication**: Email/Password with role-based access

---

## Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `profiles` | Student profile information (name, email, department, skills, resume, etc.) |
| `jobs` | Job postings created by admins |
| `applications` | Student applications linking profiles to jobs |
| `user_roles` | Role assignments (admin/student) for users |

### Key Relationships
- `applications.student_id` references `auth.users.id`
- `applications.job_id` references `jobs.id`
- `profiles.user_id` references `auth.users.id`
- `user_roles.user_id` references `auth.users.id`

---

## Features Implemented

### Authentication
- [x] Student registration with department/year selection
- [x] Admin login (separate form)
- [x] Role-based route protection
- [x] Auto-confirm email signups enabled

### Student Features
- [x] Dashboard with job stats and recent applications
- [x] Browse and filter job listings
- [x] View detailed job information
- [x] Apply for jobs
- [x] Track application status
- [x] Profile management page

### Admin Features
- [x] Dashboard with placement statistics
- [x] Post new job listings
- [x] Manage existing jobs (activate/deactivate)
- [x] View all applications with filters
- [x] Update application status (Applied, Shortlisted, Next Round, Selected, Rejected)
- [x] Add remarks to applications
- [x] Analytics page with charts

---

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── AdminLayout.tsx     # Admin page layout with sidebar
│   │   └── StudentLayout.tsx   # Student page layout with navigation
│   ├── ui/                     # shadcn/ui components
│   ├── NavLink.tsx             # Navigation link component
│   └── ProtectedRoute.tsx      # Route protection by role
├── hooks/
│   └── useAuth.tsx             # Authentication context & hooks
├── integrations/
│   └── supabase/
│       ├── client.ts           # Supabase client (auto-generated)
│       └── types.ts            # Database types (auto-generated)
├── pages/
│   ├── admin/
│   │   ├── Analytics.tsx       # Placement analytics
│   │   ├── Applications.tsx    # Manage student applications
│   │   ├── Dashboard.tsx       # Admin dashboard
│   │   ├── ManageJobs.tsx      # Job management
│   │   └── PostJob.tsx         # Create new job
│   ├── student/
│   │   ├── Applications.tsx    # Track applications
│   │   ├── Dashboard.tsx       # Student dashboard
│   │   ├── JobDetails.tsx      # Job details & apply
│   │   ├── Jobs.tsx            # Browse jobs
│   │   └── Profile.tsx         # Profile management
│   ├── Auth.tsx                # Login/Register page
│   ├── Index.tsx               # Landing page
│   └── NotFound.tsx            # 404 page
├── App.tsx                     # Main app with routing
├── index.css                   # Global styles & design tokens
└── main.tsx                    # App entry point
```

---

## User Roles

| Role | Access |
|------|--------|
| `student` | Default role on registration. Access to student dashboard, jobs, applications, profile. |
| `admin` | Admin access only. Must be manually assigned in database. Access to admin dashboard, post jobs, manage applications, analytics. |

---

## How to Create Admin Account

1. Register a new account through the student registration form
2. Open the Supabase backend dashboard
3. Navigate to the `user_roles` table
4. Find the user's row and change `role` from `student` to `admin`
5. Log out and log back in to access admin features

---

## Database Storage Limits

### Free Tier (Supabase)
- **Database Size**: 500 MB
- **File Storage**: 1 GB
- **Bandwidth**: 2 GB

### Recommendations
- Use external storage for large files (resumes, documents)
- Implement pagination for large data sets
- Clean up unused data periodically

---

## Design System

### Color Palette
- **Primary Blue**: #3548F3 (used for buttons, links, accents)
- **Teal/Accent**: For success states and highlights
- **Professional grayscale**: For text and backgrounds

### Typography
- **Display Font**: Plus Jakarta Sans (headings)
- **Body Font**: Inter (body text)

---

## What Was Done

### Initial Setup
1. Created database schema with profiles, jobs, applications, user_roles tables
2. Set up Row Level Security (RLS) policies for data protection
3. Enabled auto-confirm for email signups
4. Configured authentication system

### UI Development
1. Built landing page with hero section
2. Created authentication page with student/admin forms
3. Developed student layout with responsive navigation
4. Developed admin layout with sidebar navigation
5. Built all student pages (dashboard, jobs, applications, profile)
6. Built all admin pages (dashboard, post job, manage jobs, applications, analytics)

### Bug Fixes (Latest)
1. Fixed button component missing variants (hero, coral, glass)
2. Fixed TypeScript errors with ApplicationStatus type
3. Fixed admin applications page - query was failing due to incorrect profile join
4. Changed button color from orange (#FF6B35) to professional blue (#3548F3)
5. Removed fancy hover effects for professional appearance
6. Fixed RLS policies - changed from RESTRICTIVE to PERMISSIVE so admins can view all applications
7. Fixed admin can now view all student profiles and applications
8. Admin can update application status (Selected, Rejected, Next Round, Shortlisted)

---

## What's Next (Future Enhancements)

1. **Resume Upload**: Add file upload to Supabase storage
2. **Email Notifications**: Notify students on application status changes
3. **Bulk Actions**: Select and update multiple applications at once
4. **Export Data**: Export applications/analytics to CSV/Excel
5. **Job Expiry Alerts**: Notify admins of expiring job postings
6. **Student Search**: Advanced search for admins to find candidates
7. **Interview Scheduling**: Calendar integration for interviews
8. **Reports**: Detailed placement reports by department/year

---

## Security

- Row Level Security (RLS) enabled on all tables
- Students can only view/update their own profiles and applications
- Only authenticated users can view job details
- Admin-only routes protected by role check
