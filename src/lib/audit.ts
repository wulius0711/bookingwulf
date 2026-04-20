import { prisma } from './prisma';

type AuditFields = Record<string, string | null | undefined>;

export async function writeAuditLog(hotelId: number, before: AuditFields, after: AuditFields) {
  const entries = Object.keys(after)
    .filter((field) => String(before[field] ?? '') !== String(after[field] ?? ''))
    .map((field) => ({
      hotelId,
      field,
      oldValue: before[field] != null ? String(before[field]) : null,
      newValue: after[field] != null ? String(after[field]) : null,
    }));

  if (entries.length === 0) return;
  await prisma.auditLog.createMany({ data: entries });
}
