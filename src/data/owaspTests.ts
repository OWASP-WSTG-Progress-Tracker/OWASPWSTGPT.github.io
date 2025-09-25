import checklist from './external-checklist.json';

export interface OwaspTest {
  id: string;
  name: string;
  description: string;
  reference?: string;
}

export interface OwaspCategory {
  id: string;
  name: string;
  tests: OwaspTest[];
}

export interface TestResult {
  testId: string;
  status: 'not-started' | 'in-progress' | 'done' | 'blocked';
  notes: string;
  evidence: EvidenceFile[];
  lastUpdated: Date;
}

export interface EvidenceFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

export const owaspCategories: OwaspCategory[] = Object.entries(checklist.categories).map(([name, category]) => ({
  id: category.id,
  name,
  tests: category.tests.map((test: any) => ({
    id: test.id,
    name: test.name,
    description: test.objectives?.join('\n') || '',
    reference: test.reference
  }))
}));
