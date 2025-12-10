export interface MenuItem {
  label: string
  to: string
  icon?: string
}

export const NAVIGATION_HEADER: MenuItem[] = [
  {
    label: 'Projekty',
    to: '/projekty',
  },
  {
    label: 'O nás',
    to: '/o-nas',
  },
]

export const NAVIGATION_FOOTER: MenuItem[] = [
  {
    label: 'O nás',
    to: '/o-nas',
  },
]
