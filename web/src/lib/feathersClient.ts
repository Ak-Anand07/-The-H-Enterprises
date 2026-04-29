import { feathers } from '@feathersjs/feathers';
import rest from '@feathersjs/rest-client';
import auth from '@feathersjs/authentication-client';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3032';

const app = feathers();
const restClient = rest(API_URL);

app.configure(restClient.axios(axios));

// We must securely check if window exists (Next.js SSR compatibility)
const storage = typeof window !== 'undefined' ? window.localStorage : null;

app.configure(
  auth({
    storage: storage as Storage | undefined,
  })
);

export default app;
