const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const Movie = require('../models/movieModel')

const _var = require('../../variables.js')
const port = _var.port


//GET MOVIE LIST BY YEAR

router.get('/', (req, res, next) => {

    Movie
        .find()
        .select('id title year genres')
        .exec()
        .then(result => {
            result.sort((a, b) => {
                return a.year - b.year
            })
            const response = {
                count: result.length,
                movies: result.map(movie => {
                    return {
                        id: movie.id,
                        title: movie.title,
                        year: movie.year,
                        genres: movie.genres,
                        request: {
                            moviesByYear: {
                                type: 'GET',
                                description: 'Get a list of Movies from this Year',
                                url: `http://localhost:${port}/year/` + movie.year
                            },

                            movieDetails: {
                                type: 'GET',
                                description: 'Get Details about this Movie',
                                url: `http://localhost:${port}/titles/` + movie.id
                            }
                        }
                    }
                })
            }
            res.status(200).json(response)
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

//GET YEAR INDEX -----------------------------------------------------------------
router.get('/index', (req, res, next) => {
    const years = []

    Movie
        .find()
        .exec()
        .then(result => {
            result.forEach(movie => {
                years.push(movie.year)
            })
            const filteredYears = years.filter((element, i, self) => {
                return i === self.indexOf(element)
            }).sort()
            res.status(200).json({
                count: filteredYears.length,
                years: filteredYears.map(year => {
                    return {
                        year: year,
                        request: {
                            type: 'GET',
                            description: 'Get a list of Movies from this Year',
                            url: `http://localhost:${port}/year/` + year
                        }
                    }
                })
            })
        })
        .catch(err => {
            message: err
        })
})

//GET MOVIE BY YEAR --------------------------------------------------------------
router.get('/:year', (req, res, next) => {
    const year = req.params.year

    Movie
        .find({ 'year': year })
        .select('id title year genres')
        .exec()
        .then(result => {
            if (result.length > 0) {
                res.status(200).json({
                    year: year,
                    count: result.length,
                    movies: result.map(year => {
                        return {
                            id: year.id,
                            title: year.title,
                            year: year.year,
                            genres: year.genres,
                            request: {
                                type: 'GET',
                                description: 'Get details about this Movie',
                                url: `http://localhost:${port}/titles/` + year.id
                            }
                        }
                    })
                })
            } else {
                res.status(404).json({
                    message: 'No Movies found from that year'
                })
            }
        })
        .catch(err => {
            console.log(err)
        })
})

module.exports = router