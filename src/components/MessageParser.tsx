'use client'

import React from 'react'

interface ParsedMessageProps {
  content: string
  role: 'user' | 'assistant'
  messageKind?: 'speech' | 'action' | 'narration'
}

interface StructuredResponse {
  status: {
    date: string
    time: string
    location: string
    emotion: string
    outfit: string
    desire: string
  }
  story_flow: Array<{
    type: 'action' | 'dialogue'
    text: string
  }>
  internal_thought: string
}

/**
 * Helper to parse *text* into italicized spans
 */
function formatTextWithAsterisks(text: string) {
  const parts = text.split(/(\*.*?\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <span key={i} className="text-white/50 italic font-medium">
          {part.slice(1, -1)}
        </span>
      )
    }
    return part
  })
}

export function MessageParser({ content, role, messageKind = 'speech' }: ParsedMessageProps) {
  if (role === 'user') {
    const userClassName =
      messageKind === 'action'
        ? 'text-white/80 italic'
        : messageKind === 'narration'
          ? 'text-white/70'
          : 'text-zabb-fg'

    return (
      <div className={`${userClassName} whitespace-pre-wrap leading-relaxed`}>
        {formatTextWithAsterisks(content)}
      </div>
    )
  }

  // Attempt to parse as JSON first (Assistant)
  try {
    const data: StructuredResponse = JSON.parse(content)
    
    const header = `[${data.status.date} ${data.status.time}] / [${data.status.location}] / [${data.status.emotion}] / [${data.status.outfit}] / [${data.status.desire}]`
    
    return (
      <div className="flex flex-col w-full">
        <div className="text-xs text-zabb-muted-fg mb-2 font-mono flex flex-wrap items-center gap-2">
          <span className="text-zabb-fg font-bold bg-zabb-muted px-1.5 py-0.5 rounded shrink-0">{data.status.time}</span>
          <span className="break-words leading-relaxed" title={header}>{header}</span>
        </div>

        <div className="text-base leading-relaxed">
          {data.story_flow.map((item, index) => {
            if (item.type === 'action') {
              return (
                <blockquote key={index} className="border-l-2 border-zabb-border pl-4 my-2 text-zabb-muted-fg italic">
                  {formatTextWithAsterisks(item.text)}
                </blockquote>
              )
            }
            return (
              <p key={index} className="text-zabb-fg my-2 whitespace-pre-wrap">
                {formatTextWithAsterisks(item.text)}
              </p>
            )
          })}
        </div>

        {data.internal_thought && (
          <div className="mt-3 pt-2 border-t border-zabb-border border-dashed text-sm text-zabb-muted-fg italic">
            💭 {formatTextWithAsterisks(data.internal_thought)}
          </div>
        )}
      </div>
    )
  } catch (e) {
    // Fallback to legacy text parsing if not JSON
    const lines = content.split('\n').filter((line) => line.trim() !== '')

    let header = ''
    let timestamp = ''
    const bodyElements: React.ReactNode[] = []
    let footer = ''

    lines.forEach((line, index) => {
      const trimmed = line.trim()

      if (index === 0 && trimmed.startsWith('[')) {
        header = trimmed
        const timeMatch = trimmed.match(/^\[(.*?)\]/)
        if (timeMatch) {
          timestamp = timeMatch[1] || ''
        }
        return
      }

      if (trimmed.startsWith('> _"ความคิดในใจ:') || trimmed.startsWith('> _"ความคิด:')) {
        footer = trimmed.replace(/> _"ความคิด(ในใจ)?: __(.*?)__"_+/, '$2').replace(/> _"ความคิด(ในใจ)?: (.*?)"_+/, '$2')
        return
      }

      if (trimmed.startsWith('> _"') && trimmed.endsWith('"_')) {
        const actionText = trimmed.substring(4, trimmed.length - 2)
        bodyElements.push(
          <blockquote key={index} className="border-l-2 border-zabb-border pl-4 my-2 text-zabb-muted-fg italic">
            {formatTextWithAsterisks(actionText)}
          </blockquote>
        )
        return
      }

      if (trimmed.startsWith('>')) {
        const actionText = trimmed.substring(1).trim().replace(/^_"/, '').replace(/"_$/, '')
        bodyElements.push(
          <blockquote key={index} className="border-l-2 border-zabb-border pl-4 my-2 text-zabb-muted-fg italic">
            {formatTextWithAsterisks(actionText)}
          </blockquote>
        )
        return
      }

      bodyElements.push(
        <p key={index} className="text-zabb-fg my-2 whitespace-pre-wrap">
          {formatTextWithAsterisks(trimmed)}
        </p>
      )
    })

    return (
      <div className="flex flex-col w-full">
        {header && (
          <div className="text-xs text-zabb-muted-fg mb-2 font-mono flex flex-wrap items-center gap-2">
            {timestamp && <span className="text-zabb-fg font-bold bg-zabb-muted px-1.5 py-0.5 rounded shrink-0">{timestamp}</span>}
            <span className="break-words leading-relaxed" title={header}>{header}</span>
          </div>
        )}
        
        <div className="text-base leading-relaxed">
          {bodyElements}
        </div>

        {footer && (
          <div className="mt-3 pt-2 border-t border-zabb-border border-dashed text-sm text-zabb-muted-fg italic">
            💭 {formatTextWithAsterisks(footer.replace(/_/g, ''))}
          </div>
        )}
      </div>
    )
  }
}
