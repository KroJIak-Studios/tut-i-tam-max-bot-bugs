import React from 'react'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  Check,
  Clock,
  Eye,
  EyeOff,
  FileText,
  Heart,
  Info,
  Key,
  Layers,
  LayoutDashboard,
  Lock,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Pentagon,
  RefreshCw,
  Search,
  Settings,
  User,
  Users,
  X,
} from 'lucide-react'

export interface IconProps {
  size?: number | string
  className?: string
  color?: string
  style?: React.CSSProperties
}

/**
 * Брендовый логотип «Тут и Там» на базе Lucide MapPin
 */
export const IconLogo: React.FC<IconProps> = ({ size = 28, className, style }) => {
  const numSize = typeof size === 'number' ? size : parseInt(String(size), 10) || 28
  const pinSize = Math.round(numSize * 0.58)
  const radius = Math.round(numSize * 0.25)

  return (
    <div
      className={className}
      style={{
        width: numSize,
        height: numSize,
        backgroundColor: '#2563eb',
        borderRadius: radius,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        flexShrink: 0,
        ...style,
      }}
      aria-hidden="true"
    >
      <MapPin size={pinSize} fill="#ffffff" color="#2563eb" strokeWidth={1.75} />
    </div>
  )
}

// Re-exports из lucide-react для обратной совместимости с существующим кодом
export const IconDashboard: React.FC<IconProps> = (props) => <LayoutDashboard {...props} />
export const IconRequests: React.FC<IconProps> = (props) => <FileText {...props} />
export const IconEvents: React.FC<IconProps> = (props) => <Calendar {...props} />
export const IconUsers: React.FC<IconProps> = (props) => <Users {...props} />
export const IconSettings: React.FC<IconProps> = (props) => <Settings {...props} />
export const IconSearch: React.FC<IconProps> = (props) => <Search {...props} />
export const IconArrowLeft: React.FC<IconProps> = (props) => <ArrowLeft {...props} />
export const IconArrowRight: React.FC<IconProps> = (props) => <ArrowRight {...props} />
export const IconCheck: React.FC<IconProps> = (props) => <Check {...props} />
export const IconX: React.FC<IconProps> = (props) => <X {...props} />
export const IconAlertCircle: React.FC<IconProps> = (props) => <AlertCircle {...props} />
export const IconMapPin: React.FC<IconProps> = (props) => <MapPin {...props} />
export const IconPolygon: React.FC<IconProps> = (props) => <Pentagon {...props} />
export const IconClock: React.FC<IconProps> = (props) => <Clock {...props} />
export const IconUser: React.FC<IconProps> = (props) => <User {...props} />
export const IconMessageSquare: React.FC<IconProps> = (props) => <MessageSquare {...props} />
export const IconRefreshCw: React.FC<IconProps> = (props) => <RefreshCw {...props} />
export const IconLock: React.FC<IconProps> = (props) => <Lock {...props} />
export const IconKey: React.FC<IconProps> = (props) => <Key {...props} />
export const IconLogOut: React.FC<IconProps> = (props) => <LogOut {...props} />
export const IconLayers: React.FC<IconProps> = (props) => <Layers {...props} />
export const IconBuilding: React.FC<IconProps> = (props) => <Building2 {...props} />
export const IconHeart: React.FC<IconProps> = (props) => <Heart {...props} />
export const IconMenu: React.FC<IconProps> = (props) => <Menu {...props} />
export const IconInfo: React.FC<IconProps> = (props) => <Info {...props} />
export const IconEye: React.FC<IconProps> = (props) => <Eye {...props} />
export const IconEyeOff: React.FC<IconProps> = (props) => <EyeOff {...props} />
