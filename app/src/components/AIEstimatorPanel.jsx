import { useState, useRef } from 'react'
import { useAction, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { suggestBundlesAI } from '../lib/aiEstimator'

const fmt = (n) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0
}).format(n)

export default function AIEstimatorPanel({ ratecardItems = [], onAddBundle }) {
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)
    const [inputType, setInputType] = useState('text')
    const [proposalText, setProposalText] = useState('')
    const fileRef = useRef(null)

    const bundles = useQuery(api.masterData.listBundles) || []
    const runAction = useAction(api.aiEstimator.estimateWithAI)

    const ratecardSummary = ratecardItems.slice(0, 100).map(r => ({
        item_code: r.item_code,
        item_name: r.item_name,
        category: r.category,
    }))

    const handleEstimate = async () => {
        const finalInput = inputType === 'proposal' ? proposalText : input
        if (!finalInput.trim()) return

        setLoading(true)
        setError(null)
        setResult(null)

        try {
            const res = await suggestBundlesAI({
                userInput: finalInput,
                availableBundles: bundles,
                ratecardSummary,
                inputType,
                runAction,
                apiRef: api,
            })
            setResult(res)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setInputType('proposal')
        setLoading(true)
        try {
            const text = await file.text()
            setProposalText(text.slice(0, 4000))
        } catch (err) {
            setError('Gagal membaca file: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleAddAll = () => {
        if (!result?.bundles?.length) return
        result.bundles.forEach(b => onAddBundle?.(b))
    }

    const confidenceColor = {
        high: '#00e676',
        medium: '#ffab00',
        low: '#ff5252',
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

            {/* Header */}
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 16 }}>🤖</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>AI Estimator</span>
                    <span style={{
                        fontSize: 9, padding: '2px 6px', borderRadius: 100,
                        background: 'rgba(0,230,118,0.1)', color: '#00e676',
                        border: '1px solid rgba(0,230,118,0.2)', fontWeight: 700
                    }}>Claude Sonnet</span>
                </div>
                <p style={{ fontSize: 10, color: 'var(--text-3)', lineHeight: 1.5 }}>
                    Deskripsikan event atau upload proposal, AI akan suggest bundle & estimasi budget.
                </p>
            </div>

            {/* Input Area */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>

                {/* Mode Toggle */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                    <button
                        onClick={() => setInputType('text')}
                        style={{
                            flex: 1, padding: '5px 0', fontSize: 10, fontWeight: 700,
                            border: 'none', borderRadius: 6, cursor: 'pointer',
                            background: inputType === 'text' ? 'var(--vercel-blue)' : 'var(--surface)',
                            color: inputType === 'text' ? 'white' : 'var(--text-3)',
                        }}
                    >
                        ✏️ Ketik
                    </button>
                    <button
                        onClick={() => { setInputType('proposal'); fileRef.current?.click() }}
                        style={{
                            flex: 1, padding: '5px 0', fontSize: 10, fontWeight: 700,
                            border: 'none', borderRadius: 6, cursor: 'pointer',
                            background: inputType === 'proposal' ? 'var(--vercel-blue)' : 'var(--surface)',
                            color: inputType === 'proposal' ? 'white' : 'var(--text-3)',
                        }}
                    >
                        📄 Upload Proposal
                    </button>
                    <input
                        ref={fileRef}
                        type="file"
                        accept=".pdf,.txt"
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                    />
                </div>

                {inputType === 'text' ? (
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && e.ctrlKey && handleEstimate()}
                        placeholder="Contoh: gala dinner 500 orang di Bali dengan live band dan streaming..."
                        className="form-input"
                        style={{ fontSize: 11, minHeight: 72, resize: 'none', width: '100%', lineHeight: 1.5 }}
                    />
                ) : (
                    <div style={{
                        padding: '10px 12px', borderRadius: 8,
                        background: 'var(--surface)', border: '1px solid var(--border)',
                        fontSize: 10, color: 'var(--text-2)', minHeight: 48, lineHeight: 1.5
                    }}>
                        {proposalText
                            ? `✅ Proposal loaded (${proposalText.length} karakter)`
                            : '📎 Klik "Upload Proposal" untuk upload PDF/TXT'}
                    </div>
                )}

                <button
                    onClick={handleEstimate}
                    disabled={loading || (!input.trim() && !proposalText.trim())}
                    style={{
                        width: '100%', marginTop: 8, padding: '8px 0',
                        background: loading ? 'var(--surface)' : 'var(--vercel-blue)',
                        color: loading ? 'var(--text-3)' : 'white',
                        border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 700,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                >
                    {loading ? (
                        <>
                            <div style={{
                                width: 10, height: 10,
                                border: '2px solid var(--text-3)',
                                borderTopColor: 'var(--text)',
                                borderRadius: '50%',
                                animation: 'spin 0.8s linear infinite'
                            }} />
                            Menganalisis...
                        </>
                    ) : '✨ Estimasi (Ctrl+Enter)'}
                </button>
            </div>

            {/* Error */}
            {error && (
                <div style={{
                    padding: '10px 16px',
                    background: 'rgba(255,82,82,0.1)',
                    borderBottom: '1px solid rgba(255,82,82,0.2)'
                }}>
                    <p style={{ fontSize: 10, color: '#ff5252' }}>⚠️ {error}</p>
                </div>
            )}

            {/* Results */}
            {result && (
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>

                    {/* Confidence + Budget */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                        <div style={{ padding: '8px 10px', background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: 9, color: 'var(--text-3)', marginBottom: 2 }}>Confidence</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: confidenceColor[result.confidence] || 'var(--text)' }}>
                                {result.confidence?.toUpperCase() || '-'}
                            </div>
                        </div>
                        <div style={{ padding: '8px 10px', background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: 9, color: 'var(--text-3)', marginBottom: 2 }}>Est. Budget</div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text)' }}>
                                {result.estimatedBudget
                                    ? `${fmt(result.estimatedBudget.min)} – ${fmt(result.estimatedBudget.max)}`
                                    : '-'}
                            </div>
                        </div>
                    </div>

                    {/* Event Summary */}
                    {result.eventSummary && (
                        <div style={{
                            padding: '8px 10px', background: 'var(--surface)',
                            borderRadius: 8, border: '1px solid var(--border)', marginBottom: 12
                        }}>
                            <div style={{ fontSize: 9, color: 'var(--text-3)', marginBottom: 6, fontWeight: 700, textTransform: 'uppercase' }}>
                                Ringkasan Event
                            </div>
                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                {result.eventSummary.event_type && (
                                    <span style={{ fontSize: 10, color: 'var(--text-2)' }}>📋 {result.eventSummary.event_type}</span>
                                )}
                                {result.eventSummary.duration_days > 0 && (
                                    <span style={{ fontSize: 10, color: 'var(--text-2)' }}>📅 {result.eventSummary.duration_days} hari</span>
                                )}
                                {result.eventSummary.estimated_pax > 0 && (
                                    <span style={{ fontSize: 10, color: 'var(--text-2)' }}>👥 {result.eventSummary.estimated_pax.toLocaleString('id-ID')} pax</span>
                                )}
                                {result.eventSummary.venue_type && (
                                    <span style={{ fontSize: 10, color: 'var(--text-2)' }}>📍 {result.eventSummary.venue_type}</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Reasoning */}
                    <div style={{
                        padding: '8px 10px', background: 'var(--surface)', borderRadius: 8,
                        borderLeft: '3px solid var(--vercel-blue)',
                        borderTopLeftRadius: 0, borderBottomLeftRadius: 0, marginBottom: 12
                    }}>
                        <div style={{ fontSize: 9, color: 'var(--vercel-blue)', fontWeight: 700, marginBottom: 4 }}>Analisis AI</div>
                        <p style={{ fontSize: 10, color: 'var(--text-2)', lineHeight: 1.6 }}>{result.reasoning}</p>
                    </div>

                    {/* Suggested Bundles */}
                    {result.bundles?.length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 8 }}>
                                {result.bundles.length} Bundle Direkomendasikan
                            </div>
                            {result.bundles.map((b, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)',
                                    background: 'var(--bg)', marginBottom: 6,
                                }}>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{b.name}</div>
                                        {b.description && (
                                            <div style={{ fontSize: 9, color: 'var(--text-3)' }}>{b.description}</div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => onAddBundle?.(b)}
                                        style={{
                                            padding: '4px 10px', fontSize: 9, fontWeight: 700,
                                            background: 'var(--vercel-blue)', color: 'white',
                                            border: 'none', borderRadius: 6, cursor: 'pointer', flexShrink: 0
                                        }}
                                    >
                                        + Add
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={handleAddAll}
                                style={{
                                    width: '100%', padding: '7px 0', fontSize: 10, fontWeight: 700,
                                    background: 'rgba(0,112,243,0.1)', color: 'var(--vercel-blue)',
                                    border: '1px dashed var(--vercel-blue)', borderRadius: 8,
                                    cursor: 'pointer', marginTop: 4
                                }}
                            >
                                + Tambah Semua Bundle
                            </button>
                        </div>
                    )}

                    {/* Missing Info */}
                    {result.missingInfo?.length > 0 && (
                        <div style={{
                            padding: '8px 10px', borderRadius: 8, marginBottom: 12,
                            background: 'rgba(255,171,0,0.08)', border: '1px solid rgba(255,171,0,0.2)'
                        }}>
                            <div style={{ fontSize: 9, fontWeight: 700, color: '#ffab00', marginBottom: 6 }}>
                                Info yang Masih Dibutuhkan
                            </div>
                            {result.missingInfo.map((m, i) => (
                                <div key={i} style={{ fontSize: 10, color: '#cc8800', marginBottom: 3, display: 'flex', gap: 6 }}>
                                    <span>•</span><span>{m}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* New Items Needed */}
                    {result.newItemsNeeded?.length > 0 && (
                        <div style={{
                            padding: '8px 10px', borderRadius: 8, marginBottom: 12,
                            background: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.2)'
                        }}>
                            <div style={{ fontSize: 9, fontWeight: 700, color: '#00e676', marginBottom: 6 }}>
                                Item Baru untuk Ditambah ke Ratecard
                            </div>
                            {result.newItemsNeeded.map((m, i) => (
                                <div key={i} style={{ fontSize: 10, color: '#00b050', marginBottom: 3, display: 'flex', gap: 6 }}>
                                    <span>+</span><span>{m}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Source badge */}
                    <div style={{ textAlign: 'center', marginTop: 8 }}>
                        <span style={{ fontSize: 9, color: 'var(--text-3)', opacity: 0.6 }}>
                            {result.source === 'ai' ? '⚡ Powered by Claude Sonnet' : '🔤 Keyword matching (fallback)'}
                        </span>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!result && !loading && !error && (
                <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    padding: 24, opacity: 0.5
                }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>🤖</div>
                    <p style={{ fontSize: 11, textAlign: 'center', color: 'var(--text-3)', lineHeight: 1.6 }}>
                        Ketik deskripsi event atau upload proposal, lalu klik Estimasi.
                    </p>
                </div>
            )}

        </div>
    )
}