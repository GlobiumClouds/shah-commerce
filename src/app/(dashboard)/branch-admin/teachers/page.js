'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/input';
import Dropdown from '@/components/ui/dropdown';
import Modal from '@/components/ui/modal';
import Tabs from '@/components/ui/tabs';
import FullPageLoader from '@/components/ui/full-page-loader';
import ButtonLoader from '@/components/ui/button-loader';
import BloodGroupSelect from '@/components/ui/blood-group';
import GenderSelect from '@/components/ui/gender-select';
import { Plus, Edit, Trash2, Search, User, Mail, Phone, Eye, BookOpen, Upload, X, Calendar, MapPin, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

const TEACHER_STATUS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'on_leave', label: 'On Leave' },
  { value: 'terminated', label: 'Terminated' },
];

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const EMPLOYMENT_TYPE = [
  { value: 'full-time', label: 'Full-Time' },
  { value: 'part-time', label: 'Part-Time' },
  { value: 'contract', label: 'Contract' },
];

export default function TeachersPage() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [activeTab, setActiveTab] = useState('personal');
  const formRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [pendingProfileFile, setPendingProfileFile] = useState(null);
  const [pendingDocuments, setPendingDocuments] = useState([]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    dateOfBirth: '',
    gender: 'male',
    bloodGroup: '',
    nationality: 'Pakistani',
    religion: '',
    cnic: '',
    employeeId: '',
    departmentId: '',
    joiningDate: new Date().toISOString().split('T')[0],
    employmentType: 'full-time',
    status: 'active',
    address: {
      street: '',
      city: '',
      state: '',
      country: 'Pakistan',
      postalCode: '',
    },
    teacherProfile: {
      qualification: '',
      experience: '',
      specialization: '',
      previousInstitution: '',
      achievements: '',
    },
    qualifications: [],
    assignedSubjects: [],
    assignedClasses: [],
    salary: {
      basicSalary: '',
      allowances: [],
      deductions: [],
      bankName: '',
      accountNumber: '',
      accountTitle: '',
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
    },
    profilePhoto: {
      url: '',
      publicId: '',
    },
    documents: [],
  });

  useEffect(() => {
    fetchTeachers();
    fetchDepartments();
    fetchSubjects();
  }, [search, statusFilter, departmentFilter, pagination.page]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search,
      };
      if (statusFilter) params.status = statusFilter;
      if (departmentFilter) params.departmentId = departmentFilter;

      const response = await apiClient.get(API_ENDPOINTS.BRANCH_ADMIN.TEACHERS.LIST, params);
      if (response.success) {
        setTeachers(response.data.teachers);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.BRANCH_ADMIN.DEPARTMENTS.LIST, { limit: 100 });
      if (response.success) {
        setDepartments(response.data.departments);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.BRANCH_ADMIN.SUBJECTS.LIST, { limit: 100 });
      if (response.success) {
        setSubjects(response.data.subjects);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested fields
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubjectToggle = (subjectId) => {
    setFormData((prev) => ({
      ...prev,
      assignedSubjects: prev.assignedSubjects.includes(subjectId)
        ? prev.assignedSubjects.filter((id) => id !== subjectId)
        : [...prev.assignedSubjects, subjectId],
    }));
  };

  const handleProfileUpload = async (file) => {
    if (!file) return;
    setPendingProfileFile(file);
    try {
      setUploading(true);
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('folder', 'teachers/profiles');
      const response = await apiClient.post('/api/upload', uploadFormData);
      if (response.success) {
        setFormData((prev) => ({
          ...prev,
          profilePhoto: {
            url: response.data.url,
            publicId: response.data.publicId,
          },
        }));
        alert('Profile photo uploaded successfully!');
      }
    } catch (error) {
      alert('Failed to upload profile photo');
    } finally {
      setUploading(false);
      setPendingProfileFile(null);
    }
  };

  const handleDocumentUpload = async (file, documentType = 'other') => {
    if (!file) return;
    try {
      setUploading(true);
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('folder', 'teachers/documents');
      const response = await apiClient.post('/api/upload', uploadFormData);
      if (response.success) {
        const newDoc = {
          type: documentType,
          name: file.name,
          url: response.data.url,
          publicId: response.data.publicId,
          uploadedAt: new Date().toISOString(),
        };
        setFormData((prev) => ({
          ...prev,
          documents: [...(prev.documents || []), newDoc],
        }));
        alert('Document uploaded successfully!');
      }
    } catch (error) {
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const removeDocument = (index) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  const addQualification = () => {
    setFormData((prev) => ({
      ...prev,
      qualifications: [...prev.qualifications, { degree: '', institution: '', year: '', grade: '' }],
    }));
  };

  const removeQualification = (index) => {
    setFormData((prev) => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index),
    }));
  };

  const updateQualification = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      qualifications: prev.qualifications.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isEditMode) {
        const response = await apiClient.put(
          API_ENDPOINTS.BRANCH_ADMIN.TEACHERS.UPDATE.replace(':id', currentTeacher._id),
          formData
        );
        if (response.success) {
          alert('Teacher updated successfully!');
          setIsModalOpen(false);
          fetchTeachers();
        }
      } else {
        const response = await apiClient.post(API_ENDPOINTS.BRANCH_ADMIN.TEACHERS.CREATE, formData);
        if (response.success) {
          alert('Teacher created successfully!');
          setIsModalOpen(false);
          fetchTeachers();
        }
      }
    } catch (error) {
      alert(error.message || 'Failed to save teacher');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (teacher) => {
    setCurrentTeacher(teacher);
    setFormData({
      firstName: teacher.firstName || '',
      lastName: teacher.lastName || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      alternatePhone: teacher.alternatePhone || '',
      dateOfBirth: teacher.dateOfBirth ? teacher.dateOfBirth.split('T')[0] : '',
      gender: teacher.gender || 'male',
      bloodGroup: teacher.bloodGroup || '',
      nationality: teacher.nationality || 'Pakistani',
      religion: teacher.religion || '',
      cnic: teacher.cnic || '',
      employeeId: teacher.employeeId || '',
      departmentId: teacher.departmentId?._id || '',
      joiningDate: teacher.joiningDate ? teacher.joiningDate.split('T')[0] : '',
      employmentType: teacher.employmentType || 'full-time',
      status: teacher.status || 'active',
      address: teacher.address || {
        street: '',
        city: '',
        state: '',
        country: 'Pakistan',
        postalCode: '',
      },
      teacherProfile: teacher.teacherProfile || {
        qualification: '',
        experience: '',
        specialization: '',
        previousInstitution: '',
        achievements: '',
      },
      qualifications: teacher.qualifications || [],
      assignedSubjects: teacher.assignedSubjects?.map((s) => s._id || s) || [],
      assignedClasses: teacher.assignedClasses || [],
      salary: teacher.salary || {
        basicSalary: '',
        allowances: [],
        deductions: [],
        bankName: '',
        accountNumber: '',
        accountTitle: '',
      },
      emergencyContact: teacher.emergencyContact || {
        name: '',
        relationship: '',
        phone: '',
      },
      profilePhoto: teacher.profilePhoto || {
        url: '',
        publicId: '',
      },
      documents: teacher.documents || [],
    });
    setIsEditMode(true);
    setActiveTab('personal');
    setIsModalOpen(true);
  };

  const handleView = (teacher) => {
    setCurrentTeacher(teacher);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;

    try {
      const response = await apiClient.delete(API_ENDPOINTS.BRANCH_ADMIN.TEACHERS.DELETE.replace(':id', id));
      if (response.success) {
        alert('Teacher deleted successfully!');
        fetchTeachers();
      }
    } catch (error) {
      alert(error.message || 'Failed to delete teacher');
    }
  };

  const handleAddNew = () => {
    setCurrentTeacher(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      alternatePhone: '',
      dateOfBirth: '',
      gender: 'male',
      bloodGroup: '',
      nationality: 'Pakistani',
      religion: '',
      cnic: '',
      employeeId: '',
      departmentId: '',
      joiningDate: new Date().toISOString().split('T')[0],
      employmentType: 'full-time',
      status: 'active',
      address: {
        street: '',
        city: '',
        state: '',
        country: 'Pakistan',
        postalCode: '',
      },
      teacherProfile: {
        qualification: '',
        experience: '',
        specialization: '',
        previousInstitution: '',
        achievements: '',
      },
      qualifications: [],
      assignedSubjects: [],
      assignedClasses: [],
      salary: {
        basicSalary: '',
        allowances: [],
        deductions: [],
        bankName: '',
        accountNumber: '',
        accountTitle: '',
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
      },
      profilePhoto: {
        url: '',
        publicId: '',
      },
      documents: [],
    });
    setIsEditMode(false);
    setActiveTab('personal');
    setIsModalOpen(true);
  };

  const tabsData = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'professional', label: 'Professional' },
    { id: 'qualifications', label: 'Qualifications' },
    { id: 'salary', label: 'Salary & Bank' },
    { id: 'documents', label: 'Documents' },
  ];

  if (loading && teachers.length === 0) {
    return <FullPageLoader message="Loading teachers..." />;
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Teachers Management</CardTitle>
            <Button onClick={handleAddNew}>
              <Plus className="w-4 h-4 mr-2" />
              Add Teacher
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Input
              placeholder="Search teachers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
            />
            <Dropdown
              placeholder="Filter by department"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              options={[
                { value: '', label: 'All Departments' },
                ...departments.map((d) => ({ value: d._id, label: d.name })),
              ]}
            />
            <Dropdown
              placeholder="Filter by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[{ value: '', label: 'All Status' }, ...TEACHER_STATUS]}
            />
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Employment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500">
                    No teachers found
                  </TableCell>
                </TableRow>
              ) : (
                teachers.map((teacher) => (
                  <TableRow key={teacher._id}>
                    <TableCell className="font-medium">{teacher.employeeId}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {teacher.profilePhoto?.url ? (
                          <img src={teacher.profilePhoto.url} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <User className="w-8 h-8 p-1 rounded-full bg-gray-100" />
                        )}
                        <div>
                          <div className="font-medium">{teacher.firstName} {teacher.lastName}</div>
                          <div className="text-xs text-gray-500">{teacher.teacherProfile?.specialization || teacher.gender}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="w-3 h-3" />
                        {teacher.email}
                      </div>
                    </TableCell>
                    <TableCell>{teacher.departmentId?.name || 'Not Assigned'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {teacher.assignedSubjects?.length || teacher.subjects?.length || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize text-sm">{teacher.employmentType?.replace('-', ' ')}</span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          teacher.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : teacher.status === 'on_leave'
                            ? 'bg-yellow-100 text-yellow-700'
                            : teacher.status === 'terminated'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {teacher.status?.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon-sm" onClick={() => handleView(teacher)} title="View Details">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(teacher)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(teacher._id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Showing {teachers.length} of {pagination.total} teachers
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.pages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? 'Edit Teacher' : 'Add New Teacher'}
        size="xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? <ButtonLoader /> : isEditMode ? 'Update' : 'Create'}
            </Button>
          </div>
        }
      >
        <Tabs tabs={tabsData} activeTab={activeTab} onChange={setActiveTab} />
        
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="max-h-[60vh] overflow-y-auto space-y-4 p-1">
            
            {/* Personal Info Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-4">
                {/* Profile Photo Upload */}
                <div className="border-b pb-4">
                  <label className="block text-sm font-medium mb-2">Profile Photo</label>
                  <div className="flex items-center gap-4">
                    {formData.profilePhoto?.url ? (
                      <img src={formData.profilePhoto.url} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleProfileUpload(e.target.files[0])}
                      className="hidden"
                      id="profile-upload"
                    />
                    <label htmlFor="profile-upload" className="cursor-pointer">
                      <div className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        {uploading ? 'Uploading...' : 'Upload Photo'}
                      </div>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name *</label>
                    <Input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name *</label>
                    <Input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      icon={Mail}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      icon={Phone}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Alternate Phone</label>
                    <Input
                      type="tel"
                      name="alternatePhone"
                      value={formData.alternatePhone}
                      onChange={handleInputChange}
                      icon={Phone}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Date of Birth</label>
                    <Input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      icon={Calendar}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Gender</label>
                    <GenderSelect
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Blood Group</label>
                    <BloodGroupSelect
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nationality</label>
                    <Input
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Religion</label>
                    <Input
                      type="text"
                      name="religion"
                      value={formData.religion}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">CNIC</label>
                    <Input
                      type="text"
                      name="cnic"
                      value={formData.cnic}
                      onChange={handleInputChange}
                      placeholder="XXXXX-XXXXXXX-X"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Employee ID *</label>
                    <Input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Joining Date</label>
                    <Input
                      type="date"
                      name="joiningDate"
                      value={formData.joiningDate}
                      onChange={handleInputChange}
                      icon={Calendar}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Employment Type</label>
                    <Dropdown
                      name="employmentType"
                      value={formData.employmentType}
                      onChange={handleInputChange}
                      options={EMPLOYMENT_TYPE}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <Dropdown
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      options={TEACHER_STATUS}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Department</label>
                    <Dropdown
                      name="departmentId"
                      value={formData.departmentId}
                      onChange={handleInputChange}
                      options={[
                        { value: '', label: 'Select Department' },
                        ...departments.map((d) => ({ value: d._id, label: d.name })),
                      ]}
                    />
                  </div>
                </div>

                {/* Address Section */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Address Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Street Address</label>
                      <Input
                        type="text"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">City</label>
                        <Input
                          type="text"
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">State/Province</label>
                        <Input
                          type="text"
                          name="address.state"
                          value={formData.address.state}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Country</label>
                        <Input
                          type="text"
                          name="address.country"
                          value={formData.address.country}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Postal Code</label>
                        <Input
                          type="text"
                          name="address.postalCode"
                          value={formData.address.postalCode}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-3">Emergency Contact</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Contact Name</label>
                        <Input
                          type="text"
                          name="emergencyContact.name"
                          value={formData.emergencyContact.name}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Relationship</label>
                        <Input
                          type="text"
                          name="emergencyContact.relationship"
                          value={formData.emergencyContact.relationship}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone Number</label>
                      <Input
                        type="tel"
                        name="emergencyContact.phone"
                        value={formData.emergencyContact.phone}
                        onChange={handleInputChange}
                        icon={Phone}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Professional Tab */}
            {activeTab === 'professional' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Highest Qualification</label>
                    <Input
                      type="text"
                      name="teacherProfile.qualification"
                      value={formData.teacherProfile.qualification}
                      onChange={handleInputChange}
                      placeholder="BSc, MSc, PhD..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Years of Experience</label>
                    <Input
                      type="number"
                      name="teacherProfile.experience"
                      value={formData.teacherProfile.experience}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Specialization</label>
                    <Input
                      type="text"
                      name="teacherProfile.specialization"
                      value={formData.teacherProfile.specialization}
                      onChange={handleInputChange}
                      placeholder="Mathematics, Physics, Chemistry..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Previous Institution</label>
                    <Input
                      type="text"
                      name="teacherProfile.previousInstitution"
                      value={formData.teacherProfile.previousInstitution}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Achievements</label>
                  <textarea
                    name="teacherProfile.achievements"
                    value={formData.teacherProfile.achievements}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows="3"
                    placeholder="List achievements, awards, certifications..."
                  />
                </div>

                {/* Assigned Subjects */}
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium mb-2">Assign Subjects</label>
                  <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                    {subjects.length === 0 ? (
                      <p className="text-sm text-gray-500">No subjects available</p>
                    ) : (
                      subjects.map((subject) => (
                        <div key={subject._id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.assignedSubjects.includes(subject._id)}
                            onChange={() => handleSubjectToggle(subject._id)}
                            className="w-4 h-4"
                          />
                          <label className="text-sm">
                            {subject.name} ({subject.code})
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Qualifications Tab */}
            {activeTab === 'qualifications' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold">Academic Qualifications</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addQualification}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Qualification
                  </Button>
                </div>

                {formData.qualifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 border rounded-lg">
                    No qualifications added yet. Click "Add Qualification" to begin.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.qualifications.map((qual, index) => (
                      <div key={index} className="border rounded-lg p-4 relative">
                        <button
                          type="button"
                          onClick={() => removeQualification(index)}
                          className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Degree/Certificate</label>
                            <Input
                              type="text"
                              value={qual.degree}
                              onChange={(e) => updateQualification(index, 'degree', e.target.value)}
                              placeholder="BSc, MSc, PhD..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Institution</label>
                            <Input
                              type="text"
                              value={qual.institution}
                              onChange={(e) => updateQualification(index, 'institution', e.target.value)}
                              placeholder="University/College name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Year</label>
                            <Input
                              type="text"
                              value={qual.year}
                              onChange={(e) => updateQualification(index, 'year', e.target.value)}
                              placeholder="2020"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Grade/CGPA</label>
                            <Input
                              type="text"
                              value={qual.grade}
                              onChange={(e) => updateQualification(index, 'grade', e.target.value)}
                              placeholder="3.8 / A+"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Salary & Bank Tab */}
            {activeTab === 'salary' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Salary Information</h3>
                <div>
                  <label className="block text-sm font-medium mb-1">Basic Salary</label>
                  <Input
                    type="number"
                    name="salary.basicSalary"
                    value={formData.salary.basicSalary}
                    onChange={handleInputChange}
                    placeholder="50000"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Allowances (comma-separated)</label>
                  <textarea
                    name="salary.allowances"
                    value={Array.isArray(formData.salary.allowances) ? formData.salary.allowances.join(', ') : formData.salary.allowances}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        salary: {
                          ...prev.salary,
                          allowances: value.split(',').map(item => item.trim()).filter(item => item),
                        },
                      }));
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows="2"
                    placeholder="Housing: 10000, Transport: 5000, Medical: 3000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Deductions (comma-separated)</label>
                  <textarea
                    name="salary.deductions"
                    value={Array.isArray(formData.salary.deductions) ? formData.salary.deductions.join(', ') : formData.salary.deductions}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        salary: {
                          ...prev.salary,
                          deductions: value.split(',').map(item => item.trim()).filter(item => item),
                        },
                      }));
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows="2"
                    placeholder="Tax: 2000, Insurance: 1000"
                  />
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-3">Bank Account Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Bank Name</label>
                      <Input
                        type="text"
                        name="salary.bankName"
                        value={formData.salary.bankName}
                        onChange={handleInputChange}
                        placeholder="Bank Al Habib, HBL, MCB..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Account Number</label>
                      <Input
                        type="text"
                        name="salary.accountNumber"
                        value={formData.salary.accountNumber}
                        onChange={handleInputChange}
                        placeholder="XXXXXXXXXXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Account Title</label>
                      <Input
                        type="text"
                        name="salary.accountTitle"
                        value={formData.salary.accountTitle}
                        onChange={handleInputChange}
                        placeholder="Account holder name"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-6">
                  <div className="text-center">
                    <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm font-medium mb-2">Upload Documents</p>
                    <p className="text-xs text-gray-500 mb-4">CNIC, Certificates, Resume, etc.</p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => handleDocumentUpload(e.target.files[0])}
                      className="hidden"
                      id="document-upload"
                    />
                    <label htmlFor="document-upload" className="cursor-pointer">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Upload className="w-4 h-4" />
                        {uploading ? 'Uploading...' : 'Choose File'}
                      </div>
                    </label>
                  </div>
                </div>

                {formData.documents.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">Uploaded Documents</h3>
                    {formData.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium">{doc.name}</p>
                            <p className="text-xs text-gray-500">{doc.type || 'Document'}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View
                          </a>
                          <button
                            type="button"
                            onClick={() => removeDocument(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        open={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Teacher Details"
        size="xl"
        footer={
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        {currentTeacher && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Profile Section */}
            <div className="flex items-center gap-4 pb-4 border-b">
              {currentTeacher.profilePhoto?.url ? (
                <img src={currentTeacher.profilePhoto.url} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold">
                  {currentTeacher.firstName} {currentTeacher.lastName}
                </h2>
                <p className="text-gray-600">{currentTeacher.employeeId}</p>
                <span
                  className={`inline-block mt-1 px-2 py-1 rounded-full text-xs ${
                    currentTeacher.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : currentTeacher.status === 'on_leave'
                      ? 'bg-yellow-100 text-yellow-700'
                      : currentTeacher.status === 'terminated'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {currentTeacher.status?.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {currentTeacher.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {currentTeacher.phone || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {currentTeacher.dateOfBirth ? new Date(currentTeacher.dateOfBirth).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Gender</label>
                  <p className="capitalize">{currentTeacher.gender || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Blood Group</label>
                  <p>{currentTeacher.bloodGroup || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Nationality</label>
                  <p>{currentTeacher.nationality || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Religion</label>
                  <p>{currentTeacher.religion || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">CNIC</label>
                  <p>{currentTeacher.cnic || '-'}</p>
                </div>
              </div>
            </div>

            {/* Employment Information */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">Employment Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  <p>{currentTeacher.departmentId?.name || 'Not Assigned'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Employment Type</label>
                  <p className="capitalize">{currentTeacher.employmentType?.replace('-', ' ') || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Joining Date</label>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {currentTeacher.joiningDate ? new Date(currentTeacher.joiningDate).toLocaleDateString() : '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            {currentTeacher.teacherProfile && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Professional Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Qualification</label>
                    <p>{currentTeacher.teacherProfile.qualification || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Experience</label>
                    <p>{currentTeacher.teacherProfile.experience ? `${currentTeacher.teacherProfile.experience} years` : '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Specialization</label>
                    <p>{currentTeacher.teacherProfile.specialization || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Previous Institution</label>
                    <p>{currentTeacher.teacherProfile.previousInstitution || '-'}</p>
                  </div>
                </div>
                {currentTeacher.teacherProfile.achievements && (
                  <div className="mt-3">
                    <label className="text-sm font-medium text-gray-500">Achievements</label>
                    <p className="text-sm mt-1">{currentTeacher.teacherProfile.achievements}</p>
                  </div>
                )}
              </div>
            )}

            {/* Qualifications */}
            {currentTeacher.qualifications && currentTeacher.qualifications.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">Academic Qualifications</h3>
                <div className="space-y-3">
                  {currentTeacher.qualifications.map((qual, index) => (
                    <div key={index} className="border rounded-lg p-3 bg-gray-50">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Degree:</span> {qual.degree}
                        </div>
                        <div>
                          <span className="font-medium">Institution:</span> {qual.institution}
                        </div>
                        <div>
                          <span className="font-medium">Year:</span> {qual.year}
                        </div>
                        <div>
                          <span className="font-medium">Grade:</span> {qual.grade}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assigned Subjects */}
            {(currentTeacher.assignedSubjects?.length > 0 || currentTeacher.subjects?.length > 0) && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">Teaching Subjects</h3>
                <div className="flex flex-wrap gap-2">
                  {(currentTeacher.assignedSubjects || currentTeacher.subjects)?.map((subject) => (
                    <span key={subject._id || subject} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">
                      {subject.name || subject.code || subject}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Salary Information */}
            {currentTeacher.salary && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">Salary & Bank Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Basic Salary</label>
                    <p className="font-semibold">Rs. {currentTeacher.salary.basicSalary || '-'}</p>
                  </div>
                  {currentTeacher.salary.bankName && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Bank Name</label>
                        <p>{currentTeacher.salary.bankName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Account Number</label>
                        <p>{currentTeacher.salary.accountNumber || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Account Title</label>
                        <p>{currentTeacher.salary.accountTitle || '-'}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Address */}
            {currentTeacher.address && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Address
                </h3>
                {typeof currentTeacher.address === 'object' ? (
                  <p>
                    {currentTeacher.address.street && `${currentTeacher.address.street}, `}
                    {currentTeacher.address.city && `${currentTeacher.address.city}, `}
                    {currentTeacher.address.state && `${currentTeacher.address.state}, `}
                    {currentTeacher.address.country || ''}
                    {currentTeacher.address.postalCode && ` - ${currentTeacher.address.postalCode}`}
                  </p>
                ) : (
                  <p>{currentTeacher.address}</p>
                )}
              </div>
            )}

            {/* Emergency Contact */}
            {currentTeacher.emergencyContact && currentTeacher.emergencyContact.name && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">Emergency Contact</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p>{currentTeacher.emergencyContact.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Relationship</label>
                    <p>{currentTeacher.emergencyContact.relationship || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {currentTeacher.emergencyContact.phone || '-'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Documents */}
            {currentTeacher.documents && currentTeacher.documents.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Documents
                </h3>
                <div className="space-y-2">
                  {currentTeacher.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.type || 'Document'}</p>
                        </div>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
