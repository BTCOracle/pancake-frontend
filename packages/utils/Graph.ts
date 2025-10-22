type Neighbor<V, E> = {
  node: V
  edges: { edge: E; cost: number }[]
}
type Path<E> = { vertexKey: string; cost: number; path: string[]; edges: E[] }

export class Graph<V, E> {
  private adjacencyMap: Map<string, Neighbor<V, E>[]> = new Map()

  private vertexMap: Map<string, V> = new Map()

  private getVertexKey: (vertex: V) => string

  constructor(getVertexKey: (vertex: V) => string) {
    this.getVertexKey = getVertexKey
  }

  addVertex(vertex: V): void {
    const key = this.getVertexKey(vertex)
    if (!this.adjacencyMap.has(key)) {
      this.adjacencyMap.set(key, [])
      this.vertexMap.set(key, vertex)
    }
  }

  addEdge(from: V, to: V, edge: E, cost: number = 1): void {
    this.addVertex(from)
    this.addVertex(to)

    const fromKey = this.getVertexKey(from)
    const neighbors = this.adjacencyMap.get(fromKey)!

    const existingNeighbor = neighbors.find((n) => this.getVertexKey(n.node) === this.getVertexKey(to))
    if (existingNeighbor) {
      existingNeighbor.edges.push({ edge, cost })
    } else {
      neighbors.push({
        node: to,
        edges: [{ edge, cost }],
      })
    }
  }

  findPaths(
    from: V,
    to: V,
    type: 'dijkstra' | 'dfs' = 'dijkstra',
    maxHops: number = Infinity,
  ): { path: V[]; edges: E[]; totalCost: number }[] {
    switch (type) {
      case 'dijkstra':
        return this.dijkstra(from, to, maxHops)
      case 'dfs':
        return this.dfsAllPaths(from, to, maxHops)
      default:
        throw new Error(`Unsupported algorithm type: ${type}`)
    }
  }

  private dfsAllPaths(from: V, to: V, maxHops: number): { path: V[]; edges: E[]; totalCost: number }[] {
    const fromKey = this.getVertexKey(from)
    const toKey = this.getVertexKey(to)

    const results: { path: V[]; edges: E[]; totalCost: number }[] = []
    const visited = new Set<string>()

    const dfs = (currentKey: string, path: string[], edges: E[], cost: number) => {
      if (path.length > maxHops + 1) return

      if (currentKey === toKey) {
        results.push({
          path: path.map((key) => this.vertexMap.get(key)!),
          edges: [...edges],
          totalCost: cost,
        })
        return
      }

      visited.add(currentKey)

      const neighbors = this.adjacencyMap.get(currentKey) || []
      for (const neighbor of neighbors) {
        const neighborKey = this.getVertexKey(neighbor.node)
        if (!visited.has(neighborKey)) {
          for (const { edge, cost: edgeCost } of neighbor.edges) {
            dfs(neighborKey, [...path, neighborKey], [...edges, edge], cost + edgeCost)
          }
        }
      }

      visited.delete(currentKey)
    }

    dfs(fromKey, [fromKey], [], 0)

    return results
  }

  private dijkstra(from: V, to: V, maxHops: number): { path: V[]; edges: E[]; totalCost: number }[] {
    const fromKey = this.getVertexKey(from)
    const toKey = this.getVertexKey(to)

    const bestCost = new Map<string, number>()
    const queue: Path<E>[] = [{ vertexKey: fromKey, cost: 0, path: [fromKey], edges: [] }]
    const results: Path<E>[] = []

    while (queue.length > 0) {
      queue.sort((a, b) => a.cost - b.cost)
      const current = queue.shift()!

      if ((bestCost.get(current.vertexKey) ?? Infinity) < current.cost) continue
      bestCost.set(current.vertexKey, current.cost)

      if (current.vertexKey === toKey && current.path.length <= maxHops + 1) {
        results.push(current)
        continue
      }

      if (current.path.length > maxHops + 1) continue

      const neighbors = this.adjacencyMap.get(current.vertexKey) || []

      for (const neighbor of neighbors) {
        const neighborKey = this.getVertexKey(neighbor.node)

        for (const { edge, cost } of neighbor.edges) {
          const newCost = current.cost + cost
          if ((bestCost.get(neighborKey) ?? Infinity) > newCost) {
            queue.push({
              vertexKey: neighborKey,
              cost: newCost,
              path: [...current.path, neighborKey],
              edges: [...current.edges, edge],
            })
          }
        }
      }
    }

    return results.map((res) => ({
      path: res.path.map((key) => this.vertexMap.get(key)!),
      edges: res.edges,
      totalCost: res.cost,
    }))
  }
}
