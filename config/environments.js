module.exports = { //export environments 

  local: {
    api: 'https://dev-demo.admobilize.com',
    mxss: 'http://localhost:3000'
  },
  local2: {
    api: 'https://dev-demo.admobilize.com',
    mxss: 'http://localhost:3001'
  },
  dev: {
    api: 'https://dev-demo.admobilize.com',
    mxss: 'https://dev-mxss.admobilize.com',
    appsBucket: 'dev-admobilize-matrix-apps'
  },
  rc: {
    api: 'https://rc-api.admobilize.com',
    mxss: 'https://stage-mxss.admobilize.com',
    appsBucket: 'admobilize-matrix-apps'
  },
  stage: {
    api: 'http://stage-api.admobilize.com',
    mxss: 'http://stage-mxss.admobilize.com'
  },
  production: {
    api: 'http://demo.admobilize.com',
    mxss: 'http://mxss.admobilize.com',
    appsBucket: 'admobilize-matrix-apps'
  },
  hardcode: {
    api: 'https://dev-demo.admobilize.com',
    mxss: 'http://104.197.139.81'
  }
};