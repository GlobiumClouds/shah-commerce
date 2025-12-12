'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import { FileText, Plus, Search, Edit, Trash2, X } from 'lucide-react';
import Input from '@/components/ui/input';
import Dropdown from '@/components/ui/dropdown';
import Modal from '@/components/ui/modal';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';

export default function SyllabusPage() {
  const { user } = useAuth();
  const [syllabus, setSyllabus] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [levels, setLevels] = useState([]);
  const [grades, setGrades] = useState([]);
  const [streams, setStreams] = useState([]);
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
    levelId: '',
    gradeId: '',
    streamId: '',
    overview: '',
    status: 'draft',
    courseObjectives: [],
    learningOutcomes: [],
    teachingMethods: [],
    chapters: [],
    assessmentPlan: {
      continuousAssessment: 20,
      midTermExam: 30,
      finalExam: 50,
      project: 0,
      practical: 0,
    },
  });
  const formRef = useRef(null);

  // temp inputs for arrays
  const [newObjective, setNewObjective] = useState('');
  const [newOutcome, setNewOutcome] = useState('');
  const [newMethod, setNewMethod] = useState('');
  const [newChapter, setNewChapter] = useState({ chapterNumber: '', chapterName: '', marks: '' });

  useEffect(() => {
    fetchSyllabus();
    // top-level lists
    fetchSubjects();
    fetchClasses();
    fetchBranches();
    fetchLevels();
    fetchGrades();
    fetchStreams();
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

  const fetchLevels = async () => {
    try {
      const response = await apiClient.get('/api/school/levels?limit=100');
      if (response?.success) {
        setLevels(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch levels:', error);
    }
  };

  const fetchGrades = async (levelId) => {
    try {
      const params = new URLSearchParams({ limit: '100', ...(levelId && { levelId }) });
      const response = await apiClient.get(`/api/school/grades?${params}`);
      if (response?.success) {
        setGrades(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch grades:', error);
    }
  };

  const fetchStreams = async () => {
    try {
      const response = await apiClient.get('/api/school/streams?limit=100');
      if (response?.success) {
        setStreams(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch streams:', error);
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
      levelId: syl.levelId?._id || '',
      gradeId: syl.gradeId?._id || '',
      streamId: syl.streamId?._id || '',
      overview: syl.overview || '',
      status: syl.status || 'draft',
      courseObjectives: syl.courseObjectives || [],
      learningOutcomes: syl.learningOutcomes || [],
      teachingMethods: syl.teachingMethods || [],
      chapters: syl.chapters || [],
      assessmentPlan: syl.assessmentPlan || {
        continuousAssessment: 20,
        midTermExam: 30,
        finalExam: 50,
        project: 0,
        practical: 0,
      },
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
      levelId: '',
      gradeId: '',
      streamId: '',
      overview: '',
      status: 'draft',
      courseObjectives: [],
      learningOutcomes: [],
      teachingMethods: [],
      chapters: [],
      assessmentPlan: {
        continuousAssessment: 20,
        midTermExam: 30,
        finalExam: 50,
        project: 0,
        practical: 0,
      },
    });
    setNewObjective('');
    setNewOutcome('');
    setNewMethod('');
    setNewChapter({ chapterNumber: '', chapterName: '', marks: '' });
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
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <Input placeholder="Search syllabus..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} icon={Search} />
          </div>

          <div className="w-full sm:w-56">
            <Dropdown id="filter-branch" name="branch" value={selectedBranch} onChange={(e) => {
              const b = e.target.value; setSelectedBranch(b);
              if (b) { fetchClasses(b); fetchSubjects(undefined, b); } else { fetchClasses(); fetchSubjects(); }
            }} options={[{label: 'All Branches', value: ''}, ...branches.map(br=>({label: br.name, value: br._id}))]} placeholder="All Branches" />
          </div>

          <div className="w-full sm:w-56">
            <Dropdown id="filter-class" name="class" value={selectedClassFilter} onChange={(e)=>setSelectedClassFilter(e.target.value)} options={[{label:'All Classes', value:''}, ...classes.map(c=>({label:c.name,value:c._id}))]} placeholder="All Classes" />
          </div>

          <div className="w-full sm:w-56">
            <Dropdown id="filter-subject" name="subject" value={selectedSubject} onChange={(e)=>setSelectedSubject(e.target.value)} options={[{label:'All Subjects', value:''}, ...subjects.map(s=>({label:s.name, value:s._id}))]} placeholder="All Subjects" />
          </div>

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
          <Table className="w-full">
            <TableHeader className="bg-gray-50 border-b border-gray-200">
              <TableRow>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="bg-white divide-y divide-gray-200">
              {syllabus.map((syl) => (
                <TableRow key={syl._id} className="hover:bg-gray-50">
                  <TableCell className="px-6 py-4 text-sm font-medium text-gray-900">{syl.title}</TableCell>
                  <TableCell className="px-6 py-4 text-sm text-gray-900">{syl.subjectId?.name}</TableCell>
                  <TableCell className="px-6 py-4 text-sm text-gray-900">{syl.classId?.name}</TableCell>
                  <TableCell className="px-6 py-4 text-sm text-gray-900">{syl.academicYear}</TableCell>
                  <TableCell className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      syl.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : syl.status === 'submitted'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {syl.status.charAt(0).toUpperCase() + syl.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(syl)} className="text-blue-600 hover:text-blue-900"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(syl._id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Modal */}
      <Modal
        open={showModal}
        onClose={handleCloseModal}
        title={editingSyllabus ? 'Edit Syllabus' : 'Add New Syllabus'}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => formRef.current?.requestSubmit?.() || formRef.current?.submit?.()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editingSyllabus ? 'Update' : 'Add'} Syllabus
            </button>
          </div>
        }
      >
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Syllabus Title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Computer Science Grade 10 2025"
                  />
                </div>

                <div>
                  <Dropdown
                    label="Branch"
                    name="branchId"
                    required
                    value={formData.branchId}
                    onChange={(e) => {
                      const branchId = e.target.value;
                      setFormData({ ...formData, branchId, classId: '', subjectId: '' });
                      if (branchId) {
                        fetchClasses(branchId);
                        setSubjects([]);
                      } else {
                        fetchClasses();
                        setSubjects([]);
                      }
                    }}
                    options={[{label: 'Select Branch', value: ''}, ...branches.map(br => ({label: br.name, value: br._id}))]}
                    placeholder="Select Branch"
                  />
                </div>

                <div>
                  <Dropdown
                    label="Class"
                    name="classId"
                    required
                    value={formData.classId}
                    onChange={(e) => {
                      const classId = e.target.value;
                      setFormData({ ...formData, classId, subjectId: '' });
                      if (classId) {
                        fetchSubjects(classId, formData.branchId);
                      } else {
                        setSubjects([]);
                      }
                    }}
                    options={[{label: 'Select Class', value: ''}, ...classes.map(c => ({label: c.name, value: c._id}))]}
                    placeholder="Select Class"
                  />
                </div>

                <div>
                  <Dropdown
                    label="Level"
                    name="levelId"
                    value={formData.levelId}
                    onChange={(e) => {
                      const levelId = e.target.value;
                      setFormData({ ...formData, levelId, gradeId: '' });
                      if (levelId) {
                        fetchGrades(levelId);
                      } else {
                        fetchGrades();
                      }
                    }}
                    options={[{label: 'Select Level (Optional)', value: ''}, ...levels.map(l => ({label: l.name, value: l._id}))]}
                    placeholder="Select Level"
                  />
                </div>

                <div>
                  <Dropdown
                    label="Grade"
                    name="gradeId"
                    value={formData.gradeId}
                    onChange={(e) => setFormData({ ...formData, gradeId: e.target.value })}
                    options={[{label: 'Select Grade (Optional)', value: ''}, ...grades.map(g => ({label: g.name, value: g._id}))]}
                    placeholder="Select Grade"
                  />
                </div>

                <div>
                  <Dropdown
                    label="Stream"
                    name="streamId"
                    value={formData.streamId}
                    onChange={(e) => setFormData({ ...formData, streamId: e.target.value })}
                    options={[{label: 'Select Stream (Optional)', value: ''}, ...streams.map(s => ({label: s.name, value: s._id}))]}
                    placeholder="Select Stream"
                  />
                </div>

                <div>
                  <Dropdown
                    label="Subject"
                    name="subjectId"
                    required
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    options={!formData.classId ? [{label: 'Select class first', value: ''}] : [{label: 'Select Subject', value: ''}, ...subjects.map(s => ({label: s.name, value: s._id}))]}
                    placeholder="Select Subject"
                  />
                </div>

                <div>
                  <Input
                    label="Academic Year"
                    type="text"
                    required
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    placeholder="e.g. 2025-2026"
                  />
                </div>

                <div>
                  <Dropdown
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    options={[
                      {label: 'Draft', value: 'draft'},
                      {label: 'Submitted', value: 'submitted'},
                      {label: 'Approved', value: 'approved'}
                    ]}
                    placeholder="Select Status"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Overview</label>
                  <textarea
                    value={formData.overview}
                    onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                    rows="3"
                    placeholder="Brief description of the syllabus..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

                {/* Course Objectives */}
                <Card>
                  <CardContent>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Objectives</label>
                    <div className="space-y-2">
                      {formData.courseObjectives.map((obj, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-2 bg-gray-50 p-2 rounded">
                          <div className="text-sm text-gray-800">{obj}</div>
                          <button type="button" onClick={() => setFormData({ ...formData, courseObjectives: formData.courseObjectives.filter((_, i) => i !== idx) })} className="text-red-600">Remove</button>
                        </div>
                      ))}

                      <div className="flex gap-2">
                        <input value={newObjective} onChange={(e) => setNewObjective(e.target.value)} placeholder="Add objective" className="flex-1 px-3 py-2 border rounded" />
                        <button type="button" onClick={() => { if (newObjective.trim()) { setFormData({ ...formData, courseObjectives: [...formData.courseObjectives, newObjective.trim()] }); setNewObjective(''); } }} className="px-3 py-2 bg-blue-600 text-white rounded">Add</button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Learning Outcomes */}
                <Card className="mt-4">
                  <CardContent>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Learning Outcomes</label>
                    <div className="space-y-2">
                      {formData.learningOutcomes.map((out, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-2 bg-gray-50 p-2 rounded">
                          <div className="text-sm text-gray-800">{out}</div>
                          <button type="button" onClick={() => setFormData({ ...formData, learningOutcomes: formData.learningOutcomes.filter((_, i) => i !== idx) })} className="text-red-600">Remove</button>
                        </div>
                      ))}

                      <div className="flex gap-2">
                        <input value={newOutcome} onChange={(e) => setNewOutcome(e.target.value)} placeholder="Add outcome" className="flex-1 px-3 py-2 border rounded" />
                        <button type="button" onClick={() => { if (newOutcome.trim()) { setFormData({ ...formData, learningOutcomes: [...formData.learningOutcomes, newOutcome.trim()] }); setNewOutcome(''); } }} className="px-3 py-2 bg-blue-600 text-white rounded">Add</button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Teaching Methods */}
                <Card className="mt-4">
                  <CardContent>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teaching Methods</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.teachingMethods.map((m, idx) => (
                        <div key={idx} className="px-2 py-1 bg-gray-100 rounded flex items-center gap-2">
                          <span className="text-sm text-gray-800">{m}</span>
                          <button type="button" onClick={() => setFormData({ ...formData, teachingMethods: formData.teachingMethods.filter((_, i) => i !== idx) })} className="text-red-600">x</button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input value={newMethod} onChange={(e) => setNewMethod(e.target.value)} placeholder="Add method (e.g. Lecture)" className="flex-1 px-3 py-2 border rounded" />
                      <button type="button" onClick={() => { if (newMethod.trim()) { setFormData({ ...formData, teachingMethods: [...formData.teachingMethods, newMethod.trim()] }); setNewMethod(''); } }} className="px-3 py-2 bg-blue-600 text-white rounded">Add</button>
                    </div>
                  </CardContent>
                </Card>

                {/* Chapters */}
                <Card className="mt-4">
                  <CardContent>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chapters</label>
                    <div className="space-y-2">
                      {formData.chapters.map((ch, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-2 bg-gray-50 p-2 rounded">
                          <div>
                            <div className="text-sm font-medium">{ch.chapterName} (#{ch.chapterNumber})</div>
                            <div className="text-xs text-gray-600">Marks: {ch.marks}</div>
                          </div>
                          <button type="button" onClick={() => setFormData({ ...formData, chapters: formData.chapters.filter((_, i) => i !== idx) })} className="text-red-600">Remove</button>
                        </div>
                      ))}

                      <div className="grid grid-cols-3 gap-2">
                        <input value={newChapter.chapterNumber} onChange={(e) => setNewChapter({ ...newChapter, chapterNumber: e.target.value })} placeholder="Chapter #" className="px-3 py-2 border rounded" />
                        <input value={newChapter.chapterName} onChange={(e) => setNewChapter({ ...newChapter, chapterName: e.target.value })} placeholder="Chapter title" className="px-3 py-2 border rounded" />
                        <input value={newChapter.marks} onChange={(e) => setNewChapter({ ...newChapter, marks: e.target.value })} placeholder="Marks" className="px-3 py-2 border rounded" />
                      </div>
                      <div className="flex justify-end">
                        <button type="button" onClick={() => {
                          if (!newChapter.chapterName) return;
                          setFormData({ ...formData, chapters: [...formData.chapters, { ...newChapter }] });
                          setNewChapter({ chapterNumber: '', chapterName: '', marks: '' });
                        }} className="px-3 py-2 bg-blue-600 text-white rounded">Add Chapter</button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Assessment Plan */}
                <Card className="mt-4">
                  <CardContent>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Plan (percentage)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-600">Continuous Assessment</label>
                        <input type="number" value={formData.assessmentPlan.continuousAssessment} onChange={(e) => setFormData({ ...formData, assessmentPlan: { ...formData.assessmentPlan, continuousAssessment: Number(e.target.value) } })} className="w-full px-3 py-2 border rounded" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Mid Term Exam</label>
                        <input type="number" value={formData.assessmentPlan.midTermExam} onChange={(e) => setFormData({ ...formData, assessmentPlan: { ...formData.assessmentPlan, midTermExam: Number(e.target.value) } })} className="w-full px-3 py-2 border rounded" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Final Exam</label>
                        <input type="number" value={formData.assessmentPlan.finalExam} onChange={(e) => setFormData({ ...formData, assessmentPlan: { ...formData.assessmentPlan, finalExam: Number(e.target.value) } })} className="w-full px-3 py-2 border rounded" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Project</label>
                        <input type="number" value={formData.assessmentPlan.project} onChange={(e) => setFormData({ ...formData, assessmentPlan: { ...formData.assessmentPlan, project: Number(e.target.value) } })} className="w-full px-3 py-2 border rounded" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Practical</label>
                        <input type="number" value={formData.assessmentPlan.practical} onChange={(e) => setFormData({ ...formData, assessmentPlan: { ...formData.assessmentPlan, practical: Number(e.target.value) } })} className="w-full px-3 py-2 border rounded" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
            </form>
      </Modal>
    </div>
  );
}
