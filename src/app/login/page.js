'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, AlertCircle, Loader } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!email || !password) {
        setError('Email and password are required');
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      console.log('sending Response', email, 'password', password);


      const result = await login(email, password);

      if (!result.success) {
        setError(result.message || 'Login failed');
      }
      // Redirect happens automatically in login function
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Test credentials
  const testAccounts = [
    { email: 'superadmin@easeacademy.com', password: 'SuperAdmin@123', role: 'Super Admin' },
    { email: 'hafizshoaib@gmail.com', password: '123456', role: 'Branch Admin' },
    { email: 'shoaibrazamemon170@gmail.com', password: 'Teacher@123', role: 'Teacher' },
    { email: 'student@easeacademy.com', password: 'student123', role: 'Student' },
  ];

  const fillTestCredentials = (testEmail, testPassword) => {
    setEmail(testEmail);
    setPassword(testPassword);
    setError('');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <span className="text-3xl">🎓</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ease Academy</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">School Management System</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">Sign in to your account to continue</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-10"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Test Credentials */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-950 text-gray-600 dark:text-gray-400">
                  Test Accounts
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {testAccounts.map((account, index) => (
                <Button
                  key={index}
                  type="button"
                  onClick={() => fillTestCredentials(account.email, account.password)}
                  disabled={loading}
                  className="w-full justify-start space-y-0.5"
                >
                  <div>
                    {account.role}
                  </div>
                  <div>
                    {account.email}
                  </div>
                </Button>
              ))}
            </div>

            {/* Footer */}
            <div className="pt-4 text-center text-xs text-gray-600 dark:text-gray-400">
              <p>Demo application - Use test accounts above</p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl mb-2">👥</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Multi-Role Support</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🔒</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Secure Login</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🚀</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Fast & Modern</p>
          </div>
        </div>
      </div>
    </div>
  );
}
