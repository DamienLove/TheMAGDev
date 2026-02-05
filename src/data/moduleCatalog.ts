export interface ModuleCatalogItem {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const MODULE_CATALOG: ModuleCatalogItem[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'At-a-glance metrics, recent activity, and workspace status.',
    icon: 'space_dashboard',
  },
  {
    id: 'projects',
    name: 'Projects',
    description: 'Manage repositories, templates, and environment setups.',
    icon: 'folder',
  },
  {
    id: 'code_editor',
    name: 'Code Editor',
    description: 'Monaco-powered editor with terminals, debugging, and file explorer.',
    icon: 'code',
  },
  {
    id: 'desktop_workspace',
    name: 'Desktop Workspace',
    description: 'Multi-pane workspace with floating modules and AI assistant.',
    icon: 'desktop_windows',
  },
  {
    id: 'design_studio',
    name: 'Design Studio',
    description: 'Visual UI/UX tools, asset management, and design workflows.',
    icon: 'draw',
  },
  {
    id: 'build_system',
    name: 'Build System',
    description: 'Automated build pipelines, tasks, and deployment checks.',
    icon: 'build',
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Product analytics, usage metrics, and performance insights.',
    icon: 'monitoring',
  },
  {
    id: 'marketplace',
    name: 'Marketplace',
    description: 'Browse verified extensions, themes, and tooling packs.',
    icon: 'storefront',
  },
  {
    id: 'infrastructure_stack',
    name: 'Infrastructure Stack',
    description: 'Monitor cloud services, databases, and backend integrations.',
    icon: 'lan',
  },
  {
    id: 'community_support',
    name: 'Community Support',
    description: 'Knowledge base, Q&A, and support channels in one place.',
    icon: 'forum',
  },
  {
    id: 'extensions_marketplace',
    name: 'Extensions Marketplace',
    description: 'Discover, install, and manage IDE extensions.',
    icon: 'extension',
  },
  {
    id: 'sdk_toolchain_manager',
    name: 'SDK & Toolchain Manager',
    description: 'Install and update SDKs, toolchains, and build dependencies.',
    icon: 'build_circle',
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'Configure accounts, integrations, and workspace preferences.',
    icon: 'settings',
  },
];
