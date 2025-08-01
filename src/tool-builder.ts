import { type Tool, type InferToolInput } from "ai";
import { z } from "zod";

class ToolBuilder<Input, Output, TContext extends z.ZodObject = z.ZodObject<{}>> {
  private toolConfig: Tool | ((ctx: z.Infer<TContext>) => Tool) | null = null;
  private contextSchema: TContext | undefined = undefined;

  /**
   * Adds or extends the context schema for this tool builder.
   * Creates a new builder instance with the combined context schema.
   *
   * @template T - The new context schema type extending ZodObject
   * @param schema - The Zod schema to add to the context
   * @returns A new ToolBuilder instance with the extended context schema
   *
   * @example
   * ```typescript
   * const builder = toolBuilder
   *   .withContext(z.object({ userId: z.string() }))
   *   .withContext(z.object({ sessionId: z.string() }));
   * ```
   */
  public withContext<T extends z.ZodObject<any>>(schema: T): ToolBuilder<Input, Output, T extends TContext ? T : TContext & T> {
    const newBuilder = new ToolBuilder<Input, Output, T extends TContext ? T : TContext & T>();
    if (this.contextSchema) {
      newBuilder.contextSchema = this.contextSchema.extend(schema) as T extends TContext ? T : TContext & T;
    } else {
      newBuilder.contextSchema = schema as T extends TContext ? T : TContext & T;
    }
    return newBuilder;
  }

  /**
   * Configures the tool definition for this builder.
   * Can accept either a static tool configuration or a function that receives context and returns a tool.
   * For more information about configuring the tool [see the documentation.](https://ai-sdk.dev/docs/reference/ai-sdk-core/tool)
   * @param config - Either a Tool configuration object or a function that takes context and returns a Tool
   * @returns An object with a build method to create the final tool
   *
   * @example
   * ```typescript
   * // Tool configuration
   *
   * const builder = toolBuilder
   *   .withContext(z.object({ apiKey: z.string() }))
   *   .tool((ctx) => ({
   *     description: "API tool",
   *     parameters: z.object({ query: z.string() }),
   *     execute: async ({ query }) => callAPI(ctx.apiKey, query)
   *   }));
   * ```
   */
  tool<Input, Output>(config: Tool<Input, Output> | ((ctx: z.Infer<TContext>) => Tool<Input, Output>)) {
    const newBuilder = new ToolBuilder<Input, Output, TContext>();
    newBuilder.toolConfig = config;
    return {
      build: this.build
    }
  }

  /**
   * Builds and returns the final tool instance.
   * Validates the provided context against the schema (if present) and creates the tool.
   *
   * @param ctx - The context object that matches the defined context schema
   * @returns A configured Tool instance ready for use
   * @throws {Error} When tool configuration is missing
   * @throws {z.ZodError} When context validation fails
   *
   * @example
   * ```typescript
   * const myTool = toolBuilder
   *   .withContext(z.object({ userId: z.string() }))
   *   .tool({ ... })
   *   .build({ userId: "123" });
   * ```
   */
  private build(ctx: z.Infer<TContext>): Tool<Input, Output> {
    if (!this.toolConfig) throw new Error("Tool not configured");

    if (typeof this.toolConfig === "function") {
      if (this.contextSchema) {
        this.contextSchema.parse(ctx);
      }

      const actualConfig = this.toolConfig(ctx);
      return actualConfig;
    }

    return this.toolConfig;
  }
}

const toolBuilder = new ToolBuilder();

export { toolBuilder }
