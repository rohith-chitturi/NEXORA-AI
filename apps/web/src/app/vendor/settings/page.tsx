'use client';

import { useState, useEffect } from 'react';
import { Store, CheckCircle, AlertCircle, Save } from 'lucide-react';

export default function VendorSettingsPage() {
  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    fetch('http://localhost:4000/api/vendor/profile')
      .then(res => res.json())
      .then(data => {
        setStoreName(data.storeName || '');
        setDescription(data.description || '');
        setLogoUrl(data.logoUrl || '');
        setIsActive(data.isActive ?? true);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load settings:', err);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg({ text: '', type: '' });

    try {
      const res = await fetch('http://localhost:4000/api/vendor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeName, description, logoUrl, isActive })
      });
      
      if (res.ok) {
        setStatusMsg({ text: 'Settings updated successfully!', type: 'success' });
      } else {
        setStatusMsg({ text: 'Failed to update settings.', type: 'error' });
      }
    } catch (error) {
      setStatusMsg({ text: 'An error occurred.', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMsg({ text: '', type: '' }), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-500 border-r-2 border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
          <Store className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Store Settings</h1>
          <p className="text-sm text-gray-400">Manage your store's public profile and visibility</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                placeholder="My Awesome Store"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Logo URL</label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-300">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all resize-none"
                placeholder="Describe what your store sells..."
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-black/40 border border-white/10 rounded-xl">
            <div>
              <h3 className="font-medium text-white">Store Visibility</h3>
              <p className="text-sm text-gray-400">When disabled, your store and products will be hidden from customers.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex-1">
              {statusMsg.text && (
                <div className={`flex items-center gap-2 text-sm ${statusMsg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {statusMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {statusMsg.text}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
