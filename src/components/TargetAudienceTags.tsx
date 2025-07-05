'use client';

import { Users, User, Heart, Shield, Home } from 'lucide-react';

interface TargetAudienceTagsProps {
  audiences: string[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const audienceConfig = {
  '일반국민': {
    icon: Users,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    hoverColor: 'hover:bg-blue-200',
  },
  '청년': {
    icon: User,
    color: 'bg-green-100 text-green-800 border-green-200',
    hoverColor: 'hover:bg-green-200',
  },
  '노인': {
    icon: Heart,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    hoverColor: 'hover:bg-purple-200',
  },
  '장애인': {
    icon: Shield,
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    hoverColor: 'hover:bg-orange-200',
  },
  '저소득층': {
    icon: Home,
    color: 'bg-red-100 text-red-800 border-red-200',
    hoverColor: 'hover:bg-red-200',
  },
} as const;

const sizeConfig = {
  sm: {
    container: 'gap-1',
    tag: 'px-2 py-1 text-xs',
    icon: 'w-3 h-3',
  },
  md: {
    container: 'gap-2',
    tag: 'px-3 py-1.5 text-sm',
    icon: 'w-4 h-4',
  },
  lg: {
    container: 'gap-3',
    tag: 'px-4 py-2 text-base',
    icon: 'w-5 h-5',
  },
} as const;

export default function TargetAudienceTags({ 
  audiences, 
  className = '', 
  size = 'md' 
}: TargetAudienceTagsProps) {
  if (!audiences || audiences.length === 0) {
    return null;
  }

  const sizeStyles = sizeConfig[size];

  return (
    <div className={`flex flex-wrap items-center ${sizeStyles.container} ${className}`}>
      {audiences.map((audience) => {
        const config = audienceConfig[audience as keyof typeof audienceConfig];
        if (!config) return null;

        const Icon = config.icon;

        return (
          <span
            key={audience}
            className={`
              inline-flex items-center gap-1.5 
              ${sizeStyles.tag}
              font-medium rounded-full border
              ${config.color}
              ${config.hoverColor}
              transition-colors duration-200
            `}
          >
            <Icon className={sizeStyles.icon} />
            {audience}
          </span>
        );
      })}
    </div>
  );
}

export function TargetAudienceFilter({ 
  selectedAudiences, 
  onAudienceChange,
  className = '' 
}: {
  selectedAudiences: string[];
  onAudienceChange: (audiences: string[]) => void;
  className?: string;
}) {
  const allAudiences = Object.keys(audienceConfig);

  const toggleAudience = (audience: string) => {
    const newAudiences = selectedAudiences.includes(audience)
      ? selectedAudiences.filter(a => a !== audience)
      : [...selectedAudiences, audience];
    onAudienceChange(newAudiences);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="text-sm font-medium text-gray-700">대상</h4>
      <div className="flex flex-wrap gap-2">
        {allAudiences.map((audience) => {
          const config = audienceConfig[audience as keyof typeof audienceConfig];
          const Icon = config.icon;
          const isSelected = selectedAudiences.includes(audience);

          return (
            <button
              key={audience}
              onClick={() => toggleAudience(audience)}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 text-sm
                font-medium rounded-full border transition-all duration-200
                ${isSelected 
                  ? `${config.color} ring-2 ring-offset-1 ring-current`
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {audience}
            </button>
          );
        })}
      </div>
    </div>
  );
}