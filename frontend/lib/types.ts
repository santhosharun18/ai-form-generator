export interface FormField {
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

export interface FormSchema {
  title: string;
  description?: string;
  fields: FormField[];
}

export interface Form {
  _id: string;
  title: string;
  prompt: string;
  schema: FormSchema;
  metadata: any;
  createdAt: string;
  shareableLink: string;
  submissionCount?: number;
}
