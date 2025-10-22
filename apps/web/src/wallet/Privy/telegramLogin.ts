'use client'

// lib/telegramLogin.ts

// Define the onTelegramAuth function in the global scope
type TelegramUser = {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

// Make sure we're properly declaring the global window interface
declare global {
  interface Window {
    onTelegramAuth: (user: TelegramUser) => Promise<void>
    Telegram?: {
      Login: {
        auth: (
          param: { bot_id: string; request_access: boolean; lang: string },
          callback: (userData: TelegramUser) => void,
        ) => void
      }
    }
  }
}

export async function loginWithTelegramViaScript(onLogin: (token: string) => void) {
  await loadTelegramScript()

  const botId = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME!

  if (!window.Telegram?.Login?.auth) return
  window.Telegram.Login.auth(
    {
      bot_id: botId,
      request_access: true,
      lang: 'en',
    },
    async (userData) => {
      if (!userData) {
        alert('Login failed or cancelled.')
        return
      }
      try {
        const res = await fetch('/api/auth/telegram-callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        })

        const data = await res.json()
        if (data.customToken) {
          onLogin(data.customToken)
        } else {
          alert('fail to login')
        }
      } catch (err) {
        console.error('Telegram login failed:', err)
      }
    },
  )
}

export function loadTelegramScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Telegram?.Login?.auth) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?7'
    script.async = true
    script.onload = () => resolve()
    script.onerror = reject
    document.body.appendChild(script)
  })
}
