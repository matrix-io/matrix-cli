module.exports = { //export environments 

  local: {
    api: 'http://dev-demo.admobilize.com',
    mxss: 'http://localhost:3000'
  },
  local2: {
    api: 'http://dev-demo.admobilize.com',
    mxss: 'http://localhost:3001'
  },
  dev: {
    api: 'http://dev-demo.admobilize.com',
    mxss: 'http://dev-mxss.admobilize.com',
    appsBucket: 'dev-admobilize-matrix-apps'
  },
  rc: {
    api: 'https://rc-api.admobilize.com',
    mxss: 'https://rc-mxss.admobilize.com',
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
    api: 'http://dev-demo.admobilize.com',
    mxss: 'http://104.197.139.81'
  }
};
