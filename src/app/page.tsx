'use client';

import { useState, useRef, useEffect } from 'react';

const defaultBillTo = {
  company: 'LOUD TEAM LLC', contact: 'Jean Ortega', title: 'Co-Founder',
  address: '1012 College Road, 201, County of Kent, 19904, Dover, USA', email: 'jean@loud.gg',
};
const USERS = [{ email: 'carlos.lira@loud.gg', password: 'ggLOUDgg2026*' }];
const currencies = [
  { code: 'BRL', symbol: 'R$', label: 'BRL – Real' },
  { code: 'USD', symbol: '$', label: 'USD – Dólar' },
  { code: 'EUR', symbol: '€', label: 'EUR – Euro' },
  { code: 'ARS', symbol: '$', label: 'ARS – Peso Argentino' },
  { code: 'KRW', symbol: '₩', label: 'KRW – Won Coreano' },
  { code: 'GBP', symbol: '£', label: 'GBP – Libra' },
  { code: 'JPY', symbol: '¥', label: 'JPY – Iene' },
  { code: 'MXN', symbol: '$', label: 'MXN – Peso Mexicano' },
];
const DOC_TYPES = ['CNPJ', 'CPF', 'Passaporte'];
const BANK_FORMATS = [
  { id: 'BR', label: '🇧🇷 Brasileiro', hint: 'Banco + Conta + Agência' },
  { id: 'ROUTING', label: '🇺🇸 Routing Number', hint: 'Banco + Conta + Routing' },
  { id: 'SWIFT', label: '🌍 Swift / IBAN', hint: 'Banco + Conta + Swift' },
];

interface FormData {
  name: string;
  title: string;
  address: string;
  email: string;
  bankFormat: string;
  bankName: string;
  bankAddress: string;
  bankEmail: string;
  bank: string;
  account: string;
  agency: string;
  routing: string;
  swift: string;
  docType: string;
  docNumber: string;
}

const emptyForm: FormData = { name: '', title: '', address: '', email: '', bankFormat: 'BR', bankName: '', bankAddress: '', bankEmail: '', bank: '', account: '', agency: '', routing: '', swift: '', docType: 'CNPJ', docNumber: '' };

function storageSave(k: string, v: unknown) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(k, JSON.stringify(v));
  }
}

function storageLoad(k: string) {
  if (typeof window !== 'undefined') {
    const r = localStorage.getItem(k);
    return r ? JSON.parse(r) : null;
  }
  return null;
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 3 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13, boxSizing: 'border-box' }} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20, background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: 16 }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: '#22c55e', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>{title}</div>
      {children}
    </div>
  );
}

function BankFields({ form, set, showDoc = true }: { form: FormData; set: (k: keyof FormData) => (v: string) => void; showDoc?: boolean }) {
  const fmt = form.bankFormat || 'BR';
  return (
    <>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 6 }}>Formato Bancário</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {BANK_FORMATS.map(f => (
            <button key={f.id} onClick={() => set('bankFormat')(f.id)}
              style={{ flex: 1, padding: '8px 4px', borderRadius: 6, border: `2px solid ${fmt === f.id ? '#22c55e' : '#ccc'}`, background: fmt === f.id ? '#fff0f0' : '#fff', color: fmt === f.id ? '#22c55e' : '#555', fontWeight: fmt === f.id ? 700 : 400, fontSize: 12, cursor: 'pointer', lineHeight: 1.3 }}>
              {f.label}<br /><span style={{ fontSize: 10, fontWeight: 400, color: '#999' }}>{f.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="Nome (empresa/pessoa)" value={form.bankName} onChange={set('bankName')} placeholder="Nome ou empresa" />
        <Field label="E-mail bancário" value={form.bankEmail} onChange={set('bankEmail')} placeholder="email@exemplo.com" />
      </div>
      <Field label="Endereço bancário" value={form.bankAddress} onChange={set('bankAddress')} placeholder="Endereço completo" />

      {fmt === 'BR' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <Field label="Banco" value={form.bank} onChange={set('bank')} placeholder="Nome do banco" />
          <Field label="Conta" value={form.account} onChange={set('account')} placeholder="XXXXXXXXXX" />
          <Field label="Agência" value={form.agency} onChange={set('agency')} placeholder="XXXX" />
        </div>
      )}
      {fmt === 'ROUTING' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <Field label="Banco" value={form.bank} onChange={set('bank')} placeholder="Nome do banco" />
          <Field label="Conta" value={form.account} onChange={set('account')} placeholder="XXXXXXXXXXXX" />
          <Field label="Routing Number" value={form.routing} onChange={set('routing')} placeholder="XXXXXXXXX" />
        </div>
      )}
      {fmt === 'SWIFT' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <Field label="Banco" value={form.bank} onChange={set('bank')} placeholder="Nome do banco" />
          <Field label="Conta / IBAN" value={form.account} onChange={set('account')} placeholder="XXXX XXXX XXXX" />
          <Field label="Swift Code" value={form.swift} onChange={set('swift')} placeholder="XXXXXXXX" />
        </div>
      )}

      {showDoc && (
        <>
          <div style={{ marginBottom: 6 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 6 }}>Tipo de Documento</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {DOC_TYPES.map(t => (
                <button key={t} onClick={() => set('docType')(t)}
                  style={{ flex: 1, padding: '8px 0', borderRadius: 6, border: `2px solid ${form.docType === t ? '#22c55e' : '#ccc'}`, background: form.docType === t ? '#fff0f0' : '#fff', color: form.docType === t ? '#22c55e' : '#555', fontWeight: form.docType === t ? 700 : 400, fontSize: 13, cursor: 'pointer' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <Field label={form.docType} value={form.docNumber} onChange={set('docNumber')}
            placeholder={{ CNPJ: 'XX.XXX.XXX/0001-XX', CPF: 'XXX.XXX.XXX-XX', Passaporte: 'XXXXXXXXX' }[form.docType] || ''} />
        </>
      )}
    </>
  );
}

function wireText(form: FormData) {
  const fmt = form.bankFormat || 'BR';
  let lines = `NAME: ${form.bankName}<br/>ADDRESS: ${form.bankAddress}<br/>E-MAIL: ${form.bankEmail}<br/>BANK: ${form.bank}<br/>ACCOUNT: ${form.account}<br/>`;
  if (fmt === 'BR') lines += `AGENCY: ${form.agency}<br/>${form.docType}: ${form.docNumber}`;
  if (fmt === 'ROUTING') lines += `ROUTING NUMBER: ${form.routing}<br/>${form.docType}: ${form.docNumber}`;
  if (fmt === 'SWIFT') lines += `SWIFT CODE: ${form.swift}<br/>${form.docType}: ${form.docNumber}`;
  return lines;
}

async function analyzeReceipt(base64: string, mediaType: string) {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64, mediaType })
  });
  const data = await res.json();
  return { value: data.value || '0', desc: data.desc || 'Receipt' };
}

function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const handle = () => {
    if (USERS.find(u => u.email === email && u.password === pw)) onLogin();
    else setErr('E-mail ou senha incorretos.');
  };
  return (
    <div style={{ minHeight: '100vh', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 40, width: 360, boxShadow: '0 8px 32px rgba(0,0,0,.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ background: '#22c55e', color: '#fff', fontWeight: 900, fontSize: 24, padding: '8px 20px', borderRadius: 8, display: 'inline-block', letterSpacing: 2 }}>LOUD</div>
          <div style={{ color: '#888', fontSize: 13, marginTop: 10 }}>Invoice Generator</div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ color: '#aaa', fontSize: 11, fontWeight: 600 }}>E-MAIL</label>
          <input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="carlos.lira@loud.gg"
            onKeyDown={e => e.key === 'Enter' && handle()}
            style={{ width: '100%', marginTop: 4, padding: '9px 10px', borderRadius: 5, border: '1px solid #333', background: '#222', color: '#fff', fontSize: 13, boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ color: '#aaa', fontSize: 11, fontWeight: 600 }}>SENHA</label>
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && handle()}
            style={{ width: '100%', marginTop: 4, padding: '9px 10px', borderRadius: 5, border: '1px solid #333', background: '#222', color: '#fff', fontSize: 13, boxSizing: 'border-box' }} />
        </div>
        {err && <div style={{ color: '#ff6b6b', fontSize: 12, marginBottom: 12, textAlign: 'center' }}>{err}</div>}
        <button onClick={handle} style={{ width: '100%', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, padding: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>ENTRAR</button>
      </div>
    </div>
  );
}

function PlayerPage({ players, setPlayers, onBack, onRefresh }: { players: FormData[]; setPlayers: (p: FormData[]) => void; onBack: () => void; onRefresh?: () => void }) {
  const [form, setForm] = useState<FormData>(emptyForm);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k: keyof FormData) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name.trim()) { setMsg('❌ Nome é obrigatório.'); return; }
    setLoading(true);
    try {
      const dbData = {
        name: form.name,
        document_type: (form.docType || 'cpf').toLowerCase(),
        document: form.docNumber,
        bank_format: (form.bankFormat || 'br').toLowerCase(),
        bank_name: form.bankName || form.bank,
        bank_branch: form.agency,
        bank_account: form.account,
        routing_number: form.routing,
        swift_code: form.swift,
        iban: '',
      };
      await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbData),
      });
      setForm(emptyForm); setEditIdx(null);
      setMsg('✅ Jogador salvo!'); setTimeout(() => setMsg(''), 2500);
      if (onRefresh) onRefresh(); // Reload players from API
    } catch (e) {
      console.error('Failed to save player:', e);
      setMsg('❌ Erro ao salvar jogador.');
    }
    setLoading(false);
  };
  const edit = (i: number) => { setForm({ ...emptyForm, ...players[i] }); setEditIdx(i); };
  const remove = async (i: number) => {
    const player = players[i] as FormData & { id?: string };
    if (player.id) {
      try {
        await fetch(`/api/players?id=${player.id}`, { method: 'DELETE' });
        if (onRefresh) onRefresh();
      } catch (e) {
        console.error('Failed to delete player:', e);
      }
    }
    if (editIdx === i) { setEditIdx(null); setForm(emptyForm); }
  };

  const fmtBadge = (id: string) => BANK_FORMATS.find(f => f.id === id)?.label || id;

  return (
    <div style={{ background: '#f4f4f4', minHeight: '100vh', padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={onBack} style={{ background: '#222', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 14px', cursor: 'pointer', fontSize: 13 }}>← Voltar</button>
          <div style={{ background: '#22c55e', color: '#fff', fontWeight: 900, fontSize: 18, padding: '6px 14px', borderRadius: 6 }}>LOUD</div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Cadastro de Jogadores</div>
        </div>

        <Section title={editIdx !== null ? `Editando: ${players[editIdx]?.name}` : 'Novo Jogador'}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Nome completo *" value={form.name} onChange={set('name')} placeholder="Lucca Travaioli Bredariol" />
            <Field label="Título" value={form.title} onChange={set('title')} placeholder="Valorant Pro Player" />
          </div>
          <Field label="Endereço" value={form.address} onChange={set('address')} placeholder="Rua..." />
          <Field label="E-mail" value={form.email} onChange={set('email')} placeholder="email@exemplo.com" />
          <div style={{ borderTop: '1px dashed #ddd', margin: '12px 0', paddingTop: 12, fontWeight: 600, fontSize: 12, color: '#888', textTransform: 'uppercase' }}>Dados Bancários</div>
          <BankFields form={form} set={set} showDoc={true} />
          {msg && <div style={{ fontSize: 13, marginBottom: 8, color: msg.startsWith('✅') ? '#2a9d2a' : '#c00' }}>{msg}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={save} disabled={loading}
              style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: loading ? .6 : 1 }}>
              {loading ? 'Salvando...' : editIdx !== null ? '💾 Salvar Alterações' : '➕ Cadastrar Jogador'}
            </button>
            {editIdx !== null && (
              <button onClick={() => { setEditIdx(null); setForm(emptyForm); }}
                style={{ background: '#eee', color: '#333', border: '1px solid #ccc', borderRadius: 6, padding: '10px 18px', fontSize: 14, cursor: 'pointer' }}>
                Cancelar
              </button>
            )}
          </div>
        </Section>

        {players.length > 0 && (
          <Section title="Jogadores Cadastrados">
            {players.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#fafafa', border: '1px solid #eee', borderRadius: 6, marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: '#777' }}>{p.title} · {p.email}</div>
                  <div style={{ fontSize: 11, color: '#aaa' }}>{fmtBadge(p.bankFormat)} · {p.docType}: {p.docNumber}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => edit(i)} style={{ background: '#fff', border: '1px solid #ccc', borderRadius: 4, padding: '5px 12px', cursor: 'pointer', fontSize: 12 }}>✏️ Editar</button>
                  <button onClick={() => remove(i)} style={{ background: '#fee', border: '1px solid #fcc', color: '#c00', borderRadius: 4, padding: '5px 12px', cursor: 'pointer', fontSize: 12 }}>✕</button>
                </div>
              </div>
            ))}
          </Section>
        )}
      </div>
    </div>
  );
}

interface Item {
  desc: string;
  value: string;
  receiptSrc: string | null;
  isRefund: boolean;
}

interface Receipt {
  name: string;
  src: string;
}

function InvoicePage({ players, onLogout, onGoPlayers }: { players: FormData[]; onLogout: () => void; onGoPlayers: () => void }) {
  const todayFormatted = () => {
    const d = new Date();
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  const todayISO = () => new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayFormatted());
  const [dateISO, setDateISO] = useState(todayISO());
  const [showCal, setShowCal] = useState(false);
  const handleDatePick = (iso: string) => {
    setDateISO(iso);
    const [y, m, d] = iso.split('-');
    const formatted = new Date(parseInt(y), parseInt(m) - 1, parseInt(d)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    setDate(formatted);
    setShowCal(false);
  };
  const [invoiceNum, setInvoiceNum] = useState('01');
  const [terms, setTerms] = useState('net-7');
  const [currency, setCurrency] = useState('BRL');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [shipName, setShipName] = useState(''); const [shipTitle, setShipTitle] = useState('');
  const [shipAddress, setShipAddress] = useState(''); const [shipEmail, setShipEmail] = useState('');
  const [bankForm, setBankForm] = useState<FormData>(emptyForm);
  const setBank = (k: keyof FormData) => (v: string) => setBankForm(f => ({ ...f, [k]: v }));
  const [items, setItems] = useState<Item[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeStatus, setAnalyzeStatus] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const symbol = currencies.find(c => c.code === currency)?.symbol || '$';
  const total = items.reduce((sum, it) => sum + (parseFloat(it.value.replace(',', '.')) || 0), 0);
  const fmt = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const loadPlayer = (idx: string) => {
    if (idx === '') { setSelectedPlayer(''); return; }
    const p = players[parseInt(idx)];
    setSelectedPlayer(idx);
    setShipName(p.name); setShipTitle(p.title); setShipAddress(p.address); setShipEmail(p.email);
    setBankForm({ ...emptyForm, ...p });
  };

  const addItem = () => setItems(prev => [...prev, { desc: '', value: '', receiptSrc: null, isRefund: false }]);
  const removeItem = (i: number) => { setItems(items.filter((_, idx) => idx !== i)); setReceipts(receipts.filter((_, idx) => idx !== i)); };
  const updateItem = (i: number, f: keyof Item, v: string | boolean) => { const n = [...items]; n[i] = { ...n[i], [f]: v }; setItems(n); };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setAnalyzing(true);
    for (let idx = 0; idx < files.length; idx++) {
      const f = files[idx];
      setAnalyzeStatus(`Analisando recibo ${idx + 1} de ${files.length}...`);
      const mt = f.type || 'image/jpeg';
      const b64 = await new Promise<string>(res => { const r = new FileReader(); r.onload = ev => res((ev.target?.result as string).split(',')[1]); r.readAsDataURL(f); });
      const prev = `data:${mt};base64,${b64}`;
      try {
        const result = await analyzeReceipt(b64, mt);
        setItems(p => [...p, { desc: result.desc || 'Receipt', value: (result.value || '0').replace('.', ','), receiptSrc: prev, isRefund: false }]);
        setReceipts(p => [...p, { name: f.name, src: prev }]);
      } catch {
        setItems(p => [...p, { desc: f.name, value: '0', receiptSrc: prev, isRefund: false }]);
        setReceipts(p => [...p, { name: f.name, src: prev }]);
      }
    }
    setAnalyzing(false); setAnalyzeStatus(''); e.target.value = '';
  };

  const loudLogoSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="120" height="36">
    <rect width="200" height="60" rx="6" fill="#22c55e"/>
    <text x="100" y="42" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="36" fill="white" text-anchor="middle" letter-spacing="4">LOUD</text>
  </svg>`;
  const loudLogoDataURL = `data:image/svg+xml;base64,${btoa(loudLogoSVG)}`;

  const generatePDF = () => {
    const receiptPages = receipts
      .filter(r => r.src && r.src.startsWith('data:'))
      .map(r => `
      <div class="page receipt-page">
        <img src="${r.src}" style="width:100%;max-height:260mm;object-fit:contain;"/>
      </div>`).join('');
    const itemRows = items.map(it => {
      const v = parseFloat(it.value.replace(',', '.')) || 0;
      const desc = it.isRefund ? `Refund - ${it.desc}` : it.desc;
      return `<tr><td class="td-desc">${desc}</td><td class="td-val">${symbol} ${fmt(v)}</td></tr>`;
    }).join('');

    return `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <style>
      @page { size: A4 portrait; margin: 18mm 18mm 18mm 18mm; }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: Arial, sans-serif; font-size: 12px; color: #111; background: #fff; }
      .page { width: 100%; min-height: 257mm; page-break-after: auto; display: flex; flex-direction: column; }
      .page:not(:last-child) { page-break-after: always; }
      .receipt-page { align-items: center; justify-content: center; padding: 4mm 0; }
      .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #22c55e; padding-bottom: 12px; margin-bottom: 18px; }
      .header-left img { display: block; }
      .header-right { text-align: right; }
      .header-right h1 { font-size: 22px; color: #22c55e; letter-spacing: 2px; }
      .header-right .inv-meta { font-size: 11px; color: #777; margin-top: 4px; }
      .row2 { display: flex; gap: 32px; margin-bottom: 18px; }
      .block { flex: 1; }
      .label { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #22c55e; border-bottom: 1px solid #eee; padding-bottom: 3px; margin-bottom: 6px; letter-spacing: 1px; }
      .block div { font-size: 11px; line-height: 1.6; color: #333; }
      .block div strong { color: #111; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
      thead tr { background: #1a1a1a; }
      th { color: #fff; padding: 8px 12px; text-align: left; font-size: 11px; font-weight: 700; letter-spacing: .5px; }
      th:last-child { text-align: right; }
      .td-desc { padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 11px; }
      .td-val { padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 11px; text-align: right; white-space: nowrap; }
      tr:nth-child(even) td { background: #fafafa; }
      .total-row td { font-weight: 700; font-size: 12px; background: #fff0f0 !important; color: #22c55e; border-top: 2px solid #22c55e; border-bottom: none; }
      .wire { background: #f9f9f9; border: 1px solid #e0e0e0; border-left: 4px solid #22c55e; border-radius: 4px; padding: 12px 14px; margin-top: 10px; font-size: 11px; line-height: 2; }
      .wire-title { font-weight: 700; color: #22c55e; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
      .footer { margin-top: auto; padding-top: 16px; border-top: 1px solid #eee; text-align: center; font-size: 9px; color: #bbb; }
    </style></head><body>
    <div class="page">
      <div class="header">
        <div class="header-left"><img src="${loudLogoDataURL}" width="110" height="33"/></div>
        <div class="header-right">
          <h1>INVOICE</h1>
          <div class="inv-meta">#${invoiceNum} &nbsp;·&nbsp; ${date} &nbsp;·&nbsp; Terms: ${terms} &nbsp;·&nbsp; ${currency}</div>
        </div>
      </div>
      <div class="row2">
        <div class="block">
          <div class="label">Ship To</div>
          <div><strong>${shipName}</strong></div>
          <div>${shipTitle}</div>
          <div>${shipAddress}</div>
          <div>${shipEmail}</div>
        </div>
        <div class="block">
          <div class="label">Bill To</div>
          <div><strong>${defaultBillTo.company}</strong></div>
          <div>${defaultBillTo.contact} — ${defaultBillTo.title}</div>
          <div>${defaultBillTo.address}</div>
          <div>${defaultBillTo.email}</div>
        </div>
      </div>
      <table>
        <thead><tr><th>Description</th><th style="text-align:right">Total (${currency})</th></tr></thead>
        <tbody>
          ${itemRows}
          <tr class="total-row"><td class="td-desc">Total Value</td><td class="td-val">${symbol} ${fmt(total)}</td></tr>
        </tbody>
      </table>
      <div class="wire">
        <div class="wire-title">Please wire funds to the following</div>
        ${wireText(bankForm)}
      </div>
      <div class="footer">LOUD TEAM LLC &nbsp;·&nbsp; Invoice generated by LOUD Invoice Generator</div>
    </div>
    ${receiptPages}
    </body></html>`;
  };

  const printPDF = () => {
    const html = generatePDF();
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:210mm;height:297mm;border:none;';
    document.body.appendChild(iframe);
    if (iframe.contentDocument) {
      iframe.contentDocument.open();
      iframe.contentDocument.write(html);
      iframe.contentDocument.close();
    }
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 2000);
      }, 500);
    };
  };

  return (
    <div style={{ background: '#f4f4f4', minHeight: '100vh', padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ background: '#22c55e', color: '#fff', fontWeight: 900, fontSize: 18, padding: '6px 14px', borderRadius: 6 }}>LOUD</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Gerador de Invoice de Reembolso</div>
            <div style={{ fontSize: 12, color: '#777' }}>Upload de recibos com preenchimento automático por IA</div>
          </div>
          <button onClick={onGoPlayers} style={{ background: '#222', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 14px', cursor: 'pointer', fontSize: 13 }}>👥 Jogadores</button>
          <button onClick={onLogout} style={{ background: '#eee', color: '#555', border: '1px solid #ccc', borderRadius: 6, padding: '7px 14px', cursor: 'pointer', fontSize: 13 }}>Sair</button>
        </div>

        <Section title="Dados da Invoice">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 3 }}>Data</label>
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', border: '1px solid #ccc', borderRadius: 4, overflow: 'hidden' }}>
                  <input value={date} onChange={e => setDate(e.target.value)}
                    style={{ flex: 1, padding: '6px 8px', border: 'none', outline: 'none', fontSize: 13 }} />
                  <button onClick={() => setShowCal(v => !v)}
                    style={{ padding: '0 10px', background: '#f0f0f0', border: 'none', cursor: 'pointer', fontSize: 15, borderLeft: '1px solid #ccc' }}>
                    📅
                  </button>
                </div>
                {showCal && (
                  <div style={{ position: 'absolute', zIndex: 999, top: 'calc(100% + 4px)', left: 0, background: '#fff', border: '1px solid #ccc', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,.15)', padding: 8 }}>
                    <input type="date" value={dateISO} onChange={e => handleDatePick(e.target.value)}
                      style={{ padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13, width: '100%' }} />
                  </div>
                )}
              </div>
            </div>
            <Field label="Nº da Invoice" value={invoiceNum} onChange={setInvoiceNum} placeholder="01" />
            <Field label="Terms" value={terms} onChange={setTerms} placeholder="net-7" />
          </div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#555' }}>Moeda</label>
          <select value={currency} onChange={e => setCurrency(e.target.value)}
            style={{ marginTop: 4, padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13, width: '100%' }}>
            {currencies.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
          </select>
        </Section>

        <Section title="Ship To (Jogador / Recebedor)">
          {players.length > 0 ? (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Selecionar jogador cadastrado</label>
              <select value={selectedPlayer} onChange={e => loadPlayer(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #22c55e', borderRadius: 6, fontSize: 13, background: '#fff', color: '#111', fontWeight: 600 }}>
                <option value="">— Selecione um jogador —</option>
                {players.map((p, i) => <option key={i} value={i}>{p.name}</option>)}
              </select>
            </div>
          ) : (
            <div style={{ fontSize: 12, color: '#999', marginBottom: 10, padding: 10, background: '#fafafa', borderRadius: 6, border: '1px dashed #ddd' }}>
              Nenhum jogador cadastrado. <span onClick={onGoPlayers} style={{ color: '#22c55e', cursor: 'pointer', fontWeight: 600 }}>Cadastrar agora →</span>
            </div>
          )}
          <Field label="Nome completo" value={shipName} onChange={setShipName} placeholder="Nome do jogador" />
          <Field label="Título" value={shipTitle} onChange={setShipTitle} placeholder="Valorant Pro Player" />
          <Field label="Endereço" value={shipAddress} onChange={setShipAddress} placeholder="Rua..." />
          <Field label="E-mail" value={shipEmail} onChange={setShipEmail} placeholder="email@exemplo.com" />
        </Section>

        <Section title="Bill To">
          <div style={{ background: '#f0f0f0', borderRadius: 6, padding: 10, fontSize: 12, color: '#555' }}>
            <div><strong>LOUD TEAM LLC</strong> — Jean Ortega, Co-Founder</div>
            <div>1012 College Road, 201, County of Kent, 19904, Dover, USA · jean@loud.gg</div>
          </div>
          <div style={{ fontSize: 11, color: '#999', marginTop: 6 }}>* Fixo para todas as invoices</div>
        </Section>

        <Section title="Recibos & Itens de Reembolso">
          <div onClick={() => !analyzing && fileRef.current?.click()}
            style={{ border: `2px dashed ${analyzing ? '#aaa' : '#22c55e'}`, borderRadius: 8, padding: 20, textAlign: 'center', cursor: analyzing ? 'not-allowed' : 'pointer', color: analyzing ? '#aaa' : '#22c55e', marginBottom: 16, background: analyzing ? '#fafafa' : '#fff' }}>
            {analyzing
              ? <><div style={{ fontSize: 24 }}>⏳</div><div style={{ fontWeight: 600 }}>{analyzeStatus}</div><div style={{ fontSize: 11, color: '#999' }}>Aguarde, analisando com IA...</div></>
              : <><div style={{ fontSize: 28 }}>📎</div><div style={{ fontWeight: 600 }}>Clique para adicionar fotos dos recibos</div><div style={{ fontSize: 11, color: '#999' }}>JPG, PNG — valor e descrição preenchidos automaticamente pela IA</div></>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFiles} />
          {items.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 8, textTransform: 'uppercase' }}>Itens extraídos — edite se necessário</div>
              {items.map((it, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, background: '#fafafa', borderRadius: 6, padding: 8, border: '1px solid #eee' }}>
                  {it.receiptSrc && <img src={it.receiptSrc} alt="" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 4, border: '1px solid #ddd', flexShrink: 0 }} />}
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', flexShrink: 0 }}>
                    <input type="checkbox" checked={it.isRefund} onChange={e => updateItem(i, 'isRefund', e.target.checked)}
                      style={{ width: 16, height: 16, cursor: 'pointer' }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: it.isRefund ? '#22c55e' : '#999' }}>Refund</span>
                  </label>
                  <input value={it.desc} onChange={e => updateItem(i, 'desc', e.target.value)} placeholder="Descrição"
                    style={{ flex: 3, padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13 }} />
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: 4, overflow: 'hidden', flex: 1 }}>
                    <span style={{ padding: '6px 8px', background: '#f0f0f0', fontSize: 12, color: '#555' }}>{symbol}</span>
                    <input value={it.value} onChange={e => updateItem(i, 'value', e.target.value)} placeholder="0,00"
                      style={{ padding: '6px 8px', border: 'none', outline: 'none', fontSize: 13, width: '100%' }} />
                  </div>
                  <button onClick={() => removeItem(i)} style={{ background: '#fee', border: '1px solid #fcc', color: '#c00', borderRadius: 4, padding: '5px 10px', cursor: 'pointer', fontSize: 13 }}>✕</button>
                </div>
              ))}
              <button onClick={addItem} style={{ marginTop: 4, background: '#fff', border: '1px dashed #22c55e', color: '#22c55e', borderRadius: 4, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>+ Adicionar item manualmente</button>
              <div style={{ textAlign: 'right', marginTop: 12, fontWeight: 700, fontSize: 16 }}>Total: {symbol} {fmt(total)}</div>
            </div>
          )}
        </Section>

        <Section title="Dados Bancários (Wire)">
          <BankFields form={bankForm} set={setBank} showDoc={true} />
        </Section>

        <button onClick={printPDF}
          style={{ width: '100%', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, padding: '14px', fontSize: 16, fontWeight: 700, cursor: 'pointer', letterSpacing: 1 }}>
          🖨️ GERAR PDF
        </button>
        <div style={{ textAlign: 'center', fontSize: 11, color: '#aaa', marginTop: 8 }}>O PDF abrirá numa nova aba para você salvar ou imprimir</div>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState('login');
  const [players, setPlayers] = useState<FormData[]>([]);
  const [loaded, setLoaded] = useState(false);

  const loadPlayers = async () => {
    try {
      const res = await fetch('/api/players');
      const data = await res.json();
      if (Array.isArray(data)) {
        // Map from DB format to form format
        const mapped = data.map((p: Record<string, string>) => ({
          name: p.name || '',
          title: '',
          address: '',
          email: '',
          bankFormat: (p.bank_format || 'br').toUpperCase(),
          bankName: p.bank_name || '',
          bankAddress: '',
          bankEmail: '',
          bank: p.bank_name || '',
          account: p.bank_account || '',
          agency: p.bank_branch || '',
          routing: p.routing_number || '',
          swift: p.swift_code || '',
          docType: (p.document_type || 'cpf').toUpperCase(),
          docNumber: p.document || '',
          id: p.id,
        }));
        setPlayers(mapped);
      }
    } catch (e) {
      console.error('Failed to load players:', e);
    }
    setLoaded(true);
  };

  useEffect(() => {
    loadPlayers();
  }, []);

  if (!loaded) return (
    <div style={{ minHeight: '100vh', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Arial, sans-serif' }}>
      Carregando...
    </div>
  );

  return (
    <>
      {page === 'login' && <LoginPage onLogin={() => setPage('invoice')} />}
      {page === 'invoice' && <InvoicePage players={players} onLogout={() => setPage('login')} onGoPlayers={() => setPage('players')} />}
      {page === 'players' && <PlayerPage players={players} setPlayers={setPlayers} onBack={() => setPage('invoice')} onRefresh={loadPlayers} />}
    </>
  );
}
