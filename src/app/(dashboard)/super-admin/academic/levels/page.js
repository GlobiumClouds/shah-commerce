'use client';

import { useEffect, useState, useRef } from 'react';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, BookOpen, Search, Layers, GraduationCap, Split } from 'lucide-react';
import Modal from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Dropdown from '@/components/ui/dropdown';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import Tabs, { TabPanel } from '@/components/ui/tabs';

export default function LevelsAdminPage() {
  const [tab, setTab] = useState('levels');
  const [searchTerm, setSearchTerm] = useState('');

  // Levels
  const [levels, setLevels] = useState([]);
  const [loadingLevels, setLoadingLevels] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const levelFormRef = useRef(null);
  const [levelForm, setLevelForm] = useState({ name: '', code: '', order: 0, description: '' });

  // Grades
  const [grades, setGrades] = useState([]);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const gradeFormRef = useRef(null);
  const [gradeForm, setGradeForm] = useState({ name: '', gradeNumber: '', levelId: '', code: '', academicYear: '' });

  // Streams
  const [streams, setStreams] = useState([]);
  const [loadingStreams, setLoadingStreams] = useState(false);
  const [showStreamModal, setShowStreamModal] = useState(false);
  const [editingStream, setEditingStream] = useState(null);
  const streamFormRef = useRef(null);
  const [streamForm, setStreamForm] = useState({ name: '', code: '', description: '' });

  useEffect(() => { loadLevels(); loadGrades(); loadStreams(); }, []);

  // stats
  const stats = {
    levels: levels.length,
    grades: grades.length,
    streams: streams.length,
  };

  // Poll for real-time updates every 10s when page is visible
  useEffect(() => {
    const iv = setInterval(() => {
      try {
        if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
          loadLevels();
          loadGrades();
          loadStreams();
        }
      } catch (err) {
        console.error('Polling academic data failed', err);
      }
    }, 10000);

    return () => clearInterval(iv);
  }, []);

  /* Levels CRUD */
  const loadLevels = async () => {
    setLoadingLevels(true);
    try {
      const res = await apiClient.get('/api/school/levels?limit=100');
      if (res?.success) setLevels(res.data || []);
    } catch (err) { console.error(err); toast.error('Failed to load levels'); }
    setLoadingLevels(false);
  };

  const saveLevel = async (e) => {
    e.preventDefault();
    try {
      if (!levelForm.name) return toast.error('Name required');
      let res;
      if (editingLevel) res = await apiClient.put(`/api/school/levels/${editingLevel._id}`, levelForm);
      else res = await apiClient.post('/api/school/levels', levelForm);
      if (res?.success) { toast.success('Level saved successfully'); setShowLevelModal(false); setEditingLevel(null); setLevelForm({ name: '', code: '', order: 0, description: '' }); loadLevels(); }
      else toast.error(res?.message || 'Failed to save');
    } catch (err) { console.error(err); toast.error('Failed to save level'); }
  };

  const handleEditLevel = (lvl) => { setEditingLevel(lvl); setLevelForm({ name: lvl.name || '', code: lvl.code || '', order: lvl.order || 0, description: lvl.description || '' }); setShowLevelModal(true); };
  const handleDeleteLevel = async (id) => { if (!confirm('Delete this level? This action cannot be undone.')) return; try { const res = await apiClient.delete(`/api/school/levels/${id}`); if (res?.success) { toast.success('Level deleted'); loadLevels(); } } catch (err) { console.error(err); toast.error('Delete failed'); }};

  /* Grades CRUD */
  const loadGrades = async () => {
    setLoadingGrades(true);
    try {
      const res = await apiClient.get('/api/school/grades?limit=100');
      if (res?.success) setGrades(res.data || []);
    } catch (err) { console.error(err); toast.error('Failed to load grades'); }
    setLoadingGrades(false);
  };

  const saveGrade = async (e) => {
    e.preventDefault();
    try {
      if (!gradeForm.name || !gradeForm.levelId) return toast.error('Name and Level required');
      let res;
      if (editingGrade) res = await apiClient.put(`/api/school/grades/${editingGrade._id}`, gradeForm);
      else res = await apiClient.post('/api/school/grades', gradeForm);
      if (res?.success) { toast.success('Grade saved successfully'); setShowGradeModal(false); setEditingGrade(null); setGradeForm({ name: '', gradeNumber: '', levelId: '', code: '', academicYear: '' }); loadGrades(); }
      else toast.error(res?.message || 'Failed to save');
    } catch (err) { console.error(err); toast.error('Failed to save grade'); }
  };

  const handleEditGrade = (g) => { setEditingGrade(g); setGradeForm({ name: g.name || '', gradeNumber: g.gradeNumber || '', levelId: (g.levelId?._id || g.levelId) || '', code: g.code || '', academicYear: g.academicYear || '' }); setShowGradeModal(true); };
  const handleDeleteGrade = async (id) => { if (!confirm('Delete this grade? This action cannot be undone.')) return; try { const res = await apiClient.delete(`/api/school/grades/${id}`); if (res?.success) { toast.success('Grade deleted'); loadGrades(); } } catch (err) { console.error(err); toast.error('Delete failed'); }};

  /* Streams CRUD */
  const loadStreams = async () => {
    setLoadingStreams(true);
    try {
      const res = await apiClient.get('/api/school/streams?limit=100');
      if (res?.success) setStreams(res.data || []);
    } catch (err) { console.error(err); toast.error('Failed to load streams'); }
    setLoadingStreams(false);
  };

  const saveStream = async (e) => {
    e.preventDefault();
    try {
      if (!streamForm.name) return toast.error('Name required');
      let res;
      if (editingStream) res = await apiClient.put(`/api/school/streams/${editingStream._id}`, streamForm);
      else res = await apiClient.post('/api/school/streams', streamForm);
      if (res?.success) { toast.success('Stream saved successfully'); setShowStreamModal(false); setEditingStream(null); setStreamForm({ name: '', code: '', description: '' }); loadStreams(); }
      else toast.error(res?.message || 'Failed to save');
    } catch (err) { console.error(err); toast.error('Failed to save stream'); }
  };

  const handleEditStream = (s) => { setEditingStream(s); setStreamForm({ name: s.name || '', code: s.code || '', description: s.description || '' }); setShowStreamModal(true); };
  const handleDeleteStream = async (id) => { if (!confirm('Delete this stream? This action cannot be undone.')) return; try { const res = await apiClient.delete(`/api/school/streams/${id}`); if (res?.success) { toast.success('Stream deleted'); loadStreams(); } } catch (err) { console.error(err); toast.error('Delete failed'); }};

  // Filter data
  const filteredLevels = levels.filter(l => !searchTerm || l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.code?.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredGrades = grades.filter(g => !searchTerm || g.name.toLowerCase().includes(searchTerm.toLowerCase()) || g.code?.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredStreams = streams.filter(s => !searchTerm || s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.code?.toLowerCase().includes(searchTerm.toLowerCase()));

  const tabs = [
    { id: 'levels', label: 'Levels', icon: <Layers className="h-5 w-5" />, badge: stats.levels },
    { id: 'grades', label: 'Grades', icon: <GraduationCap className="h-5 w-5" />, badge: stats.grades },
    { id: 'streams', label: 'Streams', icon: <Split className="h-5 w-5" />, badge: stats.streams },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-7 w-7 md:h-8 md:w-8 text-blue-600" />
            Academic Setup
          </h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">Manage educational hierarchy - Levels, Grades and Streams</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Education Levels</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.levels}</p>
                  <p className="text-xs text-gray-500 mt-1">Primary, Secondary, etc.</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl">
                  <Layers className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Grade Classes</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.grades}</p>
                  <p className="text-xs text-gray-500 mt-1">1-12 and beyond</p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl">
                  <GraduationCap className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Study Streams</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.streams}</p>
                  <p className="text-xs text-gray-500 mt-1">Science, Arts, Commerce</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-xl">
                  <Split className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Add Bar */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={Search}
              />
            </div>
            <button
              onClick={() => {
                if (tab === 'levels') {
                  setShowLevelModal(true);
                  setEditingLevel(null);
                  setLevelForm({ name: '', code: '', order: 0, description: '' });
                } else if (tab === 'grades') {
                  setShowGradeModal(true);
                  setEditingGrade(null);
                  setGradeForm({ name: '', gradeNumber: '', levelId: '', code: '', academicYear: '' });
                } else {
                  setShowStreamModal(true);
                  setEditingStream(null);
                  setStreamForm({ name: '', code: '', description: '' });
                }
              }}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 justify-center whitespace-nowrap font-medium shadow-sm"
            >
              <Plus className="h-5 w-5" />
              Add {tab === 'levels' ? 'Level' : tab === 'grades' ? 'Grade' : 'Stream'}
            </button>
          </div>
        </div>

        {/* Tabs & Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <Tabs tabs={tabs} activeTab={tab} onChange={setTab} />

          <div className="p-4 md:p-6">
            {/* Levels Tab */}
            <TabPanel value="levels" activeTab={tab}>
              {loadingLevels ? (
                <div className="text-center py-12 text-gray-500">Loading levels...</div>
              ) : filteredLevels.length === 0 ? (
                <div className="text-center py-12">
                  <Layers className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">No levels found. Add your first level to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-semibold">Order</TableHead>
                        <TableHead className="font-semibold">Level Name</TableHead>
                        <TableHead className="font-semibold">Code</TableHead>
                        <TableHead className="font-semibold">Description</TableHead>
                        <TableHead className="font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLevels.map((l) => (
                        <TableRow key={l._id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium text-gray-900">{l.order}</TableCell>
                          <TableCell className="font-medium text-gray-900">{l.name}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              {l.code || 'N/A'}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                            {l.description || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleEditLevel(l)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteLevel(l._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabPanel>

            {/* Grades Tab */}
            <TabPanel value="grades" activeTab={tab}>
              {loadingGrades ? (
                <div className="text-center py-12 text-gray-500">Loading grades...</div>
              ) : filteredGrades.length === 0 ? (
                <div className="text-center py-12">
                  <GraduationCap className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">No grades found. Add your first grade to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-semibold">Grade Name</TableHead>
                        <TableHead className="font-semibold">Number</TableHead>
                        <TableHead className="font-semibold">Level</TableHead>
                        <TableHead className="font-semibold">Code</TableHead>
                        <TableHead className="font-semibold">Academic Year</TableHead>
                        <TableHead className="font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGrades.map((g) => (
                        <TableRow key={g._id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium text-gray-900">{g.name}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              {g.gradeNumber || '-'}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {g.levelId?.name || levels.find((l) => l._id === g.levelId)?.name || '-'}
                          </TableCell>
                          <TableCell>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                              {g.code || 'N/A'}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">{g.academicYear || '-'}</TableCell>
                          <TableCell>
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleEditGrade(g)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteGrade(g._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabPanel>

            {/* Streams Tab */}
            <TabPanel value="streams" activeTab={tab}>
              {loadingStreams ? (
                <div className="text-center py-12 text-gray-500">Loading streams...</div>
              ) : filteredStreams.length === 0 ? (
                <div className="text-center py-12">
                  <Split className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">No streams found. Add your first stream to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-semibold">Stream Name</TableHead>
                        <TableHead className="font-semibold">Code</TableHead>
                        <TableHead className="font-semibold">Description</TableHead>
                        <TableHead className="font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStreams.map((s) => (
                        <TableRow key={s._id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium text-gray-900">{s.name}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                              {s.code || 'N/A'}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                            {s.description || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleEditStream(s)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteStream(s._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabPanel>
          </div>
        </div>
      </div>

      {/* Level Modal */}
      <Modal
        open={showLevelModal}
        onClose={() => setShowLevelModal(false)}
        title={editingLevel ? 'Edit Level' : 'Add New Level'}
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowLevelModal(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => levelFormRef.current?.requestSubmit?.() || levelFormRef.current?.submit?.()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingLevel ? 'Update' : 'Create'} Level
            </button>
          </div>
        }
      >
        <form ref={levelFormRef} onSubmit={saveLevel} className="space-y-4">
          <Input
            label="Level Name"
            value={levelForm.name}
            onChange={(e) => setLevelForm({ ...levelForm, name: e.target.value })}
            placeholder="e.g., Primary, Secondary, Higher Secondary"
            required
          />
          <Input
            label="Code"
            value={levelForm.code}
            onChange={(e) => setLevelForm({ ...levelForm, code: e.target.value })}
            placeholder="e.g., PRI, SEC, HS"
          />
          <Input
            label="Display Order"
            type="number"
            value={levelForm.order}
            onChange={(e) => setLevelForm({ ...levelForm, order: parseInt(e.target.value || 0) })}
            placeholder="Numeric order for sorting"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea
              value={levelForm.description}
              onChange={(e) => setLevelForm({ ...levelForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Brief description of this level"
              rows="3"
            />
          </div>
        </form>
      </Modal>

      {/* Grade Modal */}
      <Modal
        open={showGradeModal}
        onClose={() => setShowGradeModal(false)}
        title={editingGrade ? 'Edit Grade' : 'Add New Grade'}
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowGradeModal(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => gradeFormRef.current?.requestSubmit?.() || gradeFormRef.current?.submit?.()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingGrade ? 'Update' : 'Create'} Grade
            </button>
          </div>
        }
      >
        <form ref={gradeFormRef} onSubmit={saveGrade} className="space-y-4">
          <Input
            label="Grade Name"
            value={gradeForm.name}
            onChange={(e) => setGradeForm({ ...gradeForm, name: e.target.value })}
            placeholder="e.g., Grade 9, Class 10"
            required
          />
          <Input
            label="Grade Number"
            type="number"
            value={gradeForm.gradeNumber}
            onChange={(e) => setGradeForm({ ...gradeForm, gradeNumber: parseInt(e.target.value || 0) })}
            placeholder="Numeric grade (1, 2, 3...12)"
          />
          <Dropdown
            label="Education Level"
            name="levelId"
            value={gradeForm.levelId || ''}
            onChange={(e) => setGradeForm({ ...gradeForm, levelId: e.target.value })}
            options={[
              { label: 'Select Level', value: '' },
              ...levels.map((l) => ({ label: l.name, value: l._id })),
            ]}
            placeholder="Select Level"
            required
          />
          <Input
            label="Code"
            value={gradeForm.code}
            onChange={(e) => setGradeForm({ ...gradeForm, code: e.target.value })}
            placeholder="e.g., G9, CL10"
          />
          <Input
            label="Academic Year"
            value={gradeForm.academicYear}
            onChange={(e) => setGradeForm({ ...gradeForm, academicYear: e.target.value })}
            placeholder="e.g., 2025-2026"
          />
        </form>
      </Modal>

      {/* Stream Modal */}
      <Modal
        open={showStreamModal}
        onClose={() => setShowStreamModal(false)}
        title={editingStream ? 'Edit Stream' : 'Add New Stream'}
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowStreamModal(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => streamFormRef.current?.requestSubmit?.() || streamFormRef.current?.submit?.()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingStream ? 'Update' : 'Create'} Stream
            </button>
          </div>
        }
      >
        <form ref={streamFormRef} onSubmit={saveStream} className="space-y-4">
          <Input
            label="Stream Name"
            value={streamForm.name}
            onChange={(e) => setStreamForm({ ...streamForm, name: e.target.value })}
            placeholder="e.g., Science, Commerce, Arts"
            required
          />
          <Input
            label="Code"
            value={streamForm.code}
            onChange={(e) => setStreamForm({ ...streamForm, code: e.target.value })}
            placeholder="e.g., SCI, COM, ART"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea
              value={streamForm.description}
              onChange={(e) => setStreamForm({ ...streamForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Brief description of this stream"
              rows="3"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
