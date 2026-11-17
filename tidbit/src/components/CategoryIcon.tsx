import {
  Briefcase, Clapperboard, Coffee, Cpu, FlaskConical, Globe, GraduationCap, HeartPulse, Landmark, MapPin, Newspaper, Rocket,
  Sparkles, ThermometerSun, Trees, TrendingUp, Trophy, type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  globe: Globe, landmark: Landmark, briefcase: Briefcase, "trending-up": TrendingUp, cpu: Cpu, sparkles: Sparkles,
  "heart-pulse": HeartPulse, "flask-conical": FlaskConical, rocket: Rocket, trophy: Trophy, clapperboard: Clapperboard,
  trees: Trees, "thermometer-sun": ThermometerSun, coffee: Coffee, "graduation-cap": GraduationCap, "map-pin": MapPin,
};

export function CategoryIcon({ name, size = 22 }: { name: string; size?: number }) {
  const Icon = ICONS[name] ?? Newspaper;
  return <Icon size={size} aria-hidden />;
}
