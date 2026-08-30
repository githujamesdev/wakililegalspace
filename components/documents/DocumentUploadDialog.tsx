'use client'

import { useRef, useState, type DragEvent } from 'react'
import { useRouter } from 'next/navigation'
import { uploadDocument } from '@/app/actions/document-actions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle, FileText, Loader2, UploadCloud, X } from 'lucide-react'

const ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.txt,.rtf,.csv,.jpg,.jpeg,.png,.webp,.tif,.tiff'
const MAX_BYTES = 10 * 1024 * 1024

const DOCUMENT_TYPES = [
  'Pleading',
  'Contract',
  'Evidence',
  'Correspondence',
  'Engagement Letter',
  'KYC / Identification',
  'Court Order',
  'Title Document',
  'Other',
]

export type MatterOption = { id: string; title: string; caseNumber: string | null }

export function DocumentUploadDialog({
  slug,
  open,
  onOpenChange,
  matters = [],
  fixedCaseId,
  fixedCaseTitle,
}: {
  slug: string
  open: boolean
  onOpenChange: (open: boolean) => void
  matters?: MatterOption[]
  /** When set the dialog is locked to one matter (used on the matter detail page). */
  fixedCaseId?: string
  fixedCaseTitle?: string
}) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [documentType, setDocumentType] = useState('')
  const [visibility, setVisibility] = useState('team')
  const [caseId, setCaseId] = useState(fixedCaseId ?? 'none')
  const [dragging, setDragging] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const reset = () => {
    setFile(null)
    setTitle('')
    setDescription('')
    setDocumentType('')
    setVisibility('team')
    setCaseId(fixedCaseId ?? 'none')
    setError('')
    setDragging(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const acceptFile = (candidate: File | undefined) => {
    if (!candidate) return
    setError('')

    if (candidate.size > MAX_BYTES) {
      setError(`"${candidate.name}" is ${(candidate.size / (1024 * 1024)).toFixed(1)} MB. The limit is 10 MB.`)
      return
    }

    setFile(candidate)
    // Offer the filename (without extension) as a starting title.
    if (!title.trim()) setTitle(candidate.name.replace(/\.[^.]+$/, ''))
  }

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    acceptFile(event.dataTransfer.files?.[0])
  }

  const handleSubmit = async () => {
    if (!file) return setError('Choose a file to upload.')

    setSaving(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', title.trim() || file.name)
    formData.append('description', description.trim())
    formData.append('documentType', documentType)
    formData.append('visibility', visibility)
    formData.append('caseId', fixedCaseId ?? caseId)

    const result = await uploadDocument(slug, formData)
    setSaving(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    reset()
    onOpenChange(false)
    router.refresh()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset()
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload document</DialogTitle>
          <DialogDescription>
            {fixedCaseTitle
              ? `This file will be filed under ${fixedCaseTitle}.`
              : 'Attach the file to a matter, or leave it at firm level.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
              dragging ? 'border-primary bg-primary/5' : 'border-border'
            }`}
          >
            {file ? (
              <div className="flex items-center gap-3 text-left">
                <FileText className="size-8 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFile(null)
                    if (inputRef.current) inputRef.current.value = ''
                  }}
                >
                  <X className="size-4" />
                  <span className="sr-only">Remove selected file</span>
                </Button>
              </div>
            ) : (
              <>
                <UploadCloud className="mx-auto mb-2 size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag a file here, or{' '}
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="font-medium text-primary underline underline-offset-2"
                  >
                    browse
                  </button>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PDF, Word, Excel, text or image &middot; up to 10 MB
                </p>
              </>
            )}

            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="sr-only"
              onChange={(e) => acceptFile(e.target.files?.[0])}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="doc-title">Title</Label>
            <Input
              id="doc-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sale agreement (executed)"
            />
          </div>

          {!fixedCaseId && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="doc-matter">Related matter</Label>
              <Select value={caseId} onValueChange={setCaseId}>
                <SelectTrigger id="doc-matter">
                  <SelectValue placeholder="Firm level (no matter)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Firm level (no matter)</SelectItem>
                  {matters.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.caseNumber ? `${m.caseNumber} — ${m.title}` : m.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="doc-type">Document type</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger id="doc-type">
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="doc-visibility">Visibility</Label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger id="doc-visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="team">Whole firm</SelectItem>
                  <SelectItem value="private">Only me</SelectItem>
                  <SelectItem value="client">Shared with client</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="doc-description">Notes</Label>
            <Textarea
              id="doc-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional context for colleagues"
              rows={2}
            />
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving || !file}>
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {saving ? 'Uploading…' : 'Upload'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
