'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { logMatterPayment, updateMatterAgreedFee } from '@/app/actions/matters'
import { DollarSign, Plus, Printer, AlertCircle, Pencil } from 'lucide-react'

const money = (cents: number) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format((cents || 0) / 100)

const METHODS = [
  ['mobile_money', 'Mobile Money'],
  ['bank_transfer', 'Bank Transfer'],
  ['cheque', 'Cheque'],
  ['cash', 'Cash'],
] as const

export function FinancialsCard({ matter, slug }: { matter: any; slug: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [reference, setReference] = useState('')
  const [method, setMethod] = useState('mobile_money')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [feeOpen, setFeeOpen] = useState(false)
  const [feeInput, setFeeInput] = useState('')
  const [feeSaving, setFeeSaving] = useState(false)
  const [feeError, setFeeError] = useState('')
  const [feeOverride, setFeeOverride] = useState<number | null>(null)

  const payments = (matter.payments || []) as any[]
  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
  const agreedFee = feeOverride ?? (matter.agreedFee || matter.financials?.totalInvoiced || 0)
  const balance = Math.max(0, agreedFee - totalPaid)
  const feeMissing = agreedFee <= 0
  const fullyPaid = agreedFee > 0 && balance === 0

  const enteredCents = useMemo(() => Math.round(Number(amount || 0) * 100), [amount])
  const overpaying = enteredCents > balance
  const statusLabel = feeMissing ? 'No fee set' : fullyPaid ? 'Fully paid' : totalPaid > 0 ? 'Partially paid' : 'Unpaid'

  const saveFee = async () => {
    setFeeError('')
    const cents = Math.round(Number(feeInput || 0) * 100)
    if (!cents || cents <= 0) return setFeeError('Enter a total agreed fee greater than zero.')
    if (cents < totalPaid) return setFeeError(`The fee cannot be lower than the ${money(totalPaid)} already paid.`)

    setFeeSaving(true)
    const result = await updateMatterAgreedFee(slug, matter.id, cents)
    setFeeSaving(false)

    if (!result.success) return setFeeError(result.error || 'Failed to update the agreed fee.')

    setFeeOverride(result.agreedFee ?? cents)
    setFeeOpen(false)
    router.refresh()
  }

  const submit = async () => {
    setError('')
    if (!enteredCents || enteredCents <= 0) return setError('Enter a payment amount greater than zero.')
    if (!reference.trim()) return setError('A payment reference number is required.')
    if (overpaying) return setError(`Payment cannot exceed the outstanding balance of ${money(balance)}.`)

    setSaving(true)
    const result = await logMatterPayment(slug, matter.id, {
      amount: enteredCents,
      paymentMethod: method,
      referenceNumber: reference.trim(),
    })
    setSaving(false)

    if (!result.success) return setError(result.error || 'Failed to record payment.')
    setOpen(false)
    setAmount('')
    setReference('')
    router.refresh()
  }

  const printInvoice = () => {
    const rows = payments
      .map(
        (p) =>
          `<tr><td>${new Date(p.paymentDate).toLocaleDateString('en-KE')}</td><td>${p.referenceNumber || '-'}</td><td>${String(p.paymentMethod).replace('_', ' ')}</td><td class="right">${money(p.amount)}</td></tr>`
      )
      .join('')

    const html = `<!doctype html><html><head><title>Invoice ${matter.caseNumber || ''}</title>
      <style>
        body{font-family:ui-sans-serif,system-ui,sans-serif;color:#111;padding:40px;max-width:760px;margin:auto}
        h1{font-size:22px;margin:0 0 4px}
        .muted{color:#666;font-size:13px}
        table{width:100%;border-collapse:collapse;margin-top:20px;font-size:14px}
        th,td{border-bottom:1px solid #e5e5e5;padding:8px;text-align:left}
        th{background:#f6f6f6;text-transform:uppercase;font-size:11px;letter-spacing:.05em}
        .right{text-align:right}
        .totals{margin-top:24px;font-size:15px}
        .totals div{display:flex;justify-content:space-between;padding:6px 0}
        .totals .due{border-top:2px solid #111;font-weight:700;margin-top:6px;padding-top:10px}
        .status{display:inline-block;margin-top:8px;padding:4px 10px;border-radius:4px;font-size:12px;font-weight:600;background:${fullyPaid ? '#dcfce7' : '#fef3c7'};color:${fullyPaid ? '#166534' : '#92400e'}}
      </style></head><body>
      <h1>Invoice — ${matter.title || 'Matter'}</h1>
      <p class="muted">Matter No: ${matter.caseNumber || '-'} &nbsp;|&nbsp; Practice Area: ${matter.caseType || '-'}</p>
      <p class="muted">Client: ${matter.client?.name || '-'}</p>
      <p class="muted">Issued: ${new Date().toLocaleDateString('en-KE')}</p>
      <span class="status">${statusLabel}</span>
      <table><thead><tr><th>Date</th><th>Reference</th><th>Method</th><th class="right">Amount Paid</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="4">No payments recorded — the full fee remains outstanding.</td></tr>'}</tbody></table>
      <div class="totals">
        <div><span>Total Agreed Fee</span><span>${money(agreedFee)}</span></div>
        <div><span>Amount Paid</span><span>${money(totalPaid)}</span></div>
        <div class="due"><span>Balance Due</span><span>${money(balance)}</span></div>
      </div></body></html>`

    const win = window.open('', '_blank', 'noopener,noreferrer,width=820,height=900')
    if (!win) {
      setError('Allow pop-ups to generate the invoice.')
      return
    }
    win.document.write(html)
    win.document.close()
    win.focus()
    win.print()
  }

  return (
    <Card className="overflow-hidden border-border shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div>
          <h2 className="flex items-center gap-2 font-semibold">
            {/* <DollarSign className="h-4 w-4 text-primary" /> */}
            Financials & Payment Status
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {statusLabel} · live billing position for this matter
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFeeError('')
              setFeeInput(agreedFee ? String(agreedFee / 100) : '')
              setFeeOpen(true)
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            {feeMissing ? 'Set Fee' : 'Edit Fee'}
          </Button>
          <Button variant="outline" size="sm" onClick={printInvoice}>
            <Printer className="mr-2 h-4 w-4" />
            Generate Invoice
          </Button>
          <Button size="sm" onClick={() => { setError(''); setOpen(true) }} disabled={fullyPaid || feeMissing}>
            <Plus className="mr-2 h-4 w-4" />
            {fullyPaid ? 'Fully Paid' : 'Log Payment'}
          </Button>
        </div>
      </div>

      {feeMissing && (
        <p className="flex items-start gap-2 border-b bg-amber-50 px-5 py-3 text-sm text-amber-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>No total agreed fee has been set for this matter. Set the fee before recording payments.</span>
        </p>
      )}

      <div className="grid gap-px bg-border sm:grid-cols-3">
        <Metric label="Total Agreed Fee" value={money(agreedFee)} />
        <Metric label="Amount Paid" value={money(totalPaid)} tone="text-emerald-600" />
        <Metric label="Balance Due" value={money(balance)} tone={balance > 0 ? 'text-amber-600' : 'text-emerald-600'} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Reference No.</th>
              <th className="px-5 py-3">Method</th>
              <th className="px-5 py-3">Amount Paid</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-muted-foreground">
                  No payments recorded — the full balance of {money(balance)} is outstanding.
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-5 py-3">{new Date(p.paymentDate).toLocaleDateString('en-KE')}</td>
                  <td className="px-5 py-3 font-mono text-xs">{p.referenceNumber || '—'}</td>
                  <td className="px-5 py-3 capitalize">{String(p.paymentMethod).replace('_', ' ')}</td>
                  <td className="px-5 py-3 font-medium">{money(p.amount)}</td>
                  <td className="px-5 py-3 text-emerald-600">{p.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {feeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
          <div className="w-full max-w-md rounded-lg border bg-card p-5 shadow-lg">
            <h3 className="font-semibold">{feeMissing ? 'Set Total Agreed Fee' : 'Edit Total Agreed Fee'}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Practice area: {String(matter.caseType || '—').replace(/-/g, ' ')} · already paid {money(totalPaid)}
            </p>

            <div className="mt-4 flex flex-col gap-4">
              <div>
                <Label htmlFor="agreed-fee">Total Agreed Fee (KES)</Label>
                <Input
                  id="agreed-fee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={feeInput}
                  onChange={(e) => setFeeInput(e.target.value)}
                  className="mt-2"
                  placeholder="e.g. 1000"
                />
              </div>

              {feeError && (
                <p className="flex items-start gap-2 rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{feeError}</span>
                </p>
              )}

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setFeeOpen(false)} disabled={feeSaving}>
                  Cancel
                </Button>
                <Button onClick={saveFee} disabled={feeSaving || !feeInput}>
                  {feeSaving ? 'Saving...' : 'Save Fee'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
          <div className="w-full max-w-md rounded-lg border bg-card p-5 shadow-lg">
            <h3 className="font-semibold">Log Payment</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Agreed fee {money(agreedFee)} · outstanding balance {money(balance)}
            </p>

            <div className="mt-4 flex flex-col gap-4">
              <div>
                <Label htmlFor="payment-amount">Amount Paid (KES)</Label>
                <Input
                  id="payment-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  max={balance / 100}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-2"
                  placeholder={(balance / 100).toString()}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Maximum allowed: {money(balance)}
                </p>
              </div>

              <div>
                <Label htmlFor="payment-reference">Reference Number</Label>
                <Input
                  id="payment-reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="mt-2"
                  placeholder="e.g. MPESA QGX12ABCD"
                />
              </div>

              <div>
                <Label htmlFor="payment-method">Payment Method</Label>
                <select
                  id="payment-method"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {METHODS.map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {error && (
                <p className="flex items-start gap-2 rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </p>
              )}

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button onClick={submit} disabled={saving || overpaying || !amount || !reference.trim()}>
                  {saving ? 'Saving...' : 'Record Payment'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

function Metric({ label, value, tone = 'text-foreground' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="bg-card p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-2 text-xl font-semibold ${tone}`}>{value}</p>
    </div>
  )
}
