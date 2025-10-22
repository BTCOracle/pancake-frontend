export interface BasePerf {
  perf: Record<string, number>
  flags: Record<string, boolean>
  error: string
}

type BaseTrackKey = 'success' | 'fail' | 'start' | 'duration'
type ExtendTrackKey = 'pool_success' | 'pool_error' | BaseTrackKey
/**
 * Usage:
 * const tracker = new PerfTracker<MyTraceData>('topic', initialTraceData, Date.now())
 * tracker.track('start')
 * try {
 *   // your code logic here
 *   tracker.success()
 * } catch (error) {
 *   tracker.fail(error)
 * } finally {
 *   tracker.report('your-log-key')
 * }
 */
export class PerfTracker<TTraceData extends BasePerf> {
  protected records: [ExtendTrackKey, number][] = []

  protected trace: TTraceData

  private start: number

  private async getLogger() {
    if (typeof window !== 'undefined') {
      const i = await import('utils/datadog')
      return i.getLogger(this.topic)
    }
    return {
      log: (key: string, trace: TTraceData) => {
        console.log(key, trace)
      },
    }
  }

  constructor(private topic: string, trace: TTraceData, start: number) {
    this.trace = trace
    this.start = start
  }

  public track(key: ExtendTrackKey) {
    this.records.push([key, Date.now() - this.start])
  }

  public getRecords() {
    const records: Record<string, number> = {}
    this.records.forEach(([key, value]) => {
      records[key] = value
    })
    return records as Record<ExtendTrackKey, number>
  }

  public addFlag(key: string, value: boolean) {
    this.trace.flags[key] = value
  }

  public success(_?: any) {
    this.track('success' as ExtendTrackKey)
  }

  public fail(ex: any) {
    if (ex instanceof Error) {
      this.trace.error = ex.message
    } else {
      this.trace.error = String(ex)
    }
    this.track('fail')
  }

  public async report(key: string) {
    const records = this.getRecords()
    this.trace.perf = records
    const end = this.trace.perf.success || this.trace.perf.fail
    const start = this.trace.perf.start
    const duration = end - start
    this.trace.perf.duration = duration
    const logger = await this.getLogger()
    logger.log(key, this.trace)
  }
}
