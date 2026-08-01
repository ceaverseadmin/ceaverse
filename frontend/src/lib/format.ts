export function formatDate(value: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function titleCase(value: string): string {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function categoryLabel(category: string): string {
  const labels: Record<string, string> = {
    id_card: 'ID Card',
    gadget: 'Gadget',
    clothing: 'Clothing',
    restroom: 'Restroom',
    classroom: 'Classroom',
    laboratory: 'Laboratory',
    service: 'Service',
    entrance: 'Entrance',
    other: 'Other',
    textbook: 'Textbook',
    module: 'Module',
    reference: 'Reference',
    syllabus: 'Syllabus',
    suggestion: 'Suggestion',
    compliment: 'Compliment',
    concern: 'Concern',
    shoutout: 'Shoutout',
  }
  return labels[category] ?? titleCase(category)
}
