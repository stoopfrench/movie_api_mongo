process.env.NODE_ENV = 'test'

const mongoose = require('mongoose')
const config = require('config')

const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../app')
const should = chai.should()

const Movie = require('../api/models/movieModel')

chai.use(chaiHttp)

describe('Requests to /api/genre', () => {
    beforeEach((done) => {
        Movie.remove({}, (err) => {
            done()
        })
    })

    describe('GET request to /api/genre', () => {
        it('Returns an index of Genres stored in the database', (done) => {

            createMovie().then(movie => {
                chai.request(app)
                    .get('/api/genre')
                    .end((err, res) => {
                        res.should.have.status(200)
                        res.should.be.json
                        res.body.should.be.a('object')
                        res.body.should.have.property('results').eql(3)
                        res.body.should.have.property('data')
                        res.body.data.should.be.a('array')
                        res.body.data.length.should.be.eql(3)
                        done()
                    })
            })
        })
    })

    describe('GET request to /api/genre/<genre>', () => {
        it('Returns the movies in the database from this genre', (done) => {

            createMovie().then(movie => {
                const movieGenres = movie.genres.split('|')
                const firstGenre = movieGenres[0]
                chai.request(app)
                    .get(`/api/genre/${firstGenre}`)
                    .send(movie)
                    .end((err, res) => {
                        res.should.have.status(200)
                        res.should.be.json
                        res.body.should.be.a('object')
                        res.body.should.have.property('genre').equal(firstGenre)
                        res.body.should.have.property('count').eql(1)
                        res.body.should.have.property('data')
                        res.body.data.should.be.a('array')
                        done()
                    })
            })
        })
    })

    describe('PATCH request to /api/genre', () => {
        it('Renames a genre', (done) => {

            createMovie().then(movie => {
                const movieGenres = movie.genres.split('|')
                const firstGenre = movieGenres[0]
                const patchUpdates = { genre: firstGenre, newName: "RENAMED" }
                chai.request(app)
                    .patch('/api/genre')
                    .send(patchUpdates)
                    .end((err, res) => {
                        res.should.have.status(200)
                        res.should.be.json
                        res.body.should.be.a('object')
                        res.body.message.should.be.equal(`${firstGenre} has been renamed ${patchUpdates.newName}`)
                        res.body.changes.should.be.eql(1)
                        done()
                    })
            })
        })
    })
})

describe('Bad Requests to /api/genre', () => {
    beforeEach((done) => {
        Movie.remove({}, (err) => {
            done()
        })
    })

    describe('GET request to invalid url', () => {
        it('Returns a 404 error', (done) => {

            chai.request(app)
                .get('/api/genresia')
                .end((err, res) => {
                    res.should.have.status(404)
                    res.body.error.message.should.be.equal('Route not found')
                    done()
                })
        })
    })

    describe('GET request to /api/genre/<genre> with invalid GENRE', () => {
        it("Returns a 404 error with the message 'No entry found with that Genre'", (done) => {

            chai.request(app)
                .get('/api/genre/notAGenre')
                .end((err, res) => {
                    res.should.have.status(404)
                    res.body.message.should.be.equal('No Movies found with that Genre')
                    done()
                })
        })
    })

    describe('PATCH request to /api/genre with a genre that is not in the database', () => {
        it("Returns a 404 error with the message 'Genre not found'", (done) => {

            const updates = { genre: 'Not|A|Genre', newName: 'NEW|GENRE'}
            chai.request(app)
                .patch('/api/genre')
                .send(updates)
                .end((err, res) => {
                    res.should.have.status(404)
                    res.body.error.should.have.property('message')
                    res.body.error.message.should.be.equal('Genre not found')
                    done()
                })
        })
    })

    describe('PATCH request to /api/genre with an invalid request format', () => {
        it("Returns a 500 error with the message 'Genre not found'", (done) => {

            const updates = { genre: 'Not|A|Genre', wrongKey: 'NEW|GENRE'}
            chai.request(app)
                .patch('/api/genre')
                .send(updates)
                .end((err, res) => {
                    res.should.have.status(500)
                    res.body.error.should.have.property('message')
                    res.body.error.message.should.be.equal('Invalid request format')
                    res.body.error.should.have.property('template')
                    done()
                })
        })
    })
})

const createMovie = () => {
    return new Promise((resolve, reject) => {
        const movieTemplate = {
            title: 'Mocha Movie Template',
            year: 1991,
            genres: 'Action,Comedy,Tragedy'
        }

        chai.request(app)
            .post('/api/titles')
            .send(movieTemplate)
            .end((err, res) => {
                resolve(res.body.created)
            })
    })
}