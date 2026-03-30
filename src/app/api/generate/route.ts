import { NextResponse } from 'next/server'
import { generateAIResponse } from '@/lib/ai-provider'
import fs from 'fs'
import path from 'path'

export async function POST(req: Request) {
  try {
    const { type, prompt, settings } = (await req.json()) as any

    const fileName = type === 'character' ? 'character-generator.md' : 'user-generator.md'
    const instructionPath = path.join(process.cwd(), 'src/assets/instructions', fileName)
    const instruction = fs.readFileSync(instructionPath, 'utf8')

    const temperature = settings?.temperature ?? 0.8

    const completion = await generateAIResponse({
      messages: [
        { role: 'system', content: instruction },
        { role: 'user', content: `สร้าง ${type === 'character' ? 'ตัวละคร' : 'ผู้ใช้'} จากหัวข้อนี้: "${prompt}"` },
      ],
      temperature: temperature,
      maxTokens: 2048,
    })

    return NextResponse.json({ result: completion.content })
  } catch (error: any) {
    console.error('Generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

