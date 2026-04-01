'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Zap, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

type WorkflowExecution = {
  id: string;
  status: string;
  message?: string | null;
  createdAt: string;
};

type Workflow = {
  id: string;
  name: string;
  description?: string | null;
  triggerType: string;
  targetModule: string;
  isActive: boolean;
  actionJson: unknown;
  executions: WorkflowExecution[];
};

export default function WorkflowsPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetModule, setTargetModule] = useState('leads');

  const [runWorkflowId, setRunWorkflowId] = useState('');
  const [targetId, setTargetId] = useState('');

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/workflows', { credentials: 'include' });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to load workflows');
        return;
      }

      setWorkflows(data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const totalExecutions = useMemo(
    () => workflows.reduce((sum, workflow) => sum + (workflow.executions?.length || 0), 0),
    [workflows]
  );

  const successRate = useMemo(() => {
    const executions = workflows.flatMap((workflow) => workflow.executions || []);
    if (executions.length === 0) return 100;
    const success = executions.filter((item) => item.status === 'success').length;
    return (success / executions.length) * 100;
  }, [workflows]);

  const handleCreateWorkflow = async () => {
    if (!name.trim()) return;

    try {
      const actionJson =
        targetModule === 'leads'
          ? { leadScoreIncrement: 5, createActivity: true }
          : { escalateLevel: 1 };

      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name,
          description,
          triggerType: 'manual',
          targetModule,
          actionJson,
          isActive: true,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to create workflow');
        return;
      }

      setName('');
      setDescription('');
      setTargetModule('leads');
      await loadWorkflows();
    } catch (err) {
      setError('Failed to create workflow');
    }
  };

  const handleRunWorkflow = async () => {
    if (!runWorkflowId.trim() || !targetId.trim()) return;

    try {
      const response = await fetch(`/api/workflows/${runWorkflowId}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ targetId }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to run workflow');
        return;
      }

      setTargetId('');
      await loadWorkflows();
    } catch (err) {
      setError('Failed to run workflow');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workflows</h1>
          <p className="text-gray-600 mt-1">Automate repetitive tasks and business processes</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={() => router.push('/workflows/history')}>
            <Clock className="w-4 h-4" />
            View History
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Workflow</CardTitle>
          <CardDescription>Create reusable automations with execution logs</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Workflow name" />
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
          <select
            value={targetModule}
            onChange={(e) => setTargetModule(e.target.value)}
            title="Workflow target module"
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="leads">Leads</option>
            <option value="cases">Cases</option>
          </select>
          <Button className="gap-2" onClick={handleCreateWorkflow}>
            <Plus className="w-4 h-4" />
            Add Workflow
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual Run</CardTitle>
          <CardDescription>Execute a workflow on a specific record</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={runWorkflowId}
            onChange={(e) => setRunWorkflowId(e.target.value)}
            title="Workflow selector"
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Select workflow</option>
            {workflows.map((workflow) => (
              <option value={workflow.id} key={workflow.id}>{workflow.name}</option>
            ))}
          </select>
          <Input
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            placeholder="Target record ID"
          />
          <Button variant="outline" onClick={handleRunWorkflow}>Run Workflow</Button>
        </CardContent>
      </Card>

      {error ? <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div> : null}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflows.length}</div>
            <p className="text-xs text-gray-500 mt-1">{workflows.filter((item) => item.isActive).length} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Executions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExecutions}</div>
            <p className="text-xs text-gray-500 mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-500 mt-1">Overall</p>
          </CardContent>
        </Card>
      </div>

      {/* Workflows List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-8 text-sm text-gray-500">Loading workflows...</div>
        ) : workflows.map((workflow) => (
          <Card key={workflow.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    <h3 className="font-medium text-gray-900">{workflow.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{workflow.description}</p>
                  <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                    <span>Target: {workflow.targetModule}</span>
                    <span>{workflow.executions?.length || 0} recent executions</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Last run: {workflow.executions?.[0]?.createdAt ? new Date(workflow.executions[0].createdAt).toLocaleString() : 'Never'}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${workflow.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                    }`}>
                    {workflow.isActive ? 'active' : 'inactive'}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setRunWorkflowId(workflow.id);
                    }}
                  >
                    Select
                  </Button>
                </div>
              </div>

              {(workflow.executions || []).slice(0, 3).map((run) => (
                <div key={run.id} className="mt-3 px-3 py-2 rounded-md bg-gray-50 text-xs text-gray-600 flex items-center justify-between">
                  <span>{run.message || 'Execution log entry'}</span>
                  <span className={run.status === 'success' ? 'text-green-700' : 'text-red-700'}>{run.status}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Workflow Builder Info */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Builder</CardTitle>
          <CardDescription>Create powerful automations without coding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900">Triggers</h4>
              <p className="text-sm text-gray-600 mt-1">Start workflows based on events</p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1">
                <li>• New record created</li>
                <li>• Field value changed</li>
                <li>• Scheduled time</li>
                <li>• Manual trigger</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Actions</h4>
              <p className="text-sm text-gray-600 mt-1">Automate actions on your data</p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1">
                <li>• Update lead score</li>
                <li>• Escalate support cases</li>
                <li>• Create follow-up activities</li>
                <li>• Log execution outcome</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div >
  );
}
