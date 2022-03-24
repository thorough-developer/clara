import { loadTest } from "./load-test";

import fastify, { FastifyReply, FastifyRequest, FastifySchema } from 'fastify';

const app = fastify({ logger: true });

const mySchema: FastifySchema = {
    params: {
        type: 'object',
        properties: {
            path: {type: 'string'}
        },
        additionalProperties: false
    },
    querystring: {
        type: 'object',
        properties: {
            query: {type: 'string'}
        },
        additionalProperties: false
    },
    response: {
        200: {
            type: 'object',
            properties: {
                path: {type: 'string'},
                query: {type: 'string'}
            },
            additionalProperties: true
        }
    }
};

app.get('/app/controller/route/:path', 
    {
        schema: mySchema
    }
,async (request: FastifyRequest, reply: FastifyReply) => {
    const path: any = (<any>request.params).path;
    const query: any = (<any>request.query).query;
    return reply.code(200).send({
        path,
        query,
        random: 'string'
    });
});


const start = async () => {
    try {
        await app.listen(3000);
        ///loadTest('http://localhost:3000/app/controller/route');
    } catch (err) {
        process.exit(1);
    }
}

start();