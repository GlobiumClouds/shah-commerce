# Academic System Restructure TODO

## Phase 1: Database Schema Updates ✅ COMPLETED
- [x] Update Level Model - Add sessionYear, isActive fields
- [x] Update Class Model - Add sessionId, facultyId references
- [x] Update Subject Model - Add facultyId reference
- [x] Update User Model - Add sessionId, facultyId, selectedSubjects to student profile
- [x] Create Migration Scripts - Data migration for existing records

## Phase 2: Backend API Development 🔄 IN PROGRESS
- [ ] Create Session Management APIs (POST/GET/PUT/DELETE /api/super-admin/sessions)
- [ ] Create Faculty Management APIs (POST/GET/PUT/DELETE /api/super-admin/faculties)
- [ ] Update Class Management APIs (session-aware operations)
- [ ] Update Subject Management APIs (faculty-aware operations)
- [ ] Create Student Enrollment APIs (session/faculty-aware enrollment)
- [ ] Create sessionController.js
- [ ] Create facultyController.js
- [ ] Update classController.js
- [ ] Update subjectController.js
- [ ] Update studentController.js

## Phase 3: Frontend Development 🔄 IN PROGRESS
- [x] Create Session Management UI Components (SessionList, SessionForm)
- [x] Create Faculty Management UI Components (FacultyList, FacultyForm)
- [ ] Create Class Hierarchy UI (Tree view)
- [ ] Create Subject Management UI Updates
- [ ] Create Student Enrollment Wizard
- [ ] Create Subject Selection Modal
- [ ] Update existing pages to use new APIs

## Phase 4: Integration & Testing 🔄 IN PROGRESS
- [ ] API Integration Testing
- [ ] Data Migration Verification
- [ ] UI/UX Testing
- [ ] Performance Testing

## Current Task: Phase 4 - API Testing
Next Steps:
1. Test all new APIs without breaking existing functionality
2. Verify session/faculty/class relationships work correctly
3. Test student enrollment flow
4. Check error handling and validation
