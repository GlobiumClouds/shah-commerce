'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building2,
  X,
  GraduationCap,
  Award,
  Briefcase,
  DollarSign,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';

export default function TeachersPage() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [activeTab, setActiveTab] = useState('personal'); // personal, academic, salary
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  // Form state
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
    cnic: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: 'Pakistan',
      postalCode: '',
    },
    branchId: '',
    joiningDate: new Date().toISOString().split('T')[0],
    designation: 'Teacher',
    department: '',
    qualifications: [],
    experience: {
      totalYears: 0,
      previousInstitutions: [],
    },
    salaryDetails: {
      basicSalary: 0,
      allowances: {
        houseRent: 0,
        medical: 0,
        transport: 0,
        other: 0,
      },
      deductions: {
        tax: 0,
        providentFund: 0,
        insurance: 0,
        other: 0,
      },
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
    },
    status: 'active',
    remarks: '',
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    onLeave: 0,
    inactive: 0,
  });

  useEffect(() => {
    fetchTeachers();
    fetchBranches();
  }, [searchTerm, selectedBranch, selectedStatus, selectedDesignation, selectedDepartment]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        role: 'teacher',
        limit: '100',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedBranch && { branchId: selectedBranch }),
        ...(selectedStatus && { status: selectedStatus }),
        ...(selectedDesignation && { designation: selectedDesignation }),
        ...(selectedDepartment && { department: selectedDepartment }),
      });

      const response = await apiClient.get(`/api/users?${params}`);
      
      if (response.success) {
        setTeachers(response.data);
        
        // Calculate stats
        const total = response.data.length;
        const active = response.data.filter(t => t.status === 'active').length;
        const onLeave = response.data.filter(t => t.status === 'on_leave').length;
        const inactive = response.data.filter(t => t.status === 'inactive').length;
        
        setStats({ total, active, onLeave, inactive });
      }
    } catch (error) {
      toast.error('Failed to fetch teachers');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await apiClient.get('/api/super-admin/branches?limit=100');
      if (response.success) {
        setBranches(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Prepare data for unified User model
      const payload = {
        role: 'teacher',
        ...formData,
        teacherProfile: {
          designation: formData.designation,
          departmentId: formData.departmentId,
          department: formData.department,
          joiningDate: formData.joiningDate,
          salaryDetails: formData.salaryDetails,
          qualifications: formData.qualifications || [],
          experience: formData.experience || { totalYears: 0, previousInstitutions: [] },
          emergencyContact: formData.emergencyContact || {},
        },
      };

      if (editingTeacher) {
        const response = await apiClient.put(
          `/api/users/${editingTeacher._id}`,
          payload
        );
        
        if (response.success) {
          toast.success('Teacher updated successfully');
          fetchTeachers();
          handleCloseModal();
        }
      } else {
        const response = await apiClient.post('/api/users/teachers', payload);
        
        if (response.success) {
          toast.success('Teacher created successfully');
          fetchTeachers();
          handleCloseModal();
        }
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save teacher');
      console.error(error);
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      firstName: teacher.firstName || '',
      lastName: teacher.lastName || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      alternatePhone: teacher.alternatePhone || '',
      dateOfBirth: teacher.dateOfBirth ? new Date(teacher.dateOfBirth).toISOString().split('T')[0] : '',
      gender: teacher.gender || 'male',
      bloodGroup: teacher.bloodGroup || '',
      nationality: teacher.nationality || 'Pakistani',
      cnic: teacher.cnic || '',
      address: teacher.address || {
        street: '',
        city: '',
        state: '',
        country: 'Pakistan',
        postalCode: '',
      },
      branchId: teacher.branchId?._id || '',
      joiningDate: teacher.teacherProfile?.joiningDate ? new Date(teacher.teacherProfile.joiningDate).toISOString().split('T')[0] : '',
      designation: teacher.teacherProfile?.designation || 'Teacher',
      department: teacher.teacherProfile?.department || '',
      departmentId: teacher.teacherProfile?.departmentId?._id || '',
      qualifications: teacher.teacherProfile?.qualifications || [],
      experience: teacher.teacherProfile?.experience || {
        totalYears: 0,
        previousInstitutions: [],
      },
      salaryDetails: teacher.teacherProfile?.salaryDetails || {
        basicSalary: 0,
        allowances: {
          houseRent: 0,
          medical: 0,
          transport: 0,
          other: 0,
        },
        deductions: {
          tax: 0,
          providentFund: 0,
          insurance: 0,
          other: 0,
        },
      },
      emergencyContact: teacher.teacherProfile?.emergencyContact || {
        name: '',
        relationship: '',
        phone: '',
      },
      status: teacher.status || 'active',
      remarks: teacher.remarks || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to deactivate this teacher?')) return;
    
    try {
      const response = await apiClient.delete(`/api/users/${id}`);
      
      if (response.success) {
        toast.success('Teacher deactivated successfully');
        fetchTeachers();
      }
    } catch (error) {
      toast.error('Failed to delete teacher');
      console.error(error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTeacher(null);
    setActiveTab('personal');
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
      cnic: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: 'Pakistan',
        postalCode: '',
      },
      branchId: '',
      joiningDate: new Date().toISOString().split('T')[0],
      designation: 'Teacher',
      department: '',
      qualifications: [],
      experience: {
        totalYears: 0,
        previousInstitutions: [],
      },
      salaryDetails: {
        basicSalary: 0,
        allowances: {
          houseRent: 0,
          medical: 0,
          transport: 0,
          other: 0,
        },
        deductions: {
          tax: 0,
          providentFund: 0,
          insurance: 0,
          other: 0,
        },
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
      },
      status: 'active',
      remarks: '',
    });
  };

  const addQualification = () => {
    setFormData({
      ...formData,
      qualifications: [
        ...formData.qualifications,
        { degree: '', institution: '', yearOfCompletion: new Date().getFullYear(), grade: '', major: '' },
      ],
    });
  };

  const removeQualification = (index) => {
    const newQualifications = formData.qualifications.filter((_, i) => i !== index);
    setFormData({ ...formData, qualifications: newQualifications });
  };

  const updateQualification = (index, field, value) => {
    const newQualifications = [...formData.qualifications];
    newQualifications[index] = { ...newQualifications[index], [field]: value };
    setFormData({ ...formData, qualifications: newQualifications });
  };

  const designations = [
    'Principal',
    'Vice Principal',
    'Head Teacher',
    'Senior Teacher',
    'Teacher',
    'Junior Teacher',
    'Subject Specialist',
    'Lab Instructor',
    'Physical Instructor',
    'Art Teacher',
    'Music Teacher',
    'Other',
  ];

  const departments = [
    'Science',
    'Mathematics',
    'English',
    'Urdu',
    'Islamiyat',
    'Social Studies',
    'Computer Science',
    'Physics',
    'Chemistry',
    'Biology',
    'Commerce',
    'Arts',
    'Physical Education',
    'Other',
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="h-7 w-7" />
          Teacher Management
        </h1>
        <p className="text-gray-600 mt-1">Manage teaching staff and their information</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Teachers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">On Leave</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.onLeave}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <Users className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name, employee ID, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Branch Filter */}
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Branches</option>
            {branches.map((branch) => (
              <option key={branch._id} value={branch._id}>
                {branch.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on_leave">On Leave</option>
            <option value="terminated">Terminated</option>
            <option value="resigned">Resigned</option>
          </select>

          {/* Designation Filter */}
          <select
            value={selectedDesignation}
            onChange={(e) => setSelectedDesignation(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Designations</option>
            {designations.map((des) => (
              <option key={des} value={des}>
                {des}
              </option>
            ))}
          </select>

          {/* Add Button */}
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="h-5 w-5" />
            Add Teacher
          </button>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading teachers...</div>
        ) : teachers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No teachers found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Branch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teachers.map((teacher) => (
                  <tr key={teacher._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {teacher.firstName} {teacher.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{teacher.employeeId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-sm text-gray-900">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {teacher.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {teacher.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-900">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        {teacher.branchId?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                        {teacher.designation}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {teacher.department || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          teacher.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : teacher.status === 'on_leave'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {teacher.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(teacher)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(teacher._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 px-6">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'personal'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Personal Info
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('academic')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'academic'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Academic Info
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('salary')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'salary'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Salary Info
                  </div>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* Personal Info Tab */}
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({ ...formData, firstName: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CNIC *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.cnic}
                        onChange={(e) =>
                          setFormData({ ...formData, cnic: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="XXXXX-XXXXXXX-X"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.dateOfBirth}
                        onChange={(e) =>
                          setFormData({ ...formData, dateOfBirth: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender *
                      </label>
                      <select
                        required
                        value={formData.gender}
                        onChange={(e) =>
                          setFormData({ ...formData, gender: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Blood Group
                      </label>
                      <select
                        value={formData.bloodGroup}
                        onChange={(e) =>
                          setFormData({ ...formData, bloodGroup: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address
                        </label>
                        <input
                          type="text"
                          value={formData.address.street}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: { ...formData.address, street: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={formData.address.city}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: { ...formData.address, city: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          value={formData.address.postalCode}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: { ...formData.address, postalCode: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={formData.emergencyContact.name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              emergencyContact: {
                                ...formData.emergencyContact,
                                name: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Relationship
                        </label>
                        <input
                          type="text"
                          value={formData.emergencyContact.relationship}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              emergencyContact: {
                                ...formData.emergencyContact,
                                relationship: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.emergencyContact.phone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              emergencyContact: {
                                ...formData.emergencyContact,
                                phone: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Academic Info Tab */}
              {activeTab === 'academic' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Branch *
                      </label>
                      <select
                        required
                        value={formData.branchId}
                        onChange={(e) =>
                          setFormData({ ...formData, branchId: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Branch</option>
                        {branches.map((branch) => (
                          <option key={branch._id} value={branch._id}>
                            {branch.name} - {branch.city}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Joining Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.joiningDate}
                        onChange={(e) =>
                          setFormData({ ...formData, joiningDate: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Designation *
                      </label>
                      <select
                        required
                        value={formData.designation}
                        onChange={(e) =>
                          setFormData({ ...formData, designation: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {designations.map((des) => (
                          <option key={des} value={des}>
                            {des}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <select
                        value={formData.department}
                        onChange={(e) =>
                          setFormData({ ...formData, department: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Experience (Years)
                      </label>
                      <input
                        type="number"
                        value={formData.experience.totalYears}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            experience: {
                              ...formData.experience,
                              totalYears: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="on_leave">On Leave</option>
                        <option value="terminated">Terminated</option>
                        <option value="resigned">Resigned</option>
                      </select>
                    </div>
                  </div>

                  {/* Qualifications */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Qualifications</h3>
                      <button
                        type="button"
                        onClick={addQualification}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Add Qualification
                      </button>
                    </div>
                    
                    {formData.qualifications.map((qual, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 mb-3"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">
                            Qualification {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeQualification(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Degree
                            </label>
                            <input
                              type="text"
                              value={qual.degree}
                              onChange={(e) =>
                                updateQualification(index, 'degree', e.target.value)
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Institution
                            </label>
                            <input
                              type="text"
                              value={qual.institution}
                              onChange={(e) =>
                                updateQualification(index, 'institution', e.target.value)
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Year
                            </label>
                            <input
                              type="number"
                              value={qual.yearOfCompletion}
                              onChange={(e) =>
                                updateQualification(
                                  index,
                                  'yearOfCompletion',
                                  parseInt(e.target.value)
                                )
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Grade/CGPA
                            </label>
                            <input
                              type="text"
                              value={qual.grade}
                              onChange={(e) =>
                                updateQualification(index, 'grade', e.target.value)
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Salary Info Tab */}
              {activeTab === 'salary' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Basic Salary *
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.salaryDetails.basicSalary}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            salaryDetails: {
                              ...formData.salaryDetails,
                              basicSalary: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Allowances */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Allowances</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          House Rent
                        </label>
                        <input
                          type="number"
                          value={formData.salaryDetails.allowances.houseRent}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              salaryDetails: {
                                ...formData.salaryDetails,
                                allowances: {
                                  ...formData.salaryDetails.allowances,
                                  houseRent: parseFloat(e.target.value) || 0,
                                },
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Medical
                        </label>
                        <input
                          type="number"
                          value={formData.salaryDetails.allowances.medical}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              salaryDetails: {
                                ...formData.salaryDetails,
                                allowances: {
                                  ...formData.salaryDetails.allowances,
                                  medical: parseFloat(e.target.value) || 0,
                                },
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Transport
                        </label>
                        <input
                          type="number"
                          value={formData.salaryDetails.allowances.transport}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              salaryDetails: {
                                ...formData.salaryDetails,
                                allowances: {
                                  ...formData.salaryDetails.allowances,
                                  transport: parseFloat(e.target.value) || 0,
                                },
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Other
                        </label>
                        <input
                          type="number"
                          value={formData.salaryDetails.allowances.other}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              salaryDetails: {
                                ...formData.salaryDetails,
                                allowances: {
                                  ...formData.salaryDetails.allowances,
                                  other: parseFloat(e.target.value) || 0,
                                },
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Deductions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tax
                        </label>
                        <input
                          type="number"
                          value={formData.salaryDetails.deductions.tax}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              salaryDetails: {
                                ...formData.salaryDetails,
                                deductions: {
                                  ...formData.salaryDetails.deductions,
                                  tax: parseFloat(e.target.value) || 0,
                                },
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Provident Fund
                        </label>
                        <input
                          type="number"
                          value={formData.salaryDetails.deductions.providentFund}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              salaryDetails: {
                                ...formData.salaryDetails,
                                deductions: {
                                  ...formData.salaryDetails.deductions,
                                  providentFund: parseFloat(e.target.value) || 0,
                                },
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Insurance
                        </label>
                        <input
                          type="number"
                          value={formData.salaryDetails.deductions.insurance}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              salaryDetails: {
                                ...formData.salaryDetails,
                                deductions: {
                                  ...formData.salaryDetails.deductions,
                                  insurance: parseFloat(e.target.value) || 0,
                                },
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Other
                        </label>
                        <input
                          type="number"
                          value={formData.salaryDetails.deductions.other}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              salaryDetails: {
                                ...formData.salaryDetails,
                                deductions: {
                                  ...formData.salaryDetails.deductions,
                                  other: parseFloat(e.target.value) || 0,
                                },
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingTeacher ? 'Update Teacher' : 'Add Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
