import express from 'express'
import apiRoutes from './routes/apiRoutes.js'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import methodOverride from 'method-override'

const app = express()

app.use(express.json())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

app.use(methodOverride('_method'))

dotenv.config();
const dbURI = process.env.MONGO_URI;

mongoose.connect(dbURI)
    .then(result => app.listen(3002))
    .catch(err => console.log(err))

app.set('view engine', 'ejs')

// routes
app.use('/api', apiRoutes)
app.get('/', (req, res) => res.render('home'))

app.use((req, res) => {
    res.status(404).render('404', { title: 'Puslapis nerastas!' });
  });

