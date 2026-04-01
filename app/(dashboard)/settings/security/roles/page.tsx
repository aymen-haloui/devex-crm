'use client';

import { useState, useEffect } from 'react';
import { Plus, Settings, AlertCircle, Shield, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type Role = {
    id: string;
    name: string;
    description: string;
    _count: { users: number };
    permissions: { permission: { name: string; action: string; resource: string } }[];
};

type Permission = {
    id: string;
    name: string;
    action: string;
    resource: string;
    group: string;
    description: string;
};

export default function RolesPage() {
    const [loading, setLoading] = useState(true);
    const [roles, setRoles] = useState<Role[]>([]);
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);

    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentRole, setCurrentRole] = useState<Role | null>(null);

    // Create state
    const [createForm, setCreateForm] = useState({ name: '', description: '' });

    // Permissions State for editing
    // Structure: { [resource]: { [action]: boolean } }
    // e.g., { 'leads': { 'read': true, 'create': false } }
    const [permissionsMatrix, setPermissionsMatrix] = useState<Record<string, Record<string, boolean>>>({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rolesRes, permRes] = await Promise.all([
                fetch('/api/roles').then(r => r.json()),
                fetch('/api/permissions').then(r => r.json())
            ]);

            if (rolesRes.success) setRoles(rolesRes.data);
            if (permRes.success) {
                setAllPermissions(permRes.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const groupedPermissions = allPermissions.reduce((acc, curr) => {
        if (!acc[curr.group]) acc[curr.group] = [];
        acc[curr.group].push(curr);
        return acc;
    }, {} as Record<string, Permission[]>);

    // Group by resource specifically for the matrix view (e.g., resource 'Leads', actions 'Create', 'Read', 'Edit', 'Delete')
    const resources = Array.from(new Set(allPermissions.map(p => p.resource)));
    const actions = ['read', 'create', 'update', 'delete'];

    const handleCreateRole = async () => {
        try {
            const res = await fetch('/api/roles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(createForm)
            });
            const data = await res.json();
            if (data.success) {
                setRoles([...roles, { ...data.data, _count: { users: 0 }, permissions: [] }]);
                setCreateForm({ name: '', description: '' });
                setIsRoleModalOpen(false);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const openPermissionsModal = (role: Role) => {
        setCurrentRole(role);

        // Initialize matrix based on role's active permissions
        const matrix: Record<string, Record<string, boolean>> = {};
        resources.forEach(res => {
            matrix[res] = {};
            actions.forEach(act => matrix[res][act] = false);
        });

        role.permissions.forEach(rp => {
            const res = rp.permission.resource;
            const act = rp.permission.action;
            if (matrix[res]) {
                matrix[res][act] = true;
            }
        });

        setPermissionsMatrix(matrix);
        setIsEditModalOpen(true);
    };

    const togglePermission = (resource: string, action: string) => {
        setPermissionsMatrix(prev => ({
            ...prev,
            [resource]: {
                ...prev[resource],
                [action]: !prev[resource][action]
            }
        }));
    };

    const handleSavePermissions = async () => {
        if (!currentRole) return;
        // Convert matrix back to just an array of desired permission IDs
        const selectedPermissionIds: string[] = [];
        for (const [resource, actionsObj] of Object.entries(permissionsMatrix)) {
            for (const [action, isSelected] of Object.entries(actionsObj)) {
                if (isSelected) {
                    const p = allPermissions.find(p => p.resource === resource && p.action === action);
                    if (p) selectedPermissionIds.push(p.id);
                }
            }
        }

        try {
            const res = await fetch(`/api/roles/${currentRole.id}/permissions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ permissionIds: selectedPermissionIds })
            });

            if (res.ok) {
                setIsEditModalOpen(false);
                fetchData(); // reload roles
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading Configuration...</div>;
    }

    return (
        <div className="flex flex-col h-full bg-slate-50 font-sans">

            {/* Header */}
            <div className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8 shadow-sm">
                <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-indigo-600" />
                    <h1 className="text-lg font-bold text-slate-900">Security & Roles</h1>
                </div>
                <Button onClick={() => setIsRoleModalOpen(true)} className="h-9 px-4 text-[13px] font-medium bg-indigo-600 hover:bg-indigo-700 shadow-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    New Role
                </Button>
            </div>

            <div className="p-8 max-w-5xl mx-auto w-full space-y-8">

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 bg-slate-50">
                        <h2 className="text-[15px] font-bold text-slate-900">System Roles</h2>
                        <p className="text-[13px] text-slate-500 mt-1">Manage user roles and map them to their corresponding access permissions across modules.</p>
                    </div>

                    <table className="w-full text-start border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-slate-100">
                                <th className="py-4 px-6 text-[12px] font-bold text-slate-500 tracking-wider">Role Name</th>
                                <th className="py-4 px-6 text-[12px] font-bold text-slate-500 tracking-wider">Description</th>
                                <th className="py-4 px-6 text-[12px] font-bold text-slate-500 tracking-wider text-center">Assigned Users</th>
                                <th className="py-4 px-6 text-[12px] font-bold text-slate-500 tracking-wider text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {roles.map(role => (
                                <tr key={role.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-4 px-6">
                                        <span className="font-bold text-slate-900 text-sm">{role.name}</span>
                                        {role.name === 'Administrator' && <span className="ms-2 text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-sm">System</span>}
                                    </td>
                                    <td className="py-4 px-6 text-sm text-slate-600 max-w-sm truncate">{role.description}</td>
                                    <td className="py-4 px-6 text-center">
                                        <div className="inline-flex items-center justify-center min-w-[32px] h-7 bg-slate-100 rounded-md font-bold text-sm text-slate-700 border border-slate-200">
                                            {role._count.users}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-end">
                                        {role.name !== 'Administrator' && (
                                            <Button variant="ghost" className="h-8 px-3 text-[13px] font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50" onClick={() => openPermissionsModal(role)}>
                                                Permissions <Settings className="w-3.5 h-3.5 ml-1.5" />
                                            </Button>
                                        )}
                                        {role.name === 'Administrator' && (
                                            <span className="text-[12px] font-medium text-slate-400 italic">Full Access</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>

            {/* Create Role Modal */}
            <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
                <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-0 shadow-xl rounded-xl">
                    <div className="px-6 py-4 border-b border-slate-100 bg-white">
                        <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-indigo-500" />
                            Create System Role
                        </DialogTitle>
                    </div>
                    <div className="px-6 py-6 space-y-5 bg-slate-50/50">
                        <div>
                            <label className="text-[13px] font-semibold text-slate-700 block mb-1.5">Role Name</label>
                            <Input
                                className="h-9 w-full bg-white shadow-sm border-slate-200 text-sm font-medium text-slate-900"
                                placeholder="e.g. Regional Manager"
                                value={createForm.name}
                                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-[13px] font-semibold text-slate-700 block mb-1.5">Description</label>
                            <Textarea
                                className="min-h-[100px] w-full bg-white shadow-sm border-slate-200 text-sm text-slate-900"
                                placeholder="Clearly describe the boundaries of this role..."
                                value={createForm.description}
                                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-3">
                        <Button variant="ghost" className="h-9 px-4 text-[13px] font-medium text-slate-600 hover:bg-slate-50" onClick={() => setIsRoleModalOpen(false)}>Cancel</Button>
                        <Button className="h-9 px-6 text-[13px] font-medium bg-indigo-600 hover:bg-indigo-700 shadow-sm" onClick={handleCreateRole}>Create Role</Button>
                    </div>
                </DialogContent>
            </Dialog>


            {/* Edit Permissions Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden border-0 shadow-xl rounded-xl">
                    <div className="px-6 py-5 border-b border-slate-100 bg-white flex justify-between items-center">
                        <DialogTitle className="text-lg font-bold text-slate-900">
                            Module Permissions: <span className="text-indigo-600">{currentRole?.name}</span>
                        </DialogTitle>
                        <div className="text-[12px] font-medium text-slate-500 flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full">
                            <AlertCircle className="w-3.5 h-3.5" /> Auto-saves on confirmation
                        </div>
                    </div>

                    <div className="px-6 py-6 max-h-[60vh] overflow-auto bg-slate-50/50">
                        <p className="text-sm text-slate-600 mb-6 font-medium">Configure exact CRMD actions available to this role. Revoking 'Read' automatically collapses functionality.</p>

                        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="py-3 px-5 text-[12px] font-bold text-slate-600 tracking-wider w-[250px]">Module / Resource</th>
                                        <th className="py-3 px-5 text-[12px] font-bold text-slate-600 tracking-wider text-center">View</th>
                                        <th className="py-3 px-5 text-[12px] font-bold text-slate-600 tracking-wider text-center">Create</th>
                                        <th className="py-3 px-5 text-[12px] font-bold text-slate-600 tracking-wider text-center">Edit</th>
                                        <th className="py-3 px-5 text-[12px] font-bold text-slate-600 tracking-wider text-center">Delete</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {resources.map(resource => (
                                        <tr key={resource} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-3.5 px-5 font-bold text-slate-900 text-sm capitalize">{resource}</td>

                                            {actions.map(action => {
                                                const isChecked = permissionsMatrix[resource]?.[action] || false;

                                                // Check if this specific permission actually exists in the DB
                                                // Sometimes a resource might not have a 'Delete' permission (e.g. system settings)
                                                const exists = allPermissions.some(p => p.resource === resource && p.action === action);

                                                if (!exists) {
                                                    return <td key={action} className="py-3.5 px-5 text-center text-slate-300">-</td>;
                                                }

                                                return (
                                                    <td key={action} className="py-3.5 px-5 text-center">
                                                        <button
                                                            className={`w-6 h-6 rounded-md border inline-flex items-center justify-center transition-all ${isChecked ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white border-slate-300 text-transparent hover:border-slate-400 hover:bg-slate-50'
                                                                }`}
                                                            onClick={() => togglePermission(resource, action)}
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-3">
                        <Button variant="ghost" className="h-9 px-4 text-[13px] font-medium text-slate-600 hover:bg-slate-50" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button className="h-9 px-6 text-[13px] font-medium bg-indigo-600 hover:bg-indigo-700 shadow-sm" onClick={handleSavePermissions}>Save Profile</Button>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}
