'use client';

import { useState, useEffect, useRef } from 'react';
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
import Input from '@/components/ui/input';
import Dropdown from '@/components/ui/dropdown';
import Modal from '@/components/ui/modal';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';

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

  // per-subject section selection + counts
  const [selectedSection, setSelectedSection] = useState({});
  const [sectionCount, setSectionCount] = useState({});
  const formRef = useRef(null);

  const fetchSectionStudents = async (classId, subjectId, section) => {
    try {
      const params = new URLSearchParams({ classId, limit: '1', page: '1' });
      if (section) params.append('section', section);
      const res = await apiClient.get(`/api/super-admin/students?${params}`);
      if (res?.success) {
        const total = res.pagination?.total ?? 0;
        setSectionCount((s) => ({ ...s, [subjectId]: total }));
      }
    } catch (err) {
      console.error('Failed to fetch students for section', err);
    }
  };

  const handleSectionSelect = (subjectId, classId, value) => {
    setSelectedSection((s) => ({ ...s, [subjectId]: value }));
    fetchSectionStudents(classId, subjectId, value);
  };

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

        // fetch default section counts for each subject (class-level total)
        list.forEach((sub) => {
          const classId = sub.classId?._id || sub.classId;
          if (classId) fetchSectionStudents(classId, sub._id, selectedSection[sub._id] || '');
        });

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
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Subjects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Core</p>
                <p className="text-2xl font-bold text-purple-600">{stats.core}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Elective</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.elective}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <BookOpen className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <Input
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>

          {/* Branch Filter */}
          <div className="w-56">
            <Dropdown
              id="branch-filter"
              name="branch"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              options={[{ label: 'All Branches', value: '' }, ...branches.map(b => ({ label: b.name, value: b._id }))]}
              placeholder="All Branches"
            />
          </div>

          {/* Class Filter */}
          <div className="w-56">
            <Dropdown
              id="class-filter"
              name="class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              options={[{ label: 'All Classes', value: '' }, ...classes.map(c => ({ label: `${c.name} - Grade ${c.grade}`, value: c._id }))]}
              placeholder="All Classes"
            />
          </div>

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
          <Table className="w-full">
            <TableHeader className="bg-gray-50 border-b border-gray-200">
              <TableRow>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade/Class</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours/Week</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="bg-white divide-y divide-gray-200">
              {subjects.map((subject) => (
                <TableRow key={subject._id} className="hover:bg-gray-50">
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                      <div className="text-sm text-gray-500">{subject.code}</div>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {subject.classId ? `Grade ${subject.classId.grade} - ${subject.classId.name}` : (subject.classId?.name || '—')}
                  </TableCell>

                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      subject.subjectType === 'core'
                        ? 'bg-purple-100 text-purple-800'
                        : subject.subjectType === 'elective'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {subject.subjectType.charAt(0).toUpperCase() + subject.subjectType.slice(1)}
                    </span>
                  </TableCell>

                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-900">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {subject.hoursPerWeek}h/week
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-900">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      {subject.branchId?.name}
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-44">
                        <Dropdown
                          id={`section-${subject._id}`}
                          name={`section-${subject._id}`}
                          value={selectedSection[subject._id] || ''}
                          onChange={(e) => handleSectionSelect(subject._id, subject.classId?._id || subject.classId, e.target.value)}
                          options={[{ label: 'All Sections', value: '' }, ...(subject.classId?.sections || []).map(s => ({ label: s.name || s, value: s }))]}
                          placeholder="All Sections"
                        />
                      </div>
                      <div className="text-sm text-gray-700">{sectionCount[subject._id] ?? 0} students</div>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      subject.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {subject.status.charAt(0).toUpperCase() + subject.status.slice(1)}
                    </span>
                  </TableCell>

                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(subject)} className="text-blue-600 hover:text-blue-900"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(subject._id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Modal (global) */}
      <Modal
        open={showModal}
        onClose={handleCloseModal}
        title={editingSubject ? 'Edit Subject' : 'Add New Subject'}
        size="md"
        footerClassName="flex justify-end gap-3"
        footer={(
          <>
            <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="button" onClick={() => formRef.current && (formRef.current.requestSubmit ? formRef.current.requestSubmit() : formRef.current.submit())} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{editingSubject ? 'Update Subject' : 'Add Subject'}</button>
          </>
        )}
      >
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name *</label>
              <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter subject name" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code (auto-generated)</label>
              <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="Leave blank for auto-generate" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch *</label>
              <Dropdown id="modal-branch" name="branchId" value={formData.branchId} onChange={(e) => { const branchId = e.target.value; setFormData({ ...formData, branchId, classId: '', departmentId: '' }); fetchClasses(branchId); fetchDepartments(branchId); }} options={[{ label: 'Select Branch', value: '' }, ...branches.map(b => ({ label: b.name, value: b._id }))]} placeholder="Select Branch" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
              <Dropdown id="modal-class" name="classId" value={formData.classId} onChange={(e) => setFormData({ ...formData, classId: e.target.value })} options={[{ label: 'Select Class', value: '' }, ...classes.map(c => ({ label: `${c.name} - Grade ${c.grade}`, value: c._id }))]} placeholder="Select Class" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department (optional)</label>
              <Dropdown id="modal-dept" name="departmentId" value={formData.departmentId} onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })} options={[{ label: 'Select Department', value: '' }, ...departments.map(d => ({ label: d.name, value: d._id }))]} placeholder="Select Department" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject Type *</label>
              <Dropdown id="modal-subject-type" name="subjectType" value={formData.subjectType} onChange={(e) => setFormData({ ...formData, subjectType: e.target.value })} options={[{ label: 'Core', value: 'core' }, { label: 'Elective', value: 'elective' }, { label: 'Co-curricular', value: 'co-curricular' }, { label: 'Skill-based', value: 'skill-based' }]} placeholder="Select Type" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hours Per Week</label>
              <Input type="number" value={formData.hoursPerWeek} onChange={(e) => setFormData({ ...formData, hoursPerWeek: parseInt(e.target.value) })} placeholder="Hours per week" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Hours Per Year</label>
              <Input type="number" value={formData.totalHoursPerYear} onChange={(e) => setFormData({ ...formData, totalHoursPerYear: parseInt(e.target.value) })} placeholder="Total hours per year" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Credit Hours</label>
              <Input type="number" value={formData.creditHours} onChange={(e) => setFormData({ ...formData, creditHours: parseInt(e.target.value) })} placeholder="Credit hours" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Dropdown id="modal-status" name="status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} options={[{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }, { label: 'Archived', value: 'archived' }]} placeholder="Select Status" />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
