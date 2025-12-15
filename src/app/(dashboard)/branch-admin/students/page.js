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
import ClassSelect from '@/components/ui/class-select';
import { Plus, Edit, Trash2, Search, User, Mail, Phone, Eye, FileText, Upload, X, Calendar, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

const STUDENT_STATUS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'graduated', label: 'Graduated' },
  { value: 'transferred', label: 'Transferred' },
  { value: 'suspended', label: 'Suspended' },
];

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

export default function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
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
    classId: '',
    admissionNumber: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    status: 'active',
    address: {
      street: '',
      city: '',
      state: '',
      country: 'Pakistan',
      postalCode: '',
    },
    parentInfo: {
      fatherName: '',
      fatherOccupation: '',
      fatherPhone: '',
      fatherEmail: '',
      fatherCnic: '',
      motherName: '',
      motherOccupation: '',
      motherPhone: '',
      motherEmail: '',
      motherCnic: '',
    },
    guardianInfo: {
      name: '',
      relationship: '',
      phone: '',
      email: '',
      cnic: '',
      address: '',
    },
    guardianType: 'parent',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
    },
    academicInfo: {
      previousSchool: '',
      previousClass: '',
      tcNumber: '',
      remarks: '',
    },
    medicalInfo: {
      bloodGroup: '',
      allergies: '',
      chronicConditions: '',
      medications: '',
      doctorName: '',
      doctorPhone: '',
    },
    profilePhoto: {
      url: '',
      publicId: '',
    },
    documents: [],
  });

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, [search, statusFilter, classFilter, pagination.page]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search,
      };
      if (statusFilter) params.status = statusFilter;
      if (classFilter) params.classId = classFilter;

      const response = await apiClient.get(API_ENDPOINTS.BRANCH_ADMIN.STUDENTS.LIST, params);
      if (response.success) {
        setStudents(response.data.students);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.BRANCH_ADMIN.CLASSES.LIST, { limit: 100 });
      if (response.success) {
        setClasses(response.data.classes);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
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

  const handleProfileUpload = async (file) => {
    if (!file) return;
    
    setPendingProfileFile(file);
    
    try {
      setUploading(true);
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('folder', 'students/profiles');

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
      uploadFormData.append('folder', 'students/documents');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isEditMode) {
        const response = await apiClient.put(
          API_ENDPOINTS.BRANCH_ADMIN.STUDENTS.UPDATE.replace(':id', currentStudent._id),
          formData
        );
        if (response.success) {
          alert('Student updated successfully!');
          setIsModalOpen(false);
          fetchStudents();
        }
      } else {
        const response = await apiClient.post(API_ENDPOINTS.BRANCH_ADMIN.STUDENTS.CREATE, formData);
        if (response.success) {
          alert('Student created successfully!');
          setIsModalOpen(false);
          fetchStudents();
        }
      }
    } catch (error) {
      alert(error.message || 'Failed to save student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (student) => {
    setCurrentStudent(student);
    setFormData({
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      email: student.email || '',
      phone: student.phone || '',
      alternatePhone: student.alternatePhone || '',
      dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
      gender: student.gender || 'male',
      bloodGroup: student.bloodGroup || '',
      nationality: student.nationality || 'Pakistani',
      religion: student.religion || '',
      cnic: student.cnic || '',
      classId: student.classId?._id || '',
      admissionNumber: student.admissionNumber || '',
      enrollmentDate: student.enrollmentDate ? student.enrollmentDate.split('T')[0] : '',
      status: student.status || 'active',
      address: student.address || {
        street: '',
        city: '',
        state: '',
        country: 'Pakistan',
        postalCode: '',
      },
      parentInfo: student.parentInfo || {
        fatherName: '',
        fatherOccupation: '',
        fatherPhone: '',
        fatherEmail: '',
        fatherCnic: '',
        motherName: '',
        motherOccupation: '',
        motherPhone: '',
        motherEmail: '',
        motherCnic: '',
      },
      guardianInfo: student.guardianInfo || {
        name: '',
        relationship: '',
        phone: '',
        email: '',
        cnic: '',
        address: '',
      },
      guardianType: student.guardianType || student.studentProfile?.guardianType || 'parent',
      emergencyContact: student.emergencyContact || {
        name: '',
        relationship: '',
        phone: '',
      },
      academicInfo: student.academicInfo || {
        previousSchool: '',
        previousClass: '',
        tcNumber: '',
        remarks: '',
      },
      medicalInfo: student.medicalInfo || {
        bloodGroup: '',
        allergies: '',
        chronicConditions: '',
        medications: '',
        doctorName: '',
        doctorPhone: '',
      },
      profilePhoto: student.profilePhoto || {
        url: '',
        publicId: '',
      },
      documents: student.documents || [],
    });
    setIsEditMode(true);
    setActiveTab('personal');
    setIsModalOpen(true);
  };

  const handleView = (student) => {
    setCurrentStudent(student);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      const response = await apiClient.delete(API_ENDPOINTS.BRANCH_ADMIN.STUDENTS.DELETE.replace(':id', id));
      if (response.success) {
        alert('Student deleted successfully!');
        fetchStudents();
      }
    } catch (error) {
      alert(error.message || 'Failed to delete student');
    }
  };

  const handleAddNew = () => {
    setCurrentStudent(null);
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
      classId: '',
      admissionNumber: '',
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: 'active',
      address: {
        street: '',
        city: '',
        state: '',
        country: 'Pakistan',
        postalCode: '',
      },
      parentInfo: {
        fatherName: '',
        fatherOccupation: '',
        fatherPhone: '',
        fatherEmail: '',
        fatherCnic: '',
        motherName: '',
        motherOccupation: '',
        motherPhone: '',
        motherEmail: '',
        motherCnic: '',
      },
      guardianInfo: {
        name: '',
        relationship: '',
        phone: '',
        email: '',
        cnic: '',
        address: '',
      },
      guardianType: 'parent',
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
      },
      academicInfo: {
        previousSchool: '',
        previousClass: '',
        tcNumber: '',
        remarks: '',
      },
      medicalInfo: {
        bloodGroup: '',
        allergies: '',
        chronicConditions: '',
        medications: '',
        doctorName: '',
        doctorPhone: '',
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
    { id: 'parent', label: 'Parent/Guardian' },
    { id: 'academic', label: 'Academic' },
    { id: 'medical', label: 'Medical' },
    { id: 'documents', label: 'Documents' },
  ];

  if (loading && students.length === 0) {
    return <FullPageLoader message="Loading students..." />;
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Students Management</CardTitle>
            <Button onClick={handleAddNew}>
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Input
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
            />
            <Dropdown
              placeholder="Filter by class"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              options={[
                { value: '', label: 'All Classes' },
                ...classes.map((c) => ({ value: c._id, label: `${c.name} - ${c.code}` })),
              ]}
            />
            <Dropdown
              placeholder="Filter by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[{ value: '', label: 'All Status' }, ...STUDENT_STATUS]}
            />
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admission #</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Guardian</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500">
                    No students found
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell className="font-medium">{student.admissionNumber}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {student.profilePhoto?.url ? (
                          <img src={student.profilePhoto.url} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <User className="w-8 h-8 p-1 rounded-full bg-gray-100" />
                        )}
                        <div>
                          <div className="font-medium">{student.firstName} {student.lastName}</div>
                          <div className="text-xs text-gray-500">{student.gender}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="w-3 h-3" />
                        {student.email}
                      </div>
                    </TableCell>
                    <TableCell>{student.classId?.name || 'Not Assigned'}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{student.parentInfo?.fatherName || student.guardianInfo?.name || '-'}</div>
                        {(student.parentInfo?.fatherPhone || student.guardianInfo?.phone) && (
                          <div className="flex items-center gap-1 text-gray-500">
                            <Phone className="w-3 h-3" />
                            {student.parentInfo?.fatherPhone || student.guardianInfo?.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          student.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : student.status === 'graduated'
                            ? 'bg-blue-100 text-blue-700'
                            : student.status === 'suspended'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {student.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon-sm" onClick={() => handleView(student)} title="View Details">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(student)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(student._id)}>
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
              Showing {students.length} of {pagination.total} students
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
        title={isEditMode ? 'Edit Student' : 'Add New Student'}
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

                <div className="grid grid-cols-3 gap-4">
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

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Enrollment Date</label>
                    <Input
                      type="date"
                      name="enrollmentDate"
                      value={formData.enrollmentDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <Dropdown
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      options={STUDENT_STATUS}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Class</label>
                  <ClassSelect
                    name="classId"
                    value={formData.classId}
                    onChange={handleInputChange}
                    classes={classes}
                  />
                </div>

                {/* Address Section */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Address Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Street</label>
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
                        <label className="block text-sm font-medium mb-1">State</label>
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
              </div>
            )}

            {/* Parent/Guardian Tab */}
            {activeTab === 'parent' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Parent / Guardian</h3>
                  <div className="w-44">
                    <label className="block text-xs text-gray-500 mb-1">Select Guardian Type</label>
                    <Dropdown
                      name="guardianType"
                      value={formData.guardianType}
                      onChange={handleInputChange}
                      options={[
                        { value: 'parent', label: 'Parent' },
                        { value: 'guardian', label: 'Guardian' },
                      ]}
                    />
                  </div>
                </div>

                {/* Parent fields (father & mother) shown when guardianType === 'parent' */}
                {formData.guardianType === 'parent' && (
                  <>
                    <div className="border-b pb-4">
                      <h3 className="font-semibold mb-3">Father Information</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Father Name</label>
                          <Input
                            type="text"
                            name="parentInfo.fatherName"
                            value={formData.parentInfo.fatherName}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Occupation</label>
                            <Input
                              type="text"
                              name="parentInfo.fatherOccupation"
                              value={formData.parentInfo.fatherOccupation}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">CNIC</label>
                            <Input
                              type="text"
                              name="parentInfo.fatherCnic"
                              value={formData.parentInfo.fatherCnic}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Phone</label>
                            <Input
                              type="tel"
                              name="parentInfo.fatherPhone"
                              value={formData.parentInfo.fatherPhone}
                              onChange={handleInputChange}
                              icon={Phone}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <Input
                              type="email"
                              name="parentInfo.fatherEmail"
                              value={formData.parentInfo.fatherEmail}
                              onChange={handleInputChange}
                              icon={Mail}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-b pb-4">
                      <h3 className="font-semibold mb-3">Mother Information</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Mother Name</label>
                          <Input
                            type="text"
                            name="parentInfo.motherName"
                            value={formData.parentInfo.motherName}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Occupation</label>
                            <Input
                              type="text"
                              name="parentInfo.motherOccupation"
                              value={formData.parentInfo.motherOccupation}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">CNIC</label>
                            <Input
                              type="text"
                              name="parentInfo.motherCnic"
                              value={formData.parentInfo.motherCnic}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Phone</label>
                            <Input
                              type="tel"
                              name="parentInfo.motherPhone"
                              value={formData.parentInfo.motherPhone}
                              onChange={handleInputChange}
                              icon={Phone}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <Input
                              type="email"
                              name="parentInfo.motherEmail"
                              value={formData.parentInfo.motherEmail}
                              onChange={handleInputChange}
                              icon={Mail}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Guardian fields shown when guardianType === 'guardian' */}
                {formData.guardianType === 'guardian' && (
                  <div className="border-b pb-4">
                    <h3 className="font-semibold mb-3">Guardian Information</h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Guardian Name</label>
                          <Input
                            type="text"
                            name="guardianInfo.name"
                            value={formData.guardianInfo.name}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Relationship</label>
                          <Input
                            type="text"
                            name="guardianInfo.relationship"
                            value={formData.guardianInfo.relationship}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Phone</label>
                          <Input
                            type="tel"
                            name="guardianInfo.phone"
                            value={formData.guardianInfo.phone}
                            onChange={handleInputChange}
                            icon={Phone}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Email</label>
                          <Input
                            type="email"
                            name="guardianInfo.email"
                            value={formData.guardianInfo.email}
                            onChange={handleInputChange}
                            icon={Mail}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">CNIC</label>
                          <Input
                            type="text"
                            name="guardianInfo.cnic"
                            value={formData.guardianInfo.cnic}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Address</label>
                        <Input
                          type="text"
                          name="guardianInfo.address"
                          value={formData.guardianInfo.address}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Emergency Contact */}
                <div>
                  <h3 className="font-semibold mb-3">Emergency Contact</h3>
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
                      <label className="block text-sm font-medium mb-1">Phone</label>
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

            {/* Academic Tab */}
            {activeTab === 'academic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Previous School</label>
                    <Input
                      type="text"
                      name="academicInfo.previousSchool"
                      value={formData.academicInfo.previousSchool}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Previous Class</label>
                    <Input
                      type="text"
                      name="academicInfo.previousClass"
                      value={formData.academicInfo.previousClass}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Transfer Certificate Number</label>
                  <Input
                    type="text"
                    name="academicInfo.tcNumber"
                    value={formData.academicInfo.tcNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Remarks</label>
                  <textarea
                    name="academicInfo.remarks"
                    value={formData.academicInfo.remarks}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows="4"
                    placeholder="Additional academic information, achievements, etc."
                  />
                </div>
              </div>
            )}

            {/* Medical Tab */}
            {activeTab === 'medical' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Allergies</label>
                  <textarea
                    name="medicalInfo.allergies"
                    value={formData.medicalInfo.allergies}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows="3"
                    placeholder="List any known allergies"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Chronic Conditions</label>
                  <textarea
                    name="medicalInfo.chronicConditions"
                    value={formData.medicalInfo.chronicConditions}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows="3"
                    placeholder="List any chronic medical conditions"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Current Medications</label>
                  <textarea
                    name="medicalInfo.medications"
                    value={formData.medicalInfo.medications}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows="3"
                    placeholder="List current medications and dosages"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Doctor Name</label>
                    <Input
                      type="text"
                      name="medicalInfo.doctorName"
                      value={formData.medicalInfo.doctorName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Doctor Phone</label>
                    <Input
                      type="tel"
                      name="medicalInfo.doctorPhone"
                      value={formData.medicalInfo.doctorPhone}
                      onChange={handleInputChange}
                      icon={Phone}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => handleDocumentUpload(e.target.files[0])}
                    className="hidden"
                    id="document-upload"
                  />
                  <label htmlFor="document-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {uploading ? 'Uploading...' : 'Click to upload documents'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, DOC, DOCX, JPG, PNG (Max 5MB)
                    </p>
                  </label>
                </div>

                {formData.documents && formData.documents.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Uploaded Documents</h4>
                    {formData.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">{doc.name}</p>
                            <p className="text-xs text-gray-500">{doc.type}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDocument(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
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
        title="Student Details"
        size="lg"
        footer={
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        {currentStudent && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center gap-4">
              {currentStudent.profilePhoto?.url ? (
                <img
                  src={currentStudent.profilePhoto.url}
                  alt={`${currentStudent.firstName} ${currentStudent.lastName}`}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold">
                  {currentStudent.firstName} {currentStudent.lastName}
                </h3>
                <p className="text-gray-600">{currentStudent.admissionNumber}</p>
                <p className="text-sm text-gray-500">{currentStudent.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Class</label>
                <p className="font-semibold">{currentStudent.classId?.name || 'Not Assigned'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className="capitalize font-semibold">{currentStudent.status}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Gender</label>
                <p className="capitalize">{currentStudent.gender}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Blood Group</label>
                <p>{currentStudent.bloodGroup || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                <p>
                  {currentStudent.dateOfBirth
                    ? new Date(currentStudent.dateOfBirth).toLocaleDateString()
                    : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Enrollment Date</label>
                <p>
                  {currentStudent.enrollmentDate
                    ? new Date(currentStudent.enrollmentDate).toLocaleDateString()
                    : '-'}
                </p>
              </div>
            </div>

            {currentStudent.parentInfo && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Parent Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Father Name</label>
                    <p>{currentStudent.parentInfo.fatherName || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Father Phone</label>
                    <p>{currentStudent.parentInfo.fatherPhone || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Mother Name</label>
                    <p>{currentStudent.parentInfo.motherName || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Mother Phone</label>
                    <p>{currentStudent.parentInfo.motherPhone || '-'}</p>
                  </div>
                </div>
              </div>
            )}

            {currentStudent.address && (
              <div className="border-t pt-4">
                <label className="text-sm font-medium text-gray-500">Address</label>
                <p>
                  {currentStudent.address.street && `${currentStudent.address.street}, `}
                  {currentStudent.address.city && `${currentStudent.address.city}, `}
                  {currentStudent.address.state && `${currentStudent.address.state} `}
                  {currentStudent.address.postalCode}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
