'use client';

import { useState, useRef } from 'react';

const defaultBillTo = {
  company: 'LOUD TEAM LLC',
  contact: 'Jean Ortega',
  title: 'Co-Founder',
  address: '1012 College Road, 201, County of Kent, 19904, Dover, USA',
  email: 'jean@loud.gg',
};

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 3 }}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13, boxSizing: 'border-box' }} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20, background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: 16 }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: '#c8102e', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>{title}</div>
      {children}
    </div>
  );
}

interface Item {
  desc: string;
  value: string;
  receiptSrc: string | null;
}

interface Receipt {
  name: string;
  src: string;
}

export default function App() {
  const [date, setDate] = useState('');
  const [invoiceNum, setInvoiceNum] = useState('01');
  const [terms, setTerms] = useState('net-7');
  const [currency, setCurrency] = useState('BRL');
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

  const [shipName, setShipName] = useState('');
  const [shipTitle, setShipTitle] = useState('');
  const [shipAddress, setShipAddress] = useState('');
  const [shipEmail, setShipEmail] = useState('');

  const [bankName, setBankName] = useState('');
  const [bankAddress, setBankAddress] = useState('');
  const [bankEmail, setBankEmail] = useState('');
  const [bank, setBank] = useState('');
  const [account, setAccount] = useState('');
  const [agency, setAgency] = useState('');
  const [cnpj, setCnpj] = useState('');

  const [items, setItems] = useState<Item[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeStatus, setAnalyzeStatus] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const symbol = currencies.find(c => c.code === currency)?.symbol || '$';
  const total = items.reduce((sum, it) => sum + (parseFloat(it.value.replace(',', '.')) || 0), 0);
  const fmt = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const addItem = () => setItems(prev => [...prev, { desc: '', value: '', receiptSrc: null }]);
  const removeReceipt = (i: number) => {
    setReceipts(receipts.filter((_, idx) => idx !== i));
    setItems(items.filter((_, idx) => idx !== i));
  };
  const updateItem = (i: number, field: keyof Item, val: string) => {
    const next = [...items];
    next[i] = { ...next[i], [field]: val };
    setItems(next);
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setAnalyzing(true);

    for (let idx = 0; idx < files.length; idx++) {
      const f = files[idx];
      setAnalyzeStatus(`Analisando recibo ${idx + 1} de ${files.length}...`);
      const mediaType = f.type || 'image/jpeg';

      const base64 = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = ev => res((ev.target?.result as string).split(',')[1]);
        r.onerror = () => rej();
        r.readAsDataURL(f);
      });

      const previewSrc = `data:${mediaType};base64,${base64}`;

      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64, mediaType }),
        });
        const result = await response.json();
        const rawVal = result.value || '0';
        const valBR = rawVal.replace('.', ',');
        setItems(prev => [...prev, { desc: result.desc || 'Receipt', value: valBR, receiptSrc: previewSrc }]);
        setReceipts(prev => [...prev, { name: f.name, src: previewSrc }]);
      } catch {
        setItems(prev => [...prev, { desc: f.name, value: '0', receiptSrc: previewSrc }]);
        setReceipts(prev => [...prev, { name: f.name, src: previewSrc }]);
      }
    }

    setAnalyzing(false);
    setAnalyzeStatus('');
    e.target.value = '';
  };

  const printPDF = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    
    const receiptPages = receipts.map(r => `
      <div class="page receipt-page">
        <img src="${r.src}" style="width:100%;max-height:100%;object-fit:contain;" />
      </div>`).join('');

    const itemRows = items.map(it => {
      const v = parseFloat(it.value.replace(',', '.')) || 0;
      return `<tr>
        <td style="padding:8px 12px;border:1px solid #ccc;">${it.desc}</td>
        <td style="padding:8px 12px;border:1px solid #ccc;text-align:right;">${symbol} ${fmt(v)}</td>
      </tr>`;
    }).join('');

    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
    <style>
      *{box-sizing:border-box;margin:0;padding:0;}
      body{font-family:Arial,sans-serif;font-size:13px;color:#111;}
      .page{width:210mm;min-height:297mm;padding:20mm;page-break-after:always;display:flex;flex-direction:column;}
      .receipt-page{padding:10mm;align-items:center;justify-content:center;}
      h1{font-size:22px;color:#c8102e;margin-bottom:4px;}
      .sub{font-size:11px;color:#888;margin-bottom:20px;}
      .row2{display:flex;gap:40px;margin-bottom:20px;}
      .block{flex:1;}
      .label{font-size:10px;font-weight:700;text-transform:uppercase;color:#888;border-bottom:1px solid #ccc;padding-bottom:2px;margin-bottom:6px;}
      table{width:100%;border-collapse:collapse;margin-bottom:16px;}
      th{background:#222;color:#fff;padding:8px 12px;text-align:left;font-size:12px;}
      th:last-child{text-align:right;}
      .total-row td{font-weight:700;background:#f5f5f5;}
      .wire{background:#f9f9f9;border:1px solid #ddd;border-radius:6px;padding:14px;margin-top:8px;font-size:12px;line-height:1.8;}
      .wire strong{color:#c8102e;}
      @media print{.page{page-break-after:always;}}
    </style></head><body>
    <div class="page">
      <h1>INVOICE #${invoiceNum}</h1>
      <div class="sub">Date: ${date} &nbsp;|&nbsp; Terms: ${terms} &nbsp;|&nbsp; Currency: ${currency}</div>
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
          <tr class="total-row">
            <td style="padding:8px 12px;border:1px solid #ccc;">Total Value</td>
            <td style="padding:8px 12px;border:1px solid #ccc;text-align:right;">${symbol} ${fmt(total)}</td>
          </tr>
        </tbody>
      </table>
      <div class="wire">
        <strong>PLEASE WIRE FUNDS TO THE FOLLOWING:</strong><br/>
        NAME: ${bankName}<br/>
        ADDRESS: ${bankAddress}<br/>
        E-MAIL: ${bankEmail}<br/>
        BANK: ${bank} &nbsp; ACCOUNT: ${account} &nbsp; AGENCY: ${agency}<br/>
        CNPJ: ${cnpj}
      </div>
    </div>
    ${receiptPages}
    </body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 600);
  };

  return (
    <div style={{ background: '#f4f4f4', minHeight: '100vh', padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ background: '#c8102e', color: '#fff', fontWeight: 900, fontSize: 18, padding: '6px 14px', borderRadius: 6 }}>LOUD</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Gerador de Invoice de Reembolso</div>
            <div style={{ fontSize: 12, color: '#777' }}>Faça upload dos recibos — os valores são preenchidos automaticamente</div>
          </div>
        </div>

        <Section title="Dados da Invoice">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <Field label="Data" value={date} onChange={setDate} placeholder="August 28, 2025" />
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
          <Field label="Nome completo" value={shipName} onChange={setShipName} placeholder="Lucca Travaioli Bredariol" />
          <Field label="Título" value={shipTitle} onChange={setShipTitle} placeholder="Valorant Pro Player" />
          <Field label="Endereço" value={shipAddress} onChange={setShipAddress} placeholder="Rua..." />
          <Field label="E-mail" value={shipEmail} onChange={setShipEmail} placeholder="email@exemplo.com" />
        </Section>

        <Section title="Bill To">
          <div style={{ background: '#f0f0f0', borderRadius: 6, padding: 10, fontSize: 12, color: '#555' }}>
            <div><strong>LOUD TEAM LLC</strong> — Jean Ortega, Co-Founder</div>
            <div>1012 College Road, 201, County of Kent, 19904, Dover, USA</div>
            <div>jean@loud.gg</div>
          </div>
          <div style={{ fontSize: 11, color: '#999', marginTop: 6 }}>* Fixo para todas as invoices</div>
        </Section>

        <Section title="Recibos & Itens de Reembolso">
          <div
            onClick={() => !analyzing && fileRef.current?.click()}
            style={{
              border: `2px dashed ${analyzing ? '#aaa' : '#c8102e'}`,
              borderRadius: 8, padding: 20, textAlign: 'center',
              cursor: analyzing ? 'not-allowed' : 'pointer',
              color: analyzing ? '#aaa' : '#c8102e', marginBottom: 16,
              background: analyzing ? '#fafafa' : '#fff'
            }}
          >
            {analyzing ? (
              <>
                <div style={{ fontSize: 24 }}>⏳</div>
                <div style={{ fontWeight: 600 }}>{analyzeStatus}</div>
                <div style={{ fontSize: 11, color: '#999' }}>Aguarde, analisando com IA...</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 28 }}>📎</div>
                <div style={{ fontWeight: 600 }}>Clique para adicionar fotos dos recibos</div>
                <div style={{ fontSize: 11, color: '#999' }}>JPG, PNG — o valor e descrição serão preenchidos automaticamente pela IA</div>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFiles} />

          {items.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 8, textTransform: 'uppercase' }}>
                Itens extraídos — edite se necessário
              </div>
              {items.map((it, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, background: '#fafafa', borderRadius: 6, padding: 8, border: '1px solid #eee' }}>
                  {it.receiptSrc && (
                    <img src={it.receiptSrc} alt="" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 4, border: '1px solid #ddd', flexShrink: 0 }} />
                  )}
                  <input
                    value={it.desc}
                    onChange={e => updateItem(i, 'desc', e.target.value)}
                    placeholder="Descrição"
                    style={{ flex: 3, padding: '6px 8px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13 }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: 4, overflow: 'hidden', flex: 1 }}>
                    <span style={{ padding: '6px 8px', background: '#f0f0f0', fontSize: 12, color: '#555' }}>{symbol}</span>
                    <input
                      value={it.value}
                      onChange={e => updateItem(i, 'value', e.target.value)}
                      placeholder="0,00"
                      style={{ padding: '6px 8px', border: 'none', outline: 'none', fontSize: 13, width: '100%' }}
                    />
                  </div>
                  <button onClick={() => removeReceipt(i)} style={{ background: '#fee', border: '1px solid #fcc', color: '#c00', borderRadius: 4, padding: '5px 10px', cursor: 'pointer', fontSize: 13 }}>✕</button>
                </div>
              ))}
              <button onClick={addItem} style={{ marginTop: 4, background: '#fff', border: '1px dashed #c8102e', color: '#c8102e', borderRadius: 4, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                + Adicionar item manualmente
              </button>
              <div style={{ textAlign: 'right', marginTop: 12, fontWeight: 700, fontSize: 16, color: '#111' }}>
                Total: {symbol} {fmt(total)}
              </div>
            </div>
          )}
        </Section>

        <Section title="Dados Bancários (Wire)">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Nome (empresa/pessoa)" value={bankName} onChange={setBankName} placeholder="LUK ESPORTS LTDA" />
            <Field label="E-mail" value={bankEmail} onChange={setBankEmail} placeholder="email@exemplo.com" />
          </div>
          <Field label="Endereço" value={bankAddress} onChange={setBankAddress} placeholder="Rua..." />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <Field label="Banco" value={bank} onChange={setBank} placeholder="Banco Inter" />
            <Field label="Conta" value={account} onChange={setAccount} placeholder="449750612" />
            <Field label="Agência" value={agency} onChange={setAgency} placeholder="0001" />
          </div>
          <Field label="CNPJ" value={cnpj} onChange={setCnpj} placeholder="00.000.000/0001-00" />
        </Section>

        <button
          onClick={printPDF}
          style={{ width: '100%', background: '#c8102e', color: '#fff', border: 'none', borderRadius: 8, padding: '14px', fontSize: 16, fontWeight: 700, cursor: 'pointer', letterSpacing: 1 }}
        >
          🖨️ GERAR PDF
        </button>
        <div style={{ textAlign: 'center', fontSize: 11, color: '#aaa', marginTop: 8 }}>O PDF abrirá numa nova aba para você salvar ou imprimir</div>
      </div>
    </div>
  );
}
