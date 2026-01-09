"use client";

import { useState , useEffect} from 'react';
import Modal from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import GenderSelect from '@/components/ui/gender-select';
import BloodGroupSelect from '@/components/ui/blood-group';
import BranchSelect from '@/components/ui/branch-select';
import ButtonLoader from '@/components/ui/button-loader';
import { toast } from 'sonner';

export default function AddStaffModal({ open, onClose, onSuccess, branches, role, staffMember = null }) {
  const [loading, setLoading] = useState(false);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(staffMember?.profilePhoto?.url || null);
  const [documentFiles, setDocumentFiles] = useState([]);
  const [formData, setFormData] = useState({
    firstName: staffMember?.firstName || '',
    lastName: staffMember?.lastName || '',
    email: staffMember?.email || '',
    phone: staffMember?.phone || '',
    alternatePhone: staffMember?.alternatePhone || '',
    dateOfBirth: staffMember?.dateOfBirth ? new Date(staffMember.dateOfBirth).toISOString().split('T')[0] : '',
    gender: staffMember?.gender || '',
    cnic: staffMember?.cnic || '',
    bloodGroup: staffMember?.bloodGroup || '',
    religion: staffMember?.religion || '',
    nationality: staffMember?.nationality || 'Pakistani',
    branchId: staffMember?.branchId?._id || staffMember?.branchId || '',
    joiningDate: staffMember?.staffProfile?.joiningDate ? new Date(staffMember.staffProfile.joiningDate).toISOString().split('T')[0] : '',
    staffType: staffMember?.staffProfile?.staffType || '',
    designation: staffMember?.staffProfile?.designation || '',
    shift: staffMember?.staffProfile?.shift || 'Morning',
    departmentId: staffMember?.staffProfile?.departmentId || '',
    basicSalary: staffMember?.staffProfile?.salaryDetails?.basicSalary || '',
    salaryType: staffMember?.staffProfile?.salaryDetails?.salaryType || 'monthly',
    address: {
      street: staffMember?.address?.street || '',
      city: staffMember?.address?.city || '',
      state: staffMember?.address?.state || '',
      postalCode: staffMember?.address?.postalCode || '',
      country: staffMember?.address?.country || 'Pakistan'
    },
    emergencyContact: {
      name: staffMember?.staffProfile?.emergencyContact?.name || '',
      relationship: staffMember?.staffProfile?.emergencyContact?.relationship || '',
      phone: staffMember?.staffProfile?.emergencyContact?.phone || '',
      alternatePhone: staffMember?.staffProfile?.emergencyContact?.alternatePhone || '',
      address: staffMember?.staffProfile?.emergencyContact?.address || ''
    },
    allowances: {
      houseRent: staffMember?.staffProfile?.salaryDetails?.allowances?.houseRent || '',
      medical: staffMember?.staffProfile?.salaryDetails?.allowances?.medical || '',
      transport: staffMember?.staffProfile?.salaryDetails?.allowances?.transport || '',
      uniform: staffMember?.staffProfile?.salaryDetails?.allowances?.uniform || '',
      other: staffMember?.staffProfile?.salaryDetails?.allowances?.other || ''
    },
    deductions: {
      tax: staffMember?.staffProfile?.salaryDetails?.deductions?.tax || '',
      providentFund: staffMember?.staffProfile?.salaryDetails?.deductions?.providentFund || '',
      insurance: staffMember?.staffProfile?.salaryDetails?.deductions?.insurance || '',
      loan: staffMember?.staffProfile?.salaryDetails?.deductions?.loan || '',
      other: staffMember?.staffProfile?.salaryDetails?.deductions?.other || ''
    },
    workingHours: {
      startTime: staffMember?.staffProfile?.workingHours?.startTime || '',
      endTime: staffMember?.staffProfile?.workingHours?.endTime || '',
      breakDuration: staffMember?.staffProfile?.workingHours?.breakDuration || 60,
      workingDays: staffMember?.staffProfile?.workingHours?.workingDays || []
    },
    uniformDetails: {
      size: staffMember?.staffProfile?.uniformDetails?.size || '',
      quantityIssued: staffMember?.staffProfile?.uniformDetails?.quantityIssued || 2,
      lastIssuedDate: staffMember?.staffProfile?.uniformDetails?.lastIssuedDate ? new Date(staffMember.staffProfile.uniformDetails.lastIssuedDate).toISOString().split('T')[0] : ''
    },
    bankAccount: {
      bankName: staffMember?.staffProfile?.bankAccount?.bankName || '',
      accountNumber: staffMember?.staffProfile?.bankAccount?.accountNumber || '',
      iban: staffMember?.staffProfile?.bankAccount?.iban || '',
      branchCode: staffMember?.staffProfile?.bankAccount?.branchCode || ''
    },
    specializedInfo: {
      driverLicense: {
        number: staffMember?.staffProfile?.specializedInfo?.driverLicense?.number || '',
        type: staffMember?.staffProfile?.specializedInfo?.driverLicense?.type || '',
        expiryDate: staffMember?.staffProfile?.specializedInfo?.driverLicense?.expiryDate ? new Date(staffMember.staffProfile.specializedInfo.driverLicense.expiryDate).toISOString().split('T')[0] : ''
      },
      securityBadgeNumber: staffMember?.staffProfile?.specializedInfo?.securityBadgeNumber || '',
      medicalQualification: staffMember?.staffProfile?.specializedInfo?.medicalQualification || '',
      tradeCertificate: staffMember?.staffProfile?.specializedInfo?.tradeCertificate || '',
      foodHandlingCertificate: staffMember?.staffProfile?.specializedInfo?.foodHandlingCertificate || ''
    }
  });

  // Initialize with existing documents for edit mode
  useEffect(() => {
    if (staffMember?.staffProfile?.documents) {
      setDocumentFiles(staffMember.staffProfile.documents.map(doc => ({
        ...doc,
        existing: true
      })));
    }
  }, [staffMember]);

  // Handle profile photo selection (no upload yet)
  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Store file and create preview
    setProfilePhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
    toast.success('Profile photo selected');
  };

  // Handle document selection (no upload yet)
  const handleDocumentSelect = (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Check if document type already exists
    const existingIndex = documentFiles.findIndex(doc => doc.type === docType);
    
    if (existingIndex !== -1) {
      // Replace existing document of same type
      const newDocs = [...documentFiles];
      newDocs[existingIndex] = { file, type: docType, name: file.name };
      setDocumentFiles(newDocs);
      toast.success(`${docType} replaced`);
    } else {
      // Add new document
      setDocumentFiles(prev => [...prev, { file, type: docType, name: file.name }]);
      toast.success(`${docType} selected`);
    }
    
    e.target.value = ''; // Reset input
  };

  // Remove document
  const handleRemoveDocument = (index) => {
    setDocumentFiles(prev => prev.filter((_, i) => i !== index));
    toast.success('Document removed');
  };

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    
    // Handle checkbox for working days
    if (name === 'workingDays') {
      const currentDays = formData.workingHours.workingDays || [];
      const newDays = checked 
        ? [...currentDays, value]
        : currentDays.filter(day => day !== value);
      
      setFormData(prev => ({
        ...prev,
        workingHours: {
          ...prev.workingHours,
          workingDays: newDays
        }
      }));
      return;
    }
    
    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 2) {
        const [parent, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      } else if (parts.length === 3) {
        const [parent, child, grandchild] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [grandchild]: value
            }
          }
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.firstName || !formData.email || !formData.staffType) {
      toast.error('First name, email and staff type are required');
      return;
    }

    // Super admin must select branch
    if (role === 'super_admin' && !formData.branchId) {
      toast.error('Please select a branch');
      return;
    }

    try {
      setLoading(true);

      const isEditMode = !!staffMember;

      // Step 1: Upload profile photo if selected or changed
      let profilePhotoData = staffMember?.profilePhoto || null;
      if (profilePhotoFile) {
        const photoFormData = new FormData();
        photoFormData.append('file', profilePhotoFile);
        photoFormData.append('fileType', 'profile');
        if (isEditMode) {
          photoFormData.append('userId', staffMember._id);
        }

        const photoResponse = await apiClient.post(API_ENDPOINTS.COMMON.UPLOAD, photoFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (photoResponse.success) {
          profilePhotoData = {
            url: photoResponse.data.url,
            publicId: photoResponse.data.publicId
          };
        }
      }

      // Step 2: Upload documents if selected
      const uploadedDocuments = [];
      for (const docFile of documentFiles) {
        if (docFile.existing) {
          // Keep existing document
          uploadedDocuments.push(docFile);
        } else {
          // Upload new document
          const docFormData = new FormData();
          docFormData.append('file', docFile.file);
          docFormData.append('fileType', 'staff_document');
          docFormData.append('documentType', docFile.type);
          if (isEditMode) {
            docFormData.append('userId', staffMember._id);
          }

          const docResponse = await apiClient.post(API_ENDPOINTS.COMMON.UPLOAD, docFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          if (docResponse.success) {
            uploadedDocuments.push({
              type: docFile.type,
              name: docFile.name,
              url: docResponse.data.url,
              publicId: docResponse.data.publicId
            });
          }
        }
      }

      // Step 3: Create or update staff record
      const endpoint = isEditMode
        ? (role === 'super_admin' 
            ? API_ENDPOINTS.SUPER_ADMIN.STAFF.UPDATE.replace(':id', staffMember._id)
            : API_ENDPOINTS.BRANCH_ADMIN.STAFF.UPDATE.replace(':id', staffMember._id))
        : (role === 'super_admin' 
            ? API_ENDPOINTS.SUPER_ADMIN.STAFF.CREATE
            : API_ENDPOINTS.BRANCH_ADMIN.STAFF.CREATE);

      // Prepare complete staff data
      const submitData = {
        ...formData,
        ...(profilePhotoData && { profilePhoto: profilePhotoData }),
        documents: uploadedDocuments
      };

      console.log('Submitting staff data:', submitData);

      const response = isEditMode
        ? await apiClient.put(endpoint, submitData)
        : await apiClient.post(endpoint, submitData);
      
      if (response.success) {
        toast.success(isEditMode ? 'Staff updated successfully' : 'Staff added successfully');
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Staff operation error:', error);
      toast.error(error.message || `Failed to ${staffMember ? 'update' : 'add'} staff`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={staffMember ? "Edit Staff Member" : "Add New Staff"}
      size="xl"
      footer={
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <ButtonLoader size={4} />
                {staffMember ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              staffMember ? 'Update Staff' : 'Add Staff'
            )}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Photo Upload */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Profile Photo</h3>
          <div className="flex items-center gap-4">
            {profilePhotoPreview ? (
              <div className="relative">
                <img
                  src={profilePhotoPreview}
                  alt="Profile Preview"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                />
                <button
                  type="button"
                  onClick={() => {
                    setProfilePhotoFile(null);
                    setProfilePhotoPreview(null);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-gray-400 text-sm">No Photo</span>
              </div>
            )}
            <div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePhotoChange}
                  className="hidden"
                />
                <span className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
                  {profilePhotoFile ? 'Change Photo' : 'Upload Photo'}
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1">Max 5MB (JPG, PNG)</p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={!!staffMember}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+92 300 1234567"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Alternate Phone
              </label>
              <input
                type="tel"
                name="alternatePhone"
                value={formData.alternatePhone}
                onChange={handleChange}
                placeholder="+92 300 1234567"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gender
              </label>
              <GenderSelect
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                CNIC
              </label>
              <input
                type="text"
                name="cnic"
                value={formData.cnic}
                onChange={handleChange}
                placeholder="XXXXX-XXXXXXX-X"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Blood Group
              </label>
              <BloodGroupSelect
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Religion
              </label>
              <input
                type="text"
                name="religion"
                value={formData.religion}
                onChange={handleChange}
                placeholder="Islam, Christianity, etc."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nationality
              </label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Employment Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Employment Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {role === 'super_admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Branch <span className="text-red-500">*</span>
                </label>
                <BranchSelect
                  name="branchId"
                  value={formData.branchId}
                  onChange={handleChange}
                  branches={branches}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Staff Type <span className="text-red-500">*</span>
              </label>
              <select
                name="staffType"
                value={formData.staffType}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Select Staff Type</option>
                <optgroup label="Administrative Staff">
                  <option value="Administrative Officer">Administrative Officer</option>
                  <option value="Office Superintendent">Office Superintendent</option>
                  <option value="Clerk">Clerk</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Data Entry Operator">Data Entry Operator</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Office Assistant">Office Assistant</option>
                </optgroup>
                <optgroup label="Academic Support Staff">
                  <option value="Librarian">Librarian</option>
                  <option value="Assistant Librarian">Assistant Librarian</option>
                  <option value="Lab Assistant">Lab Assistant</option>
                  <option value="Lab Attendant">Lab Attendant</option>
                  <option value="Computer Lab Assistant">Computer Lab Assistant</option>
                  <option value="Science Lab Assistant">Science Lab Assistant</option>
                </optgroup>
                <optgroup label="Support Staff">
                  <option value="Peon">Peon</option>
                  <option value="Security Guard">Security Guard</option>
                  <option value="Gate Keeper">Gate Keeper</option>
                  <option value="Sweeper">Sweeper</option>
                  <option value="Cleaner">Cleaner</option>
                  <option value="Gardener">Gardener</option>
                  <option value="Mali">Mali</option>
                </optgroup>
                <optgroup label="Health & Medical Staff">
                  <option value="School Nurse">School Nurse</option>
                  <option value="Doctor">Doctor</option>
                  <option value="First Aid Assistant">First Aid Assistant</option>
                </optgroup>
                <optgroup label="Transportation Staff">
                  <option value="Driver">Driver</option>
                  <option value="Transport Supervisor">Transport Supervisor</option>
                  <option value="Transport Manager">Transport Manager</option>
                </optgroup>
                <optgroup label="Kitchen & Canteen Staff">
                  <option value="Cook">Cook</option>
                  <option value="Helper">Helper</option>
                  <option value="Canteen Manager">Canteen Manager</option>
                </optgroup>
                <optgroup label="Hostel Staff">
                  <option value="Hostel Warden">Hostel Warden</option>
                  <option value="Assistant Hostel Warden">Assistant Hostel Warden</option>
                  <option value="Hostel Supervisor">Hostel Supervisor</option>
                </optgroup>
                <optgroup label="Maintenance Staff">
                  <option value="Electrician">Electrician</option>
                  <option value="Plumber">Plumber</option>
                  <option value="Carpenter">Carpenter</option>
                  <option value="Painter">Painter</option>
                </optgroup>
                <optgroup label="Other">
                  <option value="Store Keeper">Store Keeper</option>
                  <option value="Inventory Manager">Inventory Manager</option>
                  <option value="Sports Equipment Manager">Sports Equipment Manager</option>
                  <option value="Event Coordinator">Event Coordinator</option>
                  <option value="Other">Other</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Designation
              </label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="e.g., Senior Clerk, Head Security, etc."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Shift
              </label>
              <select
                name="shift"
                value={formData.shift}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night</option>
                <option value="Rotating">Rotating</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Joining Date
              </label>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Salary Details */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Salary Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Basic Salary
              </label>
              <input
                type="number"
                name="basicSalary"
                value={formData.basicSalary}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Salary Type
              </label>
              <select
                name="salaryType"
                value={formData.salaryType}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="monthly">Monthly</option>
                <option value="daily">Daily</option>
                <option value="hourly">Hourly</option>
              </select>
            </div>
          </div>
        </div>

        {/* Allowances */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Allowances</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                House Rent
              </label>
              <input
                type="number"
                name="allowances.houseRent"
                value={formData.allowances.houseRent}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Medical
              </label>
              <input
                type="number"
                name="allowances.medical"
                value={formData.allowances.medical}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Transport
              </label>
              <input
                type="number"
                name="allowances.transport"
                value={formData.allowances.transport}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Uniform
              </label>
              <input
                type="number"
                name="allowances.uniform"
                value={formData.allowances.uniform}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Other
              </label>
              <input
                type="number"
                name="allowances.other"
                value={formData.allowances.other}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Deductions */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Deductions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tax
              </label>
              <input
                type="number"
                name="deductions.tax"
                value={formData.deductions.tax}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Provident Fund
              </label>
              <input
                type="number"
                name="deductions.providentFund"
                value={formData.deductions.providentFund}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Insurance
              </label>
              <input
                type="number"
                name="deductions.insurance"
                value={formData.deductions.insurance}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Loan
              </label>
              <input
                type="number"
                name="deductions.loan"
                value={formData.deductions.loan}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Other
              </label>
              <input
                type="number"
                name="deductions.other"
                value={formData.deductions.other}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Street
              </label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                City
              </label>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                State/Province
              </label>
              <input
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                name="address.postalCode"
                value={formData.address.postalCode}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                name="emergencyContact.name"
                value={formData.emergencyContact.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Relationship
              </label>
              <input
                type="text"
                name="emergencyContact.relationship"
                value={formData.emergencyContact.relationship}
                onChange={handleChange}
                placeholder="Father, Brother, etc."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="emergencyContact.phone"
                value={formData.emergencyContact.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Alternate Phone
              </label>
              <input
                type="tel"
                name="emergencyContact.alternatePhone"
                value={formData.emergencyContact.alternatePhone}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Address
              </label>
              <textarea
                name="emergencyContact.address"
                value={formData.emergencyContact.address}
                onChange={handleChange}
                rows="2"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Working Hours */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Working Hours</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Time
              </label>
              <input
                type="time"
                name="workingHours.startTime"
                value={formData.workingHours.startTime}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Time
              </label>
              <input
                type="time"
                name="workingHours.endTime"
                value={formData.workingHours.endTime}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Break Duration (minutes)
              </label>
              <input
                type="number"
                name="workingHours.breakDuration"
                value={formData.workingHours.breakDuration}
                onChange={handleChange}
                placeholder="60"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Working Days
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <label key={day} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      name="workingDays"
                      value={day}
                      checked={formData.workingHours.workingDays.includes(day)}
                      onChange={handleChange}
                      className="rounded"
                    />
                    <span className="text-sm">{day.substring(0, 3)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Uniform Details */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Uniform Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Size
              </label>
              <input
                type="text"
                name="uniformDetails.size"
                value={formData.uniformDetails.size}
                onChange={handleChange}
                placeholder="S, M, L, XL, etc."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quantity Issued
              </label>
              <input
                type="number"
                name="uniformDetails.quantityIssued"
                value={formData.uniformDetails.quantityIssued}
                onChange={handleChange}
                placeholder="2"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Issued Date
              </label>
              <input
                type="date"
                name="uniformDetails.lastIssuedDate"
                value={formData.uniformDetails.lastIssuedDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Bank Account Details */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Bank Account Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                name="bankAccount.bankName"
                value={formData.bankAccount.bankName}
                onChange={handleChange}
                placeholder="e.g., HBL, UBL, etc."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account Number
              </label>
              <input
                type="text"
                name="bankAccount.accountNumber"
                value={formData.bankAccount.accountNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                IBAN
              </label>
              <input
                type="text"
                name="bankAccount.iban"
                value={formData.bankAccount.iban}
                onChange={handleChange}
                placeholder="PK36SCBL0000001123456702"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Branch Code
              </label>
              <input
                type="text"
                name="bankAccount.branchCode"
                value={formData.bankAccount.branchCode}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Specialized Information - Conditional based on staff type */}
        {(formData.staffType === 'Driver' || formData.staffType === 'Transporter') && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Driver Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  License Number
                </label>
                <input
                  type="text"
                  name="specializedInfo.driverLicense.number"
                  value={formData.specializedInfo.driverLicense.number}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  License Type
                </label>
                <select
                  name="specializedInfo.driverLicense.type"
                  value={formData.specializedInfo.driverLicense.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Select License Type</option>
                  <option value="LTV">LTV (Light Transport Vehicle)</option>
                  <option value="HTV">HTV (Heavy Transport Vehicle)</option>
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  License Expiry Date
                </label>
                <input
                  type="date"
                  name="specializedInfo.driverLicense.expiryDate"
                  value={formData.specializedInfo.driverLicense.expiryDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
          </div>
        )}

        {formData.staffType === 'Security Guard' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Security Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Security Badge Number
              </label>
              <input
                type="text"
                name="specializedInfo.securityBadgeNumber"
                value={formData.specializedInfo.securityBadgeNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        )}

        {(formData.staffType === 'Doctor' || formData.staffType === 'Nurse') && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Medical Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Medical Qualification
              </label>
              <input
                type="text"
                name="specializedInfo.medicalQualification"
                value={formData.specializedInfo.medicalQualification}
                onChange={handleChange}
                placeholder="MBBS, BDS, RN, etc."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        )}

        {/* Documents Upload */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Documents</h3>
          <div className="space-y-4">
            {/* Document Upload Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['cnic', 'cv', 'certificate', 'driver_license', 'medical_certificate', 'police_verification', 'contract', 'other'].map(docType => {
                const isAdded = documentFiles.some(doc => doc.type === docType);
                return (
                  <label key={docType} className="cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleDocumentSelect(e, docType)}
                      className="hidden"
                    />
                    <div className={`px-4 py-2 border-2 border-dashed rounded-lg text-center transition-colors ${
                      isAdded 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                        : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 dark:border-gray-600 dark:hover:border-blue-400 dark:hover:bg-blue-900/20'
                    }`}>
                      <span className="text-sm font-medium capitalize">
                        {docType.replace('_', ' ')} {isAdded && '✓'}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Uploaded Documents List */}
            {documentFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Selected Documents ({documentFiles.length})
                </p>
                <div className="space-y-2">
                  {documentFiles.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-300 text-xs font-semibold">
                            {doc.type.substring(0, 3).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {doc.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {doc.type.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument(index)}
                        className="text-red-500 hover:text-red-700 font-medium text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Supported formats: PDF, JPG, PNG (Max 10MB per file). Click same type to replace document.
            </p>
          </div>
        </div>
      </form>
    </Modal>
  );
}
