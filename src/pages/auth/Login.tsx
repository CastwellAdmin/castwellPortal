import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../../components/forms/Input';
import { Button } from '../../components/forms/Button';
import Logo from '../../components/shared/Logo';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Subtle gold radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Login card */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md border-t-4 border-primary-500 overflow-hidden">
        {/* Gold accent line at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-400" />

        <div className="p-10">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Logo variant="dark" size="2xl" />
            </div>
            <p className="text-secondary-500 text-sm tracking-widest uppercase">Client Portal</p>
          </div>

          <form onSubmit={handleSubmit}>
            <Input
              label="User ID"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your user ID"
              autoComplete="username"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="mt-6">
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Sign In
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Copyright */}
      <p className="relative mt-8 text-secondary-500 text-xs tracking-wide">
        &copy; 2026 Castwell Investments Ltd. All rights reserved.
      </p>
    </div>
  );
}
