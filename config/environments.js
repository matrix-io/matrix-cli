module.exports = { //export environments 

  local: {
    api: 'https://dev-api.admobilize.com',
    mxss: 'http://localhost:3000'
  },
  local2: {
    api: 'https://dev-api.admobilize.com',
    mxss: 'http://localhost:3001'
  },
  dev: {
    api: 'https://dev-api.admobilize.com',
    mxss: 'https://dev-mxss.admobilize.com',
    appsBucket: 'dev-admobilize-matrix-apps'
  },
  rc: {
    api: 'https://rc-api.admobilize.com',
    mxss: 'https://mxss.admobilize.com',
    appsBucket: 'admobilize-matrix-apps'
  },
  stage: {
    api: 'https://stage-api.admobilize.com',
    mxss: 'https://stage-mxss.admobilize.com'
  },
  production: {
    api: 'https://demo.admobilize.com',
    mxss: 'https://mxss.admobilize.com',
    appsBucket: 'admobilize-matrix-apps'
  },
  hardcode: {
    api: 'https://dev-api.admobilize.com',
    mxss: 'https://104.197.139.81'
  }
};
