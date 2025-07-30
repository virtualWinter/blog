'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { UserCheck, UserX, Trash2 } from 'lucide-react';
import {
    promoteUserToAdmin,
    demoteUserFromAdmin,
    deleteUser
} from '@/lib/auth/actions';
import { PublicUser, UserRole } from '@/lib/auth/types';

interface AdminUsersProps {
    users: PublicUser[];
    currentUserId: string;
}

export function AdminUsers({ users: initialUsers, currentUserId }: AdminUsersProps) {
    const [users, setUsers] = useState(initialUsers);
    const [actionDialogOpen, setActionDialogOpen] = useState(false);
    const [actionType, setActionType] = useState<'promote' | 'demote' | 'delete'>('promote');
    const [selectedUser, setSelectedUser] = useState<PublicUser | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleAction = (user: PublicUser, action: 'promote' | 'demote' | 'delete') => {
        setSelectedUser(user);
        setActionType(action);
        setActionDialogOpen(true);
    };

    const handleActionConfirm = async () => {
        if (!selectedUser) return;

        setIsProcessing(true);
        try {
            let result;

            switch (actionType) {
                case 'promote':
                    result = await promoteUserToAdmin(selectedUser.id);
                    break;
                case 'demote':
                    result = await demoteUserFromAdmin(selectedUser.id);
                    break;
                case 'delete':
                    result = await deleteUser(selectedUser.id);
                    break;
            }

            if (result.success) {
                if (actionType === 'delete') {
                    setUsers(users.filter(u => u.id !== selectedUser.id));
                } else {
                    setUsers(users.map(u =>
                        u.id === selectedUser.id
                            ? { ...u, role: actionType === 'promote' ? UserRole.ADMIN : UserRole.DEFAULT }
                            : u
                    ));
                }
                setActionDialogOpen(false);
                setSelectedUser(null);
            } else {
                alert(result.error || `Failed to ${actionType} user`);
            }
        } catch (error) {
            alert(`Failed to ${actionType} user`);
        } finally {
            setIsProcessing(false);
        }
    };

    const getActionDialogContent = () => {
        if (!selectedUser) return { title: '', description: '', buttonText: '', buttonClass: '' };

        switch (actionType) {
            case 'promote':
                return {
                    title: 'Promote to Admin',
                    description: `Are you sure you want to promote "${selectedUser.name || selectedUser.email}" to admin? They will have full access to manage the site.`,
                    buttonText: 'Promote',
                    buttonClass: 'bg-green-600 hover:bg-green-700'
                };
            case 'demote':
                return {
                    title: 'Demote from Admin',
                    description: `Are you sure you want to demote "${selectedUser.name || selectedUser.email}" from admin? They will lose admin privileges.`,
                    buttonText: 'Demote',
                    buttonClass: 'bg-orange-600 hover:bg-orange-700'
                };
            case 'delete':
                return {
                    title: 'Delete User',
                    description: `Are you sure you want to delete "${selectedUser.name || selectedUser.email}"? This action cannot be undone. All their comments and data will be permanently deleted.`,
                    buttonText: 'Delete',
                    buttonClass: 'bg-red-600 hover:bg-red-700'
                };
        }
    };

    const dialogContent = getActionDialogContent();

    return (
        <>
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Users</h2>
                
                {users.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>No users found</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {users.map((user) => (
                            <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium truncate">
                                            {user.name || user.email}
                                        </span>
                                        {user.id === currentUserId && (
                                            <Badge variant="outline" className="text-xs">You</Badge>
                                        )}
                                        <Badge variant={user.role === UserRole.ADMIN ? 'default' : 'secondary'} className="text-xs">
                                            {user.role === UserRole.ADMIN ? 'Admin' : 'User'}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {user.email} • {new Date(user.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                
                                {user.id !== currentUserId && (
                                    <div className="flex items-center gap-2">
                                        {user.role === UserRole.DEFAULT ? (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleAction(user, 'promote')}
                                                className="text-green-600 hover:text-green-600"
                                            >
                                                <UserCheck className="h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleAction(user, 'demote')}
                                                className="text-orange-600 hover:text-orange-600"
                                            >
                                                <UserX className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleAction(user, 'delete')}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{dialogContent.title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {dialogContent.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleActionConfirm}
                            disabled={isProcessing}
                            className={dialogContent.buttonClass}
                        >
                            {isProcessing ? 'Processing...' : dialogContent.buttonText}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}