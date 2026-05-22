import type { ThemeId } from '../engine/types';

export const THEMES: { id: ThemeId; label: string; sub: string }[] = [
  { id: 'mono', label: 'Mono', sub: 'Black / white, focused' },
  { id: 'indigo', label: 'Indigo Night', sub: 'Deep blue with violet' },
  { id: 'forest', label: 'Forest', sub: 'Moss green' },
  { id: 'amber', label: 'Amber', sub: 'Warm reading-lamp' },
  { id: 'light', label: 'Light Paper', sub: 'Daytime, high contrast' },
];
