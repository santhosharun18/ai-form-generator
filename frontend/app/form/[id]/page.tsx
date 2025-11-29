'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface FormField {
  name: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

interface FormSchema {
  title: string;
  description?: string;
  fields: FormField[];
}

export default function PublicFormPage() {
  const params = useParams();
  const [form, setForm] = useState<any>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [imageUrls, setImageUrls] = useState<{ fieldName: string; url: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchForm();
  }, []);

  const fetchForm = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/forms/${params.id}`);
      const data = await response.json();
      setForm(data.form);
    } catch (error) {
      console.error('Failed to fetch form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldName: string, value: any) => {
    setResponses({ ...responses, [fieldName]: value });
    if (errors[fieldName]) {
      setErrors({ ...errors, [fieldName]: '' });
    }
  };

  const handleImageUpload = async (fieldName: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'unsigned_preset');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );
      const data = await response.json();
      const url = data.secure_url;
      setImageUrls([...imageUrls, { fieldName, url }]);
      setResponses({ ...responses, [fieldName]: url });
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Image upload failed. Please try again.');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const schema: FormSchema = form.schema;

    schema.fields.forEach((field) => {
      const value = responses[field.name];

      if (field.required && (!value || value.toString().trim() === '')) {
        newErrors[field.name] = `${field.label} is required`;
        return;
      }

      if (value) {
        switch (field.type) {
          case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              newErrors[field.name] = 'Invalid email format';
            }
            break;
          case 'tel':
            const phoneRegex = /^[0-9]{10,15}$/;
            if (!phoneRegex.test(value.replace(/[\s-]/g, ''))) {
              newErrors[field.name] = 'Invalid phone number';
            }
            break;
          case 'url':
            try {
              new URL(value);
            } catch {
              newErrors[field.name] = 'Invalid URL format';
            }
            break;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`http://localhost:5000/api/forms/${params.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses, imageUrls })
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      setSubmitted(true);
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Failed to submit form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-xl font-semibold text-gray-700">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-3xl shadow-2xl p-12 max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Form Not Found</h2>
          <p className="text-gray-600">The form you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-lg transform scale-100 animate-bounce-in">
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Form Submitted! 🎉
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Thank you for your submission. Your response has been recorded successfully.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
            >
              Submit Another Response
            </button>
          </div>
        </div>
      </div>
    );
  }

  const schema: FormSchema = form.schema;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-white/50">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
              {schema.title}
            </h1>
            {schema.description && (
              <p className="text-gray-600 text-lg">{schema.description}</p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {schema.fields.map((field, index) => (
              <div key={field.name} className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {field.type === 'textarea' ? (
                  <textarea
                    required={field.required}
                    placeholder={field.placeholder}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none ${
                      errors[field.name] ? 'border-red-500' : 'border-gray-200'
                    }`}
                    rows={4}
                  />
                ) : field.type === 'file' ? (
                  <div>
                    <input
                      type="file"
                      id={field.name}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(field.name, file);
                        }
                      }}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx"
                    />
                    <label
                      htmlFor={field.name}
                      className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-gradient-to-r from-blue-100 to-purple-100 hover:from-blue-200 hover:to-purple-200 text-blue-700 rounded-xl font-semibold cursor-pointer transition-all border-2 border-dashed border-blue-300"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload {field.label}
                    </label>
                    {responses[field.name] && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        File uploaded successfully!
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type={field.type}
                    required={field.required}
                    placeholder={field.placeholder}
                    minLength={field.validation?.minLength}
                    maxLength={field.validation?.maxLength}
                    pattern={field.validation?.pattern}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none ${
                      errors[field.name] ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                )}

                {errors[field.name] && (
                  <p className="text-sm text-red-600 flex items-center gap-2 mt-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors[field.name]}
                  </p>
                )}
              </div>
            ))}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-5 rounded-2xl font-bold text-xl hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Submit Form
                </span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              Powered by{' '}
              <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Form Generator
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
