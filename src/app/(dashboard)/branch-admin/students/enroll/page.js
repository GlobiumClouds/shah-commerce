import React from 'react';
import StudentEnrollmentWizard from '../../../../components/branch-admin/StudentEnrollmentWizard';

const StudentEnrollmentPage = () => {
  const handleEnrollmentComplete = (studentData) => {
    // Handle successful enrollment
    console.log('Student enrolled successfully:', studentData);
    // You can add toast notifications, redirect, or other actions here
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Student Enrollment</h1>
        <p className="text-gray-600 mt-2">
          Enroll new students with session, faculty, and subject selection
        </p>
      </div>

      <StudentEnrollmentWizard onEnrollmentComplete={handleEnrollmentComplete} />
    </div>
  );
};

export default StudentEnrollmentPage;
