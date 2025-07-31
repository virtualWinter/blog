export interface RateLimitInfo {
    userRemaining: number;
    userResetTime: number;
    ipRemaining: number;
    ipResetTime: number;
}

export interface BlogActionResult {
    success?: boolean;
    error?: string;
    message?: string;
    rateLimitInfo?: RateLimitInfo;
}

export interface PublicUser {
    id: string;
    name: string | null;
    email: string;
    role: 'DEFAULT' | 'ADMIN';
}

export interface PublicPost {
    id: string;
    title: string;
    content: string;
    published: boolean;
    createdAt: Date;
    updatedAt: Date;
    author: PublicUser;
    _count: {
        comments: number;
        views?: number;
    };
}

export interface PublicComment {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    author: PublicUser;
}

export interface CreatePostResult extends BlogActionResult {
    post?: PublicPost;
}

export interface UpdatePostResult extends BlogActionResult {
    post?: PublicPost;
}

export interface DeletePostResult extends BlogActionResult {}

export interface CreateCommentResult extends BlogActionResult {
    comment?: PublicComment;
}

export interface UpdateCommentResult extends BlogActionResult {
    comment?: PublicComment;
}

export interface DeleteCommentResult extends BlogActionResult {}

export interface CreatePostFormData {
    title: string;
    content: string;
    published: boolean;
}

export interface UpdatePostFormData extends CreatePostFormData {
    id: string;
}

export interface CreateCommentFormData {
    postId: string;
    content: string;
}

export interface UpdateCommentFormData {
    id: string;
    content: string;
}