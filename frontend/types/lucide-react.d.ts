declare module 'lucide-react' {
  import * as React from 'react';

  export interface IconProps extends React.SVGProps<SVGSVGElement> {
    color?: string;
    size?: string | number;
    strokeWidth?: string | number;
  }

  /**
   * The library exports many icons; we declare the ones used in the codebase.
   * Feel free to add more as needed.
   */
  export const ShoppingCart: React.FC<IconProps>;
  export const Check: React.FC<IconProps>;
  export const ArrowLeft: React.FC<IconProps>;
  export const Circle: React.FC<IconProps>;
  export const Plus: React.FC<IconProps>;
  export const Package: React.FC<IconProps>;
  export const Brain: React.FC<IconProps>;
  export const AlertTriangle: React.FC<IconProps>;
  export const Clock: React.FC<IconProps>;
  export const ChevronDown: React.FC<IconProps>;
  export const Edit: React.FC<IconProps>;
  export const GripVertical: React.FC<IconProps>;
  export const Search: React.FC<IconProps>;
  export const X: React.FC<IconProps>;
  export const Sparkles: React.FC<IconProps>;
  export const ShoppingBag: React.FC<IconProps>;
  export const Trash2: React.FC<IconProps>;
  export const ArrowRight: React.FC<IconProps>;
  export const Mail: React.FC<IconProps>;
  export const Lock: React.FC<IconProps>;
  export const Eye: React.FC<IconProps>;
  export const EyeOff: React.FC<IconProps>;
  export const User: React.FC<IconProps>;
  export const FolderPlus: React.FC<IconProps>;
  export const Upload: React.FC<IconProps>;
  export const ImageIcon: React.FC<IconProps>;
  export const Send: React.FC<IconProps>;
  export const Settings: React.FC<IconProps>;
  export const Bot: React.FC<IconProps>;
  export const MessageCircle: React.FC<IconProps>;
  export const MoreVertical: React.FC<IconProps>;
  export const Info: React.FC<IconProps>;
  export const Smartphone: React.FC<IconProps>;
  export const Shield: React.FC<IconProps>;
  export const Users: React.FC<IconProps>;
  export const Star: React.FC<IconProps>;
  export const CheckCircle: React.FC<IconProps>;
  export const Moon: React.FC<IconProps>;
  export const Sun: React.FC<IconProps>;
  export const Menu: React.FC<IconProps>;
  export const WifiOff: React.FC<IconProps>;
  export const RefreshCcw: React.FC<IconProps>;
  export const List: React.FC<IconProps>;
  export const LogOut: React.FC<IconProps>;
  export const Key: React.FC<IconProps>;
  // Generic export for any other icon not explicitly declared
  export function createLucideIcon(name: string, nodes: any[]): React.FC<IconProps>;
  const lucide: { [key: string]: React.FC<IconProps> };
  export default lucide;
}