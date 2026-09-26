import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'
import { uiTranslations } from 'fumadocs-ui/i18n'
import { openapiTranslations } from 'fumadocs-openapi/i18n'
import { zhCN } from '@fumadocs/language/zh-cn'
import { Logo } from '@/components/logo'
import { ThemeMenu } from '@/components/theme-menu'
import { i18n, localePath } from './i18n'

export const translations = i18n
  .translations()
  .extend(uiTranslations())
  .extend(openapiTranslations())
  .preset('zh', zhCN())
  .add({ en: { displayName: 'English' } })

// Used by the mobile top bar; on desktop the site header carries brand and theme, and the footer carries language.
export function baseOptions(lang: string): BaseLayoutProps {
  return {
    nav: {
      title: <Logo />,
      url: localePath(lang, '/'),
      // The mobile top bar gets the same single-icon theme menu as the desktop header.
      children: (
        <div className="flex justify-end md:hidden">
          <ThemeMenu />
        </div>
      )
    },
    // Neither the sidebar nor the drawer carries language or theme controls.
    i18n: false,
    themeSwitch: { enabled: false }
  }
}
