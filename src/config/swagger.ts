import { z, ZodSchema } from 'zod';
import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { scoreSchema } from '../validation/score.schema';
import { successMessageResponse } from '../validation/generic.schema';

extendZodWithOpenApi(z); // must pass zod instance

export const registry = new OpenAPIRegistry();

// ---------------------------
// Routes auto-registration
// ---------------------------

// Each route you want in Swagger
interface RouteDefinition {
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  path: string;
  request?: {
    body?: ZodSchema<any>;
    query?: ZodSchema<any>;
  };
  response?: ZodSchema<any>;
  summary?: string;
}
const routes: RouteDefinition[] = [
  { method: 'post', path: '/score', request: { body: scoreSchema }, response: successMessageResponse }
];

/**
 * Automatically registers all routes in OpenAPI registry
 */
const registerAllRoutes = () => {
  routes.forEach(r => {
    const request: any = {};

    if (r.request?.body) {
      request.body = { content: { 'application/json': { schema: r.request.body } } };
    }

    if (r.request?.query) {
      request.query = { content: { 'application/json': { schema: r.request.query } } };
    }

    const responses: any = {};

    if (r.response) {
      responses[200] = {
        description: 'Success',
        content: { 'application/json': { schema: r.response } },
      };
    }

    registry.registerPath({
      method: r.method,
      path: r.path,
      summary: r.summary ?? `Auto-generated ${r.method.toUpperCase()} ${r.path}`,
      request,
      responses,
    });
  });
};


// ---------------------------
// Generate OpenAPI doc
// ---------------------------
export const generateOpenApiDocs = () => {
  registerAllRoutes(); // make sure all paths are registered before generating docs
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'Stream Daemon API',
      version: '1.0.0',
    },
  });
};
