'use client'
// Fumadocs' Ask AI panel (`@fumadocs/cli add ai/openrouter`, MIT), served by /api/chat and rendering text parts only.
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  type SyntheticEvent,
  use,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState
} from 'react'
import { flushSync } from 'react-dom'
import { Loader2, MessageCircleIcon, RefreshCw, Send, X } from 'lucide-react'
import { useChat, type UseChatHelpers } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { BASE_PATH } from '@/base-path.mjs'
import { cn } from '@/lib/cn'
import type { Strings } from '@/lib/strings'
import { buttonVariants } from '../ui/button'
import { Markdown } from '../markdown'

export type AskAiLabels = Strings['askAi']

export type ChatUIMessage = UIMessage<never, { client: { location: string } }>

const Context = createContext<{
  open: boolean
  setOpen: (open: boolean) => void
  chat: UseChatHelpers<ChatUIMessage>
  labels: AskAiLabels
} | null>(null)

export function AISearchPanelHeader({ className, ...props }: ComponentProps<'div'>) {
  const { setOpen, labels } = useAISearchContext()

  return (
    <div
      className={cn('sticky top-0 flex items-start gap-2 rounded-xl border bg-fd-secondary text-fd-secondary-foreground shadow-sm', className)}
      {...props}
    >
      <div className="flex-1 px-3 py-2">
        <p className="mb-2 text-sm font-medium">{labels.title}</p>
        <p className="text-xs text-fd-muted-foreground">{labels.disclaimer}</p>
      </div>

      <button
        aria-label={labels.close}
        tabIndex={-1}
        className={cn(buttonVariants({ size: 'icon-sm', variant: 'ghost', className: 'rounded-full text-fd-muted-foreground' }))}
        onClick={() => setOpen(false)}
      >
        <X />
      </button>
    </div>
  )
}

export function AISearchInputActions() {
  const { chat, labels } = useAISearchContext()
  const { messages, status, setMessages, regenerate } = chat
  const isLoading = status === 'streaming' || status === 'submitted'

  if (messages.length === 0) return null

  return (
    <>
      {!isLoading && messages.at(-1)?.role === 'assistant' && (
        <button
          type="button"
          className={cn(buttonVariants({ variant: 'secondary', size: 'sm', className: 'gap-1.5 rounded-full' }))}
          onClick={() => regenerate()}
        >
          <RefreshCw className="size-4" />
          {labels.retry}
        </button>
      )}
      <button
        type="button"
        className={cn(buttonVariants({ variant: 'secondary', size: 'sm', className: 'rounded-full' }))}
        onClick={() => setMessages([])}
      >
        {labels.clear}
      </button>
    </>
  )
}

const StorageKeyInput = '__ai_search_input'

function readDraft(): string {
  try {
    return localStorage.getItem(StorageKeyInput) ?? ''
  } catch {
    return ''
  }
}

function writeDraft(value: string) {
  try {
    if (value) localStorage.setItem(StorageKeyInput, value)
    else localStorage.removeItem(StorageKeyInput)
  } catch {}
}

export function AISearchInput(props: ComponentProps<'form'>) {
  const { chat, labels } = useAISearchContext()
  const { status, sendMessage, stop } = chat
  const [input, setInput] = useState(readDraft)
  const isLoading = status === 'streaming' || status === 'submitted'
  const onStart = (e?: SyntheticEvent) => {
    e?.preventDefault()
    const message = input.trim()
    if (message.length === 0) return

    void sendMessage({
      role: 'user',
      parts: [
        { type: 'data-client', data: { location: location.href } },
        { type: 'text', text: message }
      ]
    })
    setInput('')
    writeDraft('')
  }

  useEffect(() => {
    if (isLoading) document.getElementById('nd-ai-input')?.focus()
  }, [isLoading])

  return (
    <form {...props} className={cn('flex items-start pe-2', props.className)} onSubmit={onStart}>
      <Input
        value={input}
        placeholder={isLoading ? labels.answering : labels.placeholder}
        autoFocus
        className="p-3"
        disabled={isLoading}
        onChange={(e) => {
          setInput(e.target.value)
          writeDraft(e.target.value)
        }}
        onKeyDown={(event) => {
          // keyCode 229: Safari fires `compositionend` before this keydown, so `isComposing` is already false.
          if (event.nativeEvent.isComposing || event.keyCode === 229) return
          if (!event.shiftKey && event.key === 'Enter') onStart(event)
        }}
      />
      {isLoading ? (
        <button
          key="bn"
          type="button"
          className={cn(buttonVariants({ variant: 'secondary', className: 'mt-2 gap-2 rounded-full transition-all' }))}
          onClick={stop}
        >
          <Loader2 className="size-4 animate-spin text-fd-muted-foreground" />
          {labels.stop}
        </button>
      ) : (
        <button
          key="bn"
          type="submit"
          aria-label={labels.send}
          className={cn(buttonVariants({ variant: 'default', className: 'mt-2 rounded-full transition-all' }))}
          disabled={input.length === 0}
        >
          <Send className="size-4" />
        </button>
      )}
    </form>
  )
}

function List(props: Omit<ComponentProps<'div'>, 'dir'>) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    function callback() {
      const container = containerRef.current
      if (!container) return
      container.scrollTo({ top: container.scrollHeight, behavior: 'instant' })
    }

    const observer = new ResizeObserver(callback)
    callback()
    const element = containerRef.current?.firstElementChild
    if (element) observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} {...props} className={cn('fd-scroll-container flex min-w-0 flex-col overflow-y-auto', props.className)}>
      {props.children}
    </div>
  )
}

function Input(props: ComponentProps<'textarea'>) {
  const shared = cn('col-start-1 row-start-1', props.className)

  return (
    <div className="grid flex-1">
      <textarea
        id="nd-ai-input"
        {...props}
        className={cn('resize-none bg-transparent placeholder:text-fd-muted-foreground focus-visible:outline-none', shared)}
      />
      <div className={cn(shared, 'invisible break-all')}>{`${props.value?.toString() ?? ''}\n`}</div>
    </div>
  )
}

function Pending({ label }: { label: string }) {
  return (
    <p className="flex items-center gap-2 text-sm text-fd-muted-foreground">
      <Loader2 className="size-3.5 animate-spin" />
      {label}
    </p>
  )
}

function Role({ role, labels }: { role: string; labels: AskAiLabels }) {
  return (
    <p className={cn('mb-1 text-sm font-medium text-fd-muted-foreground', role === 'assistant' && 'text-fd-primary')}>
      {role === 'user' ? labels.you : 'AgentConnect'}
    </p>
  )
}

// Only text is shown: the stream's reasoning, tool, plan and notice parts stay out of the panel.
function Message({ message, pending, ...props }: { message: ChatUIMessage; pending: boolean } & ComponentProps<'div'>) {
  const { labels } = useAISearchContext()
  const markdown = message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('')

  return (
    <div onClick={(e) => e.stopPropagation()} {...props}>
      <Role role={message.role} labels={labels} />
      {markdown ? (
        <div className="prose text-sm">
          <Markdown text={markdown} />
        </div>
      ) : (
        pending && <Pending label={labels.thinking} />
      )}
    </div>
  )
}

// The route answers `{ error }` codes; `useChat` surfaces the body as the error message.
function errorText(error: Error, labels: AskAiLabels): string {
  let code: unknown
  try {
    code = (JSON.parse(error.message) as { error?: unknown }).error
  } catch {}
  if (code === 'disabled') return labels.errors.disabled
  if (code === 'busy') return labels.errors.busy
  if (code === 'rate_limited') return labels.errors.rateLimited
  return labels.errors.failed
}

// One handle per panel, living exactly as long as its in-memory history; the route keys this tab's conversation by it.
function tabHandle(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export function AISearch({ labels, children }: { labels: AskAiLabels; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [tab] = useState(tabHandle)
  const chat = useChat<ChatUIMessage>({
    id: 'search',
    transport: new DefaultChatTransport({ api: `${BASE_PATH}/api/chat`, body: { tab } })
  })

  return <Context value={useMemo(() => ({ chat, open, setOpen, labels }), [chat, open, labels])}>{children}</Context>
}

export function AISearchTrigger({
  position = 'default',
  className,
  ...props
}: ComponentProps<'button'> & { position?: 'default' | 'float' }) {
  const { open, setOpen } = useAISearchContext()

  return (
    <button
      data-state={open ? 'open' : 'closed'}
      className={cn(
        position === 'float' && [
          'fixed inset-e-[calc(--spacing(4)+var(--removed-body-scroll-bar-size,0px))] bottom-4 z-20 gap-3 shadow-lg transition-[translate,opacity]',
          open && 'translate-y-10 opacity-0'
        ],
        className
      )}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {props.children}
    </button>
  )
}

export function AISearchPanel() {
  const { open, setOpen } = useAISearchContext()
  const [actualOpen, setActualOpen] = useState(open)
  useHotKey()

  if (open && !actualOpen) setActualOpen(open)

  return (
    <>
      <style>
        {`
        @keyframes ask-ai-open {
          from { translate: 100% 0; }
          to { translate: 0 0; }
        }
        @keyframes ask-ai-close {
          from { width: var(--ai-chat-width); }
          to { width: 0px; }
        }`}
      </style>
      {actualOpen && (
        <div
          className={cn('fixed inset-0 z-30 bg-fd-overlay backdrop-blur-xs lg:hidden', open ? 'animate-fd-fade-in' : 'animate-fd-fade-out')}
          onClick={() => setOpen(false)}
          onAnimationEnd={() => {
            if (!open) flushSync(() => setActualOpen(false))
          }}
        />
      )}
      {actualOpen && (
        <div
          className={cn(
            'z-30 overflow-hidden bg-fd-card text-fd-card-foreground [--ai-chat-width:400px] 2xl:[--ai-chat-width:460px]',
            'max-lg:fixed max-lg:inset-x-2 max-lg:inset-y-4 max-lg:rounded-2xl max-lg:border max-lg:shadow-xl',
            // Below the site header, which Fumadocs knows as its banner.
            'lg:sticky lg:top-(--fd-banner-height) lg:ms-auto lg:h-[calc(100dvh-var(--fd-banner-height))] lg:border-s lg:in-[#nd-docs-layout]:[grid-area:toc]',
            open ? 'animate-fd-dialog-in lg:animate-[ask-ai-open_200ms]' : 'animate-fd-dialog-out lg:animate-[ask-ai-close_200ms]'
          )}
          onAnimationEnd={() => {
            if (!open) flushSync(() => setActualOpen(false))
          }}
        >
          <div className="flex size-full flex-col p-2 lg:w-(--ai-chat-width) lg:p-3">
            <AISearchPanelHeader />
            <AISearchPanelList className="flex-1" />
            <div className="rounded-xl border bg-fd-secondary text-fd-secondary-foreground shadow-sm has-focus-visible:shadow-md">
              <AISearchInput />
              <div className="flex items-center gap-1.5 p-1 empty:hidden">
                <AISearchInputActions />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function AISearchPanelList({ className, style, ...props }: ComponentProps<'div'>) {
  const { chat, labels } = useAISearchContext()
  const messages = chat.messages.filter((msg) => msg.role !== 'system')
  const busy = chat.status === 'streaming' || chat.status === 'submitted'
  const last = messages.at(-1)

  return (
    <List
      className={cn('overscroll-contain py-4', className)}
      style={{
        maskImage: 'linear-gradient(to bottom, transparent, white 1rem, white calc(100% - 1rem), transparent 100%)',
        ...style
      }}
      {...props}
    >
      {messages.length === 0 ? (
        <div className="flex size-full flex-col items-center justify-center gap-2 text-center text-sm text-fd-muted-foreground/80">
          <MessageCircleIcon fill="currentColor" stroke="none" />
          <p onClick={(e) => e.stopPropagation()}>{labels.empty}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 px-3">
          {messages.map((item) => (
            <Message key={item.id} message={item} pending={busy && item === last} />
          ))}
          {busy && last?.role === 'user' && (
            <div>
              <Role role="assistant" labels={labels} />
              <Pending label={labels.thinking} />
            </div>
          )}
          {chat.error && (
            <p className="rounded-lg border bg-fd-secondary p-2 text-sm text-fd-secondary-foreground">{errorText(chat.error, labels)}</p>
          )}
        </div>
      )}
    </List>
  )
}

export function useHotKey() {
  const { open, setOpen } = useAISearchContext()

  const onKeyPress = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      setOpen(false)
      e.preventDefault()
    }

    if (e.key === '/' && (e.metaKey || e.ctrlKey) && !open) {
      setOpen(true)
      e.preventDefault()
    }
  })

  useEffect(() => {
    window.addEventListener('keydown', onKeyPress)
    return () => window.removeEventListener('keydown', onKeyPress)
  }, [])
}

export function useAISearchContext() {
  return use(Context)!
}

// The whole panel as the site mounts it: Fumadocs' floating trigger beside the panel.
export function AskAi({ labels }: { labels: AskAiLabels }) {
  return (
    <AISearch labels={labels}>
      <AISearchPanel />
      <AISearchTrigger
        position="float"
        className={cn(buttonVariants({ variant: 'secondary', className: 'rounded-2xl text-fd-muted-foreground' }))}
      >
        <MessageCircleIcon className="size-4.5" />
        {labels.trigger}
      </AISearchTrigger>
    </AISearch>
  )
}
