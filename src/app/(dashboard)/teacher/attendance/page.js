'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, CheckCircle, XCircle } from 'lucide-react';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { useApi } from '@/hooks/useApi';
import { toast } from 'sonner';

export default function TeacherAttendancePage() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const { execute: apiCall } = useApi();

  useEffect(() => {
    getCurrentLocation();
    fetchTodayAttendance();
  }, []);

  const getCurrentLocation = () => {
    setLocationLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocationLoading(false);
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        setLocationError(errorMessage);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const fetchTodayAttendance = async () => {
    try {
      // This would be a new API endpoint to get today's attendance for the teacher
      // For now, we'll assume it's not implemented yet
      setTodayAttendance(null);
    } catch (error) {
      console.error('Error fetching today attendance:', error);
    }
  };

  const handleCheckIn = async () => {
    if (!currentLocation) {
      toast.error('Location not available. Please enable location services.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiCall(API_ENDPOINTS.TEACHER.SELF_ATTENDANCE.CHECK_IN, {
        method: 'POST',
        body: currentLocation
      });

      if (response.success) {
        toast.success(response.message);
        setTodayAttendance({
          ...todayAttendance,
          checkInTime: response.data.attendance.checkInTime,
          status: response.data.attendance.status,
          distance: response.data.attendance.distance
        });
        // Refresh location for check-out
        getCurrentLocation();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Check-in error:', error);
      toast.error('Failed to check in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!currentLocation) {
      toast.error('Location not available. Please enable location services.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiCall(API_ENDPOINTS.TEACHER.SELF_ATTENDANCE.CHECK_OUT, {
        method: 'POST',
        body: currentLocation
      });

      if (response.success) {
        toast.success(response.message);
        setTodayAttendance({
          ...todayAttendance,
          checkOutTime: response.data.attendance.checkOutTime,
          status: response.data.attendance.status,
          distance: response.data.attendance.distance
        });
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Check-out error:', error);
      toast.error('Failed to check out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canCheckIn = currentLocation && !todayAttendance?.checkInTime;
  const canCheckOut = currentLocation && todayAttendance?.checkInTime && !todayAttendance?.checkOutTime;

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Self Attendance</h1>
        <p className="text-muted-foreground">Check in and check out for your attendance</p>
      </div>

      {/* Location Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            Current Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          {locationLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Getting your location...</span>
            </div>
          ) : locationError ? (
            <div className="text-red-600 flex items-center space-x-2">
              <XCircle className="h-4 w-4" />
              <span>{locationError}</span>
            </div>
          ) : currentLocation ? (
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">
                Location detected: {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
              </span>
            </div>
          ) : (
            <div className="text-muted-foreground">Location not available</div>
          )}

          {!currentLocation && !locationLoading && (
            <Button
              onClick={getCurrentLocation}
              variant="outline"
              className="mt-2"
            >
              Refresh Location
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Today's Attendance */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Today's Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayAttendance ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Status:</span>
                <Badge variant={todayAttendance.status === 'present' ? 'default' : 'destructive'}>
                  {todayAttendance.status === 'present' ? 'Present' :
                   todayAttendance.status === 'late' ? 'Late' :
                   todayAttendance.status === 'early_checkout' ? 'Early Checkout' : 'Unknown'}
                </Badge>
              </div>

              {todayAttendance.checkInTime && (
                <div className="flex justify-between items-center">
                  <span>Check-in Time:</span>
                  <span className="font-mono">
                    {new Date(todayAttendance.checkInTime).toLocaleTimeString()}
                  </span>
                </div>
              )}

              {todayAttendance.checkOutTime && (
                <div className="flex justify-between items-center">
                  <span>Check-out Time:</span>
                  <span className="font-mono">
                    {new Date(todayAttendance.checkOutTime).toLocaleTimeString()}
                  </span>
                </div>
              )}

              {todayAttendance.distance && (
                <div className="flex justify-between items-center">
                  <span>Distance from branch:</span>
                  <span>{Math.round(todayAttendance.distance)} meters</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No attendance record for today
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleCheckIn}
            disabled={!canCheckIn || loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Processing...' : 'Check In'}
          </Button>

          <Button
            onClick={handleCheckOut}
            disabled={!canCheckOut || loading}
            variant="outline"
            className="w-full"
            size="lg"
          >
            {loading ? 'Processing...' : 'Check Out'}
          </Button>

          {!currentLocation && !locationLoading && (
            <div className="text-center text-sm text-muted-foreground">
              Location access is required for attendance
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
