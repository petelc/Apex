import { z } from 'zod';

/**
 * Zod validation schema for Change Request forms
 */
export const changeRequestSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must not exceed 200 characters'),
  
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must not exceed 2000 characters'),
  
  changeType: z.enum(['Standard', 'Normal', 'Emergency'], {
    required_error: 'Please select a change type',
  }),
  
  priority: z.enum(['Low', 'Medium', 'High', 'Critical'], {
    required_error: 'Please select a priority level',
  }),
  
  riskLevel: z.enum(['Low', 'Medium', 'High', 'Critical'], {
    required_error: 'Please select a risk level',
  }),
  
  impactAssessment: z
    .string()
    .min(20, 'Impact assessment must be at least 20 characters')
    .max(2000, 'Impact assessment must not exceed 2000 characters'),
  
  rollbackPlan: z
    .string()
    .min(20, 'Rollback plan must be at least 20 characters')
    .max(2000, 'Rollback plan must not exceed 2000 characters'),
  
  affectedSystems: z
    .string()
    .min(3, 'Please specify affected systems')
    .max(500, 'Affected systems must not exceed 500 characters'),
});

export type ChangeRequestFormData = z.infer<typeof changeRequestSchema>;

/**
 * Default values for new change request
 */
export const defaultChangeRequestValues: ChangeRequestFormData = {
  title: '',
  description: '',
  changeType: 'Normal',
  priority: 'Medium',
  riskLevel: 'Low',
  impactAssessment: '',
  rollbackPlan: '',
  affectedSystems: '',
};
