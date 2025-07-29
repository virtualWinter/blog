'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
    MoreHorizontal,
    UserCheck,
    UserX,
    Trash2,
    Calendar,
    Mail,
    Shield,
    User
} from 'lucide-react';
import {
    promoteUserToAdmin,
    demoteUserFromAdmin,
    deleteUser
} from '@/lib/auth/actions';
import type { PublicUser, UserRole } from '@/lib/auth/types';

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
            <Card>
                <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>
                        Manage user accounts and permissions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {users.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No users found</p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Email Status</TableHead>
                                        <TableHead>2FA</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead className="w-[70px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0">
                                                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                            <User className="h-4 w-4 text-gray-500" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{user.name || 'No name'}</p>
                                                        <p className="text-sm text-gray-500">{user.email}</p>
                                                        {user.id === currentUserId && (
                                                            <Badge variant="outline" className="text-xs">You</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={user.role === UserRole.ADMIN ? 'default' : 'secondary'}>
                                                    <Shield className="h-3 w-3 mr-1" />
                                                    {user.role === UserRole.ADMIN ? 'Admin' : 'User'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                                                    <Badge variant={user.emailVerified ? 'default' : 'destructive'}>
                                                        {user.emailVerified ? 'Verified' : 'Unverified'}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    {user.totpEnabled && (
                                                        <Badge variant="outline" className="text-xs">
                                                            TOTP
                                                        </Badge>
                                                    )}
                                                    {user.emailOtpEnabled && (
                                                        <Badge variant="outline" className="text-xs">
                                                            Email OTP
                                                        </Badge>
                                                    )}
                                                    {!user.totpEnabled && !user.emailOtpEnabled && (
                                                        <span className="text-sm text-gray-500">None</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Calendar className="h-4 w-4 mr-1" />
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {user.id !== currentUserId && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {user.role === UserRole.DEFAULT ? (
                                                                <DropdownMenuItem
                                                                    onClick={() => handleAction(user, 'promote')}
                                                                    className="text-green-600"
                                                                >
                                                                    <UserCheck className="h-4 w-4 mr-2" />
                                                                    Promote to Admin
                                                                </DropdownMenuItem>
                                                            ) : (
                                                                <DropdownMenuItem
                                                                    onClick={() => handleAction(user, 'demote')}
                                                                    className="text-orange-600"
                                                                >
                                                                    <UserX className="h-4 w-4 mr-2" />
                                                                    Demote from Admin
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem
                                                                onClick={() => handleAction(user, 'delete')}
                                                                className="text-red-600"
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Delete User
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

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