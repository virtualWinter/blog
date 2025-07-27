import { UserRole } from '@/lib/auth/types';

interface UserRoleBadgeProps {
    role: UserRole;
    className?: string;
}

export function UserRoleBadge({ role, className = '' }: UserRoleBadgeProps) {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    const roleStyles = {
        [UserRole.ADMIN]: 'bg-red-100 text-red-800',
        [UserRole.DEFAULT]: 'bg-gray-100 text-gray-800',
    };

    const roleLabels = {
        [UserRole.ADMIN]: 'Admin',
        [UserRole.DEFAULT]: 'User',
    };

    return (
        <span className={`${baseClasses} ${roleStyles[role]} ${className}`}>
            {roleLabels[role]}
        </span>
    );
}