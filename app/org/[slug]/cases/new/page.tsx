'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronRight, ChevronLeft, Users, Briefcase, CheckCircle2, ArrowLeft } from 'lucide-react'
import ClientSearch from '@/components/matters/ClientSearch'
import CreateClientDrawer from '@/components/matters/CreateClientDrawer'
import { createMatter } from '@/app/actions/matters'
import { PRACTICE_AREAS, PRACTICE_FEES, DEFAULT_PRACTICE_AREA } from '@/lib/practice-areas'

const STEPS = [
  { number: 1, title: 'Client', icon: Users, description: 'Select or create client' },
  { number: 2, title: 'Matter Details', icon: Briefcase, description: 'Essential information' },
  { number: 3, title: 'Review', icon: CheckCircle2, description: 'Confirm & create' },
]

export default function NewMatterPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [currentStep, setCurrentStep] = useState(1)
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [isCreatingMatter, setIsCreatingMatter] = useState(false)
  const [showCreateClient, setShowCreateClient] = useState(false)

  const [matterData, setMatterData] = useState({
    title: '',
    matterType: DEFAULT_PRACTICE_AREA,
    agreedFee: PRACTICE_FEES[DEFAULT_PRACTICE_AREA],
    priority: 'medium',
    court: '',
    judge: '',
    opposingParty: '',
    description: '',
  })

  const handleNextStep = () => {
    if (currentStep === 1 && !selectedClient) {
      alert('Please select a client')
      return
    }
    if (currentStep === 2 && !matterData.title) {
      alert('Please enter a matter title')
      return
    }
    if (currentStep === 2 && (!matterData.agreedFee || matterData.agreedFee <= 0)) {
      alert('Please enter the total agreed fee for this matter')
      return
    }
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleClientCreated = (client: any) => {
    setSelectedClient(client)
    setShowCreateClient(false)
  }

  const handleCreateMatter = async () => {
    setIsCreatingMatter(true)
    try {
      const result = await createMatter(slug, {
        clientId: selectedClient.id,
        title: matterData.title,
        matterType: matterData.matterType,
        agreedFee: matterData.agreedFee,
        priority: matterData.priority,
        court: matterData.court,
        judge: matterData.judge,
        opposingParty: matterData.opposingParty,
        description: matterData.description,
      })

      if (result.success) {
        router.push(`/org/${slug}/cases/${result.matterId}`)
      } else {
        alert(result.error || 'Failed to create matter')
      }
    } catch (error) {
      console.error('[v0] Matter creation error:', error)
      alert('An error occurred while creating the matter')
    } finally {
      setIsCreatingMatter(false)
    }
  }

  return (
    <div className="min-h-full bg-muted/40 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-5 border bg-card shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <Link href={`/org/${slug}/cases`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-blue-950">Create New Matter</h1>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-12">
          {STEPS.map((step, index) => {
            const isActive = currentStep === step.number
            const isCompleted = currentStep > step.number
            const Icon = step.icon

            return (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg scale-110'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : step.number}
                  </div>
                  <p className={`mt-2 text-sm font-medium ${isActive ? 'text-blue-950' : 'text-slate-600'}`}>
                    {step.title}
                  </p>
                </div>

                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-slate-200'}`}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Step Content */}
        <div className="rounded border bg-card p-5 shadow-sm sm:p-8">
          {/* STEP 1: CLIENT SELECTION */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-blue-950 mb-2">Select a Client</h2>
                <p className="text-slate-600">Choose an existing client or create a new one</p>
              </div>

              <ClientSearch organizationSlug={slug} onSelect={setSelectedClient} />

              {selectedClient && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-900">Selected Client</p>
                  <p className="text-lg font-semibold text-green-950 mt-1">{selectedClient.name}</p>
                  <p className="text-sm text-green-700">{selectedClient.email}</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: MATTER DETAILS */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-blue-950 mb-2">Matter Details</h2>
                <p className="text-slate-600">Enter the essential information about this matter</p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {/* Matter Title */}
                <div>
                  <Label className="font-semibold text-slate-900">Matter Title *</Label>
                  <Input
                    placeholder="e.g., Smith v. Johnson - Contract Dispute"
                    value={matterData.title}
                    onChange={(e) => setMatterData({ ...matterData, title: e.target.value })}
                    className="mt-2"
                  />
                </div>

                {/* Matter Type & Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold text-slate-900">Matter Type *</Label>
                    <Select value={matterData.matterType} onValueChange={(value) => setMatterData({ ...matterData, matterType: value, agreedFee: PRACTICE_FEES[value] ?? 0 })}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRACTICE_AREAS.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="font-semibold text-slate-900">Priority</Label>
                    <Select value={matterData.priority} onValueChange={(value) => setMatterData({ ...matterData, priority: value })}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="font-semibold text-slate-900">Total Agreed Fee (KES)</Label>
                  <Input type="number" min="0" value={matterData.agreedFee / 100} onChange={(e) => setMatterData({ ...matterData, agreedFee: Math.max(0, Math.round(Number(e.target.value || 0) * 100)) })} className="mt-2" />
                  <p className="mt-1 text-xs text-muted-foreground">Default fee is assigned from the selected practice area and can be overridden.</p>
                </div>

                {/* Court & Judge */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold text-slate-900">Court/Forum</Label>
                    <Input
                      placeholder="e.g., Federal District Court"
                      value={matterData.court}
                      onChange={(e) => setMatterData({ ...matterData, court: e.target.value })}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="font-semibold text-slate-900">Judge/Arbitrator</Label>
                    <Input
                      placeholder="e.g., Hon. Sarah Davis"
                      value={matterData.judge}
                      onChange={(e) => setMatterData({ ...matterData, judge: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Opposing Party */}
                <div>
                  <Label className="font-semibold text-slate-900">Opposing Party</Label>
                  <Input
                    placeholder="e.g., XYZ Corporation"
                    value={matterData.opposingParty}
                    onChange={(e) => setMatterData({ ...matterData, opposingParty: e.target.value })}
                    className="mt-2"
                  />
                </div>

                {/* Description */}
                <div>
                  <Label className="font-semibold text-slate-900">Matter Description</Label>
                  <textarea
                    placeholder="Brief description of the matter and key details"
                    value={matterData.description}
                    onChange={(e) => setMatterData({ ...matterData, description: e.target.value })}
                    className="w-full mt-2 px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & CONFIRM */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-blue-950 mb-2">Review Matter</h2>
                <p className="text-slate-600">Please review the details below before creating</p>
              </div>

              <div className="space-y-6">
                {/* Client Summary */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm font-semibold text-blue-950">Client</p>
                  <p className="text-lg font-semibold text-blue-950 mt-1">{selectedClient?.name}</p>
                  <p className="text-sm text-blue-700">{selectedClient?.email}</p>
                </div>

                {/* Matter Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-slate-600">Matter Title</p>
                    <p className="font-semibold text-slate-900 mt-1">{matterData.title}</p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-slate-600">Matter Type</p>
                    <p className="font-semibold text-slate-900 mt-1 capitalize">{matterData.matterType}</p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-slate-600">Total Agreed Fee</p>
                    <p className="font-semibold text-slate-900 mt-1">
                      {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(matterData.agreedFee / 100)}
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-slate-600">Priority</p>
                    <p className="font-semibold text-slate-900 mt-1 capitalize">{matterData.priority}</p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-slate-600">Court</p>
                    <p className="font-semibold text-slate-900 mt-1">{matterData.court || 'Not specified'}</p>
                  </div>
                </div>

                {matterData.description && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-slate-600">Description</p>
                    <p className="text-slate-900 mt-1">{matterData.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <Button
            onClick={handlePreviousStep}
            disabled={currentStep === 1}
            variant="outline"
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          {currentStep < STEPS.length ? (
            <Button
              onClick={handleNextStep}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleCreateMatter}
              disabled={isCreatingMatter}
              className="bg-green-600 hover:bg-green-700 gap-2"
            >
              {isCreatingMatter ? 'Creating Matter...' : 'Create Matter'}
              <CheckCircle2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
