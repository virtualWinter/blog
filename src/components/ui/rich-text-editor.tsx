'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Code,
  Link,
  Eye,
  Edit
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  rows?: number
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Write your content here...", 
  disabled = false,
  rows = 20
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')

  const insertText = useCallback((before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)
    onChange(newText)

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + before.length + selectedText.length + after.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }, [value, onChange])

  const formatBold = () => insertText('**', '**')
  const formatItalic = () => insertText('*', '*')
  const formatUnderline = () => insertText('<u>', '</u>')
  const formatCode = () => insertText('`', '`')
  const formatCodeBlock = () => insertText('\n```\n', '\n```\n')
  const formatQuote = () => insertText('\n> ', '')
  const formatUnorderedList = () => insertText('\n- ', '')
  const formatOrderedList = () => insertText('\n1. ', '')
  const formatLink = () => insertText('[', '](url)')
  const formatHeading = (level: number) => insertText(`\n${'#'.repeat(level)} `, '')

  const renderPreview = (text: string) => {
    // Simple markdown-like preview
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-muted pl-4 italic">$1</blockquote>')
      .replace(/^#{1}\s(.+)$/gm, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
      .replace(/^#{2}\s(.+)$/gm, '<h2 class="text-2xl font-bold mb-3">$1</h2>')
      .replace(/^#{3}\s(.+)$/gm, '<h3 class="text-xl font-bold mb-2">$1</h3>')
      .replace(/^#{4}\s(.+)$/gm, '<h4 class="text-lg font-bold mb-2">$1</h4>')
      .replace(/^- (.+)$/gm, '<li class="ml-4">• $1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline">$1</a>')
      .replace(/\n/g, '<br>')
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'write' | 'preview')} className="flex flex-col h-full">
        <div className="flex items-center justify-between flex-shrink-0">
          <TabsList>
            <TabsTrigger value="write" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Write
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="write" className="flex flex-col flex-1 space-y-4 mt-4">
          {/* Toolbar */}
          <Card className="flex-shrink-0">
            <CardContent className="p-3">
              <div className="flex flex-wrap gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => formatHeading(1)}
                  disabled={disabled}
                  title="Heading 1"
                >
                  H1
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => formatHeading(2)}
                  disabled={disabled}
                  title="Heading 2"
                >
                  H2
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => formatHeading(3)}
                  disabled={disabled}
                  title="Heading 3"
                >
                  H3
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={formatBold}
                  disabled={disabled}
                  title="Bold"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={formatItalic}
                  disabled={disabled}
                  title="Italic"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={formatUnderline}
                  disabled={disabled}
                  title="Underline"
                >
                  <Underline className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={formatCode}
                  disabled={disabled}
                  title="Inline Code"
                >
                  <Code className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={formatUnorderedList}
                  disabled={disabled}
                  title="Bullet List"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={formatOrderedList}
                  disabled={disabled}
                  title="Numbered List"
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={formatQuote}
                  disabled={disabled}
                  title="Quote"
                >
                  <Quote className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={formatLink}
                  disabled={disabled}
                  title="Link"
                >
                  <Link className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Text Editor */}
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="font-mono text-sm resize-none flex-1 min-h-0"
            style={{ minHeight: '400px' }}
          />
        </TabsContent>

        <TabsContent value="preview" className="flex-1 mt-4">
          <Card className="h-full">
            <CardContent className="p-6 h-full overflow-y-auto">
              {value ? (
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderPreview(value) }}
                />
              ) : (
                <p className="text-muted-foreground italic">Nothing to preview yet. Start writing in the Write tab.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}