import 'dotenv/config'

import { fastify } from "fastify";
import { getAllPrompts, uploadVideoRoute, createTranscriptionRoute } from "./routes";

const app = fastify()

app.register(getAllPrompts)
app.register(uploadVideoRoute)
app.register(createTranscriptionRoute)

app.listen({
  port: 3333
}).then(() => {
  console.log('HTTP Server Running')
})