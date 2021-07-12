require('dotenv').config()
const fetch = require('node-fetch')
const express = require('express')
const bodyParser = require('body-parser')
const nbTasks = parseInt(process.env.TASKS) || 4
const port = process.env.PORT || 3030
const randInt = (min, max) => Math.floor(Math.random() * (max - min)) + min
const taskType = () => (randInt(0, 2) ? 'mult' : 'add')
const args = () => ({ a: randInt(0, 40), b: randInt(0, 40) })

const generateTasks = i =>
  new Array(i).fill(1).map(_ => ({ type: taskType(), args: args() }))

let workers = ['http://localhost:8080','http://localhost:2020','http://localhost:6060','http://localhost:4040']
let tasks = generateTasks(nbTasks)
let taskToDo = nbTasks

const wait = mili => new Promise((resolve, reject) => setTimeout(resolve, mili))

const sendTask = async (worker, task) => {
  console.log(`${worker}/${task.type}`, task)
  workers = workers.filter(w => w !== worker)
  tasks = tasks.filter(t => t !== task)
  const request = fetch(`${worker}/${task.type}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task.args),
  })
    .then(res => {
      workers = [...workers]
      console.log(task.args,"11")
      return res.json()
    })
    .then(res => {
      taskToDo -= 1
      console.log(task, 'has res', res)
      return res
    })
    .catch(err => {
      console.log(task, ' failed')
      tasks = [...tasks, task]
    })
}

const main = async () => {
  console.log(tasks)
  while (taskToDo > 0) {
    await wait(100)
    if (workers.length === 0 || tasks.length === 0) continue
    sendTask(workers[0], tasks[0])
  }
}

const app = express()

app.use(bodyParser())
let data = {}

app.get('/', (req, res) => {
  res.send(JSON.stringify(data))
})

app.post('/data', (req, res) => {
  data = { ...data, ...req.body }
  console.log(data)
  res.send('ok')
})

app.listen(port, () => {
  console.log(`Worker listening at http://localhost:${port}`)
})

main()
