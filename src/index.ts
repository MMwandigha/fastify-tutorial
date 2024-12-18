import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fastifyMongo from '@fastify/mongodb';

// declare module "fastify" {
//     interface FastifyRequest {
//       user?: string; // Add a `user` property of type string
//     }
//   }

const fastify = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
    },
  },
});

async function  userRoutes(fastify: FastifyInstance) {
    fastify.get("/", {
        handler: async (
          request: FastifyRequest<{
            Body: {
              name: string;
              age: number;
            };
          }>,
          reply: FastifyReply
        ) => {
          const body = request.body;
      
        //   console.log({ body });
        const jwt = fastify.signJwt();
        const verified = fastify.verifyJwt();
      
          return reply.code(201).send({jwt, verified} );
        },
      });

      fastify.log.info("User routes registered")

}

// async function dbConnector(fastify: FastifyInstance, options: any) {
//     fastify.register(fastifyMongo, {
//         url: "mongodb://localhost:27017/fastify",
//     })
//     fastify.log.info("Connected to database", options)
// }
declare module "fastify" {
    export interface FastifyRequest {
        user: {
            name: string;
        }
    }
    export interface FastifyInstance {
        signJwt: () => string;
        verifyJwt: () => {
            name: string
        }
    }
}

fastify.decorateRequest("user", null as unknown as { name:string});

fastify.addHook(
    "preHandler",
    async  (request: FastifyRequest, reply: FastifyReply) => {
        request.user = {
            name: "Bob Jones",
        }
    });

fastify.decorate('signJwt', () => {
    return "Signed JWT";
})

fastify.decorate('verifyJwt', () => {
    return {
        name: 'Tom'
    }
})

// fastify.register(dbConnector)

fastify.register(userRoutes, {prefix: "/"});

async function main() {
  await fastify.listen({
    port: 3000,
    host: "0.0.0.0",
  });
}

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, async () => {
    await fastify.close();

    process.exit(0);
  });
});

main();