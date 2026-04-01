export const mockLeads = [
  {
    id: 'lead-1',
    firstName: 'Amine',
    lastName: 'B.',
    email: 'amine@example.com',
    company: 'Atlas Build',
    source: 'Website',
    score: 78,
    status: 'qualified',
  },
  {
    id: 'lead-2',
    firstName: 'Sara',
    lastName: 'K.',
    email: 'sara@example.com',
    company: 'Nexus Retail',
    source: 'Google Ads',
    score: 64,
    status: 'contacted',
  },
  {
    id: 'lead-3',
    firstName: 'Youssef',
    lastName: 'M.',
    email: 'youssef@example.com',
    company: 'Delta Services',
    source: 'Referral',
    score: 83,
    status: 'proposal_sent',
  },
];

export const mockDeals = [
  {
    id: 'deal-1',
    name: 'Atlas Annual Plan',
    value: 12000,
    stage: 'prospecting',
    closedWon: false,
  },
  {
    id: 'deal-2',
    name: 'Nexus Expansion',
    value: 24000,
    stage: 'proposal',
    closedWon: false,
  },
  {
    id: 'deal-3',
    name: 'Delta Renewal',
    value: 18000,
    stage: 'closed_won',
    closedWon: true,
  },
];

export const mockAccounts = [
  { id: 'acc-1', name: 'Atlas Build', industry: 'Construction' },
  { id: 'acc-2', name: 'Nexus Retail', industry: 'Retail' },
  { id: 'acc-3', name: 'Delta Services', industry: 'Consulting' },
];

export const mockActivities = [
  {
    id: 'act-1',
    title: 'Discovery call with Atlas',
    description: 'Discussed implementation scope',
    scheduledDate: new Date().toISOString(),
    status: 'completed',
  },
  {
    id: 'act-2',
    title: 'Send proposal to Nexus',
    description: 'Include phased rollout plan',
    scheduledDate: new Date().toISOString(),
    status: 'open',
  },
  {
    id: 'act-3',
    title: 'Follow-up with Delta CFO',
    description: 'Finalize contract details',
    scheduledDate: new Date().toISOString(),
    status: 'open',
  },
];
