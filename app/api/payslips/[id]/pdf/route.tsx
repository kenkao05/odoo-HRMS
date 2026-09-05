import { NextResponse } from 'next/server';
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { createClient } from '@/lib/supabase/server';

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11 },
  header: { fontSize: 18, marginBottom: 16, color: '#3E2723' },
  row: { flexDirection: 'row', justifyContent: 'space-between', borderBottom: '1 solid #eee', paddingVertical: 4 },
  total: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, fontSize: 13, fontWeight: 700 },
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: payslip, error } = await supabase
    .from('payslips')
    .select('*, employees(name, job_position), payslip_lines(*)')
    .eq('id', id)
    .single();

  if (error || !payslip) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!payslip.payslip_lines?.length) return NextResponse.json({ error: 'Payslip has no computed lines' }, { status: 404 });

  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Payslip -- {(payslip as any).employees?.name}</Text>
        <Text>{(payslip as any).employees?.job_position}</Text>
        <View style={{ marginTop: 16 }}>
          {(payslip as any).payslip_lines.map((line: any) => (
            <View style={styles.row} key={line.id}>
              <Text>{line.name}</Text>
              <Text>{line.amount.toFixed(2)}</Text>
            </View>
          ))}
        </View>
        <View style={styles.total}>
          <Text>Gross</Text>
          <Text>{payslip.gross.toFixed(2)}</Text>
        </View>
        <View style={styles.total}>
          <Text>Net</Text>
          <Text>{payslip.net.toFixed(2)}</Text>
        </View>
      </Page>
    </Document>
  );

    const buffer = await renderToBuffer(doc);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="payslip-${id}.pdf"`,
    },
  });
}