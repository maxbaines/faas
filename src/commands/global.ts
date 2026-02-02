// Global install command - install faas globally

import { resolve } from 'path'
import logger from '../utils/logger'
import { exec, execStream } from '../utils/shell'

const INSTALL_PATH = '/usr/local/bin/faas'

export async function global(): Promise<boolean> {
  logger.title('Installing FAAS globally')

  // Get the path to the current executable
  const currentExe = process.execPath

  // Check if we're running from a compiled binary
  if (!currentExe || currentExe.includes('bun')) {
    logger.error('This command must be run from the compiled binary')
    logger.info('First build the binary with: bun run build')
    logger.info('Then run: ./dist/faas global')
    return false
  }

  logger.step(`Installing to ${INSTALL_PATH}...`)

  // Check if we have write access (need sudo)
  const testResult = await exec('test', ['-w', '/usr/local/bin'])
  const needsSudo = !testResult.success

  if (needsSudo) {
    logger.info('Requires sudo for /usr/local/bin')
    const exitCode = await execStream('sudo', ['cp', currentExe, INSTALL_PATH])
    if (exitCode !== 0) {
      logger.error('Failed to install globally')
      return false
    }
    await execStream('sudo', ['chmod', '+x', INSTALL_PATH])
  } else {
    const { copyFile, chmod } = await import('fs/promises')
    await copyFile(currentExe, INSTALL_PATH)
    await chmod(INSTALL_PATH, 0o755)
  }

  logger.newline()
  logger.success('FAAS installed globally!')
  logger.newline()
  logger.info('You can now run faas from anywhere:')
  logger.dim('  faas --version')
  logger.dim('  faas doctor')
  logger.dim('  faas nodejs hello')
  logger.newline()

  return true
}

export async function uninstall(): Promise<boolean> {
  logger.title('Uninstalling FAAS')

  const { existsSync } = await import('fs')
  if (!existsSync(INSTALL_PATH)) {
    logger.warn('FAAS is not installed globally')
    return true
  }

  logger.step(`Removing ${INSTALL_PATH}...`)

  const testResult = await exec('test', ['-w', '/usr/local/bin'])
  const needsSudo = !testResult.success

  if (needsSudo) {
    const exitCode = await execStream('sudo', ['rm', INSTALL_PATH])
    if (exitCode !== 0) {
      logger.error('Failed to uninstall')
      return false
    }
  } else {
    const { rm } = await import('fs/promises')
    await rm(INSTALL_PATH)
  }

  logger.newline()
  logger.success('FAAS uninstalled!')
  logger.newline()

  return true
}

export default global
