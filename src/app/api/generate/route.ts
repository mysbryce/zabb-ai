import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import fs from 'fs'
import path from 'path'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { type, prompt, settings } = (await req.json()) as any

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'Missing GROQ_API_KEY' }, { status: 500 })
    }

    const fileName = type === 'character' ? 'character-generator.md' : 'user-generator.md'
    const instructionPath = path.join(process.cwd(), 'src/assets/instructions', fileName)
    const instruction = fs.readFileSync(instructionPath, 'utf8')

    const model = settings?.model || 'moonshotai/kimi-k2-instruct-0905'
    const temperature = settings?.temperature ?? 0.8

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: instruction },
        { role: 'user', content: `สร้าง ${type === 'character' ? 'ตัวละคร' : 'ผู้ใช้'} จากหัวข้อนี้: "${prompt}"` },
      ],
      model: model,
      temperature: temperature,
      max_tokens: 2048,
    })

    const result = completion.choices[0]?.message?.content || ''
    return NextResponse.json({ result })
  } catch (error: any) {
    console.error('Generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
