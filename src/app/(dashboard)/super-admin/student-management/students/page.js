 'use client';

import { useState, useEffect, useRef } from 'react';
import Modal from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import Dropdown from '@/components/ui/dropdown';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  UserPlus,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  MapPin,
  X,
  Upload,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import apiClient from '@/lib/api-client';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [branches, setBranches] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showQrPreview, setShowQrPreview] = useState(false);
  const [qrUrl, setQrUrl] = useState('');

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState('basic');
  const formRef = useRef(null);

  const [pendingProfileFile, setPendingProfileFile] = useState(null);
  const [pendingDocuments, setPendingDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [studentToDelete, setStudentToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToActivate, setStudentToActivate] = useState(null);
  const [showActivateModal, setShowActivateModal] = useState(false);

  const [branchFilter, setBranchFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  const [loadingStates, setLoadingStates] = useState({});
  const setButtonLoading = (key, value) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  };
  const isButtonLoading = (key) => loadingStates[key] || false;

  const loadClasses = async (selectedBranchId = null) => {
    try {
      const branchToUse = selectedBranchId || branchFilter || '';
      const params = new URLSearchParams();
      if (branchToUse) params.append('branchId', branchToUse);
      params.append('limit', '100');

      const data = await apiClient.get(`/api/super-admin/classes?${params}`);
      if (data && data.success) {
        const payload = data.data;
        // classes route returns data as an array (data.data) or wrapped in { classes }
        let items = [];
        if (Array.isArray(payload)) {
          items = payload;
        } else if (Array.isArray(payload?.classes)) {
          items = payload.classes;
        }

        setClasses(items);
      } else {
        setClasses([]);
      }
    } catch (error) {
      // apiClient throws a friendly error object in many cases; log useful details
      console.error('Error loading classes:', error?.message ? error.message : error);
      setClasses([]);
    }
  };

  const loadBranches = async () => {
    try {
      const res = await apiClient.get('/api/super-admin/branches?limit=200');
      if (res && res.success) {
        const payload = res.data;
        setBranches(Array.isArray(payload) ? payload : payload?.branches || []);
      } else {
        setBranches([]);
      }
    } catch (err) {
      console.error('Error loading branches:', err);
      setBranches([]);
    }
  };

  const loadStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', String(page || 1));
      params.append('limit', String(limit || 50));
      if (branchFilter) params.append('branchId', branchFilter);
      if (classFilter) params.append('classId', classFilter);
      if (genderFilter) params.append('gender', genderFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const res = await apiClient.get(`/api/super-admin/users/students?${params.toString()}`);
      if (res && res.success) {
        const studentsData = Array.isArray(res.data) ? res.data : res.data?.students || [];
        setStudents(studentsData);
        setTotal(res.pagination?.total || (Array.isArray(res.data) ? res.data.length : 0));
      } else {
        setStudents([]);
        setTotal(0);
      }
    } catch (err) {
      console.error('Error loading students:', err);
      setStudents([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data and whenever filters/pagination change
  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    loadStudents();
  }, [page, limit, branchFilter, classFilter, genderFilter, statusFilter, searchTerm]);

  // Keep class options in sync with the selected branch filter
  useEffect(() => {
    // when branchFilter changes, reload classes for that branch
    try {
      loadClasses(branchFilter || null);
    } catch (err) {
      console.error('Failed to load classes on branch change:', err);
    }
  }, [branchFilter]);

  const handleAddNew = () => {
    setEditingStudent(null);
    setFormData({
      registrationNumber: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: 'male',
      bloodGroup: '',
      religion: '',
      nationality: 'Pakistani',
      address: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Pakistan',
      },
      branchId: '',
      classId: '',
      section: '',
      rollNumber: '',
      admissionDate: new Date().toISOString().split('T')[0],
      academicYear: new Date().getFullYear().toString(),
      father: {
        name: '',
        occupation: '',
        phone: '',
        email: '',
        cnic: '',
      },
      mother: {
        name: '',
        occupation: '',
        phone: '',
        email: '',
        cnic: '',
      },
      status: 'active',
      remarks: '',
    });
    setActiveTab('basic');
    setShowModal(true);
  };

  const handleEdit = async (student) => {
    setEditingStudent(student);
    setFormData({
      registrationNumber: student.studentProfile?.registrationNumber || '',
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email || '',
      phone: student.phone || '',
      dateOfBirth: student.dateOfBirth ? format(new Date(student.dateOfBirth), 'yyyy-MM-dd') : '',
      gender: student.gender,
      bloodGroup: student.bloodGroup || '',
      religion: student.religion || '',
      nationality: student.nationality || 'Pakistani',
      cnic: student.cnic || '',
      address: student.address || {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Pakistan',
      },
  branchId: student.branchId?._id || student.branchId || '',
  classId: student.studentProfile?.classId?._id || student.studentProfile?.classId || '',
      departmentId: student.studentProfile?.departmentId?._id || '',
      section: student.studentProfile?.section || '',
      rollNumber: student.studentProfile?.rollNumber || '',
      admissionDate: student.studentProfile?.admissionDate ? format(new Date(student.studentProfile.admissionDate), 'yyyy-MM-dd') : '',
      academicYear: student.studentProfile?.academicYear || new Date().getFullYear().toString(),
      previousSchool: student.studentProfile?.previousSchool || '',
      father: student.studentProfile?.father || { name: '', occupation: '', phone: '', email: '', cnic: '' },
      mother: student.studentProfile?.mother || { name: '', occupation: '', phone: '', email: '', cnic: '' },
      guardian: student.studentProfile?.guardian || { name: '', relationship: '', phone: '', email: '', cnic: '' },
      feeDiscount: student.studentProfile?.feeDiscount || 0,
      transportFee: student.studentProfile?.transportFee || false,
      status: student.status,
      remarks: student.remarks || '',
    });
    // Ensure classes for this student's branch are loaded so class/section selects populate
    try {
      await loadClasses(student.branchId?._id || student.branchId || '');
    } catch (err) {
      // ignore - classes will be empty
    }

    setActiveTab('basic');
    setShowModal(true);
  };

  const openView = async (student) => {
    setSelectedStudent(student);
    // ensure classes loaded for the branch to display class name/sections properly
    try { await loadClasses(student.branchId?._id || student.branchId || ''); } catch (e) {}
    setShowViewModal(true);
  };

  const closeView = () => {
    setShowViewModal(false);
    setSelectedStudent(null);
  };

  const handleProfileUpload = async (file) => {
    if (!selectedStudent) return;
    try {
      setUploading(true);
      const form = new FormData();
      form.append('file', file);
      form.append('fileType', 'profile');
      form.append('userId', selectedStudent._id);

      const res = await apiClient.post('/api/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res && res.success) {
        toast.success('Profile photo uploaded');
        // server returns updated user in some responses; if so, update selectedStudent
        if (res.data) setSelectedStudent(res.data);
        loadStudents();
      } else {
        toast.error(res?.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Profile upload error:', err);
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentUpload = async (file, documentType = 'other') => {
    if (!selectedStudent) return;
    try {
      setUploading(true);
      const form = new FormData();
      form.append('file', file);
      form.append('fileType', 'student_document');
      form.append('documentType', documentType);
      form.append('userId', selectedStudent._id);

      const res = await apiClient.post('/api/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res && res.success) {
        toast.success('Document uploaded');
        // merge new document into selectedStudent if returned
        const newDoc = res.data?.document;
        if (newDoc) {
          setSelectedStudent(prev => ({ ...prev, studentProfile: { ...prev.studentProfile, documents: [...(prev.studentProfile?.documents||[]), newDoc] } }));
        }
        loadStudents();
      } else {
        toast.error(res?.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Document upload error:', err);
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.branchId || !formData.classId || !formData.father.name || !formData.father.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    setButtonLoading('submitForm', true);
    try {
      // Restructure data for unified User schema
      const payload = {
        role: 'student',
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        nationality: formData.nationality,
        cnic: formData.cnic,
        address: formData.address,
        branchId: formData.branchId,
        status: formData.status,
        remarks: formData.remarks,
        studentProfile: {
          classId: formData.classId,
          departmentId: formData.departmentId,
          section: formData.section,
          rollNumber: formData.rollNumber,
          admissionDate: formData.admissionDate,
          academicYear: formData.academicYear,
          previousSchool: formData.previousSchool,
          father: formData.father,
          mother: formData.mother,
          guardian: formData.guardian,
          feeDiscount: formData.feeDiscount,
          transportFee: formData.transportFee,
        }
      };

      let data;
      if (editingStudent) {
        data = await apiClient.put(`/api/users/${editingStudent._id}`, payload);
      } else {
        data = await apiClient.post('/api/users/students', payload);
      }

      if (data.success) {
        toast.success(data.message);
        // After create/update, upload any pending files (profile/documents)
        try {
          const userId = editingStudent ? editingStudent._id : (data.data?._id || data.data?._id);

          if (pendingProfileFile && userId) {
            const form = new FormData();
            form.append('file', pendingProfileFile);
            form.append('fileType', 'profile');
            form.append('userId', userId);
            const upRes = await apiClient.post('/api/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (upRes && upRes.success) {
              toast.success('Profile photo uploaded');
            }
          }

          if (pendingDocuments.length > 0 && userId) {
            for (const d of pendingDocuments) {
              const form = new FormData();
              form.append('file', d.file);
              form.append('fileType', 'student_document');
              form.append('documentType', d.type || 'other');
              form.append('userId', userId);
              try {
                const docRes = await apiClient.post('/api/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
                if (docRes && docRes.success) {
                  toast.success(`${d.file.name} uploaded`);
                }
              } catch (err) {
                console.error('Doc upload failed:', err);
                toast.error(`Failed to upload ${d.file.name}`);
              }
            }
          }
        } catch (err) {
          console.error('Pending uploads error:', err);
          toast.error('Some uploads failed');
        } finally {
          // clear pending uploads
          setPendingProfileFile(null);
          setPendingDocuments([]);
        }

        setShowModal(false);
        loadStudents();

        // If a QR was generated and uploaded, show preview to the admin
        if (!editingStudent && data.data?.studentProfile?.qr?.url) {
          setQrUrl(data.data.studentProfile.qr.url);
          setShowQrPreview(true);
        }
      } else {
        toast.error(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving student:', error);
      toast.error(error.message || 'Failed to save student');
    } finally {
      setButtonLoading('submitForm', false);
    }
  };

  const handleDelete = async () => {
    if (!studentToDelete) return;

    setButtonLoading('deleteStudent', true);
    try {
      const data = await apiClient.delete(`/api/users/${studentToDelete._id}`);

      if (data.success) {
        toast.success('Student deactivated successfully');
        setShowDeleteModal(false);
        setStudentToDelete(null);
        loadStudents();
      } else {
        toast.error(data.message || 'Failed to deactivate student');
      }
    } catch (error) {
      console.error('Error deactivating student:', error);
      toast.error('Failed to deactivate student');
    } finally {
      setButtonLoading('deleteStudent', false);
    }
  };

  const handleActivate = async () => {
    if (!studentToActivate) return;

    setButtonLoading('activateStudent', true);
    try {
      const payload = { status: 'active', isActive: true };
      const data = await apiClient.put(`/api/users/${studentToActivate._id}`, payload);

      if (data && data.success) {
        toast.success('Student activated successfully');
        setShowActivateModal(false);
        setStudentToActivate(null);
        loadStudents();
      } else {
        toast.error(data.message || 'Failed to activate student');
      }
    } catch (error) {
      console.error('Error activating student:', error);
      toast.error('Failed to activate student');
    } finally {
      setButtonLoading('activateStudent', false);
    }
  };

  // Calculate stats
  const totalStudents = Array.isArray(students) ? students.length : 0;
  const maleStudents = Array.isArray(students) ? students.filter(s => s.gender === 'male').length : 0;
  const femaleStudents = Array.isArray(students) ? students.filter(s => s.gender === 'female').length : 0;
  const activeStudents = Array.isArray(students) ? students.filter(s => s.status === 'active').length : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage student admissions and records</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <UserPlus className="w-4 h-4" />
          Add Student
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalStudents}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Students</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{activeStudents}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Male Students</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{maleStudents}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Female Students</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{femaleStudents}</p>
            </div>
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-pink-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="min-w-0">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search students..."
            />
          </div>

          <Dropdown
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            options={branches.map(b => ({ value: b._id, label: `${b.name}` }))}
            placeholder="All Branches"
          />

          <Dropdown
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            options={classes.map(c => ({ value: c._id, label: `${c.name} (Grade ${c.grade})` }))}
            placeholder="All Classes"
          />

          <Dropdown
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other', label: 'Other' },
            ]}
            placeholder="All Genders"
          />

          <Dropdown
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'graduated', label: 'Graduated' },
              { value: 'transferred', label: 'Transferred' },
            ]}
            placeholder="All Status"
          />
        </div>
      </div>

      {/* Students Table (using global Table components) */}
      <Table className="w-full">
        <TableHeader className="bg-gray-50 border-b border-gray-200">
          <TableRow>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reg No.</TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Father Info</TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</TableHead>
            <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-gray-200">
          {students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="px-6 py-12 text-center text-gray-500">No students found. Add your first student to get started.</TableCell>
            </TableRow>
          ) : (
            students.map((student) => (
              <TableRow key={student._id} className="hover:bg-gray-50">
                <TableCell className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</p>
                    <div className="flex items-center gap-4 mt-1">
                      {student.email && <p className="text-xs text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" />{student.email}</p>}
                      {student.phone && <p className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" />{student.phone}</p>}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-6 py-4">
                  <p className="text-sm font-mono text-gray-900">{student.registrationNumber}</p>
                  <p className="text-xs text-gray-500">{student.gender === 'male' ? '♂' : '♀'} {student.gender}</p>
                </TableCell>

                <TableCell className="px-6 py-4">
                  <p className="text-sm text-gray-900">{student.classId?.name}</p>
                  <p className="text-xs text-gray-500">Grade {student.classId?.grade}</p>
                </TableCell>

                <TableCell className="px-6 py-4">
                  <p className="text-sm text-gray-900">{student.branchId?.name}</p>
                  <p className="text-xs text-gray-500">{student.branchId?.city}</p>
                </TableCell>

                <TableCell className="px-6 py-4">
                  <p className="text-sm text-gray-900">{student.father?.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" />{student.father?.phone}</p>
                </TableCell>

                <TableCell className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    student.status === 'active' ? 'bg-green-100 text-green-700' : student.status === 'graduated' ? 'bg-blue-100 text-blue-700' : student.status === 'transferred' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                  }`}>{student.status}</span>
                </TableCell>

                <TableCell className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleEdit(student)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Edit"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => openView(student)} className="p-2 text-gray-700 hover:bg-gray-50 rounded" title="View"><Eye className="w-4 h-4" /></button>
                    {student.status === 'inactive' ? (
                      <button onClick={() => { setStudentToActivate(student); setShowActivateModal(true); }} className="p-2 text-green-600 hover:bg-green-50 rounded" title="Activate"><UserPlus className="w-4 h-4" /></button>
                    ) : (
                      <button onClick={() => { setStudentToDelete(student); setShowDeleteModal(true); }} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Deactivate"><Trash2 className="w-4 h-4" /></button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Create/Edit Modal */}
      {showModal && (
        <Modal
          open={showModal}
          title={editingStudent ? 'Edit Student' : 'Add New Student'}
          onClose={() => setShowModal(false)}
          size="lg"
          footer={(
            <div className="flex items-center justify-end gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              <button type="button" onClick={() => formRef.current && (formRef.current.requestSubmit ? formRef.current.requestSubmit() : formRef.current.submit())} disabled={isButtonLoading('submitForm')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2">
                {isButtonLoading('submitForm') ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Saving...</>) : (editingStudent ? 'Update Student' : 'Add Student')}
              </button>
            </div>
          )}
        >
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === 'basic'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Basic Info
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('academic')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === 'academic'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Academic Info
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('parent')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === 'parent'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Parent Info
              </button>
            </div>

            <form ref={formRef} onSubmit={handleFormSubmit} className="p-2">
              {/* Basic Info Tab */}
              {activeTab === 'basic' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="John"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <Dropdown
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        options={[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }, { label: 'Other', value: 'other' }]}
                        placeholder="Select Gender"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Blood Group
                      </label>
                      <Dropdown
                        id="bloodGroup"
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                        options={[{ label: 'Select', value: '' }, { label: 'A+', value: 'A+' }, { label: 'A-', value: 'A-' }, { label: 'B+', value: 'B+' }, { label: 'B-', value: 'B-' }, { label: 'AB+', value: 'AB+' }, { label: 'AB-', value: 'AB-' }, { label: 'O+', value: 'O+' }, { label: 'O-', value: 'O-' }]}
                        placeholder="Select Blood Group"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="student@example.com" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <Input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+92-XXX-XXXXXXX" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Religion
                      </label>
                      <input
                        type="text"
                        value={formData.religion}
                        onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Islam"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nationality
                      </label>
                      <input
                        type="text"
                        value={formData.nationality}
                        onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Pakistani"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      value={formData.address.street}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, street: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="2"
                      placeholder="Street address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.address.city}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: { ...formData.address, city: e.target.value }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Lahore"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        value={formData.address.state}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: { ...formData.address, state: e.target.value }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Punjab"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={formData.address.postalCode}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: { ...formData.address, postalCode: e.target.value }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="54000"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Academic Info Tab */}
              {activeTab === 'academic' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Registration Number
                      </label>
                      <input
                        type="text"
                        value={formData.registrationNumber}
                        onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                        disabled={editingStudent}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        placeholder="Auto-generated if empty"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Admission Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.admissionDate}
                        onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Branch <span className="text-red-500">*</span></label>
                      <Dropdown
                        id="form-branch"
                        name="branchId"
                        value={formData.branchId}
                        onChange={async (e) => {
                          const b = e.target.value;
                          setFormData(prev => ({ ...prev, branchId: b, classId: '', section: '' }));
                          try { await loadClasses(b); } catch (err) { console.error('Failed to load classes for branch:', err); }
                        }}
                        options={[{ label: 'Select Branch', value: '' }, ...branches.map(branch => ({ label: `${branch.name} - ${branch.address?.city}`, value: branch._id }))]}
                        placeholder="Select Branch"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Class <span className="text-red-500">*</span></label>
                      <Dropdown
                        id="form-class"
                        name="classId"
                        value={formData.classId}
                        onChange={(e) => setFormData(prev => ({ ...prev, classId: e.target.value, section: '' }))}
                        options={[{ label: 'Select Class', value: '' }, ...classes.map(cls => ({ label: `${cls.name} (Grade ${cls.grade})`, value: cls._id }))]}
                        placeholder="Select Class"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Section
                      </label>
                      <Dropdown
                        id="form-section"
                        name="section"
                        value={formData.section}
                        onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                        options={[{ label: 'Select Section', value: '' }, ...((classes.find(c => c._id === formData.classId)?.sections || []).map((s, idx) => ({ label: s.name || s, value: s.name || s._id })))]}
                        placeholder="Select Section"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Roll Number
                      </label>
                      <input
                        type="text"
                        value={formData.rollNumber}
                        onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="001"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Academic Year <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.academicYear}
                        onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="2024-2025"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="graduated">Graduated</option>
                        <option value="transferred">Transferred</option>
                      </select>
                    </div>
                  </div>

                  <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Remarks
                        </label>
                        <textarea
                          value={formData.remarks}
                          onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows="3"
                          placeholder="Any additional notes..."
                        />

                        {/* Uploads in Add/Edit form */}
                        <div className="mt-4 border-t pt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Profile Photo (optional)</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setPendingProfileFile(e.target.files?.[0] || null)}
                          />
                          {pendingProfileFile && (
                            <div className="mt-2 flex items-center justify-between bg-gray-50 p-2 rounded">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white overflow-hidden rounded">
                                  <img src={URL.createObjectURL(pendingProfileFile)} alt="preview" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{pendingProfileFile.name}</p>
                                  <p className="text-xs text-gray-500">{Math.round(pendingProfileFile.size/1024)} KB</p>
                                </div>
                              </div>
                              <button type="button" className="text-sm text-red-600" onClick={() => setPendingProfileFile(null)}>Remove</button>
                            </div>
                          )}

                          <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Attach Documents (optional)</p>
                            <div className="flex items-center gap-2">
                              <select id="addDocType" className="px-3 py-2 border rounded">
                                <option value="b_form">B-Form</option>
                                <option value="birth_certificate">Birth Certificate</option>
                                <option value="previous_result">Previous Result</option>
                                <option value="other">Other</option>
                              </select>
                              <input type="file" id="addDocFile" />
                              <button type="button" className="px-3 py-2 bg-blue-600 text-white rounded" onClick={() => {
                                const fileInput = document.getElementById('addDocFile');
                                const typeSelect = document.getElementById('addDocType');
                                const file = fileInput?.files?.[0];
                                const type = typeSelect?.value || 'other';
                                if (file) {
                                  setPendingDocuments(prev => [...prev, { file, type }]);
                                  // clear inputs
                                  fileInput.value = '';
                                }
                              }}>Add</button>
                            </div>

                            {pendingDocuments.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {pendingDocuments.map((d, idx) => (
                                  <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                    <div>
                                      <p className="text-sm font-medium">{d.file.name}</p>
                                      <p className="text-xs text-gray-500">Type: {d.type}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button type="button" className="text-sm text-red-600" onClick={() => setPendingDocuments(prev => prev.filter((_, i) => i !== idx))}>Remove</button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                  </div>
                </>
              )}

              {/* Parent Info Tab */}
              {activeTab === 'parent' && (
                <>
                  <div className="border border-gray-200 rounded-lg p-4 mb-4">
                    <h3 className="font-medium text-gray-900 mb-4">Father Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Father Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.father.name}
                          onChange={(e) => setFormData({
                            ...formData,
                            father: { ...formData.father, name: e.target.value }
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="John Doe Sr."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Occupation
                        </label>
                        <input
                          type="text"
                          value={formData.father.occupation}
                          onChange={(e) => setFormData({
                            ...formData,
                            father: { ...formData.father, occupation: e.target.value }
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Business"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={formData.father.phone}
                          onChange={(e) => setFormData({
                            ...formData,
                            father: { ...formData.father, phone: e.target.value }
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+92-XXX-XXXXXXX"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.father.email}
                          onChange={(e) => setFormData({
                            ...formData,
                            father: { ...formData.father, email: e.target.value }
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="father@example.com"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CNIC
                      </label>
                      <input
                        type="text"
                        value={formData.father.cnic}
                        onChange={(e) => setFormData({
                          ...formData,
                          father: { ...formData.father, cnic: e.target.value }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="XXXXX-XXXXXXX-X"
                      />
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-4">Mother Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mother Name
                        </label>
                        <input
                          type="text"
                          value={formData.mother.name}
                          onChange={(e) => setFormData({
                            ...formData,
                            mother: { ...formData.mother, name: e.target.value }
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Jane Doe"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Occupation
                        </label>
                        <input
                          type="text"
                          value={formData.mother.occupation}
                          onChange={(e) => setFormData({
                            ...formData,
                            mother: { ...formData.mother, occupation: e.target.value }
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Teacher"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.mother.phone}
                          onChange={(e) => setFormData({
                            ...formData,
                            mother: { ...formData.mother, phone: e.target.value }
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+92-XXX-XXXXXXX"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.mother.email}
                          onChange={(e) => setFormData({
                            ...formData,
                            mother: { ...formData.mother, email: e.target.value }
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="mother@example.com"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CNIC
                      </label>
                      <input
                        type="text"
                        value={formData.mother.cnic}
                        onChange={(e) => setFormData({
                          ...formData,
                          mother: { ...formData.mother, cnic: e.target.value }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="XXXXX-XXXXXXX-X"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Footer handled by Modal footer prop */}
            </form>
          </div>
        </Modal>
      )}
      {/* Activate Modal (uses shared Modal with sticky footer) */}
      {showActivateModal && (
        <Modal
          open={showActivateModal}
          onClose={() => setShowActivateModal(false)}
          title="Activate Student"
          size="sm"
          footer={(
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowActivateModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleActivate}
                disabled={isButtonLoading('activateStudent')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isButtonLoading('activateStudent') ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Activating...
                  </>
                ) : (
                  'Activate'
                )}
              </button>
            </div>
          )}
        >
          <div className="p-4">
            <p className="text-gray-600">
              Are you sure you want to activate "{studentToActivate?.firstName} {studentToActivate?.lastName}"? The student will be marked as active.
            </p>
          </div>
        </Modal>
      )}

      {/* Delete Modal (uses shared Modal component with sticky footer) */}
      {showDeleteModal && (
        <Modal
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Deactivate Student"
          size="sm"
          footerClassName=""
          footer={(
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isButtonLoading('deleteStudent')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isButtonLoading('deleteStudent') ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deactivating...
                  </>
                ) : (
                  'Deactivate'
                )}
              </button>
            </div>
          )}
        >
          <div className="p-4">
            <p className="text-gray-600">
              Are you sure you want to deactivate "{studentToDelete?.firstName} {studentToDelete?.lastName}"? The student will be marked as inactive.
            </p>
          </div>
        </Modal>
      )}
      {/* QR Preview Modal */}
      {showQrPreview && (
        <Modal open={showQrPreview} title="Student QR" onClose={() => { setShowQrPreview(false); setQrUrl(''); }}>
          <div className="p-4">
            {qrUrl ? (
              <div className="flex flex-col items-center">
                <img src={qrUrl} alt="Student QR" className="max-w-full h-auto" />
                <div className="mt-4 flex items-center gap-2">
                  <a href={qrUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Open</a>
                  <a href={qrUrl} download className="px-4 py-2 bg-green-600 text-white rounded-lg">Download</a>
                  <button onClick={() => { setShowQrPreview(false); setQrUrl(''); }} className="px-4 py-2 bg-gray-100 rounded-lg">Close</button>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">No QR available</p>
            )}
          </div>
        </Modal>
      )}

      {/* Student View Modal */}
      {showViewModal && selectedStudent && (
        <Modal open={showViewModal} title="" onClose={closeView} size="lg">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left: Avatar & basic */}
              <div className="md:w-1/3 bg-gray-50 rounded-lg p-4 flex flex-col items-center gap-4">
                <div className="w-36 h-36 rounded-full overflow-hidden bg-white border">
                  {selectedStudent.profilePhoto?.url ? (
                    <img src={selectedStudent.profilePhoto.url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">No Photo</div>
                  )}
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                  <p className="text-sm text-gray-500">{selectedStudent.email || selectedStudent.phone || ''}</p>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${selectedStudent.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {selectedStudent.status}
                    </span>
                  </div>
                </div>

                <div className="w-full mt-3 text-sm">
                  <div className="flex justify-between py-1 border-b"><span className="text-gray-500">Registration</span><span className="font-medium">{selectedStudent.studentProfile?.registrationNumber || '-'}</span></div>
                  <div className="flex justify-between py-1 border-b"><span className="text-gray-500">Class</span><span className="font-medium">{(() => { const id = selectedStudent.studentProfile?.classId?._id || selectedStudent.studentProfile?.classId || selectedStudent.classId?._id || selectedStudent.classId; const found = classes.find(c => String(c._id) === String(id)); return found?.name || '-'; })()}</span></div>
                  <div className="flex justify-between py-1 border-b"><span className="text-gray-500">Branch</span><span className="font-medium">{selectedStudent.branchId?.name || '-'}</span></div>
                  <div className="flex justify-between py-1"><span className="text-gray-500">Roll</span><span className="font-medium">{selectedStudent.studentProfile?.rollNumber || '-'}</span></div>
                </div>

                {/* QR preview if exists */}
                {selectedStudent.studentProfile?.qr?.url && (
                  <div className="w-full mt-4">
                    <p className="text-xs text-gray-500 mb-2">QR Code</p>
                    <img src={selectedStudent.studentProfile.qr.url} alt="QR" className="mx-auto w-28 h-28 object-contain" />
                  </div>
                )}
              </div>

              {/* Right: Details & Documents */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border rounded p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Contact</h4>
                    <p className="text-sm"><strong>Phone:</strong> {selectedStudent.phone || '-'}</p>
                    <p className="text-sm mt-1"><strong>Email:</strong> {selectedStudent.email || '-'}</p>
                    <p className="text-sm mt-2"><strong>DOB:</strong> {selectedStudent.dateOfBirth ? new Date(selectedStudent.dateOfBirth).toLocaleDateString() : '-'}</p>
                  </div>

                  <div className="bg-white border rounded p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Parents</h4>
                    <p className="text-sm"><strong>Father:</strong> {selectedStudent.studentProfile?.father?.name || '-'}</p>
                    <p className="text-sm text-gray-500">{selectedStudent.studentProfile?.father?.phone || ''}</p>
                    <p className="text-sm mt-2"><strong>Mother:</strong> {selectedStudent.studentProfile?.mother?.name || '-'}</p>
                    <p className="text-sm text-gray-500">{selectedStudent.studentProfile?.mother?.phone || ''}</p>
                  </div>
                </div>

                <div className="bg-white border rounded p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-700">Documents</h4>
                    <div className="flex items-center gap-2">
                      <select id="viewDocType" className="px-2 py-1 border rounded text-sm">
                        <option value="b_form">B-Form</option>
                        <option value="birth_certificate">Birth Certificate</option>
                        <option value="previous_result">Previous Result</option>
                        <option value="other">Other</option>
                      </select>
                      <input type="file" id="viewDocFile" className="text-sm" />
                      <button type="button" className="px-3 py-1 bg-blue-600 text-white rounded text-sm" onClick={() => {
                        const fileInput = document.getElementById('viewDocFile');
                        const type = document.getElementById('viewDocType')?.value || 'other';
                        const file = fileInput?.files?.[0];
                        if (file) handleDocumentUpload(file, type);
                      }}>Upload</button>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedStudent.studentProfile?.documents?.length > 0 ? selectedStudent.studentProfile.documents.map((d, i) => (
                      <div key={d.publicId || i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white rounded overflow-hidden border flex items-center justify-center">
                            {d.url && d.url.match(/\.jpg$|\.jpeg$|\.png$|\.gif$/i) ? (
                              <img src={d.url} alt={d.name || d.type} className="w-full h-full object-cover" />
                            ) : (
                              <div className="text-xs text-gray-500 px-2">{d.type}</div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{d.name || d.type}</p>
                            <p className="text-xs text-gray-500">{d.uploadedAt ? new Date(d.uploadedAt).toLocaleString() : ''}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a href={d.url} target="_blank" rel="noreferrer" className="text-blue-600 text-sm">Open</a>
                          <button type="button" className="text-sm text-red-600" onClick={async () => {
                            if (!d.publicId) return;
                            try {
                              const del = await apiClient.delete(`/api/upload?publicId=${encodeURIComponent(d.publicId)}&fileType=student_document&documentId=${d._id}`);
                              if (del && del.success) {
                                toast.success('Document deleted');
                                setSelectedStudent(prev => ({ ...prev, studentProfile: { ...prev.studentProfile, documents: prev.studentProfile.documents.filter(doc => doc.publicId !== d.publicId) } }));
                                loadStudents();
                              } else {
                                toast.error(del?.message || 'Delete failed');
                              }
                            } catch (err) {
                              console.error('Delete doc error', err);
                              toast.error('Delete failed');
                            }
                          }}>Delete</button>
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-2 text-sm text-gray-500">No documents uploaded</div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button onClick={closeView} className="px-4 py-2 bg-gray-100 rounded">Close</button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
