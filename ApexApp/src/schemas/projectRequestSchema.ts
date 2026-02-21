import { z } from 'zod';

/**
 * Zod validation schema for Project Request forms
 */
export const projectRequestSchema = z.object({
    title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must not exceed 200 characters'),
  
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must not exceed 2000 characters'),
  
  businessJustification: z
    .string()
    .min(20, 'Business justification must be at least 20 characters')
    .max(2000, 'Business justification must not exceed 2000 characters'),
    
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
    
  dueDate: z.string().optional().nullable(),
    
  estimatedBudget: z.number().min(0, 'Estimated budget must be a positive number').optional().nullable(),
  
  proposedStartDate: z.string().optional().nullable(),
  
  proposedEndDate: z.string().optional().nullable(),
  
})

export type ProjectRequestFormData = z.infer<typeof projectRequestSchema>;

/**
 * Default values for new project request
 */
export const defaultProjectRequestValues: ProjectRequestFormData = {
    title: '',
    description: '',
    businessJustification: '',
    priority: 'Medium',
    dueDate: undefined,
    estimatedBudget: undefined,
    proposedStartDate: undefined,
    proposedEndDate: undefined,
};