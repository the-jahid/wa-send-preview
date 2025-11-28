'use client';

import LeadItemsTab from '@/app/features/lead-item/LeadItemsTab';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LeadsTab({ agentId }: { agentId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads</CardTitle>
      </CardHeader>
      <CardContent>
        <LeadItemsTab agentId={agentId} />
      </CardContent>
    </Card>
  );
}
