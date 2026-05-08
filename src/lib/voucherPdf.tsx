import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';

type VoucherPdfData = {
  hotelName: string;
  accentColor: string;
  templateName: string;
  code: string;
  type: string;
  value: number;
  expiresAt: Date;
  recipientName?: string | null;
  senderName?: string | null;
  message?: string | null;
};

function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace('#', '');
  return [parseInt(c.slice(0,2),16), parseInt(c.slice(2,4),16), parseInt(c.slice(4,6),16)];
}

function luminance(hex: string): number {
  const [r,g,b] = hexToRgb(hex).map(v => { v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); });
  return 0.2126*r + 0.7152*g + 0.0722*b;
}

function formatValue(type: string, value: number): string {
  if (type === 'value') return new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(value);
  if (type === 'nights') return `${value} ${value === 1 ? 'Nacht' : 'Nächte'}`;
  return String(value);
}

function fmtDate(d: Date): string {
  return new Intl.DateTimeFormat('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(d));
}

export function VoucherPdfDocument({ data }: { data: VoucherPdfData }) {
  const accent = data.accentColor || '#111827';
  const onAccent = luminance(accent) > 0.4 ? '#111827' : '#ffffff';

  const s = StyleSheet.create({
    page: { fontFamily: 'Helvetica', backgroundColor: '#f5f5f5', padding: 0 },
    header: { backgroundColor: accent, padding: '40 48', minHeight: 140 },
    hotelName: { fontSize: 11, fontFamily: 'Helvetica', color: onAccent, opacity: 0.75, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
    headerTitle: { fontSize: 28, fontFamily: 'Helvetica-Bold', color: onAccent, letterSpacing: -0.5 },
    body: { padding: '36 48' },
    valueBox: { backgroundColor: '#ffffff', borderRadius: 12, padding: '28 32', marginBottom: 24, alignItems: 'center', border: '1.5 solid #e5e7eb' },
    valueLabel: { fontSize: 10, fontFamily: 'Helvetica', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
    valueText: { fontSize: 42, fontFamily: 'Helvetica-Bold', color: accent, letterSpacing: -1 },
    templateName: { fontSize: 16, fontFamily: 'Helvetica', color: '#374151', marginTop: 8 },
    codeBox: { backgroundColor: '#ffffff', borderRadius: 12, padding: '24 32', marginBottom: 24, alignItems: 'center', border: `2 dashed #d1d5db` },
    codeLabel: { fontSize: 10, fontFamily: 'Helvetica', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 },
    codeRow: { flexDirection: 'row', justifyContent: 'center', width: '100%' },
    codeText: { fontSize: 30, fontFamily: 'Courier-Bold', color: '#0f172a', letterSpacing: 3 },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    metaBox: { backgroundColor: '#ffffff', borderRadius: 10, padding: '16 20', flex: 1 },
    metaBoxLeft: { marginRight: 8 },
    metaLabel: { fontSize: 9, fontFamily: 'Helvetica', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 },
    metaValue: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#111827' },
    messageBox: { backgroundColor: '#f0f9ff', borderRadius: 10, padding: '16 20', marginBottom: 16, borderLeft: `3 solid ${accent}` },
    messageText: { fontSize: 13, fontFamily: 'Helvetica-Oblique', color: '#374151', lineHeight: 1.6 },
    footer: { padding: '0 48 32', marginTop: 'auto' },
    footerText: { fontSize: 10, fontFamily: 'Helvetica', color: '#9ca3af', textAlign: 'center', lineHeight: 1.6 },
  });

  return (
    <Document>
      <Page size="A5" style={s.page}>
        <View style={s.header}>
          <Text style={s.hotelName}>{data.hotelName}</Text>
          <Text style={s.headerTitle}>Gutschein</Text>
        </View>

        <View style={s.body}>
          <View style={s.valueBox}>
            <Text style={s.valueLabel}>Wert</Text>
            <Text style={s.valueText}>{formatValue(data.type, data.value)}</Text>
            <Text style={s.templateName}>{data.templateName}</Text>
          </View>

          <View style={s.codeBox}>
            <Text style={s.codeLabel}>Gutschein-Code</Text>
            <View style={s.codeRow}>
              <Text style={s.codeText}>{data.code}</Text>
            </View>
          </View>

          <View style={s.metaRow}>
            <View style={[s.metaBox, s.metaBoxLeft]}>
              <Text style={s.metaLabel}>Gültig bis</Text>
              <Text style={s.metaValue}>{fmtDate(data.expiresAt)}</Text>
            </View>
            {data.recipientName && (
              <View style={s.metaBox}>
                <Text style={s.metaLabel}>Für</Text>
                <Text style={s.metaValue}>{data.recipientName}</Text>
              </View>
            )}
          </View>

          {data.message && (
            <View style={s.messageBox}>
              <Text style={s.messageText}>„{data.message}"</Text>
            </View>
          )}
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>
            Bitte nennen Sie diesen Code bei der Buchung oder an der Rezeption von {data.hotelName}.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateVoucherPdf(data: VoucherPdfData): Promise<Buffer> {
  return renderToBuffer(<VoucherPdfDocument data={data} />);
}
