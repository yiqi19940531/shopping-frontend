export function formatMoney(amount: number | undefined | null): string {
  if (amount == null) return '0.00'
  return Number(amount).toFixed(2)
}

export function formatDate(date: string | undefined | null): string {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
