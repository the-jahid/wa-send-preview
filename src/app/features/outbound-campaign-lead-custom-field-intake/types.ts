// Types aligned with the backend LeadCustomFieldIntake model

export interface LeadCustomFieldIntake {
  id: string;
  name: string;

  outboundCampaignId: string;

  createdAt: string; // ISO string on client
  updatedAt: string; // ISO string on client
}

// Create
export interface CreateLeadCustomFieldIntakeBody {
  name: string; // MachineName: ^[A-Za-z][A-Za-z0-9_]*$, max 64
}

// Update (optional fields; if name is provided it must be non-empty & valid)
export interface UpdateLeadCustomFieldIntakeBody {
  name?: string;
}

export type SortBy = 'createdAt' | 'name';
export type SortOrder = 'asc' | 'desc';

// Query for list
export interface QueryLeadCustomFieldIntakes {
  page?: number;       // default 1
  limit?: number;      // default 20 (max 100)
  q?: string;          // search by name (1..64)
  sortBy?: SortBy;     // default 'createdAt'
  sortOrder?: SortOrder; // default 'desc'
}

// Paginated response
export interface PaginatedLeadCustomFieldIntake {
  data: LeadCustomFieldIntake[];
  total: number;
  page: number;
  limit: number;
}
