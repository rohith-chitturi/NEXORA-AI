'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Save, User, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { getToken, userId } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: ''
  });

  useEffect(() => {
    if (!userId) return;
    
    const fetchProfile = async () => {
      try {
        const token = await getToken();
        const res = await fetch('http://localhost:4000/api/user/profile', {
          headers: { ...(token && { Authorization: `Bearer ${token}` }) }
        });
        
        if (res.ok) {
          const data = await res.json();
          setFormData({
            firstName: data.user.firstName || '',
            lastName: data.user.lastName || '',
            phone: data.user.phone || data.address.phone || '',
            street: data.address.street || '',
            city: data.address.city || '',
            state: data.address.state || '',
            country: data.address.country || '',
            zipCode: data.address.zipCode || ''
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [userId, getToken]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    try {
      const token = await getToken();
      const res = await fetch('http://localhost:4000/api/user/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }) 
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setMessage('Profile updated successfully!');
      } else {
        setMessage('Failed to update profile.');
      }
    } catch (error) {
      setMessage('An error occurred.');
    } finally {
      setSaving(false);
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Please sign in to view your profile.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 lg:py-24">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Account Settings</h1>
        <p className="text-gray-400">Manage your personal information and default shipping address.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Personal Information */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Personal Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">First Name</label>
              <input 
                type="text" 
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Last Name</label>
              <input 
                type="text" 
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Doe"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-gray-400 flex items-center gap-2"><Phone className="w-4 h-4" /> Phone Number</label>
              <input 
                type="text" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <MapPin className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Default Shipping Address</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-gray-400">Street Address</label>
              <input 
                type="text" 
                name="street"
                value={formData.street}
                onChange={handleChange}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="123 Main St"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">City</label>
              <input 
                type="text" 
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="New York"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">State / Province</label>
              <input 
                type="text" 
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="NY"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Country</label>
              <input 
                type="text" 
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="United States"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">ZIP / Postal Code</label>
              <input 
                type="text" 
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="10001"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <p className={`text-sm ${message.includes('successfully') ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </p>
          <Button 
            type="submit" 
            disabled={saving}
            className="bg-white text-black hover:bg-gray-200 rounded-full px-8 py-6 font-semibold flex items-center gap-2 transition-all"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-5 h-5" /> Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
