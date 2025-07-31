/**
 * Formats a number for display (e.g., 1000 -> 1K, 1000000 -> 1M)
 * @param num - The number to format
 * @returns Formatted string
 */
export function formatNumber(num: number): string {
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
}

/**
 * Formats view count for display
 * @param views - Number of views
 * @returns Formatted view count string
 */
export function formatViewCount(views: number): string {
    if (views === 0) return '0 views';
    if (views === 1) return '1 view';
    return `${formatNumber(views)} views`;
}

/**
 * Formats comment count for display
 * @param comments - Number of comments
 * @returns Formatted comment count string
 */
export function formatCommentCount(comments: number): string {
    if (comments === 0) return '0 comments';
    if (comments === 1) return '1 comment';
    return `${formatNumber(comments)} comments`;
}