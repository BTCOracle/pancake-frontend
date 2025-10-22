import { ChakraProvider } from '@chakra-ui/react'
import { Global } from '@emotion/react'
import { dark, light, UIKitProvider } from '@pancakeswap/uikit'
import { type FC, type ReactNode } from 'react'
import { ThemeProvider as NextThemeProvider, useTheme as useNextTheme } from 'next-themes'
import { colors } from '@/theme/cssVariables'
import { theme } from '../theme'

const StyledUIKitProvider: React.FC<React.PropsWithChildren> = ({ children, ...props }) => {
  const { resolvedTheme } = useNextTheme()

  return (
    <UIKitProvider theme={resolvedTheme === 'dark' ? dark : light} {...props}>
      {children}
    </UIKitProvider>
  )
}

const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <NextThemeProvider storageKey="pcs-theme">
      <StyledUIKitProvider>
        <ChakraProvider theme={theme}>
          {/* through object's styles's global can't inject multi font-face */}
          <Global
            styles={`
        html,
        body,
        #__next,
        .app {
          overflow: hidden; /* ensure web app's scrollbar will never exist*/
          height: 100%;
        }
        :root,body {
          --global-font-family: Kanit, 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
            'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
            'Segoe UI Symbol';
          font-family: var(--global-font-family);
          font-feature-settings: 'ss04', 'tnum' 1;
          --chakra-fonts-heading: var(--global-font-family);
          --chakra-fonts-body: var(--global-font-family);
          --chakra-fonts-mono: var(--global-font-family);
          font-size: 16px;
          
          background: ${colors.backgroundApp};
          background-attachment: fixed;
          color: ${colors.textPrimary}
        }
        * {
          box-sizing: border-box;
          outline: none !important; /* without !important, the priority is not high enough */
          --chakra-shadows-outline: none !important;
          /* user-select: none; disable user-select so it is like a web app not web document */
        }
        input {
          font-weight: inherit;
        }

        input[type='number']::-webkit-outer-spin-button,
        input[type='number']::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        /* Firefox */
        input[type='number'] {
          -moz-appearance: textfield;
        }
        .chakra-icon {
          vertical-align: middle;
          line-height: 1;
        }
        div,section {
          ::-webkit-scrollbar {
            width: 6px;
          }
        }
        `}
          />
          {children}
        </ChakraProvider>
      </StyledUIKitProvider>
    </NextThemeProvider>
  )
}

export default ThemeProvider
