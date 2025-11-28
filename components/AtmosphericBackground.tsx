import React from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import EffectAether from '@/components/EffectAether';
import EffectWaves from '@/components/EffectWaves';
import EffectCosmos from '@/components/EffectCosmos';
import EffectNet from '@/components/EffectNet';
import EffectGrid from '@/components/EffectGrid';

interface Props {
  visible?: boolean;
}

const AtmosphericBackground: React.FC<Props> = ({ visible = true }) => {
  const { settings } = useTheme();

  if (!visible) return null;

  return (
    <div className="fixed inset-0 w-full h-full z-0 transition-opacity duration-1000">
      {settings.proceduralSet === 'aether' && <EffectAether />}
      {settings.proceduralSet === 'waves' && <EffectWaves />}
      {settings.proceduralSet === 'cosmos' && <EffectCosmos />}
      {settings.proceduralSet === 'net' && <EffectNet />}
      {settings.proceduralSet === 'grid' && <EffectGrid />}
    </div>
  );
};

export default AtmosphericBackground;
