/**
 * 合并工具函数 - 实现三路合并算法和冲突检测
 */

export interface ConflictMarker {
  type: 'conflict' | 'added' | 'removed' | 'unchanged'
  lineNumber: number
  content: string
  source?: 'current' | 'incoming' | 'base'
}

export interface ConflictBlock {
  id: string
  startLine: number
  endLine: number
  currentContent: string[]
  incomingContent: string[]
  baseContent?: string[]
  resolved?: boolean
  resolution?: string[]
}

export interface MergeResult {
  hasConflicts: boolean
  conflicts: ConflictBlock[]
  mergedContent: string
  stats: {
    totalLines: number
    conflictBlocks: number
    addedLines: number
    removedLines: number
  }
}

/**
 * 简单的行级差异检测
 */
function diffLines(text1: string, text2: string): { added: string[], removed: string[], unchanged: string[] } {
  const lines1 = text1.split('\n')
  const lines2 = text2.split('\n')
  
  const added: string[] = []
  const removed: string[] = []
  const unchanged: string[] = []
  
  // 简化的diff算法 - 找出不同的行
  const maxLines = Math.max(lines1.length, lines2.length)
  
  for (let i = 0; i < maxLines; i++) {
    const line1 = lines1[i] || ''
    const line2 = lines2[i] || ''
    
    if (line1 === line2) {
      unchanged.push(line1)
    } else {
      if (line1 && !lines2.includes(line1)) {
        removed.push(line1)
      }
      if (line2 && !lines1.includes(line2)) {
        added.push(line2)
      }
    }
  }
  
  return { added, removed, unchanged }
}

/**
 * 检测两个文本之间的冲突
 */
export function detectConflicts(
  baseContent: string,
  currentContent: string, 
  incomingContent: string
): MergeResult {
  const baseLines = baseContent.split('\n')
  const currentLines = currentContent.split('\n')
  const incomingLines = incomingContent.split('\n')
  
  const conflicts: ConflictBlock[] = []
  const mergedLines: string[] = []
  let conflictId = 0
  
  // 简化的三路合并
  const maxLines = Math.max(baseLines.length, currentLines.length, incomingLines.length)
  
  let i = 0
  while (i < maxLines) {
    const baseLine = baseLines[i] || ''
    const currentLine = currentLines[i] || ''
    const incomingLine = incomingLines[i] || ''
    
    // 如果三个版本都相同，或者只有base不同（说明两个分支都做了相同修改）
    if (currentLine === incomingLine) {
      mergedLines.push(currentLine)
      i++
      continue
    }
    
    // 如果当前分支没有修改，使用incoming的内容
    if (currentLine === baseLine && incomingLine !== baseLine) {
      mergedLines.push(incomingLine)
      i++
      continue
    }
    
    // 如果incoming分支没有修改，使用当前分支的内容
    if (incomingLine === baseLine && currentLine !== baseLine) {
      mergedLines.push(currentLine)
      i++
      continue
    }
    
    // 存在冲突 - 两个分支都修改了同一行
    if (currentLine !== incomingLine && currentLine !== baseLine && incomingLine !== baseLine) {
      const conflictBlock: ConflictBlock = {
        id: `conflict-${conflictId++}`,
        startLine: i,
        endLine: i,
        currentContent: [currentLine],
        incomingContent: [incomingLine],
        baseContent: [baseLine],
        resolved: false
      }
      
      // 查看是否有连续的冲突行
      let j = i + 1
      while (j < maxLines) {
        const nextBase = baseLines[j] || ''
        const nextCurrent = currentLines[j] || ''
        const nextIncoming = incomingLines[j] || ''
        
        if (nextCurrent !== nextIncoming && 
            (nextCurrent !== nextBase || nextIncoming !== nextBase)) {
          conflictBlock.endLine = j
          conflictBlock.currentContent.push(nextCurrent)
          conflictBlock.incomingContent.push(nextIncoming)
          conflictBlock.baseContent!.push(nextBase)
          j++
        } else {
          break
        }
      }
      
      conflicts.push(conflictBlock)
      
      // 在合并结果中添加冲突标记
      mergedLines.push(`<<<<<<< 当前分支`)
      mergedLines.push(...conflictBlock.currentContent)
      mergedLines.push(`=======`)
      mergedLines.push(...conflictBlock.incomingContent)
      mergedLines.push(`>>>>>>> 传入分支`)
      
      i = conflictBlock.endLine + 1
      continue
    }
    
    // 默认使用当前分支的内容
    mergedLines.push(currentLine)
    i++
  }
  
  const hasConflicts = conflicts.length > 0
  const mergedContent = mergedLines.join('\n')
  
  // 计算统计信息
  const currentDiff = diffLines(baseContent, currentContent)
  const incomingDiff = diffLines(baseContent, incomingContent)
  
  return {
    hasConflicts,
    conflicts,
    mergedContent: hasConflicts ? mergedContent : (currentContent !== baseContent ? currentContent : incomingContent),
    stats: {
      totalLines: mergedLines.length,
      conflictBlocks: conflicts.length,
      addedLines: currentDiff.added.length + incomingDiff.added.length,
      removedLines: currentDiff.removed.length + incomingDiff.removed.length
    }
  }
}

/**
 * 解决冲突 - 生成最终的合并内容
 */
export function resolveConflicts(
  originalContent: string,
  conflicts: ConflictBlock[]
): string {
  let resolvedContent = originalContent
  
  // 按行号倒序处理，避免行号偏移问题
  const sortedConflicts = [...conflicts].sort((a, b) => b.startLine - a.startLine)
  
  for (const conflict of sortedConflicts) {
    if (conflict.resolved && conflict.resolution) {
      const lines = resolvedContent.split('\n')
      
      // 找到冲突标记的开始和结束
      let startIdx = -1
      let endIdx = -1
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('<<<<<<< 当前分支')) {
          startIdx = i
        }
        if (lines[i].includes('>>>>>>> 传入分支') && startIdx !== -1) {
          endIdx = i
          break
        }
      }
      
      if (startIdx !== -1 && endIdx !== -1) {
        // 替换冲突块为解决后的内容
        lines.splice(startIdx, endIdx - startIdx + 1, ...conflict.resolution)
        resolvedContent = lines.join('\n')
      }
    }
  }
  
  return resolvedContent
}

/**
 * 检查内容是否包含未解决的冲突标记
 */
export function hasUnresolvedConflicts(content: string): boolean {
  return content.includes('<<<<<<< ') || 
         content.includes('=======') || 
         content.includes('>>>>>>> ')
}
