const isProd = process.env.NODE_ENV === 'production'
export class Debugger {
  // eslint-disable-next-line no-useless-constructor
  private constructor(private name: string) {}

  public debug(...args: unknown[]) {
    if (isProd) {
      return
    }
    console.debug(`%c[${this.name}]`, 'color: blue;font-weight: bold;', ...args)
  }

  static create(name: string) {
    return new Debugger(name)
  }
}
