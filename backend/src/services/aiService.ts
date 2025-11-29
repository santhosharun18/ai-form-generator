import Groq from 'groq-sdk';
import { Form } from '../models/Form';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export class AIFormService {
  
  // Generate embedding using a simple approach
  // For production: Use sentence-transformers or OpenAI embeddings
  async generateEmbedding(text: string): Promise<number[]> {
    // Simple TF-IDF based embedding (for demo)
    // For production, use proper embedding model
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(384).fill(0); // Standard embedding size
    
    words.forEach((word, idx) => {
      const hash = this.simpleHash(word);
      embedding[hash % 384] += 1;
    });
    
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
  }
  
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  // Calculate cosine similarity between two embeddings
  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;
    
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      mag1 += vec1[i] * vec1[i];
      mag2 += vec2[i] * vec2[i];
    }
    
    return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
  }

  // Retrieve top-K relevant past forms using semantic search
  async retrieveRelevantContext(
    userId: string, 
    prompt: string, 
    k: number = 5
  ): Promise<any[]> {
    try {
      const promptEmbedding = await this.generateEmbedding(prompt);
      
      // Get all user forms
      const allForms = await Form.find({ userId }).lean();
      
      if (allForms.length === 0) {
        return [];
      }

      // Calculate similarity scores
      const formsWithScores = allForms.map(form => ({
        form,
        similarity: this.cosineSimilarity(promptEmbedding, form.embedding)
      }));

      // Sort by similarity and take top-K
      formsWithScores.sort((a, b) => b.similarity - a.similarity);
      const topK = formsWithScores.slice(0, Math.min(k, formsWithScores.length));

      // Return only relevant information
      return topK
        .filter(item => item.similarity > 0.3) // Confidence threshold
        .map(item => ({
          purpose: item.form.metadata.purpose,
          fields: item.form.schema.fields?.map((f: any) => ({
            name: f.name,
            type: f.type,
            label: f.label,
            required: f.required
          })),
          hasImageUpload: item.form.metadata.hasImageUpload,
          category: item.form.metadata.category,
          similarity: item.similarity.toFixed(3)
        }));
    } catch (error) {
      console.error('Error retrieving context:', error);
      return [];
    }
  }

  // Generate form schema using Groq with context-aware memory
  async generateFormSchema(userId: string, prompt: string) {
    try {
      // Step 1: Retrieve relevant past forms
      const relevantContext = await this.retrieveRelevantContext(userId, prompt, 5);
      
      // Step 2: Build context-aware prompt
      const systemPrompt = `You are an intelligent form schema generator. 
You MUST return ONLY valid JSON with NO additional text, explanation, or markdown.

${relevantContext.length > 0 ? `Here is relevant user form history for reference:
${JSON.stringify(relevantContext, null, 2)}

Use these patterns to inform field naming, types, and structure.` : 'This is the user\'s first form. Generate a complete form based solely on the request.'}

Generate a new form schema for this request: "${prompt}"

Return ONLY this exact JSON structure (no markdown, no explanation):
{
  "title": "Form Title",
  "description": "Brief description",
  "fields": [
    {
      "name": "fieldName",
      "type": "text|email|number|tel|url|textarea|date|file",
      "label": "Field Label",
      "placeholder": "Placeholder text",
      "required": true,
      "validation": {
        "minLength": 0,
        "maxLength": 100,
        "pattern": ""
      }
    }
  ]
}

Important:
- For profile pictures, resumes, documents use type: "file"
- Use "email" type for email fields
- Use "tel" type for phone numbers
- Use "textarea" for long text
- Set proper validation rules`;

      // Step 3: Call Groq API
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'llama-3.3-70b-versatile', // Fast and accurate
        temperature: 0.3, // Lower temperature for consistent JSON
        max_tokens: 2048
      });

      const responseText = completion.choices[0].message.content || '';
      
      // Step 4: Parse JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from response');
      }
      
      const schema = JSON.parse(jsonMatch[0]);
      
      // Step 5: Generate embedding for this new form
      const embedding = await this.generateEmbedding(prompt);
      
      // Step 6: Extract metadata
      const metadata = {
        purpose: schema.title,
        fieldCount: schema.fields.length,
        hasImageUpload: schema.fields.some((f: any) => f.type === 'file'),
        tags: this.extractTags(prompt),
        category: this.categorizeForm(prompt)
      };
      
      return { schema, embedding, metadata };
    } catch (error) {
      console.error('Error generating form schema:', error);
      throw new Error('Failed to generate form schema. Please try again.');
    }
  }

  // Extract tags from prompt
  private extractTags(prompt: string): string[] {
    const keywords = ['signup', 'login', 'contact', 'survey', 'feedback', 
                     'application', 'registration', 'job', 'internship', 
                     'admission', 'medical', 'patient', 'order', 'booking'];
    
    return keywords.filter(keyword => 
      prompt.toLowerCase().includes(keyword)
    );
  }

  // Categorize form type
  private categorizeForm(prompt: string): string {
    const categories: Record<string, string[]> = {
      'HR & Recruitment': ['job', 'application', 'internship', 'resume', 'career'],
      'Education': ['admission', 'college', 'school', 'student', 'course'],
      'Healthcare': ['medical', 'patient', 'health', 'appointment'],
      'Customer Service': ['feedback', 'survey', 'contact', 'support'],
      'E-commerce': ['order', 'booking', 'purchase', 'checkout'],
      'Authentication': ['signup', 'login', 'register', 'account']
    };
    
    const lowerPrompt = prompt.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
        return category;
      }
    }
    
    return 'General';
  }
}
