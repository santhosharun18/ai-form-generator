import mongoose, { Document } from 'mongoose';

interface IForm extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  prompt: string;
  schema: any;
  embedding: number[];
  metadata: {
    purpose: string;
    fieldCount: number;
    hasImageUpload: boolean;
    tags: string[];
    category: string;
  };
  shareableLink: string;
  createdAt: Date;
}

const formSchema = new mongoose.Schema<IForm>({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  prompt: { 
    type: String, 
    required: true 
  },
  schema: { 
    type: Object, 
    required: true 
  },
  embedding: { 
    type: [Number],
    required: true 
  },
  metadata: {
    purpose: String,
    fieldCount: Number,
    hasImageUpload: Boolean,
    tags: [String],
    category: String
  },
  shareableLink: String,
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

formSchema.index({ userId: 1, createdAt: -1 });
formSchema.index({ 'metadata.tags': 1 });

export const Form = mongoose.model<IForm>('Form', formSchema);
