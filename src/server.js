import http from 'http'
import express from 'express'
import bodyParser from 'body-parser'
import path from 'path'

import { server, env } from 'decentraland-commons'
import db from './lib/db'

// import {} from './lib/models'
// import {} from './lib/services'

env.load()

const SERVER_PORT = env.get('SERVER_PORT', 5000)

const app = express()
const httpServer = http.Server(app)

app.use(bodyParser.urlencoded({ extended: false, limit: '2mb' }))
app.use(bodyParser.json())

if (env.isProduction()) {
  const webappPath = env.get(
    'WEBAPP_PATH',
    path.join(__dirname, '..', 'webapp/build')
  )

  app.use('/', express.static(webappPath, { extensions: ['html'] }))
} else {
  app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Request-Method', '*')
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    next()
  })
}

/**
 * Return the parcels an address owns
 * @param  {string} address - User address
 * @return {object}
 */
app.get('/api/userParcels', server.handleRequest(getUserParcels))

export async function getUserParcels(req) {
  const address = server.extractFromReq(req, 'address')

  const parcels = [
    { x: 0, y: 0, price: 13230, name: '', description: '' },
    { x: 1, y: 0, price: 1030, name: '', description: '' },
    { x: 0, y: 1, price: 1500, name: '', description: '' }
  ] // from contract

  // TODO: We'll need to add the price to each parcel we fetch from the contract
  // using the parcel_states table

  return parcels
}

/**
 * Start the server
 */
if (require.main === module) {
  db
    .connect()
    .then(() => {
      httpServer.listen(SERVER_PORT, () =>
        console.log('Server running on port', SERVER_PORT)
      )
    })
    .catch(console.error)
}
