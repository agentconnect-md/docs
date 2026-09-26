import { createElement, type ComponentType } from 'react'
import {
  ArrowLeftRight,
  BookOpen,
  Bot,
  Boxes,
  Brain,
  Cable,
  CalendarClock,
  CircleArrowUp,
  CodeXml,
  Container,
  CreditCard,
  Download,
  Eye,
  FingerprintPattern,
  Flag,
  FlaskConical,
  FolderGit2,
  FolderInput,
  GitPullRequest,
  Handshake,
  House,
  IdCard,
  Link,
  Lock,
  LockKeyhole,
  LogIn,
  MessagesSquare,
  Network,
  Plug,
  Rocket,
  Route,
  ScrollText,
  Server,
  ServerCog,
  Settings,
  ShieldHalf,
  ShipWheel,
  SlidersHorizontal,
  Sparkles,
  Users,
  Variable,
  Webhook,
  Workflow,
  Wrench,
  Zap
} from 'lucide-react'
import type { LoaderPlugin } from 'fumadocs-core/source'
import {
  DiscordMark,
  GiteaMark,
  GitHubMark,
  GitLabMark,
  LarkMark,
  LinearMark,
  QQMark,
  SlackMark,
  TelegramMark
} from '@/components/brand-marks'

// The icons pages name in their frontmatter `icon`. Only these are bundled: lucide's full map, which Fumadocs' plugin
// imports, is copied into every route that reads the content and cost the Worker about 1 MB gzip. Add a name here to use it.
const ICONS: Record<string, ComponentType> = {
  ArrowLeftRight,
  BookOpen,
  Bot,
  Boxes,
  Brain,
  Cable,
  CalendarClock,
  CircleArrowUp,
  CodeXml,
  Container,
  CreditCard,
  Download,
  Eye,
  FingerprintPattern,
  Flag,
  FlaskConical,
  FolderGit2,
  FolderInput,
  GitPullRequest,
  Handshake,
  House,
  IdCard,
  Link,
  Lock,
  LockKeyhole,
  LogIn,
  MessagesSquare,
  Network,
  Plug,
  Rocket,
  Route,
  ScrollText,
  Server,
  ServerCog,
  Settings,
  ShieldHalf,
  ShipWheel,
  SlidersHorizontal,
  Sparkles,
  Users,
  Variable,
  Webhook,
  Workflow,
  Wrench,
  Zap,
  // Platforms lucide does not ship a mark for.
  Discord: DiscordMark,
  Gitea: GiteaMark,
  GitHub: GitHubMark,
  GitLab: GitLabMark,
  Lark: LarkMark,
  Linear: LinearMark,
  QQ: QQMark,
  Slack: SlackMark,
  Telegram: TelegramMark
}

// Fumadocs' lucide icons plugin, resolving names from the list above.
export function iconsPlugin(): LoaderPlugin {
  function resolve(name: string) {
    const Icon = ICONS[name]
    if (!Icon) console.warn(`[icons] Unknown icon: ${name}; add it to lib/icons.tsx`)
    return Icon ? createElement(Icon) : undefined
  }
  function replace<T extends { icon?: unknown }>(node: T): T {
    if (typeof node.icon === 'string') node.icon = resolve(node.icon)
    return node
  }
  return { name: 'agentconnect:icons', transformPageTree: { file: replace, folder: replace, separator: replace } }
}
