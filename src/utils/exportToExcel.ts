import * as XLSX from 'xlsx';

interface ApplicationExportData {
  'Student Name': string;
  'Email': string;
  'Phone': string;
  'Department': string;
  'Year of Study': number | string;
  'CGPA': number | string;
  'Skills': string;
  'Status': string;
  'Applied On': string;
  'Admin Remarks': string;
  'Resume URL': string;
}

export function exportApplicationsToExcel(
  applications: any[],
  jobTitle: string,
  companyName: string
) {
  const statusLabels: Record<string, string> = {
    applied: 'Applied',
    shortlisted: 'Shortlisted',
    next_round: 'Next Round',
    selected: 'Selected',
    rejected: 'Rejected',
  };

  const exportData: ApplicationExportData[] = applications.map((app) => ({
    'Student Name': app.profiles?.full_name || 'N/A',
    'Email': app.profiles?.email || 'N/A',
    'Phone': app.profiles?.phone || 'N/A',
    'Department': app.profiles?.department || 'N/A',
    'Year of Study': app.profiles?.year_of_study || 'N/A',
    'CGPA': app.profiles?.cgpa || 'N/A',
    'Skills': app.profiles?.skills?.join(', ') || 'N/A',
    'Status': statusLabels[app.status] || app.status,
    'Applied On': app.applied_at
      ? new Date(app.applied_at).toLocaleDateString()
      : 'N/A',
    'Admin Remarks': app.admin_remarks || '',
    'Resume URL': app.profiles?.resume_url || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  
  // Set column widths
  const columnWidths = [
    { wch: 25 }, // Student Name
    { wch: 30 }, // Email
    { wch: 15 }, // Phone
    { wch: 20 }, // Department
    { wch: 12 }, // Year of Study
    { wch: 8 },  // CGPA
    { wch: 40 }, // Skills
    { wch: 12 }, // Status
    { wch: 12 }, // Applied On
    { wch: 30 }, // Admin Remarks
    { wch: 50 }, // Resume URL
  ];
  worksheet['!cols'] = columnWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Applications');

  const fileName = `${companyName}_${jobTitle}_Applications_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
