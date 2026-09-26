// Page feedback into GitHub Discussions, from Fumadocs' own docs (apps/docs/lib/github.ts) as its guide suggests, on
// @octokit/core + @octokit/auth-app rather than the all-in-one octokit, which added about 1 MB gzip to the Worker.
// Needs a GitHub App installed on the repository with Discussions write access: GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY.
import { createAppAuth } from '@octokit/auth-app'
import { Octokit } from '@octokit/core'
import { pageFeedback, type ActionResponse, type PageFeedback } from '@/components/feedback/schema'
import { channel } from '@/lib/channel'

export const repo = 'docs'
export const owner = 'agentconnect-md'
// Each channel has its own category, since both serve the same paths; nothing posted names the channel's host.
export const DocsCategory = channel.id === 'prod' ? 'Docs Feedback' : `Docs Feedback (${channel.id})`

let instance: Octokit | undefined

async function getOctokit(): Promise<Octokit> {
  if (instance) return instance
  const appId = process.env.GITHUB_APP_ID
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY

  if (!appId || !privateKey) {
    throw new Error('No GitHub keys provided for Github app, docs feedback feature will not work.')
  }

  const app = new Octokit({ authStrategy: createAppAuth, auth: { appId, privateKey } })

  const { data } = await app.request('GET /repos/{owner}/{repo}/installation', {
    owner,
    repo,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })

  instance = new Octokit({ authStrategy: createAppAuth, auth: { appId, privateKey, installationId: data.id } })
  return instance
}

interface RepositoryInfo {
  id: string
  discussionCategories: {
    nodes: {
      id: string
      name: string
    }[]
  }
}

let cachedDestination: RepositoryInfo | undefined
async function getFeedbackDestination() {
  if (cachedDestination) return cachedDestination
  const octokit = await getOctokit()

  const {
    repository
  }: {
    repository: RepositoryInfo
  } = await octokit.graphql(`
  query {
    repository(owner: "${owner}", name: "${repo}") {
      id
      discussionCategories(first: 25) {
        nodes { id name }
      }
    }
  }
`)

  return (cachedDestination = repository)
}

export async function onPageFeedbackAction(feedback: PageFeedback): Promise<ActionResponse> {
  'use server'
  feedback = pageFeedback.parse(feedback)
  const url = new URL(feedback.url)

  // A failure is logged rather than thrown, so the reader still gets the thank-you instead of an error page.
  try {
    return await createDiscussionThread(url.pathname, `[${feedback.opinion}] ${feedback.message}\n\n> Forwarded from user feedback.`)
  } catch (err) {
    console.error('docs feedback:', err)
    return {}
  }
}

async function createDiscussionThread(pageId: string, body: string) {
  const octokit = await getOctokit()
  const destination = await getFeedbackDestination()
  const category = destination.discussionCategories.nodes.find((category) => category.name === DocsCategory)

  if (!category) throw new Error(`Please create a "${DocsCategory}" category in GitHub Discussion`)

  const title = `Feedback for ${pageId}`
  const queryResult: {
    search: {
      nodes: { id: string; title: string; url: string; category: { id: string } }[]
    }
  } = await octokit.graphql(`
          query {
            search(type: DISCUSSION, query: ${JSON.stringify(`"${title}" in:title repo:${owner}/${repo} author:@me`)}, first: 10) {
              nodes {
                ... on Discussion { id, title, url, category { id } }
              }
            }
          }`)

  // Titles repeat across channels, so the page's thread is the one in this channel's category.
  const discussion = queryResult.search.nodes.find((item) => item.title === title && item.category.id === category.id)

  if (discussion) {
    const result: {
      addDiscussionComment: {
        comment: { id: string; url: string }
      }
    } = await octokit.graphql(`
            mutation {
              addDiscussionComment(input: { body: ${JSON.stringify(body)}, discussionId: "${discussion.id}" }) {
                comment { id, url }
              }
            }`)

    return {
      githubUrl: result.addDiscussionComment.comment.url
    }
  } else {
    const result: {
      createDiscussion: {
        discussion: { id: string; url: string }
      }
    } = await octokit.graphql(`
            mutation {
              createDiscussion(input: { repositoryId: "${destination.id}", categoryId: "${category.id}", body: ${JSON.stringify(body)}, title: ${JSON.stringify(title)} }) {
                discussion { id, url }
              }
            }`)

    return {
      githubUrl: result.createDiscussion.discussion.url
    }
  }
}
