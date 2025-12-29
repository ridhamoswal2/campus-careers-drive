// Department and Course constants for student eligibility
export const DEPARTMENTS = [
  { value: 'AIIT', label: 'AIIT' },
  { value: 'AIT', label: 'AIT' },
  { value: 'ASFT', label: 'ASFT' },
  { value: 'AIBAS', label: 'AIBAS' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const COURSES = [
  { value: 'BCA', label: 'BCA' },
  { value: 'MCA', label: 'MCA' },
  { value: 'BTECH', label: 'B.Tech' },
] as const;

export const YEARS = [
  { value: 1, label: '1st Year' },
  { value: 2, label: '2nd Year' },
  { value: 3, label: '3rd Year' },
  { value: 4, label: '4th Year' },
] as const;

export type Department = typeof DEPARTMENTS[number]['value'];
export type Course = typeof COURSES[number]['value'];
