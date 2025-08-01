import z from "zod";
import { toolBuilder } from "./tool-builder";


const toolExample = toolBuilder
  .withContext(z.object({ lastName: z.string() }))
  .withContext(z.object({ age: z.number() }))
  .tool(({ lastName, age }) => ({
    name: "example",
    description: "An example tool",
    inputSchema: z.object({
      name: z.string().describe("Input string"),
    }),
    execute: async ({ name }: { name: string }) => {
      return { welcome: `Hello, ${name} ${lastName}!` };
    },
  }))

const buildedTool = toolExample.build({ lastName: '', age: 20 })
