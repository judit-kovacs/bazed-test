# Agent swarm sample from Bazed AF

The repo contains the implementation of the [first agent swarm tutorial from Bazed](https://bazed.ai/first-swarm.html).

To run locally, `Node v20.11.0` or higher required. 
Install the packages

```sh
npm install
```

Create a `.env` file and set the `OPENAI_API_KEY`.

Then run the server
```sh
npm run dev
```

If everything went well

```sh
curl http://localhost:3000
```

Should return the json, that contains the agents listed.
The agents can be called with `POST` request to `localhost:3000/spawn`

```sh
curl -X POST https://localhost:3000/spawn -H "Content-Type: application/json" -d '{ "type": "testproject/SearcherAgent", "options": { "question": "<question>" }, "env": { "serp-api-key": "<your serp api key>" } }'
```
