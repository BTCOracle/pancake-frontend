import { Flag, flag } from 'flags/next'
import { EXPERIMENTAL_FEATURES, EXPERIMENTAL_FEATURE_CONFIGS } from 'config/experimentalFeatures'
import { ExtendedNextReq } from 'middlewares/types'
import { getOverrides } from 'feature-flags'
import { RequestCookies } from '@edge-runtime/cookies'
import { ReadonlyRequestCookies, RequestCookiesAdapter } from 'feature-flags/libs/request-cookies'

// Helper function to get feature config by feature key
const getFeatureConfig = (feature: EXPERIMENTAL_FEATURES) => {
  return EXPERIMENTAL_FEATURE_CONFIGS.find((config) => config.feature === feature)
}

// Helper function to generate deterministic result for a user for a given feature
// This uses the same logic as the original ab-test-middleware
const getFeatureAccess = async (userIdentifier: string, feature: EXPERIMENTAL_FEATURES): Promise<boolean> => {
  const config = getFeatureConfig(feature)
  if (!config) return false

  // Check whitelist first
  if (config.whitelist.includes(userIdentifier)) return true

  // Use deterministic hashing based on user identifier and feature
  const msgBuffer = new TextEncoder().encode(`${userIdentifier}-${feature}`)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const bufferArray = new Uint8Array(hashBuffer)
  const lastByte = bufferArray[bufferArray.length - 1]

  return lastByte <= config.percentage * 0xff
}

// Helper function to extract user identifier from request
const getUserIdentifier = (request: any): string => {
  // Try different ways to get user identifier
  return request?.clientId || 'anonymous'
}

// Helper function to create a feature flag for any experimental feature
const createFeatureFlag = (feature: EXPERIMENTAL_FEATURES) => {
  return flag({
    identify: () => feature,
    key: feature,
    async decide(request) {
      const userIdentifier = getUserIdentifier(request)
      return getFeatureAccess(userIdentifier, feature)
    },
  })
}

// Dynamically generate flags for all experimental features
export const flags = EXPERIMENTAL_FEATURE_CONFIGS.reduce((acc, config) => {
  return {
    ...acc,
    [config.feature]: createFeatureFlag(config.feature),
  }
}, {} as Record<EXPERIMENTAL_FEATURES, Flag<boolean, EXPERIMENTAL_FEATURES>>)

function sealCookies(headers: Headers): ReadonlyRequestCookies {
  const sealed = RequestCookiesAdapter.seal(new RequestCookies(headers))
  return sealed
}

// Get experimental feature access using the new flags SDK
export const getExperimentalFeatureAccessList = async (
  request: ExtendedNextReq,
): Promise<Array<{ feature: EXPERIMENTAL_FEATURES; hasAccess: boolean }>> => {
  const readonlyCookies = sealCookies(request.headers)

  const overrides = await getOverrides(readonlyCookies.get('vercel-flag-overrides')?.value)

  const flagEvaluations = await Promise.all(
    Object.entries(flags).map(async ([feature, flagFunction]) => {
      try {
        if (overrides && overrides[feature] !== undefined) {
          return { feature: feature as EXPERIMENTAL_FEATURES, hasAccess: overrides[feature] as boolean }
        }

        // Pass the adapted request object to the flag function
        const hasAccess = await flagFunction(request as any)

        return { feature: feature as EXPERIMENTAL_FEATURES, hasAccess }
      } catch (error) {
        console.error(`Error evaluating flag ${feature}:`, error)
        return { feature: feature as EXPERIMENTAL_FEATURES, hasAccess: false }
      }
    }),
  )

  return flagEvaluations
}
