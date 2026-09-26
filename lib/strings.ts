// Site copy that Fumadocs' language packs do not cover.
const en = {
  guides: 'Guides',
  apiReference: 'API',
  selfHosting: 'Self-hosting',
  theme: { label: 'Theme', light: 'Light', dark: 'Dark', system: 'System' },
  footer: { home: 'Home', blog: 'Blog', terms: 'Terms', privacy: 'Privacy' },
  release: 'Release',
  untranslated: 'This page has not been translated yet, so it is shown in English.',
  baseUrl: 'Base URL',
  document: 'OpenAPI document',
  download: 'Download openapi.json',
  openConsole: 'Open console',
  star: 'Star',
  moreActions: 'More page actions',
  editPage: 'Edit page',
  reportIssue: 'Report issue'
}

type Strings = typeof en

const zh: Strings = {
  guides: '指南',
  apiReference: 'API',
  selfHosting: '自托管',
  theme: { label: '主题', light: '浅色', dark: '深色', system: '跟随系统' },
  footer: { home: '官网', blog: '博客', terms: '条款', privacy: '隐私' },
  release: '版本',
  untranslated: '本页还没有中文版，下面是英文原文。',
  baseUrl: '基础 URL',
  document: 'OpenAPI 文档',
  download: '下载 openapi.json',
  openConsole: '打开控制台',
  star: 'Star',
  moreActions: '更多页面操作',
  editPage: '编辑此页',
  reportIssue: '报告问题'
}

const STRINGS: Record<string, Strings> = { en, zh }

export function t(lang: string): Strings {
  return STRINGS[lang] ?? en
}
