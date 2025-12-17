'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Dropdown from '@/components/ui/dropdown';
import Tabs, { TabPanel } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import QRScanner from '@/components/QRScanner';
import apiClient from '@/lib/api-client';
import API_ENDPOINTS from '@/constants/api-endpoints';
import { toast } from 'sonner';
import { Camera, Search, Save, CheckCircle, XCircle, Clock } from 'lucide-react';
import FullPageLoader from '@/components/ui/full-page-loader';
import ButtonLoader from '@/components/ui/button-loader';

export default function SuperAdminAttendancePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [activeTab, setActiveTab] = useState('manual');
  
  // Data states
  const [branches, setBranches] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  
  // Form states
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Attendance states
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [scannedStudents, setScannedStudents] = useState([]);
  
  // Fetch branches on mount
  useEffect(() => {
    fetchBranches();
  }, []);
  
  // Fetch classes when branch changes
  useEffect(() => {
    if (selectedBranch) {
      fetchClasses();
      // Reset dependent selects
      setSelectedClass('');
      setSelectedSection('');
      setSelectedSubject('');
      setStudents([]);
      setFilteredStudents([]);
    }
  }, [selectedBranch]);
  
  // Fetch students when class/section changes
  useEffect(() => {
    if (selectedBranch && selectedClass && selectedSection) {
      fetchStudents();
      fetchSubjects();
    } else {
      setStudents([]);
      setFilteredStudents([]);
      setSubjects([]);
    }
  }, [selectedClass, selectedSection]);
  
  // Filter students when search changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStudents(students);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredStudents(
        students.filter(student =>
          student.firstName.toLowerCase().includes(query) ||
          student.lastName.toLowerCase().includes(query) ||
          student.registrationNumber.toLowerCase().includes(query) ||
          student.rollNumber?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, students]);
  
  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(API_ENDPOINTS.SUPER_ADMIN.BRANCHES.LIST);
      setBranches(response.data.branches || []);
    } catch (error) {
      toast.error('Failed to fetch branches');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(API_ENDPOINTS.SUPER_ADMIN.CLASSES.LIST);
      // Filter classes by branch if needed
      setClasses(response.data.classes || []);
    } catch (error) {
      toast.error('Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchSubjects = async () => {
    if (!selectedClass) return;
    try {
      const response = await apiClient.get(API_ENDPOINTS.SUBJECT.LIST);
      const classSubjects = response.data.subjects.filter(s => s.classId === selectedClass);
      setSubjects(classSubjects || []);
    } catch (error) {
      toast.error('Failed to fetch subjects');
    }
  };
  
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(API_ENDPOINTS.STUDENT.LIST);
      
      const filtered = response.data.students.filter(
        student => 
          student.branchId === selectedBranch &&
          student.classId === selectedClass &&
          student.section === selectedSection
      );
      
      setStudents(filtered);
      setFilteredStudents(filtered);
      
      // Initialize attendance records
      await fetchExistingAttendance(filtered);
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchExistingAttendance = async (studentList) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SUPER_ADMIN.ATTENDANCE.LIST, {
        params: {
          branchId: selectedBranch,
          classId: selectedClass,
          date: attendanceDate,
          subjectId: selectedSubject || undefined
        }
      });
      
      if (response.data.attendance) {
        const records = {};
        response.data.attendance.records?.forEach(record => {
          records[record.studentId] = record.status;
        });
        setAttendanceRecords(records);
      } else {
        // Initialize all students as present by default
        const records = {};
        studentList.forEach(student => {
          records[student._id] = 'present';
        });
        setAttendanceRecords(records);
      }
    } catch (error) {
      // If no attendance exists, initialize all as present
      const records = {};
      studentList.forEach(student => {
        records[student._id] = 'present';
      });
      setAttendanceRecords(records);
    }
  };
  
  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };
  
  const handleQRScan = async (qrData) => {
    // Always send the QR payload to backend scan endpoint; backend will handle matching
    try {
      const res = await apiClient.post(API_ENDPOINTS.SUPER_ADMIN.ATTENDANCE.SCAN, {
        qr: qrData,
        date: attendanceDate,
        subjectId: selectedSubject || null,
        attendanceType: selectedSubject ? 'subject' : 'daily'
      });

      if (res?.data?.success) {
        toast.success(res.data.message || 'Attendance recorded');
        const student = res.data.data?.student;
        if (student && student._id) {
          // update local UI if student is currently loaded
          if (students.find(s => s._id === student._id) && student.branchId === selectedBranch && student.studentProfile?.classId === selectedClass) {
            setAttendanceRecords(prev => ({ ...prev, [student._id]: 'present' }));
            if (!scannedStudents.find(s => s._id === student._id)) {
              setScannedStudents(prev => [...prev, students.find(s => s._id === student._id)]);
            }
          }
        }
      } else {
        toast.error(res?.data?.message || 'Scan failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record scan');
    }
  };
  
  const handleSubmit = async () => {
    if (!selectedBranch || !selectedClass || !selectedSection) {
      toast.error('Please select branch, class and section');
      return;
    }
    
    try {
      setSaving(true);
      
      const records = Object.entries(attendanceRecords).map(([studentId, status]) => ({
        studentId,
        status
      }));
      
      const payload = {
        branchId: selectedBranch,
        classId: selectedClass,
        section: selectedSection,
        subjectId: selectedSubject || null,
        date: attendanceDate,
        attendanceType: selectedSubject ? 'subject' : 'daily',
        records
      };
      
      await apiClient.post(API_ENDPOINTS.SUPER_ADMIN.ATTENDANCE.CREATE, payload);
      toast.success('Attendance saved successfully!');
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };
  
  const getSelectedClass = () => classes.find(c => c._id === selectedClass);
  const sections = getSelectedClass()?.sections || [];
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };
  
  const getStatusBadge = (status) => {
    const variants = {
      present: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      absent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      late: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    };
    
    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };
  
  if (loading && !branches.length) return <FullPageLoader />;
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mark Attendance</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Mark attendance for students across all branches
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowScanner(true)}>
            <Camera className="h-4 w-4 mr-2" />
            Scan QR
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Attendance Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Branch *</Label>
              <Dropdown
                name="branch"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                options={branches.map((b) => ({ value: b._id, label: b.name }))}
                placeholder="Select branch"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Class *</Label>
              <Dropdown
                name="class"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                options={classes.map((c) => ({ value: c._id, label: c.name }))}
                disabled={!selectedBranch}
                placeholder="Select class"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Section *</Label>
              <Dropdown
                name="section"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                options={sections.map((s) => ({ value: s.name, label: s.name }))}
                disabled={!selectedClass}
                placeholder="Select section"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Subject (Optional)</Label>
              <Dropdown
                name="subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                options={[{ value: '', label: 'All subjects' }, ...subjects.map((s) => ({ value: s._id, label: s.name }))]}
                disabled={!selectedClass}
                placeholder="All subjects"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {selectedBranch && selectedClass && selectedSection && (
        <>
          <Tabs
            tabs={[{ id: 'manual', label: 'Manual Attendance' }, { id: 'qr', label: 'QR Code Scan' }]}
            activeTab={activeTab}
            onChange={setActiveTab}
            className="w-full"
          />

          <TabPanel value="manual" activeTab={activeTab}>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Students List</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                    <Button onClick={handleSubmit} disabled={saving}>
                      {saving ? <ButtonLoader /> : <Save className="h-4 w-4 mr-2" />}
                      Save Attendance
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading students...</div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No students found
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Roll No.</TableHead>
                        <TableHead>Reg. No.</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map(student => (
                        <TableRow key={student._id}>
                          <TableCell>{student.rollNumber || 'N/A'}</TableCell>
                          <TableCell>{student.registrationNumber}</TableCell>
                          <TableCell className="font-medium">
                            {student.firstName} {student.lastName}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant={attendanceRecords[student._1d] === 'present' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleStatusChange(student._id, 'present')}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Present
                              </Button>
                              <Button
                                variant={attendanceRecords[student._id] === 'absent' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleStatusChange(student._id, 'absent')}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Absent
                              </Button>
                              <Button
                                variant={attendanceRecords[student._id] === 'late' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleStatusChange(student._id, 'late')}
                              >
                                <Clock className="h-4 w-4 mr-1" />
                                Late
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel value="qr" activeTab={activeTab}>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>QR Code Scanner</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => setShowScanner(true)}>
                      <Camera className="h-4 w-4 mr-2" />
                      Open Scanner
                    </Button>
                    <Button onClick={handleSubmit} disabled={saving}>
                      {saving ? <ButtonLoader /> : <Save className="h-4 w-4 mr-2" />}
                      Save Attendance
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Click "Open Scanner" to scan multiple student QR codes. The camera will stay open until you close it.
                      Scanned students will be automatically marked as present.
                    </p>
                  </div>
                  
                  {scannedStudents.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">
                        Scanned Students ({scannedStudents.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {scannedStudents.map(student => (
                          <div
                            key={student._id}
                            className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                          >
                            <div>
                              <p className="font-medium">
                                {student.firstName} {student.lastName}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {student.registrationNumber}
                              </p>
                            </div>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Roll No.</TableHead>
                          <TableHead>Reg. No.</TableHead>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map(student => (
                          <TableRow key={student._id}>
                            <TableCell>{student.rollNumber || 'N/A'}</TableCell>
                            <TableCell>{student.registrationNumber}</TableCell>
                            <TableCell className="font-medium">
                              {student.firstName} {student.lastName}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(attendanceRecords[student._id])}
                                {getStatusBadge(attendanceRecords[student._id])}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabPanel>
        </>
      )}
      
      {showScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
