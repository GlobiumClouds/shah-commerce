'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Building2,
  Users,
  Clock,
  Award,
} from 'lucide-react';

export default function SubjectsPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    classId: '',
    departmentId: '',
    subjectType: 'core',
    hoursPerWeek: 5,
    totalHoursPerYear: 150,
    creditHours: 3,
    branchId: '',
    status: 'active',
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    core: 0,
    elective: 0,
  });

  useEffect(() => {
    fetchSubjects();
    // fetch classes for selectedBranch filter (if any)
    fetchClasses(selectedBranch);
    fetchBranches();
    // also refresh departments for the selectedBranch
    fetchDepartments(selectedBranch);
  }, [searchTerm, selectedClass, selectedBranch, selectedDepartment]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: '100',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedClass && { classId: selectedClass }),
  ...(selectedBranch && { branchId: selectedBranch }),
  ...(selectedDepartment && { departmentId: selectedDepartment }),
      });

      const response = await apiClient.get(`/api/super-admin/subjects?${params}`);
      // Normalize response (backend may return { success, data } or { success, data: [...] })
      if (response?.success) {
        const list = response.data || response.data?.subjects || [];
        setSubjects(list);

        const total = list.length;
        const active = list.filter(s => s.status === 'active').length;
        const core = list.filter(s => s.subjectType === 'core').length;
        const elective = list.filter(s => s.subjectType === 'elective').length;

        setStats({ total, active, core, elective });
      }
    } catch (error) {
      toast.error('Failed to fetch subjects');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch classes; accepts an optional branchId (used by the modal to load branch-specific classes)
  const fetchClasses = async (branchId = selectedBranch) => {
    try {
      const params = new URLSearchParams({ limit: '200', ...(branchId && { branchId }) });
      const response = await apiClient.get(`/api/super-admin/classes?${params}`);
      if (response?.success) {
        const list = response.data || response.data?.classes || [];
        setClasses(list);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const fetchDepartments = async (branchId = selectedBranch) => {
    try {
      const params = new URLSearchParams({ limit: '200', ...(branchId && { branchId }) });
      const response = await apiClient.get(`/api/super-admin/departments?${params}`);
      if (response?.success) {
        const list = response.data || response.data?.departments || [];
        setDepartments(list);
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await apiClient.get('/api/super-admin/branches?limit=200');
      if (response?.success) {
        const list = response.data?.branches || response.data || [];
        setBranches(list);
      }
    } catch (error) {
      console.error('Failed to fetch branches:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Basic validation
      if (!formData.name || !formData.classId || !formData.branchId) {
        toast.error('Please provide subject name, class and branch');
        return;
      }

      // Build payload matching Subject model
      const payload = {
        name: formData.name,
        code: formData.code ? formData.code.toUpperCase() : undefined,
        description: formData.description || '',
        classId: formData.classId,
        departmentId: formData.departmentId || undefined,
        // grade is derived from the class; do not send grade explicitly
        subjectType: formData.subjectType || 'core',
        hoursPerWeek: Number(formData.hoursPerWeek) || 0,
        totalHoursPerYear: Number(formData.totalHoursPerYear) || 0,
        creditHours: Number(formData.creditHours) || 0,
        branchId: formData.branchId,
        status: formData.status || 'active',
      };

      let response;
      if (editingSubject) {
        response = await apiClient.put(`/api/super-admin/subjects/${editingSubject._id}`, payload);
      } else {
        response = await apiClient.post('/api/super-admin/subjects', payload);
      }

      if (response?.success) {
        toast.success(editingSubject ? 'Subject updated successfully' : 'Subject created successfully');
        fetchSubjects();
        handleCloseModal();
      } else {
        toast.error(response?.message || 'Operation failed');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save subject');
      console.error(error);
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name || '',
      code: subject.code || '',
      description: subject.description || '',
      classId: subject.classId?._id || '',
      subjectType: subject.subjectType || 'core',
      hoursPerWeek: subject.hoursPerWeek || 5,
      totalHoursPerYear: subject.totalHoursPerYear || 150,
      creditHours: subject.creditHours || 3,
      branchId: subject.branchId?._id || '',
      status: subject.status || 'active',
    });
    // ensure the modal's branch state is in sync so fetchClasses/Departments load correctly
    const branchId = subject.branchId?._id || '';
    setSelectedBranch(branchId);
    // fetch classes & departments for the subject's branch so class dropdown is populated
    if (branchId) {
      fetchClasses(branchId);
      fetchDepartments(branchId);
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to archive this subject?')) return;
    
    try {
      const response = await apiClient.delete(`/api/super-admin/subjects/${id}`);
      
      if (response.success) {
        toast.success('Subject archived successfully');
        fetchSubjects();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete subject');
      console.error(error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSubject(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      classId: '',
      subjectType: 'core',
      hoursPerWeek: 5,
      totalHoursPerYear: 150,
      creditHours: 3,
      branchId: '',
      status: 'active',
    });
  };

  // grades are now derived from classes; explicit grades list removed

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="h-7 w-7" />
          Subject Management
        </h1>
        <p className="text-gray-600 mt-1">Manage subjects and curriculum</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Subjects</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
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
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Core</p>
              <p className="text-2xl font-bold text-purple-600">{stats.core}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Elective</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.elective}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <BookOpen className="h-6 w-6 text-yellow-600" />
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
                placeholder="Search subjects..."
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

          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name} - Grade {cls.grade}
              </option>
            ))}
          </select>

          {/* Grade filter removed — classes carry grade information */}

          {/* Add Button */}
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="h-5 w-5" />
            Add Subject
          </button>
        </div>
      </div>

      {/* Subjects Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading subjects...</div>
        ) : subjects.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No subjects found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade/Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours/Week
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Branch
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
                {subjects.map((subject) => (
                  <tr key={subject._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {subject.name}
                        </div>
                        <div className="text-sm text-gray-500">{subject.code}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subject.classId ? `Grade ${subject.classId.grade} - ${subject.classId.name}` : (subject.classId?.name || '—')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        subject.subjectType === 'core'
                          ? 'bg-purple-100 text-purple-800'
                          : subject.subjectType === 'elective'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {subject.subjectType.charAt(0).toUpperCase() + subject.subjectType.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-900">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {subject.hoursPerWeek}h/week
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-900">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        {subject.branchId?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        subject.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {subject.status.charAt(0).toUpperCase() + subject.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(subject)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(subject._id)}
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            {/* Modal Header */}
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Code (auto-generated)
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Leave blank for auto-generate"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch *
                  </label>
                  <select
                    required
                    value={formData.branchId}
                    onChange={(e) => {
                      const branchId = e.target.value;
                      setFormData({ ...formData, branchId, classId: '', departmentId: '' });
                      // fetch classes & departments for this branch for the modal
                      fetchClasses(branchId);
                      fetchDepartments(branchId);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Branch</option>
                    {branches.map((branch) => (
                      <option key={branch._id} value={branch._id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class *
                  </label>
                  <select
                    required
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name} - Grade {cls.grade}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department (optional)
                  </label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Grade removed — classes carry grade information */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Type *
                  </label>
                  <select
                    required
                    value={formData.subjectType}
                    onChange={(e) => setFormData({ ...formData, subjectType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="core">Core</option>
                    <option value="elective">Elective</option>
                    <option value="co-curricular">Co-curricular</option>
                    <option value="skill-based">Skill-based</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hours Per Week
                  </label>
                  <input
                    type="number"
                    value={formData.hoursPerWeek}
                    onChange={(e) => setFormData({ ...formData, hoursPerWeek: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Hours Per Year
                  </label>
                  <input
                    type="number"
                    value={formData.totalHoursPerYear}
                    onChange={(e) => setFormData({ ...formData, totalHoursPerYear: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Credit Hours
                  </label>
                  <input
                    type="number"
                    value={formData.creditHours}
                    onChange={(e) => setFormData({ ...formData, creditHours: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
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
                  {editingSubject ? 'Update Subject' : 'Add Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
