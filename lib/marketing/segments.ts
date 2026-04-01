export type SegmentCondition = {
  field: string;
  operator: 'eq' | 'neq' | 'contains' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'isTrue' | 'isFalse';
  value?: string | number | boolean | string[];
  source?: 'standard' | 'custom' | 'campaign';
};

export type SegmentRules = {
  combinator: 'and' | 'or';
  conditions: SegmentCondition[];
};

export function safeParseSegmentRules(input: unknown): SegmentRules {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { combinator: 'and', conditions: [] };
  }

  const record = input as Record<string, unknown>;
  const combinator = record.combinator === 'or' ? 'or' : 'and';
  const conditions = Array.isArray(record.conditions)
    ? (record.conditions.filter(Boolean) as SegmentCondition[])
    : [];

  return { combinator, conditions };
}

function evalCondition(value: unknown, condition: SegmentCondition): boolean {
  switch (condition.operator) {
    case 'eq':
      return String(value ?? '') === String(condition.value ?? '');
    case 'neq':
      return String(value ?? '') !== String(condition.value ?? '');
    case 'contains':
      return String(value ?? '').toLowerCase().includes(String(condition.value ?? '').toLowerCase());
    case 'gt':
      return Number(value ?? 0) > Number(condition.value ?? 0);
    case 'gte':
      return Number(value ?? 0) >= Number(condition.value ?? 0);
    case 'lt':
      return Number(value ?? 0) < Number(condition.value ?? 0);
    case 'lte':
      return Number(value ?? 0) <= Number(condition.value ?? 0);
    case 'in': {
      const list = Array.isArray(condition.value) ? condition.value.map(String) : [];
      return list.includes(String(value ?? ''));
    }
    case 'isTrue':
      return Boolean(value) === true;
    case 'isFalse':
      return Boolean(value) === false;
    default:
      return false;
  }
}

export function matchSegment(
  entity: Record<string, unknown>,
  customFields: Record<string, unknown> | null | undefined,
  rules: SegmentRules,
  campaignMetrics?: Record<string, unknown>
): boolean {
  if (!rules.conditions.length) return true;

  const results = rules.conditions.map((condition) => {
    if (condition.source === 'campaign') {
      const value = campaignMetrics ? campaignMetrics[condition.field] : undefined;
      return evalCondition(value, condition);
    }

    if (condition.source === 'custom') {
      const value = customFields ? customFields[condition.field] : undefined;
      return evalCondition(value, condition);
    }

    const value = entity[condition.field];
    return evalCondition(value, condition);
  });

  return rules.combinator === 'and' ? results.every(Boolean) : results.some(Boolean);
}
