// Runtime registry - all supported runtimes

import type { Runtime, RuntimeConfig } from './base'
export type { Runtime, RuntimeConfig }

// Import all runtimes from individual files
import { nodejs } from './nodejs'
import { python } from './python'
import { go } from './go'
import { java } from './java'
import { ruby } from './ruby'
import { dotnet } from './dotnet'
import { php } from './php'
import { dart } from './dart'
import { cpp } from './cpp'

// Runtime registry with aliases
export const runtimes: Record<string, Runtime> = {
  // Node.js
  nodejs,
  node: nodejs,
  js: nodejs,

  // Python
  python,
  py: python,

  // Go
  go,
  golang: go,

  // Java
  java,

  // Ruby
  ruby,
  rb: ruby,

  // .NET
  dotnet,
  csharp: dotnet,
  cs: dotnet,

  // PHP
  php,

  // Dart
  dart,

  // C++
  cpp,
  'c++': cpp,
}

export function getRuntime(name: string): Runtime | undefined {
  return runtimes[name.toLowerCase()]
}

export function getAllRuntimes(): Runtime[] {
  // Return unique runtimes (no aliases)
  const seen = new Set<string>()
  return Object.values(runtimes).filter((r) => {
    if (seen.has(r.name)) return false
    seen.add(r.name)
    return true
  })
}

export function getRuntimeNames(): string[] {
  return Object.keys(runtimes)
}
