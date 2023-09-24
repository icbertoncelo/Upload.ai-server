import { FastifyInstance } from "fastify";
import { z } from 'zod'
import { createReadStream } from "fs";
import { prisma, openai } from "../lib";

export async function generateAiCompletionRoute(app: FastifyInstance) {
  app.post('/ai/complete', async(request, reply) => {
    const bodySchema = z.object({
      videoId: z.string().uuid(),
      template: z.string(),
      temperature: z.number().min(0).max(1).default(0.5)
    })

    const { videoId, temperature, template } = bodySchema.parse(request.body)

    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId
      }
    })

    if(!video.transcription) {
      return reply.status(400).send({ error: "Video transcription was not generated yet!" })
    }

    const promptMessage = template.replace('{transcription}', video.transcription)

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature,
      messages: [
        {
          role: 'user',
          content: promptMessage
        }
      ]
    })

    return response
  })
}