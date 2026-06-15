import type { StepTwoForm } from '../../types/registration';

export type SocialNetwork = 'facebook' | 'instagram' | 'tiktok' | 'twitter-x';

const SOCIAL_ICON_CLASS: Record<SocialNetwork, string> = {
  facebook: 'bi-facebook',
  instagram: 'bi-instagram',
  tiktok: 'bi-tiktok',
  'twitter-x': 'bi-twitter-x',
};

type SocialIconProps = {
  network: SocialNetwork;
  className?: string;
};

export function SocialIcon({ network, className }: SocialIconProps) {
  return (
    <i
      className={['bi', SOCIAL_ICON_CLASS[network], className].filter(Boolean).join(' ')}
      aria-hidden="true"
    />
  );
}

export const SOCIAL_NETWORKS: {
  key: keyof Pick<StepTwoForm, 'socialFb' | 'socialIg' | 'socialTt' | 'socialX'>;
  label: string;
  network: SocialNetwork;
}[] = [
  { key: 'socialFb', label: 'facebook', network: 'facebook' },
  { key: 'socialIg', label: 'instagram', network: 'instagram' },
  { key: 'socialTt', label: 'tiktok', network: 'tiktok' },
  { key: 'socialX', label: 'twitter / x', network: 'twitter-x' },
];
