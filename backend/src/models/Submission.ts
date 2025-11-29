import mongoose, { Document } from 'mongoose';

interface ISubmission extends Document {
  formId: mongoose.Types.ObjectId;
  responses: Map<string, any>;
  imageUrls: Array<{ fieldName: string; url: string }>;
  submittedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

const submissionSchema = new mongoose.Schema<ISubmission>({
  formId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Form', 
    required: true,
    index: true 
  },
  responses: { 
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    required: true 
  },
  imageUrls: [{ 
    fieldName: String,
    url: String 
  }],
  submittedAt: { 
    type: Date, 
    default: Date.now 
  },
  ipAddress: String,
  userAgent: String
});

submissionSchema.index({ formId: 1, submittedAt: -1 });

export const Submission = mongoose.model<ISubmission>('Submission', submissionSchema);
