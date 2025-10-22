import { snapToNext } from 'views/HomeV2/hook/useScrollToNearestSnap'

export const handleHomepageSnapDown = () => {
  if (typeof window !== 'undefined') {
    snapToNext('down', 'homepage-snap', window.innerHeight * 0.1)
  }
}
