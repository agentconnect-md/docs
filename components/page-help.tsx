import { CircleAlert, SquarePen } from 'lucide-react'
import { Feedback } from '@/components/feedback/client'
import { cn } from '@/lib/cn'
import { onPageFeedbackAction } from '@/lib/github'

const link = 'inline-flex items-center gap-2 transition-colors hover:text-fd-accent-foreground [&_svg]:size-4'

// The page's rating, then links to edit it and to report a problem with it.
export function PageHelp({
  editUrl,
  issueUrl,
  labels,
  className
}: {
  editUrl: string
  issueUrl: string
  labels: { editPage: string; reportIssue: string }
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-4 text-sm', className)}>
      {/* The question takes its own line, with the two ratings side by side under it. */}
      <Feedback onSendAction={onPageFeedbackAction} className="border-0 py-0 [&>div:first-child>p]:basis-full" />
      <div className="flex flex-col gap-2 text-fd-muted-foreground">
        <a href={editUrl} target="_blank" rel="noreferrer noopener" className={link}>
          <SquarePen />
          {labels.editPage}
        </a>
        <a href={issueUrl} target="_blank" rel="noreferrer noopener" className={link}>
          <CircleAlert />
          {labels.reportIssue}
        </a>
      </div>
    </div>
  )
}
