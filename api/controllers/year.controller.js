const mongoose = require('mongoose')

const Movie = require('../models/movieModel')

const config = require('config')
const port = config.port

//GET YEAR INDEX -----------------------------------------------------------------
exports.year_get_all = (req, res, next) => {

    Movie
        .aggregate([
            { $group: { _id: { "year": "$year" }, count: { $sum: 1 } } },
            { $sort: { "count": -1 } }
        ])
        .exec()
        .then(result => {
            const response = {
                "results": result.length,
                "data": result.map(year => {
                    return {
                        year: year._id.year,
                        movies: year.count,
                        request: {
                            type: 'GET',
                            description: 'Get a list of movies in this year',
                            url: `http://localhost:${port}/api/year/${year._id.year}`
                        }
                    }
                })
            }
            res.status(200).json(response)
        }).catch(err => {
            res.status(500).json({
                error: err
            })
        })
}

//GET MOVIES BY YEAR --------------------------------------------------------------
exports.get_title_by_year = (req, res, next) => {
    const year = req.params.year

    Movie
        .find({ 'year': year }, { _id: 0 })
        .sort({ "title": 1 })
        .exec()
        .then(result => {
            if (result.length > 0) {
                const response = {
                    year: year,
                    count: result.length,
                    data: result.map(year => {
                        return {
                            title: year.title,
                            year: year.year,
                            genres: year.genres,
                            index: year.index,
                            request: {
                                type: 'GET',
                                description: 'Get details about this movie',
                                url: `http://localhost:${port}/api/titles/${year.index}`
                            }
                        }
                    })
                }
                res.status(200).json(response)
            } else {
                throw new Error('No Movies found from that year')
            }
        })
        .catch(err => {
            res.status(404).json({
                message: err.message
            })
        })
}