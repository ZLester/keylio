const path = require('path')
const express = require('express')
const app = express()
const PORT = process.env.PORT || 8080
const randomWords = require('random-words')
const db = require('./db/db')
const { incrementLetter, getAllLetters } = require('./db/model')
const { median } = require('./util/util')

// using webpack-dev-server and middleware in development environment
if(process.env.NODE_ENV !== 'production') {
  const webpackDevMiddleware = require('webpack-dev-middleware')
  const webpackHotMiddleware = require('webpack-hot-middleware')
  const webpack = require('webpack')
  const config = require('./webpack.config')
  const compiler = webpack(config)

  app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }))
  app.use(webpackHotMiddleware(compiler))
}

app.use(express.static(path.join(__dirname, 'dist')))

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'))
})

app.post('/api/dwell', (req, res) => {
  let body
  req.on('data', (chunk) => {
    body += chunk
  })
  req.on('end', () => {
          
  })
})

app.get('/api/keyboard', (req, res) => {
  getAllLetters((err, result) => {
    const medians = Object.keys(result)
      .reduce((mediansObject, char) => {
        mediansObject[char] = median(result[char])
        return mediansObject
      }, {})

    if (err) {
      res.sendStatus(500)
    } else {
      res.status(200).send(medians)
    }
  })
})

app.get('/api/prompt', (req, res) => {
  const prompt = randomWords({ exactly: 50, join: ' ' })
  res.send(prompt)
})

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'))
})

db.connect(function(err) {
  if (err) {
    console.log('Unable to connect to Mongo.')
    process.exit(1)
  } else {
    app.listen(PORT, (error) => {
      if (error) {
        console.error(error)
      } else {
        console.info("==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.", PORT, PORT)
      }
    })
  }
})
