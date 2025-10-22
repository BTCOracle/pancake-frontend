const ENABLED = process.env.NODE_ENV === 'development'
export class RemoteLogger {
  private logs: string[] = []

  private id: string = ''

  private createTime = new Date().getTime()

  constructor(_id: string) {
    this.id = _id
  }

  debug(log: string, indent: number = 0) {
    if (ENABLED && this.id !== '__dummy__') {
      const indentStr = '  '.repeat(indent)
      this.logs.push(`${indentStr}${log}`)
    }
  }

  metric(log: string, indent: number = 0) {
    if (ENABLED && this.id !== '__dummy__') {
      const indentStr = '  '.repeat(indent)
      const time = new Date().getTime() - this.createTime
      this.logs.push(`[${time}ms]${indentStr}${log}`)
    }
  }

  debugJson(obj: any, indent: number = 0) {
    if (ENABLED && this.id !== '__dummy__') {
      try {
        const str = JSON.stringify(obj, (_, value) => (typeof value === 'bigint' ? value.toString() : value), 2)
        const lines = str.split('\n')
        const indentStr = '  '.repeat(indent)
        const logs = lines.map((line) => `${indentStr}${line}`)
        this.logs.push(...logs)
      } catch (e) {
        this.logs.push(`Error in json, ${e}`)
      }
    }
  }

  async flush() {
    if (ENABLED && this.id !== '__dummy__') {
      try {
        // eslint-disable-next-line no-restricted-globals
        const origin = self.origin || window.location.origin
        await fetch(`${origin}/api/logger`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: this.id,
            logs: this.logs,
          }),
        })
      } catch (ex) {
        // Do nothing
      }
    }
  }

  private static __loggers = new Map<string, RemoteLogger>()

  public static getLogger(id?: string) {
    if (!id) {
      return new RemoteLogger('__dummy__')
    }
    if (!RemoteLogger.__loggers.has(id)) {
      RemoteLogger.__loggers.set(id, new RemoteLogger(id))
    }
    return RemoteLogger.__loggers.get(id)!
  }

  public static generateUniqId(topic: string) {
    const t = new Date().getTime()
    const rnd = Math.floor(Math.random() * 1000000)
    return `${topic}-${t}-${rnd}`
  }
}
