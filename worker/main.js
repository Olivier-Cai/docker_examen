require('dotenv').config()
const fetch = require('node-fetch')
const express = require('express')
const app = express()
const port = process.env.PORT || 8080
const randInt = (min, max) => Math.floor(Math.random() * (max - min)) + min
let mult = false
let add = false
let task = {}
const registry = 'http://localhost:3030'

app.use(express.json())
app.use(
  express.urlencoded({
    extended: true,
  })
)

if (process.env.MULT)
  app.post('/mult', (req, res) => {
    if (mult) {
      console.error('mult', 'Already working')
      res.status(403).send('Already working')
      return
    }
    mult = true
    const { a, b } = req.body
    task = { a, b }
    console.log('mult', req.body)
    const duration = randInt(3000, 12000)
    setTimeout(() => {
      mult = false
      res.send(JSON.stringify({ res: a * b, duration }))
    }, duration)
  })

if (process.env.ADD)
  app.post('/add', (req, res) => {
    if (add) {
      console.error('add', 'Already working')
      res.status(403).send('Already working')
      return
    }
    add = true
    const { a, b } = req.body
    task = { a, b }
    console.log('add', req.body)
    const duration = randInt(3000, 7000)
    setTimeout(() => {
      add = false
      res.send(JSON.stringify({ res: a + b, duration }))
    }, duration)
  })

app.get('/', (req, res) => {
  if (mult) {
    res.send(JSON.stringify({ type: 'mult', task }))
    return
  }
  if (add) {
    res.send(JSON.stringify({ type: 'add', task }))
    return
  }
  res.send('ready to work')
})

app.listen(port, () => {
  console.log(`Worker listening at http://localhost:${port}`)
})

const register = (adress, registry) =>
  fetch(registry + '/data', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ worker: adress }),
  })

register(`http://localhost:${port}`, registry)