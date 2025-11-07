export type PanelMenuItem = {
  label: string;
  icon?: string;
  url?: string;
  command?: () => void;
  items?: PanelMenuItem[];
};
