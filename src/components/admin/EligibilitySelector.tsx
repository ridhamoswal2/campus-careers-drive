import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DEPARTMENTS, COURSES, YEARS } from '@/constants/eligibility';
import { Users } from 'lucide-react';

interface EligibilitySelectorProps {
  selectedDepartments: string[];
  selectedCourses: string[];
  selectedYears: number[];
  onDepartmentsChange: (departments: string[]) => void;
  onCoursesChange: (courses: string[]) => void;
  onYearsChange: (years: number[]) => void;
}

export default function EligibilitySelector({
  selectedDepartments,
  selectedCourses,
  selectedYears,
  onDepartmentsChange,
  onCoursesChange,
  onYearsChange,
}: EligibilitySelectorProps) {
  const toggleDepartment = (dept: string) => {
    if (selectedDepartments.includes(dept)) {
      onDepartmentsChange(selectedDepartments.filter((d) => d !== dept));
    } else {
      onDepartmentsChange([...selectedDepartments, dept]);
    }
  };

  const toggleCourse = (course: string) => {
    if (selectedCourses.includes(course)) {
      onCoursesChange(selectedCourses.filter((c) => c !== course));
    } else {
      onCoursesChange([...selectedCourses, course]);
    }
  };

  const toggleYear = (year: number) => {
    if (selectedYears.includes(year)) {
      onYearsChange(selectedYears.filter((y) => y !== year));
    } else {
      onYearsChange([...selectedYears, year]);
    }
  };

  const selectAllDepartments = () => {
    if (selectedDepartments.length === DEPARTMENTS.length) {
      onDepartmentsChange([]);
    } else {
      onDepartmentsChange(DEPARTMENTS.map((d) => d.value));
    }
  };

  const selectAllCourses = () => {
    if (selectedCourses.length === COURSES.length) {
      onCoursesChange([]);
    } else {
      onCoursesChange(COURSES.map((c) => c.value));
    }
  };

  const selectAllYears = () => {
    if (selectedYears.length === YEARS.length) {
      onYearsChange([]);
    } else {
      onYearsChange(YEARS.map((y) => y.value));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-coral" />
          Job Eligibility
        </CardTitle>
        <CardDescription>
          Select which departments, courses, and years can see and apply to this job. 
          Leave empty to make the job visible to all students.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Departments */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Departments</Label>
            <button
              type="button"
              onClick={selectAllDepartments}
              className="text-sm text-primary hover:underline"
            >
              {selectedDepartments.length === DEPARTMENTS.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {DEPARTMENTS.map((dept) => (
              <div key={dept.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`dept-${dept.value}`}
                  checked={selectedDepartments.includes(dept.value)}
                  onCheckedChange={() => toggleDepartment(dept.value)}
                />
                <label
                  htmlFor={`dept-${dept.value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {dept.label}
                </label>
              </div>
            ))}
          </div>
          {selectedDepartments.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedDepartments.map((dept) => (
                <Badge key={dept} variant="secondary" className="text-xs">
                  {DEPARTMENTS.find((d) => d.value === dept)?.label || dept}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Courses */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Courses</Label>
            <button
              type="button"
              onClick={selectAllCourses}
              className="text-sm text-primary hover:underline"
            >
              {selectedCourses.length === COURSES.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {COURSES.map((course) => (
              <div key={course.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`course-${course.value}`}
                  checked={selectedCourses.includes(course.value)}
                  onCheckedChange={() => toggleCourse(course.value)}
                />
                <label
                  htmlFor={`course-${course.value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {course.label}
                </label>
              </div>
            ))}
          </div>
          {selectedCourses.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedCourses.map((course) => (
                <Badge key={course} variant="secondary" className="text-xs">
                  {COURSES.find((c) => c.value === course)?.label || course}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Years */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Years of Study</Label>
            <button
              type="button"
              onClick={selectAllYears}
              className="text-sm text-primary hover:underline"
            >
              {selectedYears.length === YEARS.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {YEARS.map((year) => (
              <div key={year.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`year-${year.value}`}
                  checked={selectedYears.includes(year.value)}
                  onCheckedChange={() => toggleYear(year.value)}
                />
                <label
                  htmlFor={`year-${year.value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {year.label}
                </label>
              </div>
            ))}
          </div>
          {selectedYears.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedYears.map((year) => (
                <Badge key={year} variant="secondary" className="text-xs">
                  {YEARS.find((y) => y.value === year)?.label || `Year ${year}`}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Info message */}
        {selectedDepartments.length === 0 && selectedCourses.length === 0 && selectedYears.length === 0 && (
          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            ℹ️ No restrictions selected - this job will be visible to all students.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
