'use client';

import { useState, useEffect } from 'react';

type Props = {
  initialValues: {
    bankTransferEnabled: boolean;
    paypalEnabled: boolean;
    paypalClientId: string;
    paypalClientSecret: string;
    stripeEnabled: boolean;
    stripePublishableKey: string;
    stripeSecretKey: string;
    depositEnabled: boolean;
    depositType: string;
    depositValue: number;
    depositDueDays: number;
    bankAccountHolder: string;
    bankIban: string;
    bankBic: string;
  };
  inputStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
};

function IosToggle({ name, checked, onChange }: { name: string; checked: boolean; onChange: () => void }) {
  return (
    <label style={{ position: 'relative', display: 'inline-block', width: 46, height: 26, flexShrink: 0, cursor: 'pointer' }}>
      <input type="checkbox" name={name} checked={checked} onChange={onChange} style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
      <span style={{
        position: 'absolute', inset: 0,
        background: checked ? 'var(--accent)' : 'var(--border-strong)',
        borderRadius: 26,
        transition: 'background 0.2s',
      }} />
      <span style={{
        position: 'absolute',
        width: 20, height: 20,
        left: 3, top: 3,
        background: '#fff',
        borderRadius: '50%',
        transform: checked ? 'translateX(20px)' : 'translateX(0)',
        transition: 'transform 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
        pointerEvents: 'none',
      }} />
    </label>
  );
}

function ToggleRow({ name, label, description, checked, onChange, disabled }: {
  name: string; label: string; description?: string; checked: boolean; onChange: () => void; disabled?: boolean;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '14px 0', opacity: disabled ? 0.4 : 1 }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.3 }}>{label}</div>
        {description && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>{description}</div>}
      </div>
      <IosToggle name={name} checked={disabled ? false : checked} onChange={disabled ? () => {} : onChange} />
    </div>
  );
}

const divider: React.CSSProperties = {
  height: 1, background: 'var(--border)', margin: '0',
};

function InlineHint({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', background: 'var(--primitive-yellow-50)', border: '1px solid var(--primitive-yellow-100)', borderRadius: 8, fontSize: 13, color: 'var(--primitive-yellow-800)', lineHeight: 1.45 }}>
      <span style={{ fontSize: 15, lineHeight: 1, flexShrink: 0 }}>⚠️</span>
      {children}
    </div>
  );
}

export default function PaymentSettings({ initialValues, inputStyle, labelStyle }: Props) {
  const [bankTransfer, setBankTransfer] = useState(initialValues.bankTransferEnabled);
  const [paypal, setPaypal] = useState(initialValues.paypalEnabled);
  const [paypalClientId, setPaypalClientId] = useState(initialValues.paypalClientId);
  const [paypalClientSecret, setPaypalClientSecret] = useState(initialValues.paypalClientSecret);
  const [stripe, setStripe] = useState(initialValues.stripeEnabled);
  const [stripePublishableKey, setStripePublishableKey] = useState(initialValues.stripePublishableKey);
  const [stripeSecretKey, setStripeSecretKey] = useState(initialValues.stripeSecretKey);
  const [deposit, setDeposit] = useState(initialValues.depositEnabled);

  const paypalIncomplete = paypal && (!paypalClientId.trim() || !paypalClientSecret.trim());
  const stripeIncomplete = stripe && (!stripePublishableKey.trim() || !stripeSecretKey.trim());

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('bw:payment-change', { detail: { anyEnabled: bankTransfer || paypal || stripe } }));
  }, [bankTransfer, paypal, stripe]);

  return (
    <div style={{ display: 'grid', gap: 24 }}>

      {/* Aktive Zahlungsmethoden */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px 0', fontSize: 11, fontWeight: 700, color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Zahlungsmethoden
        </div>

        {/* Banküberweisung */}
        <div style={{ padding: '0 16px' }}>
          <ToggleRow
            name="bankTransferEnabled"
            label="Banküberweisung"
            description="Gast überweist den Betrag auf das angegebene Konto"
            checked={bankTransfer}
            onChange={() => setBankTransfer(v => !v)}
          />
        </div>
        {bankTransfer && (
          <div style={{ borderTop: '1px solid var(--border)', background: 'var(--surface-2)', padding: '14px 16px', display: 'grid', gap: 10 }}>
            <div>
              <label style={labelStyle}>Kontoinhaber</label>
              <input name="bankAccountHolder" type="text" defaultValue={initialValues.bankAccountHolder} placeholder="Max Mustermann" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>IBAN</label>
              <input name="bankIban" type="text" defaultValue={initialValues.bankIban} placeholder="AT12 3456 7890 1234 5678" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>BIC / SWIFT</label>
              <input name="bankBic" type="text" defaultValue={initialValues.bankBic} placeholder="BKAUATWW" style={inputStyle} />
            </div>
            <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
            <div style={{ paddingLeft: 16 }}>
              <ToggleRow
                name="depositEnabled"
                label="Anzahlung"
                description="Gast zahlt bei Buchung einen Teilbetrag"
                checked={deposit}
                onChange={() => setDeposit(v => !v)}
              />
            </div>
            {deposit && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Art</label>
                  <select name="depositType" defaultValue={initialValues.depositType} style={{ ...inputStyle, width: '100%' }}>
                    <option value="percent">Prozentsatz (%)</option>
                    <option value="fixed">Fixbetrag (€)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Wert</label>
                  <input name="depositValue" type="number" min="0" step="0.01" defaultValue={initialValues.depositValue} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Frist bis Zahlung (Tage)</label>
                  <input name="depositDueDays" type="number" min="1" max="90" defaultValue={initialValues.depositDueDays} style={inputStyle} />
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ height: 1, background: 'var(--border)' }} />

        {/* PayPal */}
        <div style={{ padding: '0 16px' }}>
          <ToggleRow
            name="paypalEnabled"
            label="PayPal"
            description="Gast wird nach der Buchung zu PayPal weitergeleitet"
            checked={paypal}
            onChange={() => setPaypal(v => !v)}
          />
        </div>
        {paypal && (
          <div style={{ borderTop: '1px solid var(--border)', background: 'var(--surface-2)', padding: '14px 16px', display: 'grid', gap: 10 }}>
            {paypalIncomplete && (
              <InlineHint>Client ID und Client Secret sind erforderlich, um PayPal zu aktivieren.</InlineHint>
            )}
            <div>
              <label style={labelStyle}>PayPal Client ID</label>
              <input name="paypalClientId" type="text" value={paypalClientId} onChange={(e) => setPaypalClientId(e.target.value)} placeholder="AaBbCc…" style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>PayPal Client Secret</label>
              <input name="paypalClientSecret" type="password" value={paypalClientSecret} onChange={(e) => setPaypalClientSecret(e.target.value)} placeholder="••••••••" style={inputStyle} required />
            </div>
          </div>
        )}

        <div style={{ height: 1, background: 'var(--border)' }} />

        {/* Stripe */}
        <div style={{ padding: '0 16px' }}>
          <ToggleRow
            name="stripeEnabled"
            label="Kreditkarte (Stripe)"
            description="Gast zahlt direkt im Widget mit Kreditkarte"
            checked={stripe}
            onChange={() => setStripe(v => !v)}
          />
        </div>
        {stripe && (
          <div style={{ borderTop: '1px solid var(--border)', background: 'var(--surface-2)', padding: '14px 16px', display: 'grid', gap: 10 }}>
            {stripeIncomplete && (
              <InlineHint>Publishable Key und Secret Key sind erforderlich, um Kreditkartenzahlung zu aktivieren.</InlineHint>
            )}
            <div>
              <label style={labelStyle}>Publishable Key</label>
              <input name="stripePublishableKey" type="text" value={stripePublishableKey} onChange={(e) => setStripePublishableKey(e.target.value)} placeholder="pk_live_…" style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Secret Key</label>
              <input name="stripeSecretKey" type="password" value={stripeSecretKey} onChange={(e) => setStripeSecretKey(e.target.value)} placeholder="sk_live_…" style={inputStyle} required />
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
