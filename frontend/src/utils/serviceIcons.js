import {
  Compass,
  Layers,
  CheckSquare,
  Leaf,
  Hexagon,
  Shield,
  Award,
  Users,
  Briefcase,
  FileText,
  Home as HomeIcon,
  Maximize,
  HelpCircle,
  Building,
  Layout,
  Grid,
  PenTool,
  Ruler,
  Box,
  Settings,
  Sparkles,
  MapPin,
  Calendar,
  Star,
  CheckCircle2,
} from 'lucide-react';

/**
 * Single Source of Truth for all Service Icons in Da' Corridor Portfolio CMS.
 */
export const serviceIcons = {
  Home: HomeIcon,
  Briefcase: Briefcase,
  Maximize: Maximize,
  Compass: Compass,
  Layers: Layers,
  CheckSquare: CheckSquare,
  Leaf: Leaf,
  Hexagon: Hexagon,
  Shield: Shield,
  Award: Award,
  Users: Users,
  FileText: FileText,
  Building: Building,
  Layout: Layout,
  Grid: Grid,
  PenTool: PenTool,
  Ruler: Ruler,
  Box: Box,
  Settings: Settings,
  Sparkles: Sparkles,
  MapPin: MapPin,
  Calendar: Calendar,
  Star: Star,
  CheckCircle2: CheckCircle2,
};

/**
 * Fallback icon component when an icon key is undefined or unknown.
 */
export const DEFAULT_ICON = HelpCircle;

/**
 * Helper list of available icon names for Admin CMS dropdown selectors.
 */
export const SERVICE_ICON_LIST = Object.keys(serviceIcons);

export default serviceIcons;
