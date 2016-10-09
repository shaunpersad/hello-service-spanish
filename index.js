"use strict";

const amqp = require('seneca-amqp-transport');
const seneca = require('seneca')().use(amqp);
const ready = require('hello-common/ready');

/**
 * This is an action on this service.  It handles requests for words that are greetings.
 */
seneca.add({word_type: 'greeting'}, (request, respond) => {

    var greeting = 'hola';
    /**
     * Making a request to the "reverse" service.
     */
    seneca.act({service: 'service-reverse', word: greeting}, (err, response) => {

        respond(err, {
            greeting: greeting,
            reverse: response.reverse || 'unknown'
        });

    });
});

/**
 * Check if rabbitmq is ready before allowing this service to use it.
 */
ready({
    hostname: 'rabbitmq',
    port: 15672,
    path: '/api'
}, () => {

    seneca
        .client({
            type: 'amqp',
            hostname: 'rabbitmq',
            port: 5672,
            username: 'guest',
            password: 'guest',
            pin: [
                {service: 'service-reverse'} // the services this can send requests to.
            ]
        })
        .listen({
            type: 'amqp',
            hostname: 'rabbitmq',
            port: 5672,
            username: 'guest',
            password: 'guest',
            pin: {service: 'service-english'} // this service
        });
    
});