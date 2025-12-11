'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import { FileText, Plus, Search, Edit, Trash2, X } from 'lucide-react';

export default function SyllabusPage() {
  const { user } = useAuth();
  const [syllabus, setSyllabus] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSyllabus, setEditingSyllabus] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    academicYear: new Date().getFullYear().toString(),
    subjectId: '',
    classId: '',
    branchId: '',
    overview: '',
    status: 'draft',
  });

  useEffect(() => {
    fetchSyllabus();
    // top-level lists
    fetchSubjects();
    fetchClasses();
    fetchBranches();
  }, [searchTerm, selectedSubject, selectedBranch, selectedClassFilter]);

  const fetchSyllabus = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: '100',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedBranch && { branchId: selectedBranch }),
        ...(selectedClassFilter && { classId: selectedClassFilter }),
        ...(selectedSubject && { subjectId: selectedSubject }),
      });

      const response = await apiClient.get(`/api/super-admin/syllabus?${params}`);

      if (response.success) {
        setSyllabus(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch syllabus');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch subjects. If classId is provided, fetch only subjects for that class.
  // When called without classId (e.g. top-level filter) it returns all subjects.
  const fetchSubjects = async (classId, branchId) => {
    try {
      const params = new URLSearchParams({ limit: '200', ...(classId && { classId }), ...(branchId && { branchId }) });
      const response = await apiClient.get(`/api/super-admin/subjects?${params}`);
      if (response?.success) {
        const list = response.data || response.data?.subjects || [];
        setSubjects(list);
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    }
  };

  const fetchClasses = async (branchId) => {
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
      if (editingSyllabus) {
        const response = await apiClient.put(
          `/api/super-admin/syllabus/${editingSyllabus._id}`,
          formData
        );
        if (response.success) {
          toast.success('Syllabus updated successfully');
          fetchSyllabus();
          handleCloseModal();
        }
      } else {
        const response = await apiClient.post('/api/super-admin/syllabus', formData);
        if (response.success) {
          toast.success('Syllabus created successfully');
          fetchSyllabus();
          handleCloseModal();
        }
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save syllabus');
      console.error(error);
    }
  };

  const handleEdit = async (syl) => {
    setEditingSyllabus(syl);
    setFormData({
      title: syl.title || '',
      academicYear: syl.academicYear || '',
      subjectId: syl.subjectId?._id || '',
      classId: syl.classId?._id || '',
      branchId: syl.branchId?._id || '',
      overview: syl.overview || '',
      status: syl.status || 'draft',
    });
    // preload classes & subjects for this branch/class so modal dropdowns are populated
    const branchId = syl.branchId?._id || '';
    const classId = syl.classId?._id || '';
    if (branchId) fetchClasses(branchId);
    if (classId) fetchSubjects(classId, branchId);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    
    try {
      const response = await apiClient.delete(`/api/super-admin/syllabus/${id}`);
      
      if (response.success) {
        toast.success('Syllabus archived successfully');
        fetchSyllabus();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSyllabus(null);
    setFormData({
      title: '',
      academicYear: new Date().getFullYear().toString(),
      subjectId: '',
      classId: '',
      branchId: '',
      overview: '',
      status: 'draft',
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="h-7 w-7" />
          Syllabus Management
        </h1>
        <p className="text-gray-600 mt-1">Create and manage course syllabus</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search syllabus..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={selectedBranch}
            onChange={(e) => {
              const b = e.target.value;
              setSelectedBranch(b);
              // when top-level branch filter changes, also refresh classes list for filter
              if (b) {
                fetchClasses(b);
                // update subject filter to subjects for this branch
                fetchSubjects(undefined, b);
              } else {
                fetchClasses();
                fetchSubjects();
              }
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Branches</option>
            {branches.map((branch) => (
              <option key={branch._id} value={branch._id}>
                {branch.name}
              </option>
            ))}
          </select>

          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name}
              </option>
            ))}
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="h-5 w-5" />
            Add Syllabus
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : syllabus.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No syllabus found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {syllabus.map((syl) => (
                  <tr key={syl._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{syl.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{syl.subjectId?.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{syl.classId?.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{syl.academicYear}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        syl.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : syl.status === 'submitted'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {syl.status.charAt(0).toUpperCase() + syl.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(syl)} className="text-blue-600 hover:text-blue-900">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(syl._id)} className="text-red-600 hover:text-red-900">
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
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingSyllabus ? 'Edit Syllabus' : 'Add New Syllabus'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch *</label>
                  <select
                    required
                    value={formData.branchId}
                    onChange={(e) => {
                      const branchId = e.target.value;
                      setFormData({ ...formData, branchId, classId: '', subjectId: '' });
                      if (branchId) {
                        fetchClasses(branchId);
                        // clear subjects until a class is selected
                        setSubjects([]);
                      } else {
                        fetchClasses();
                        setSubjects([]);
                      }
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
                  <select
                    required
                    value={formData.classId}
                    onChange={(e) => {
                      const classId = e.target.value;
                      setFormData({ ...formData, classId, subjectId: '' });
                      if (classId) {
                        fetchSubjects(classId, formData.branchId);
                      } else {
                        // no class selected for modal — clear subjects list
                        setSubjects([]);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                  <select
                    required
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {!formData.classId ? (
                      <option value="">Select class first</option>
                    ) : (
                      <>
                        <option value="">Select Subject</option>
                        {subjects.map((subject) => (
                          <option key={subject._id} value={subject._id}>
                            {subject.name}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year *</label>
                  <input
                    type="text"
                    required
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="submitted">Submitted</option>
                    <option value="approved">Approved</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Overview</label>
                  <textarea
                    value={formData.overview}
                    onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

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
                  {editingSyllabus ? 'Update' : 'Add'} Syllabus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
