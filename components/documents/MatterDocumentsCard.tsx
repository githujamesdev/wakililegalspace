'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  deleteDocument,
  getDocuments,
  type DocumentListItem,
} from '@/app/actions/document-actions'
import { DocumentUploadDialog } from './DocumentUploadDialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertCircle, Download, FileText, Loader2, Lock, Plus, Trash2 } from 'lucide-react'

const formatBytes = (bytes: number | null) => {
  const size = Number(bytes)
  if (!Number.isFinite(size) || size <= 0) return null
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

const formatDate = (date: Date | string) =>
  new Intl.DateTimeFormat('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(date)
  )

export function MatterDocumentsCard({
  slug,
  caseId,
  caseTitle,
}: {
  slug: string
  caseId: string
  caseTitle: string
}) {
  const [documents, setDocuments] = useState<DocumentListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  // The parent page loads on the client, so this card owns its own list and reloads
  // it after a write instead of relying on router.refresh().
  const load = useCallback(async () => {
    try {
      setDocuments(await getDocuments(slug, { caseId }))
      setError('')
    } catch (err) {
      console.error('[v0] Error loading matter documents:', err)
      setError('Documents could not be loaded.')
    } finally {
      setLoading(false)
    }
  }, [slug, caseId])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async (doc: DocumentListItem) => {
    if (!window.confirm(`Delete "${doc.title}"? This removes the file permanently.`)) return

    setDeletingId(doc.id)
    const result = await deleteDocument(doc.id, slug)
    setDeletingId(null)

    if (!result.success) {
      setError(result.error)
      return
    }

    await load()
  }

  return (
    <Card className="p-6 border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Documents
          {!loading && documents.length > 0 && (
            <span className="text-sm font-normal text-slate-500">({documents.length})</span>
          )}
        </h2>
        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setUploadOpen(true)}
        >
          <Plus className="w-4 h-4 mr-1" />
          Upload
        </Button>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-3 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        </div>
      ) : documents.length > 0 ? (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate flex items-center gap-2">
                  {doc.title}
                  {doc.visibility === 'private' && (
                    <Lock className="w-3 h-3 shrink-0 text-amber-600" aria-label="Only visible to you" />
                  )}
                </p>
                <p className="text-xs text-slate-500 mt-1 truncate">
                  {[
                    doc.documentType || 'Document',
                    formatBytes(doc.fileSize),
                    formatDate(doc.createdAt),
                    `by ${doc.uploadedBy}`,
                  ]
                    .filter(Boolean)
                    .join(' • ')}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button asChild variant="ghost" size="sm">
                  <a href={`/api/documents/${doc.id}?download=1`}>
                    <Download className="w-4 h-4" />
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
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 text-destructive" />
                  )}
                  <span className="sr-only">Delete {doc.title}</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">No documents uploaded yet</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => setUploadOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Upload the first document
          </Button>
        </div>
      )}

      <DocumentUploadDialog
        slug={slug}
        open={uploadOpen}
        onOpenChange={(next) => {
          setUploadOpen(next)
          if (!next) load()
        }}
        fixedCaseId={caseId}
        fixedCaseTitle={caseTitle}
      />
    </Card>
  )
}
