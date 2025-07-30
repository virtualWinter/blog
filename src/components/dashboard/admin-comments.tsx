'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
import { Trash2, ExternalLink } from 'lucide-react';
import { deleteComment } from '@/lib/blog';
import type { PublicComment } from '@/lib/blog/types';

interface AdminCommentsProps {
    comments: (PublicComment & { post: { id: string; title: string } })[];
}

export function AdminComments({ comments: initialComments }: AdminCommentsProps) {
    const [comments, setComments] = useState(initialComments);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState<(PublicComment & { post: { id: string; title: string } }) | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (comment: PublicComment & { post: { id: string; title: string } }) => {
        setCommentToDelete(comment);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!commentToDelete) return;

        setIsDeleting(true);
        try {
            const result = await deleteComment(commentToDelete.id);
            if (result.success) {
                setComments(comments.filter(c => c.id !== commentToDelete.id));
                setDeleteDialogOpen(false);
                setCommentToDelete(null);
            } else {
                alert(result.error || 'Failed to delete comment');
            }
        } catch (error) {
            alert('Failed to delete comment');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Comments</h2>
                
                {comments.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>No comments yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {comments.map((comment) => (
                            <div key={comment.id} className="p-4 border rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-sm">
                                                {comment.author.name || comment.author.email}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(comment.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-sm text-muted-foreground">on</span>
                                            <Link 
                                                href={`/blog/${comment.post.id}`}
                                                className="text-sm text-primary hover:underline flex items-center gap-1"
                                            >
                                                {comment.post.title}
                                                <ExternalLink className="h-3 w-3" />
                                            </Link>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteClick(comment)}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="text-sm bg-muted/30 p-3 rounded">
                                    {comment.content}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                        <AlertDialogDescription>
                            Delete this comment? This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}