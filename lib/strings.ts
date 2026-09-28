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
  reportIssue: 'Report issue',
  askAi: {
    trigger: 'Ask AI',
    title: 'Ask AI',
    disclaimer: 'AI can be inaccurate, please verify the answers.',
    close: 'Close',
    placeholder: 'Ask a question',
    answering: 'AI is answering...',
    send: 'Send',
    stop: 'Stop',
    retry: 'Retry',
    clear: 'Clear chat',
    empty: 'Start a new chat below.',
    you: 'You',
    thinking: 'Thinking...',
    errors: {
      disabled: 'Ask AI is not available right now.',
      busy: 'Still answering your previous question. Try again when it finishes.',
      rateLimited: 'Too many questions in a short time. Try again in a minute.',
      declined: 'I can only help with questions about AgentConnect.',
      offline: 'The assistant is offline right now. Try again later.',
      failed: 'Something went wrong. Please try again.'
    }
  }
}

export type Strings = typeof en

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
  reportIssue: '报告问题',
  askAi: {
    trigger: '问 AI',
    title: '问 AI',
    disclaimer: 'AI 的回答可能有误，请自行核实。',
    close: '关闭',
    placeholder: '输入问题',
    answering: 'AI 正在回答…',
    send: '发送',
    stop: '停止',
    retry: '重试',
    clear: '清空对话',
    empty: '在下方开始新的对话。',
    you: '你',
    thinking: '思考中…',
    errors: {
      disabled: '问 AI 暂时不可用。',
      busy: '上一个问题还在回答中，请等它结束后再试。',
      rateLimited: '提问太频繁，请一分钟后再试。',
      declined: '我只能回答和 AgentConnect 相关的问题。',
      offline: '助手暂时离线，请稍后再试。',
      failed: '出错了，请重试。'
    }
  }
}

const STRINGS: Record<string, Strings> = { en, zh }

export function t(lang: string): Strings {
  return STRINGS[lang] ?? en
}
