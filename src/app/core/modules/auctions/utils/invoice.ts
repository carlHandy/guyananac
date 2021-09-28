// returns an array of invoices for a given invoice map
export function getInvoices(items: any) {
  if (!items) {
    return [];
  }
  const invoiceItems: any[] = [];
  for (const key in items) {
    invoiceItems.push({ ...items[key], key });
  }
  return invoiceItems;
}

// returns an array of items for a given invoice items map
export function getInvoicesItems(items: any) {
  if (!items) {
    return [];
  }
  const invoiceItems: any[] = [];
  for (const key in items) {
    invoiceItems.push({ ...items[key] });
  }
  return invoiceItems;
}

// returns an array of statements from a auction statement map
export function getStatementsFromAuction(items: any) {
  if (!items) {
    return [];
  }
  const statements: any[] = [];
  for (const key in items) {
    statements.push({ ...items[key] });
  }
  return statements;
}
