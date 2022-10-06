# RToken Keeper - adapted from Defender autotask examples

This is a public keeper that anyone should be able to use to progress RTokens. 


## Commands

`yarn build` to create `dist/index.ts`.

`yarn deploy` to push the `dist/index.ts` live.

`yarn run_all` should eventually do everything, but currently breaks on the execute portion. 

## .env

Needed:

```
API_KEY=yourapikey
API_SECRET=yourapisecret
```

Then run `yarn start`, which will run the typescript code using `ts-node`, and connecting to your Defender Relayer via the HTTP API.
