'use client';

import { useState } from 'react';

type Props = {
  initialValues: {
    bankTransferEnabled: boolean;
    paypalEnabled: boolean;
    paypalClientId: string;
    paypalClientSecret: string;
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
        background: checked ? '#111827' : '#d1d5db',
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
        <div style={{ fontSize: 14, fontWeight: 500, color: '#111827', lineHeight: 1.3 }}>{label}</div>
        {description && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2, lineHeight: 1.4 }}>{description}</div>}
      </div>
      <IosToggle name={name} checked={disabled ? false : checked} onChange={disabled ? () => {} : onChange} />
    </div>
  );
}

const divider: React.CSSProperties = {
  height: 1, background: '#e5e7eb', margin: '0',
};

export default function PaymentSettings({ initialValues, inputStyle, labelStyle }: Props) {
  const [bankTransfer, setBankTransfer] = useState(initialValues.bankTransferEnabled);
  const [paypal, setPaypal] = useState(initialValues.paypalEnabled);
  const [deposit, setDeposit] = useState(initialValues.depositEnabled);

  return (
    <div style={{ display: 'grid', gap: 24 }}>

      {/* Aktive Zahlungsmethoden */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px 0', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
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
          <div style={{ borderTop: '1px solid #f3f4f6', background: '#fafafa', padding: '14px 16px', display: 'grid', gap: 10 }}>
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
            <div style={{ height: 1, background: '#e5e7eb', margin: '4px 0' }} />
            <ToggleRow
              name="depositEnabled"
              label="Anzahlung"
              description="Gast zahlt bei Buchung einen Teilbetrag"
              checked={deposit}
              onChange={() => setDeposit(v => !v)}
            />
            {deposit && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
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
                  <label style={labelStyle}>Frist (Tage)</label>
                  <input name="depositDueDays" type="number" min="1" max="90" defaultValue={initialValues.depositDueDays} style={inputStyle} />
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ height: 1, background: '#e5e7eb' }} />

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
          <div style={{ borderTop: '1px solid #f3f4f6', background: '#fafafa', padding: '14px 16px', display: 'grid', gap: 10 }}>
            <div>
              <label style={labelStyle}>PayPal Client ID</label>
              <input name="paypalClientId" type="text" defaultValue={initialValues.paypalClientId} placeholder="AaBbCc…" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>PayPal Client Secret</label>
              <input name="paypalClientSecret" type="password" defaultValue={initialValues.paypalClientSecret} placeholder="••••••••" style={inputStyle} />
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
