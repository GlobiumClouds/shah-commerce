# Academic System Restructuring Plan

## Overview
Restructure the academic system to organize levels by sessions (2025, 2026), with classes, subjects, and faculties (pre-engineering, pre-medical) under each session. When adding students to classes, link them to sessions, faculties, and display subject options in a popup.

## Current State Analysis
- **Level Model**: Basic level structure with name, code, order
- **Grade Model**: Links to Level with gradeNumber and academicYear
- **Class Model**: Links to Grade with sections, subjects, academicYear
- **Subject Model**: Links to Class with grade, department, teachers
- **User Model**: Student profile links to classId, departmentId
- **Stream Model**: Separate faculty/stream structure

## Required Changes

### 1. Database Schema Updates

#### Level Model Updates
- Add `sessionYear` field (e.g., 2025, 2026)
- Add `isActive` field for session management
- Update indexes for session-based queries

#### Class Model Updates
- Add `sessionId` reference to Level (session)
- Add `facultyId` reference to Stream (pre-engineering, pre-medical)
- Update academicYear to be derived from session

#### Subject Model Updates
- Add `facultyId` reference to Stream
- Update classId to be session-aware
- Add subject limits per faculty

#### User Model Updates (Student Profile)
- Add `sessionId` reference
- Add `facultyId` reference
- Add `selectedSubjects` array with limits
- Update enrollment flow

### 2. Backend APIs

#### Session Management APIs
- **POST /api/super-admin/sessions**: Create new session (2025, 2026)
- **GET /api/super-admin/sessions**: List all sessions
- **PUT /api/super-admin/sessions/[id]**: Update session
- **DELETE /api/super-admin/sessions/[id]**: Delete session

#### Faculty Management APIs
- **POST /api/super-admin/faculties**: Create faculty (pre-engineering, pre-medical)
- **GET /api/super-admin/faculties**: List faculties
- **PUT /api/super-admin/faculties/[id]**: Update faculty
- **DELETE /api/super-admin/faculties/[id]**: Delete faculty

#### Class Management APIs
- **POST /api/branch-admin/classes**: Create class under session
- **GET /api/branch-admin/classes?sessionId=X**: List classes by session
- **PUT /api/branch-admin/classes/[id]**: Update class
- **DELETE /api/branch-admin/classes/[id]**: Delete class

#### Subject Management APIs
- **POST /api/branch-admin/subjects**: Create subject under faculty
- **GET /api/branch-admin/subjects?facultyId=X**: List subjects by faculty
- **PUT /api/branch-admin/subjects/[id]**: Update subject
- **DELETE /api/branch-admin/subjects/[id]**: Delete subject

#### Student Enrollment APIs
- **POST /api/branch-admin/students/enroll**: Enroll student with session/faculty selection
- **GET /api/branch-admin/students/[id]/subjects**: Get available subjects for student
- **POST /api/branch-admin/students/[id]/subjects**: Assign subjects to student
- **GET /api/branch-admin/students?sessionId=X&facultyId=Y**: List students by session/faculty

### 3. Frontend Components

#### Session Management Components
- **SessionList.jsx**: Display and manage sessions (2025, 2026)
- **SessionForm.jsx**: Create/edit session forms
- **SessionSelector.jsx**: Dropdown for session selection

#### Faculty Management Components
- **FacultyList.jsx**: Display faculties (pre-engineering, pre-medical)
- **FacultyForm.jsx**: Create/edit faculty forms
- **FacultySelector.jsx**: Dropdown for faculty selection

#### Class Management Components
- **ClassHierarchy.jsx**: Tree view of Session > Faculty > Classes
- **ClassForm.jsx**: Create class with session/faculty selection
- **ClassList.jsx**: List classes filtered by session/faculty

#### Subject Management Components
- **SubjectList.jsx**: Display subjects under faculties
- **SubjectForm.jsx**: Create subject with faculty selection
- **SubjectSelector.jsx**: Multi-select for subject assignment

#### Student Enrollment Components
- **StudentEnrollmentWizard.jsx**: Step-by-step enrollment process
- **SubjectSelectionModal.jsx**: Popup showing available subjects with limits
- **StudentClassAssignment.jsx**: Assign student to class with session/faculty context

### 4. Business Logic

#### Session-Based Organization
- Sessions (2025, 2026) as top-level containers
- Classes created under specific sessions
- Academic years derived from session years

#### Faculty-Based Subject Organization
- Subjects grouped under faculties (pre-engineering, pre-medical)
- Subject limits per faculty (configurable)
- Student subject selection based on faculty enrollment

#### Student Enrollment Flow
1. Select session (2025, 2026)
2. Select faculty (pre-engineering, pre-medical)
3. Choose class within session/faculty
4. Select subjects (with popup showing limits)
5. Confirm enrollment

## Implementation Plan

### Phase 1: Database Schema Updates
1. **Update Level Model** - Add sessionYear, isActive
2. **Update Class Model** - Add sessionId, facultyId
3. **Update Subject Model** - Add facultyId, subject limits
4. **Update User Model** - Add sessionId, facultyId, selectedSubjects
5. **Create Migration Scripts** - Data migration for existing records

### Phase 2: Backend API Development
1. **Session Management APIs** - CRUD operations for sessions
2. **Faculty Management APIs** - CRUD operations for faculties
3. **Class Management APIs** - Session-aware class operations
4. **Subject Management APIs** - Faculty-aware subject operations
5. **Student Enrollment APIs** - Session/faculty-aware enrollment

### Phase 3: Frontend Development
1. **Session Management UI** - Create session management components
2. **Faculty Management UI** - Create faculty management components
3. **Class Hierarchy UI** - Tree view for session > faculty > classes
4. **Subject Management UI** - Faculty-based subject organization
5. **Student Enrollment UI** - Wizard with subject selection popup

### Phase 4: Integration & Testing
1. **API Integration** - Connect frontend to new APIs
2. **Data Migration** - Migrate existing data to new structure
3. **UI/UX Testing** - Test enrollment flows and hierarchies
4. **Performance Testing** - Test with large datasets

## File Structure Changes

### Backend Files to Create/Update:
```
src/backend/models/
├── Level.js (update - add sessionYear)
├── Class.js (update - add sessionId, facultyId)
├── Subject.js (update - add facultyId)
├── User.js (update - student profile updates)
├── Stream.js (rename to Faculty.js or update)

src/backend/controllers/
├── sessionController.js (new)
├── facultyController.js (new)
├── classController.js (update)
├── subjectController.js (update)
├── studentController.js (update)

src/app/api/super-admin/
├── sessions/route.js (new)
├── sessions/[id]/route.js (new)
├── faculties/route.js (new)
├── faculties/[id]/route.js (new)

src/app/api/branch-admin/
├── classes/route.js (update)
├── subjects/route.js (update)
├── students/enroll/route.js (new)
├── students/[id]/subjects/route.js (new)
```

### Frontend Files to Create/Update:
```
src/components/super-admin/
├── SessionList.jsx (new)
├── SessionForm.jsx (new)
├── FacultyList.jsx (new)
├── FacultyForm.jsx (new)

src/components/branch-admin/
├── ClassHierarchy.jsx (new)
├── ClassForm.jsx (update)
├── SubjectList.jsx (update)
├── StudentEnrollmentWizard.jsx (new)
├── SubjectSelectionModal.jsx (new)

src/app/(dashboard)/super-admin/
├── sessions/page.js (new)
├── faculties/page.js (new)

src/app/(dashboard)/branch-admin/
├── classes/page.js (update)
├── subjects/page.js (update)
├── students/enroll/page.js (new)
```

## Data Structure

### Updated Level (Session)
```javascript
{
  name: String, // "Session 2025"
  code: String, // "SESS-2025"
  sessionYear: Number, // 2025
  isActive: Boolean, // true
  order: Number,
  description: String,
  createdBy: ObjectId,
  updatedBy: ObjectId
}
```

### Updated Class
```javascript
{
  name: String,
  code: String,
  grade: ObjectId,
  sections: [...],
  branchId: ObjectId,
  sessionId: ObjectId, // NEW: Reference to session
  facultyId: ObjectId, // NEW: Reference to faculty
  subjects: [ObjectId],
  feeTemplates: [ObjectId],
  description: String,
  status: String
}
```

### Updated Subject
```javascript
{
  name: String,
  code: String,
  classId: ObjectId,
  grade: Number,
  gradeId: ObjectId,
  facultyId: ObjectId, // NEW: Reference to faculty
  subjectType: String,
  hoursPerWeek: Number,
  totalHoursPerYear: Number,
  creditHours: Number,
  departmentId: ObjectId,
  headTeacherId: ObjectId,
  teachers: [ObjectId],
  assessmentPattern: Object,
  learningOutcomes: [Object],
  prerequisites: [ObjectId],
  resources: Object,
  status: String
}
```

### Updated Student Profile
```javascript
{
  registrationNumber: String,
  classId: ObjectId,
  departmentId: ObjectId,
  section: String,
  rollNumber: String,
  admissionDate: Date,
  academicYear: String,
  sessionId: ObjectId, // NEW: Reference to session
  facultyId: ObjectId, // NEW: Reference to faculty
  selectedSubjects: [{ // NEW: Selected subjects with limits
    subjectId: ObjectId,
    subjectName: String,
    creditHours: Number
  }],
  previousSchool: Object,
  father: Object,
  mother: Object,
  guardian: Object,
  feeDiscount: Object,
  transportFee: Object,
  documents: [Object],
  qr: Object
}
```

## API Endpoints

### Session Management
- **POST /api/super-admin/sessions**
  - Body: `{ name, code, sessionYear, description }`
  - Response: `{ success, data: session }`

- **GET /api/super-admin/sessions**
  - Response: `{ success, data: sessions[] }`

### Faculty Management
- **POST /api/super-admin/faculties**
  - Body: `{ name, code, description }`
  - Response: `{ success, data: faculty }`

- **GET /api/super-admin/faculties**
  - Response: `{ success, data: faculties[] }`

### Class Management
- **POST /api/branch-admin/classes**
  - Body: `{ name, code, gradeId, sessionId, facultyId, sections, subjects }`
  - Response: `{ success, data: class }`

- **GET /api/branch-admin/classes?sessionId=X&facultyId=Y**
  - Response: `{ success, data: classes[] }`

### Student Enrollment
- **POST /api/branch-admin/students/enroll**
  - Body: `{ studentData, sessionId, facultyId, classId }`
  - Response: `{ success, data: student }`

- **GET /api/branch-admin/students/[id]/subjects**
  - Response: `{ success, data: { availableSubjects: [], selectedSubjects: [], limits: {} } }`

- **POST /api/branch-admin/students/[id]/subjects**
  - Body: `{ subjectIds: [] }`
  - Response: `{ success, message }`

## Validation Rules

### Session Validation
- Unique sessionYear per branch
- Future years only (2025, 2026, etc.)
- Active sessions limit (max 2-3 concurrent)

### Faculty Validation
- Unique faculty names
- Pre-defined faculties (pre-engineering, pre-medical, etc.)
- Subject limits per faculty

### Class Validation
- Must belong to active session
- Must belong to valid faculty
- Subjects must match faculty

### Student Enrollment Validation
- Session must be active
- Faculty must exist
- Class must belong to selected session/faculty
- Subject selection within faculty limits

## UI/UX Requirements

### Session Management Page
- Grid/list view of sessions (2025, 2026)
- Create new session form
- Edit/delete actions
- Active/inactive status indicators

### Faculty Management Page
- List of faculties (pre-engineering, pre-medical)
- Create/edit faculty forms
- Subject count per faculty
- Associated classes count

### Class Hierarchy Page
- Tree structure: Session > Faculty > Classes
- Expandable nodes
- Quick actions (edit, delete, view students)
- Search/filter by session/faculty

### Student Enrollment Wizard
- Step 1: Select session (2025, 2026)
- Step 2: Select faculty (pre-engineering, pre-medical)
- Step 3: Choose class
- Step 4: Subject selection popup with limits
- Step 5: Confirmation and enrollment

### Subject Selection Modal
- Available subjects list
- Selected subjects counter
- Faculty subject limits display
- Credit hours calculation
- Save/cancel actions

## Dependencies
- Existing: MongoDB, Mongoose, Next.js, React
- New: Tree view components (react-tree-view or similar)

## Testing Checklist

### Backend Tests
- [ ] Session CRUD operations
- [ ] Faculty CRUD operations
- [ ] Class creation with session/faculty
- [ ] Subject creation with faculty
- [ ] Student enrollment with subject selection
- [ ] Validation rules enforcement

### Frontend Tests
- [ ] Session/faculty selection flows
- [ ] Class hierarchy display
- [ ] Subject selection modal
- [ ] Enrollment wizard steps
- [ ] Data persistence across steps

## Security Considerations
- Session/faculty isolation for branch admins
- Student data privacy
- API rate limiting for enrollment operations
- Audit logging for enrollment changes

## Performance Optimizations
- Database indexing on sessionId, facultyId
- Efficient tree queries for hierarchy
- Caching for frequently accessed sessions/faculties
- Lazy loading for large subject lists

## Rollback Plan
- Keep existing class/subject structure intact
- Gradual migration of existing data
- Feature flags for new enrollment flow
- Backup all existing student/class data

## Success Metrics
- Successful session/faculty creation
- Smooth enrollment wizard completion
- Accurate subject selection limits
- Proper hierarchy display and navigation
- Data integrity across all levels

## Migration Strategy
1. **Phase 1**: Create new schema fields alongside existing ones
2. **Phase 2**: Migrate existing data to new structure
3. **Phase 3**: Update frontend to use new APIs
4. **Phase 4**: Deprecate old fields after verification
5. **Phase 5**: Clean up old schema fields

## Risk Assessment
- **Data Loss**: Comprehensive backups before migration
- **Downtime**: Staged rollout to minimize impact
- **User Training**: Documentation and training for new flows
- **Performance**: Monitor and optimize database queries
