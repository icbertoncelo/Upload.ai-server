import { FastifyInstance } from "fastify";
import { fastifyMultipart } from '@fastify/multipart'
import path from "path";
import {  randomUUID } from "crypto";
import { promisify } from "util";
import { pipeline } from "stream";
import { createWriteStream } from "fs";

import { prisma } from "../lib";

const pump = promisify(pipeline)

export async function uploadVideoRoute(app: FastifyInstance) {
  app.register(fastifyMultipart, {
    limits: {
      fieldSize: 1048576 * 25 // 25Mb
    }
  })

  app.post('/videos', async(request, reply) => {
    const data = await request.file()

    if(!data) {
      return reply.status(400).send({ error: "Missing file input." })
    }

    const fileExtension = path.extname(data.filename)

    if(fileExtension !== ".mp3") {
      return reply.status(400).send({ error: "Invalid input type. Please upload a MP3." })
    }

    const fileBaseName = path.basename(data.filename, fileExtension)
    const fileUploadName = `${fileBaseName}-${randomUUID()}${fileExtension}`
    const uploadDir = path.resolve(__dirname, '..', '..', 'tmp', fileUploadName)

    await pump(data.file, createWriteStream(uploadDir))

    const video = await prisma.video.create({
      data: {
        name: data.filename,
        path: uploadDir,
      }
    })

    return { video }
  })
}