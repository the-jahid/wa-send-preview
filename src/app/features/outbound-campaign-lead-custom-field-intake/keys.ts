import type { QueryLeadCustomFieldIntakes } from './types';

export const leadCFIKeys = {
  root: ['lead-custom-field-intake'] as const,

  // typed params to avoid Record<string, unknown> index signature issues
  list: (campaignId: string, params?: QueryLeadCustomFieldIntakes) =>
    [...leadCFIKeys.root, 'list', campaignId, params ?? {}] as const,

  detail: (id: string) =>
    [...leadCFIKeys.root, 'detail', id] as const,

  create: (campaignId: string) =>
    [...leadCFIKeys.root, 'create', campaignId] as const,

  update: (id: string) =>
    [...leadCFIKeys.root, 'update', id] as const,

  remove: (id: string) =>
    [...leadCFIKeys.root, 'remove', id] as const,
};
