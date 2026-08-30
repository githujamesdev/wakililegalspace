import { getDocuments, getMatterOptions } from '@/app/actions/document-actions'
import { DocumentsView } from '@/components/documents/DocumentsView'

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const [documents, matters] = await Promise.all([
    getDocuments(slug),
    getMatterOptions(slug),
  ])

  return <DocumentsView slug={slug} documents={documents} matters={matters} />
}
