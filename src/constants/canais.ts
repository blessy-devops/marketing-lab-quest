import { 
  ShoppingCart, 
  Package, 
  Users, 
  UserCheck, 
  DollarSign, 
  Heart, 
  Instagram, 
  Mail, 
  Facebook, 
  Search, 
  Headphones, 
  Briefcase, 
  MessageCircle, 
  Phone, 
  Video, 
  Globe, 
  Store, 
  Building 
} from "lucide-react";

export interface CanalOption {
  value: string;
  label: string;
  icon: any;
  categoria: string;
}

export const CATEGORIAS_CANAIS = {
  ECOMMERCE: "E-commerce",
  CREATORS: "Creators/Influencers", 
  MIDIA_PAGA: "Mídia Paga",
  ORGANICO: "Orgânico/Social",
  CRM: "CRM",
  OUTROS: "Outros"
};

export const CANAIS_OPTIONS: CanalOption[] = [
  // E-commerce
  {
    value: "E-commerce - Home",
    label: "E-commerce - Home", 
    icon: ShoppingCart,
    categoria: CATEGORIAS_CANAIS.ECOMMERCE
  },
  {
    value: "E-commerce - PDP",
    label: "E-commerce - PDP",
    icon: Package,
    categoria: CATEGORIAS_CANAIS.ECOMMERCE
  },

  // Creators/Influencers
  {
    value: "Influencers",
    label: "Influencers",
    icon: Users,
    categoria: CATEGORIAS_CANAIS.CREATORS
  },
  {
    value: "Creators comissionadas",
    label: "Creators comissionadas",
    icon: UserCheck,
    categoria: CATEGORIAS_CANAIS.CREATORS
  },
  {
    value: "Creators pagas", 
    label: "Creators pagas",
    icon: DollarSign,
    categoria: CATEGORIAS_CANAIS.CREATORS
  },
  {
    value: "Afiliadas",
    label: "Afiliadas",
    icon: Heart,
    categoria: CATEGORIAS_CANAIS.CREATORS
  },
  {
    value: "Renata Lima",
    label: "Renata Lima",
    icon: Users,
    categoria: CATEGORIAS_CANAIS.CREATORS
  },

  // Mídia Paga
  {
    value: "Meta Ads",
    label: "Meta Ads",
    icon: Facebook,
    categoria: CATEGORIAS_CANAIS.MIDIA_PAGA
  },
  {
    value: "Google Ads",
    label: "Google Ads", 
    icon: Search,
    categoria: CATEGORIAS_CANAIS.MIDIA_PAGA
  },
  {
    value: "TikTok Ads",
    label: "TikTok Ads",
    icon: Video,
    categoria: CATEGORIAS_CANAIS.MIDIA_PAGA
  },
  {
    value: "Pinterest Ads",
    label: "Pinterest Ads",
    icon: Heart,
    categoria: CATEGORIAS_CANAIS.MIDIA_PAGA
  },

  // Orgânico/Social
  {
    value: "Instagram",
    label: "Instagram",
    icon: Instagram,
    categoria: CATEGORIAS_CANAIS.ORGANICO
  },
  {
    value: "TikTok",
    label: "TikTok", 
    icon: Video,
    categoria: CATEGORIAS_CANAIS.ORGANICO
  },
  {
    value: "Google Orgânico",
    label: "Google Orgânico",
    icon: Search,
    categoria: CATEGORIAS_CANAIS.ORGANICO
  },

  // CRM
  {
    value: "E-mail Marketing",
    label: "E-mail Marketing",
    icon: Mail,
    categoria: CATEGORIAS_CANAIS.CRM
  },
  {
    value: "WhatsApp - Grupos",
    label: "WhatsApp - Grupos", 
    icon: MessageCircle,
    categoria: CATEGORIAS_CANAIS.CRM
  },
  {
    value: "WhatsApp - API Oficial",
    label: "WhatsApp - API Oficial",
    icon: Phone,
    categoria: CATEGORIAS_CANAIS.CRM
  },

  // Outros
  {
    value: "Atendimento",
    label: "Atendimento",
    icon: Headphones,
    categoria: CATEGORIAS_CANAIS.OUTROS
  },
  {
    value: "Comercial",
    label: "Comercial",
    icon: Briefcase,
    categoria: CATEGORIAS_CANAIS.OUTROS
  },
  {
    value: "Direto / Sem Origem",
    label: "Direto / Sem Origem",
    icon: Globe,
    categoria: CATEGORIAS_CANAIS.OUTROS
  },
  {
    value: "Marketplace",
    label: "Marketplace",
    icon: Store,
    categoria: CATEGORIAS_CANAIS.OUTROS
  },
  {
    value: "TikTok Shop",
    label: "TikTok Shop",
    icon: Store,
    categoria: CATEGORIAS_CANAIS.OUTROS
  },
  {
    value: "B2B",
    label: "B2B",
    icon: Building,
    categoria: CATEGORIAS_CANAIS.OUTROS
  }
];

export const CANAIS = CANAIS_OPTIONS.map(canal => canal.value);

export const getChannelIcon = (canalValue: string) => {
  const canal = CANAIS_OPTIONS.find(c => c.value === canalValue);
  if (!canal) return Globe;
  
  const IconComponent = canal.icon;
  return IconComponent;
};

export const getChannelsByCategory = () => {
  const grouped: Record<string, CanalOption[]> = {};
  
  CANAIS_OPTIONS.forEach(canal => {
    if (!grouped[canal.categoria]) {
      grouped[canal.categoria] = [];
    }
    grouped[canal.categoria].push(canal);
  });
  
  return grouped;
};