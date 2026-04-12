export const EXPENSE_CATEGORIES = [
  'Alimentacao',
  'Transporte',
  'Moradia',
  'Saude',
  'Educacao',
  'Lazer',
  'Roupas',
  'Tecnologia',
  'Assinaturas',
  'Outros',
]

export const INCOME_CATEGORIES = [
  'Salario',
  'Freelance',
  'Investimentos',
  'Bonus',
  'Outros',
]

export const FINANCE_LINK_KIND_OPTIONS = [
  { value: 'spreadsheet', label: 'Planilha', icon: '📊' },
  { value: 'banking', label: 'Banco', icon: '🏦' },
  { value: 'card', label: 'Cartao', icon: '💳' },
  { value: 'investments', label: 'Investimentos', icon: '📈' },
  { value: 'bills', label: 'Boletos', icon: '🧾' },
  { value: 'documents', label: 'Documentos', icon: '📁' },
  { value: 'other', label: 'Outro', icon: '🔗' },
] as const

export const FINANCE_LINK_KIND_META = FINANCE_LINK_KIND_OPTIONS.reduce(
  (acc, option) => {
    acc[option.value] = { label: option.label, icon: option.icon }
    return acc
  },
  {} as Record<
    (typeof FINANCE_LINK_KIND_OPTIONS)[number]['value'],
    { label: string; icon: string }
  >
)
