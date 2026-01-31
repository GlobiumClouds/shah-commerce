import React from 'react';
import FacultyList from '../../../../components/super-admin/FacultyList';

export default function FacultiesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <FacultyList />
    </div>
  );
}

export const metadata = {
  title: 'Academic Faculties | Super Admin',
  description: 'Manage academic faculties for the school management system',
};
