# Tool Builder Concept

Just a quick experiment I tried - a way to build AI SDK tools with shared context using a fluent API. Nothing fancy, just wanted a cleaner way to pass data between tool executions.

## What it does

Instead of manually wiring up context every time, you can chain it together like this:

```typescript
import { toolBuilder } from "./src/tool-builder";
import { z } from "zod";

// Simple tool
const greetTool = toolBuilder
  .tool({
    name: "greet",
    description: "Says hello",
    inputSchema: z.object({
      name: z.string(),
    }),
    execute: async ({ name }) => {
      return { message: `Hello, ${name}!` };
    },
  })
  .build({});

// Tool with context (like API keys, db connections, etc.)
const weatherTool = toolBuilder
  .withContext(z.object({
    apiKey: z.string(),
  }))
  .tool((ctx) => ({
    name: "weather",
    description: "Gets weather info",
    inputSchema: z.object({
      location: z.string(),
    }),
    execute: async ({ location }) => {
      // ctx.apiKey is available here
      return { weather: "sunny" };
    },
  }))
  .build({ apiKey: "your-key" });
```

That's pretty much it. The context gets passed down and validated with Zod schemas.
