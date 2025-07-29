'use client'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const renderMarkdown = (text: string) => {
    return text
      // Headers
      .replace(/^#{1}\s(.+)$/gm, '<h1 class="text-3xl font-bold mb-6 mt-8 first:mt-0 text-foreground">$1</h1>')
      .replace(/^#{2}\s(.+)$/gm, '<h2 class="text-2xl font-bold mb-4 mt-6 text-foreground">$1</h2>')
      .replace(/^#{3}\s(.+)$/gm, '<h3 class="text-xl font-bold mb-3 mt-5 text-foreground">$1</h3>')
      .replace(/^#{4}\s(.+)$/gm, '<h4 class="text-lg font-bold mb-2 mt-4 text-foreground">$1</h4>')
      .replace(/^#{5}\s(.+)$/gm, '<h5 class="text-base font-bold mb-2 mt-3 text-foreground">$1</h5>')
      .replace(/^#{6}\s(.+)$/gm, '<h6 class="text-sm font-bold mb-2 mt-3 text-foreground">$1</h6>')
      
      // Bold and Italic
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      
      // Underline
      .replace(/<u>(.*?)<\/u>/g, '<u class="underline">$1</u>')
      
      // Code
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm font-mono">$1</code></pre>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-2 py-1 rounded text-sm font-mono">$1</code>')
      
      // Blockquotes
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-muted-foreground/30 pl-4 py-2 my-4 italic text-muted-foreground">$1</blockquote>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline hover:text-primary/80 transition-colors" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // Lists - handle nested structure better
      .replace(/^(\s*)- (.+)$/gm, (match, indent, content) => {
        const level = indent.length / 2;
        return `<li class="ml-${level * 4} mb-1 list-disc list-inside">${content}</li>`;
      })
      .replace(/^(\s*)\d+\. (.+)$/gm, (match, indent, content) => {
        const level = indent.length / 2;
        return `<li class="ml-${level * 4} mb-1 list-decimal list-inside">${content}</li>`;
      })
      
      // Horizontal rules
      .replace(/^---$/gm, '<hr class="border-border my-6" />')
      
      // Line breaks - convert double newlines to paragraphs, single newlines to br
      .replace(/\n\n/g, '</p><p class="mb-4 text-foreground leading-relaxed">')
      .replace(/\n/g, '<br>')
      
      // Wrap in paragraph tags
      .replace(/^(.+)/, '<p class="mb-4 text-foreground leading-relaxed">$1')
      .replace(/(.+)$/, '$1</p>')
  }

  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  )
}