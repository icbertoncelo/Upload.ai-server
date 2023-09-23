import { FastifyInstance } from "fastify";
import { z } from 'zod'
import { createReadStream } from "fs";
import { prisma, openai } from "../lib";

export async function createTranscriptionRoute(app: FastifyInstance) {
  app.post('/videos/:videoId/transcription', async(request, reply) => {
    const paramsSchema = z.object({
      videoId: z.string().uuid()
    })

    const { videoId } = paramsSchema.parse(request.params)

    const bodySchema = z.object({
      prompt: z.string()
    })

    const { prompt } = bodySchema.parse(request.body)

    const { path: videoPath } = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId
      }
    })
    
    const audioReadStream = createReadStream(videoPath)

    const { text: transcription } = await openai.audio.transcriptions.create({
      file: audioReadStream,
      model: "whisper-1",
      language: 'pt',
      response_format: "json",
      prompt,
    })

    await prisma.video.update({
      where: {
        id: videoId
      },
      data: {
        transcription
      }
    })

    return { transcription }
  })
}