import { createMDX } from 'fumadocs-mdx/next'
import { BASE_PATH } from './base-path.mjs'

const withMDX = createMDX()

/** @type {import('next').NextConfig} */
const config = {
  basePath: BASE_PATH,
  reactStrictMode: true,
  images: { unoptimized: true }
}

export default withMDX(config)
