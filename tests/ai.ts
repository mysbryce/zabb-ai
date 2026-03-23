import { Groq } from 'groq-sdk'
import path from 'path'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const instruction = await Bun.file(
  path.join(__dirname, '..', 'instructions', 'mello-example.md')
).text()

const chatCompletion = await groq.chat.completions.create({
  messages: [
    {
      role: 'user',
      content: instruction,
    },
  ],
  model: 'moonshotai/kimi-k2-instruct',
  temperature: 0.75,
  max_completion_tokens: 3000,
  top_p: 0.95,
  stream: true,
  stop: null,
  
  response_format: {
    type: 'json_schema',
    json_schema: {
      name: 'mello_story_schema',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          status: {
            type: 'object',
            properties: {
              date: { type: 'string' },
              time: { type: 'string' },
              location: { type: 'string' },
              emotion: { type: 'string' },
              outfit: { type: 'string' },
              desire: { type: 'string' },
            },
            required: ['date', 'time', 'location', 'emotion', 'outfit', 'desire'],
            additionalProperties: false,
          },
          story_flow: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['action', 'dialogue'] },
                text: { type: 'string' },
              },
              required: ['type', 'text'],
              additionalProperties: false,
            },
          },
          internal_thought: { 
            type: 'string',
            description: 'สรุปความคิดในใจสั้นๆ ของตัวละคร' 
          },
        },
        required: ['status', 'story_flow', 'internal_thought'],
        additionalProperties: false,
      },
    },
  },
})

for await (const chunk of chatCompletion) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '')
}
