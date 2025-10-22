export async function takeFirstFulfilled<T>(promises: Promise<T>[]): Promise<{
  result: T
  index: number
}> {
  const errors: any[] = []

  return new Promise<{
    result: T
    index: number
  }>((resolve, reject) => {
    let rejectionCount = 0

    promises.forEach(async (promise, index) => {
      try {
        const result = await promise
        resolve({
          result,
          index,
        })
      } catch (err) {
        errors[index] = err
        rejectionCount++
        if (rejectionCount === promises.length) {
          const msgs = `${errors.map((x) => x.toString()).join('\n\n')}`
          reject(new Error(`All promises were rejected: ${msgs}`))
        }
      }
    })
  })
}
