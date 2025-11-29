'use client';
import { useState } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { FormSchema } from '@/lib/types';

interface FormRendererProps {
  schema: FormSchema;
  formId: string;
  onSubmitSuccess?: () => void;
}

export default function FormRenderer({ schema, formId, onSubmitSuccess }: FormRendererProps) {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [imageUrls, setImageUrls] = useState<{ fieldName: string; url: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (fieldName: string, value: any) => {
    setResponses({ ...responses, [fieldName]: value });
    // Clear error when user types
    if (errors[fieldName]) {
      setErrors({ ...errors, [fieldName]: '' });
    }
  };

  const handleImageUpload = (fieldName: string, result: any) => {
    const url = result.info.secure_url;
    setImageUrls([...imageUrls, { fieldName, url }]);
    setResponses({ ...responses, [fieldName]: url });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    schema.fields.forEach((field) => {
      const value = responses[field.name];

      // Required field validation
      if (field.required && (!value || value.toString().trim() === '')) {
        newErrors[field.name] = `${field.label} is required`;
        return;
      }

      // Type-specific validation
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
          
          case 'number':
            if (isNaN(value)) {
              newErrors[field.name] = 'Must be a number';
            }
            break;
        }

        // Length validation
        if (field.validation?.minLength && value.length < field.validation.minLength) {
          newErrors[field.name] = `Minimum ${field.validation.minLength} characters required`;
        }
        if (field.validation?.maxLength && value.length > field.validation.maxLength) {
          newErrors[field.name] = `Maximum ${field.validation.maxLength} characters allowed`;
        }

        // Pattern validation
        if (field.validation?.pattern) {
          const regex = new RegExp(field.validation.pattern);
          if (!regex.test(value)) {
            newErrors[field.name] = 'Invalid format';
          }
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '
