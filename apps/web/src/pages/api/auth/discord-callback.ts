import { getAuth } from 'firebase-admin/auth'
import { firebaseAdmin } from 'lib/firebase-admin'
import type { NextApiRequest, NextApiResponse } from 'next'

const MAX_STATE_LENGTH = 21
const stateRegex = /^[a-zA-Z0-9_-]+$/

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { code, state } = req.query

  if (!code || typeof code !== 'string' || !state || typeof state !== 'string') {
    res.status(400).json({ error: 'Invalid code or state' })
    return
  }

  if (state.length > MAX_STATE_LENGTH) {
    res.status(400).json({ error: 'State parameter too long' })
    return
  }

  if (!stateRegex.test(state)) {
    // only allow alphanumeric + underscore
    res.status(400).json({ error: 'Invalid state format' })
    return
  }

  try {
    // 1. Exchange authorization code for access token
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI!,
    })

    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    })

    const tokenData = await tokenRes.json()
    const { access_token: accessToken } = tokenData

    // 2. Retrieve Discord user information
    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const userData = await userRes.json()
    const discordId = userData.id

    // 3. Issue Firebase custom token
    await firebaseAdmin() // Ensure Admin SDK is initialized
    const customToken = await getAuth().createCustomToken(`discord:${discordId}`)

    // 4. Return token to frontend via postMessage
    res.setHeader('Content-Type', 'text/html')
    res.end(`
      <!DOCTYPE html>
  <html lang="zh-TW">
    <head>
      <meta charset="UTF-8" />
      <title>Login success</title>
    </head>
    <body>
      <script>
        document.addEventListener('DOMContentLoaded', function () {
          const token = "${customToken}";
          const state = "${state}";
          const origin = "${process.env.NEXT_PUBLIC_FRONTEND_ORIGIN || '*'}";

          if (window.opener) {
            window.opener.postMessage({ customToken: token, state: state }, origin);
            window.close();
          } else {
            // fallback
            localStorage.setItem('discordAuthToken', token);
            localStorage.setItem('discordAuthCallbackState', state);
            document.body.innerHTML =
              '<div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; flex-direction: column;">' +
              '<h2>login success</h2>' +
              '<p>close window and return to PancakeSwap.</p>' +
              '<button onclick="window.close()" style="padding: 10px 20px; background: #1FC7D4; color: white; border: none; border-radius: 16px; cursor: pointer; margin-top: 20px;">close window</button>' +
              '</div>';
          }
        });
      </script>
    </body>
  </html>
    `)
  } catch (err) {
    console.error('[Discord callback error]:', err)
    res.status(500).json({ error: 'Discord authentication failed' })
  }
}
