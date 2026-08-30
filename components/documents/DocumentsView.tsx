'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { deleteDocument, type DocumentListItem } from '@/app/actions/document-actions'
import { DocumentUploadDialog, type MatterOption } from './DocumentUploadDialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  AlertCircle,
  Briefcase,
  Download,
  FileText,
  Loader2,
  Lock,
  Search,
  Trash2,
  Upload,
  Users,
} from 'lucide-react'

const formatBytes = (bytes: number | null) => {
  const size = Number(bytes)
  if (!Number.isFinite(size) || size <= 0) return '—'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

const formatDate = (date: Date | string) =>
  new Intl.DateTimeFormat('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(date)
  )

const FILTERS = [
  { key: 'all', label: 'All documents' },
  { key: 'matter', label: 'Filed to a matter' },
  { key: 'firm', label: 'Firm level' },
] as const

export function DocumentsView({
  slug,
  documents,
  matters,
}: {
  slug: string
  documents: DocumentListItem[]
  matters: MatterOption[]
}) {
  const router = useRouter()
  const [uploadOpen, setUploadOpen] = useState(false)
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('all')
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()

    return documents.filter((doc) => {
      if (filter === 'matter' && !doc.caseId) return false
      if (filter === 'firm' && doc.caseId) return false
      if (!term) return true

      return (
        doc.title.toLowerCase().includes(term) ||
        doc.fileName.toLowerCase().includes(term) ||
        (doc.caseTitle || '').toLowerCase().includes(term) ||
        (doc.documentType || '').toLowerCase().includes(term)
      )
    })
  }, [documents, filter, search])

  const handleDelete = async (doc: DocumentListItem) => {
    if (!window.confirm(`Delete "${doc.title}"? This removes the file permanently.`)) return

    setDeletingId(doc.id)
    setError('')

    const result = await deleteDocument(doc.id, slug)
    setDeletingId(null)

    if (!result.success) {
      setError(result.error)
      return
    }

    router.refresh()
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Documents</h1>
          <p className="mt-2 text-muted-foreground">
            {documents.length === 0
              ? 'No documents stored yet'
              : `${documents.length} document${documents.length === 1 ? '' : 's'} in the firm library`}
          </p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Upload className="mr-2 size-4" />
          Upload document
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Button
              key={f.key}
              variant={filter === f.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        <div className="relative min-w-56 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, file, matter or type"
            className="pl-9"
            aria-label="Search documents"
          />
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {visible.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <FileText className="size-12 text-muted-foreground/40" />
          <div>
            <p className="font-medium text-foreground">
              {documents.length === 0 ? 'No documents yet' : 'Nothing matches this view'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {documents.length === 0
                ? 'Upload pleadings, contracts, evidence or firm templates to get started.'
                : 'Try a different filter or search term.'}
            </p>
          </div>
          {documents.length === 0 && (
            <Button onClick={() => setUploadOpen(true)} variant="outline">
              <Upload className="mr-2 size-4" />
              Upload the first document
            </Button>
          )}
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((doc) => (
            <Card key={doc.id} className="p-4 transition-shadow hover:shadow-md">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <FileText className="mt-1 size-9 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-semibold text-foreground">{doc.title}</h2>
                    <p className="truncate text-sm text-muted-foreground">{doc.fileName}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>{formatBytes(doc.fileSize)}</span>
                      {doc.documentType && <span>{doc.documentType}</span>}
                      <span>{formatDate(doc.createdAt)}</span>
                      <span>by {doc.uploadedBy}</span>
                      {doc.caseId ? (
                        <Link
                          href={`/org/${slug}/cases/${doc.caseId}`}
                          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                        >
                          <Briefcase className="size-3" />
                          {doc.caseTitle || 'View matter'}
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <Briefcase className="size-3" />
                          Firm level
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${
                      doc.visibility === 'private'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {doc.visibility === 'private' ? (
                      <>
                        <Lock className="size-3" /> Only me
                      </>
                    ) : (
                      <>
                        <Users className="size-3" />
                        {doc.visibility === 'client' ? 'Client' : 'Firm'}
                      </>
                    )}
                  </span>

                  <Button asChild variant="ghost" size="sm">
                    <a href={`/api/documents/${doc.id}?download=1`}>
                      <Download className="size-4" />
                      <span className="sr-only">Download {doc.title}</span>
                    </a>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(doc)}
                    disabled={deletingId === doc.id}
                  >
                    {deletingId === doc.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4 text-destructive" />
                    )}
                    <span className="sr-only">Delete {doc.title}</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <DocumentUploadDialog
        slug={slug}
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        matters={matters}
      />
    </div>
  )
}
