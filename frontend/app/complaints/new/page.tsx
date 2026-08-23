'use client';
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import DashboardLayout from '@/components/DashboardLayout';
import { api, getErrorMessage } from '@/lib/api';
import { ArrowLeft, UploadCloud, X, Loader2, Check } from 'lucide-react';
import Link from 'next/link';

const complaintSchema = z.object({
  category: z.enum(['PLUMBING', 'ELECTRICAL', 'CLEANING', 'SECURITY', 'PARKING', 'OTHER']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  photo_url: z.string().optional(),
});

export default function NewComplaint() {
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      priority: 'MEDIUM',
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setValue('photo_url', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (data: any) => {
    try {
      setError('');
      let uploadedUrl = data.photo_url;

      // If a local image file was picked, upload it to /api/upload first
      if (selectedFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        const uploadRes = await api.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedUrl = uploadRes.data.url;
        setUploading(false);
      }

      await api.post('/api/complaints', {
        ...data,
        photo_url: uploadedUrl || undefined,
      });

      window.location.href = '/complaints';
    } catch (err: any) {
      setUploading(false);
      setError(getErrorMessage(err, 'Failed to submit complaint'));
    }
  };

  return (
    <DashboardLayout roleRequired="RESIDENT">
      <div className="p-8 max-w-3xl mx-auto">
        <Link href="/complaints" className="inline-flex items-center gap-2 text-gray-500 hover:text-brand mb-6 transition">
          <ArrowLeft size={16} />
          Back to Complaints
        </Link>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h1 className="text-2xl font-bold text-gray-900">Raise a Complaint</h1>
            <p className="text-gray-500 text-sm mt-1">Please provide details about the maintenance issue.</p>
          </div>
          
          <div className="p-6 md:p-8">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">{error}</div>}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select 
                    {...register('category')}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand focus:outline-none bg-white"
                  >
                    <option value="">Select Category...</option>
                    <option value="PLUMBING">Plumbing</option>
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="CLEANING">Cleaning</option>
                    <option value="SECURITY">Security</option>
                    <option value="PARKING">Parking</option>
                    <option value="OTHER">Other</option>
                  </select>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message as string}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select 
                    {...register('priority')}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand focus:outline-none bg-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                  {errors.priority && <p className="text-red-500 text-xs mt-1">{errors.priority.message as string}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea 
                  {...register('description')}
                  rows={4}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand focus:outline-none resize-none"
                  placeholder="Describe the issue in detail..."
                ></textarea>
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message as string}</p>}
              </div>

              {/* Photo Upload Input & Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photo Attachment (Optional)</label>
                
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden" 
                />

                {!previewUrl ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-brand hover:bg-gray-50 transition cursor-pointer"
                  >
                    <div className="space-y-1 text-center">
                      <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600 justify-center">
                        <span className="font-medium text-brand hover:text-brand-dark">
                          Click to upload an image
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 10MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative mt-2 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 p-2 max-w-sm">
                    <img src={previewUrl} alt="Upload preview" className="w-full h-48 object-cover rounded-md" />
                    <button 
                      type="button"
                      onClick={handleRemoveFile}
                      className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow-md transition"
                    >
                      <X size={16} />
                    </button>
                    <div className="p-2 flex items-center gap-2 text-xs text-gray-600">
                      <Check size={14} className="text-green-600" />
                      <span className="truncate">{selectedFile?.name}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end items-center gap-3">
                <Link href="/complaints" className="bg-white py-2.5 px-5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </Link>
                <button 
                  type="submit" 
                  disabled={isSubmitting || uploading}
                  className="bg-brand py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-50 flex items-center gap-2"
                >
                  {(isSubmitting || uploading) && <Loader2 size={16} className="animate-spin" />}
                  {uploading ? 'Uploading image...' : isSubmitting ? 'Submitting...' : 'Submit Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
