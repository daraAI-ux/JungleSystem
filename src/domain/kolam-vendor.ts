export interface KolamVendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
}

export function normalizeKolamVendorList(payload: unknown): KolamVendor[] {
  const root = asRecord(payload);
  const list: unknown[] = Array.isArray(payload)
    ? payload
    : Array.isArray(root.data)
    ? root.data
    : Array.isArray(root.items)
    ? root.items
    : Array.isArray(root.vendors)
    ? root.vendors
    : [];

  return list.map(normalizeKolamVendor).filter(vendor => vendor.id && vendor.name);
}

export function normalizeKolamVendor(value: unknown): KolamVendor {
  const record = asRecord(value);

  return {
    id: getString(record, '_id') || getString(record, 'id'),
    name:
      getString(record, 'name') ||
      getString(record, 'companyName') ||
      getString(record, 'displayName') ||
      'Vendor tanpa nama',
    email: getString(record, 'email'),
    phone: getString(record, 'phone') || getString(record, 'phoneNumber'),
    status: getString(record, 'status') || 'active',
  };
}

export function createKolamVendorListRevision(vendors: KolamVendor[]) {
  return JSON.stringify(
    vendors.map(vendor => ({
      id: vendor.id,
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      status: vendor.status,
    })),
  );
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function getString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' ? value.trim() : '';
}