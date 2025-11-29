import express from 'express';
import { AIFormService } from '../services/aiService';
import { Form } from '../models/Form';
import { Submission } from '../models/Submission';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();
const aiService = new AIFormService();

// Generate new form with AI
router.post('/generate', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { prompt } = req.body;
    const userId = req.user!.id;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Generate schema using Groq with context-aware memory
    const { schema, embedding, metadata } = await aiService.generateFormSchema(
      userId,
      prompt
    );

    // Save form to database
    const form = new Form({
      userId,
      title: schema.title,
      prompt,
      schema,
      embedding,
      metadata,
      shareableLink: `/form/${Date.now()}`
    });

    await form.save();

    res.json({
      success: true,
      formId: form._id,
      schema: form.schema,
      shareableLink: `/form/${form._id}`
    });
  } catch (error: any) {
    console.error('Form generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate form' });
  }
});

// Get all user forms (Dashboard)
router.get('/my-forms', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const forms = await Form.find({ userId: req.user!.id })
      .sort({ createdAt: -1 })
      .select('title prompt metadata createdAt shareableLink')
      .lean();

    // Get submission count for each form
    const formsWithStats = await Promise.all(
      forms.map(async (form) => {
        const submissionCount = await Submission.countDocuments({ formId: form._id });
        return { ...form, submissionCount };
      })
    );

    res.json({ forms: formsWithStats });
  } catch (error) {
    console.error('Fetch forms error:', error);
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
});

// Get public form by ID (for rendering)
router.get('/:id', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id)
      .select('title schema metadata')
      .lean();

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    res.json({ form });
  } catch (error) {
    console.error('Fetch form error:', error);
    res.status(500).json({ error: 'Failed to fetch form' });
  }
});

// Submit form response
router.post('/:id/submit', async (req, res) => {
  try {
    const { responses, imageUrls } = req.body;
    const formId = req.params.id;

    // Verify form exists
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Create submission
    const submission = new Submission({
      formId,
      responses: new Map(Object.entries(responses)),
      imageUrls: imageUrls || [],
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    await submission.save();

    res.json({
      success: true,
      message: 'Form submitted successfully',
      submissionId: submission._id
    });
  } catch (error) {
    console.error('Submit form error:', error);
    res.status(500).json({ error: 'Failed to submit form' });
  }
});

// Get form submissions (for form owner)
router.get('/:id/submissions', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const form = await Form.findById(req.params.id);
    
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Check ownership
    if (form.userId.toString() !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const submissions = await Submission.find({ formId: req.params.id })
      .sort({ submittedAt: -1 })
      .lean();

    res.json({ submissions, formTitle: form.title });
  } catch (error) {
    console.error('Fetch submissions error:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

export default router;
