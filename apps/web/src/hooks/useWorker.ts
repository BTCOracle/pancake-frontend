import { atom, useAtom, useAtomValue } from 'jotai'
import { useEffect, useRef, useState } from 'react'

import { WorkerInstance, createWorker } from 'utils/worker'

export const globalWorkerAtom = atom(async () => {
  const worker = await createWorker()
  return worker
})

function createUseWorkerHook(shared?: boolean) {
  return function useWorker() {
    const [worker, setWorker] = useState<WorkerInstance | undefined>()
    const workerRef = useRef<WorkerInstance | undefined>(worker)

    useEffect(() => {
      if (workerRef.current) {
        return () => {}
      }

      const abortController = new AbortController()
      async function initWorkerInstance() {
        workerRef.current = await createWorker()
        if (abortController.signal.aborted) {
          workerRef.current?.destroy()
          return
        }
        setWorker(workerRef.current)
      }
      initWorkerInstance()

      return () => {
        abortController.abort()
        workerRef.current?.destroy()
      }
    }, [setWorker])

    return worker
  }
}

export const useWorker = createUseWorkerHook(false)

export const useInitGlobalWorker = () => {
  useAtomValue(globalWorkerAtom)
}
