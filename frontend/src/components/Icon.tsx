import { Book, Search, MessageSquare, Compass, Mail, Phone, Download, ArrowRight, type LucideIcon } from 'lucide-react'

// Icon mapping from icon names to Lucide React components
const iconMap: Record<string, LucideIcon> = {
  book: Book,
  search: Search,
  'message-square': MessageSquare,
  compass: Compass,
  mail: Mail,
  phone: Phone,
  download: Download,
  'arrow-right': ArrowRight,
}

interface IconProps {
  name: string
  size?: number
  className?: string
}

export default function Icon({ name, size = 24, className = '' }: IconProps) {
  const IconComponent = iconMap[name]

  if (!IconComponent) {
    // Fallback for unknown icons - show nothing or a placeholder
    return null
  }

  return <IconComponent size={size} className={className} />
}