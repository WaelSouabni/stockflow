export type DashboardPeriod = 30 | 90 | 180 | 365;

export function getPeriodStart(period: DashboardPeriod, now = new Date()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (period === 30) start.setDate(start.getDate() - 29);
  else if (period === 90) start.setDate(start.getDate() - 89);
  else if (period === 180) start.setDate(start.getDate() - 179);
  else start.setDate(start.getDate() - 364);
  return start;
}

export function buildMonthlyRevenue(invoices: Array<{ issueDate: Date; total: number; status: string }>, months: number, now = new Date()) {
  return Array.from({ length: months }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (months - 1 - index), 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const revenue = invoices.filter((invoice) => {
      const issue = new Date(invoice.issueDate);
      return invoice.status === "PAID" && issue.getFullYear() === date.getFullYear() && issue.getMonth() === date.getMonth();
    }).reduce((sum, invoice) => sum + invoice.total, 0);
    return { month: key, revenue };
  });
}

export function groupMovementQuantities(movements: Array<{ type: string; quantity: number }>) {
  return Object.entries(movements.reduce<Record<string, number>>((acc, movement) => {
    acc[movement.type] = (acc[movement.type] ?? 0) + movement.quantity;
    return acc;
  }, {})).map(([type, quantity]) => ({ type, quantity }));
}