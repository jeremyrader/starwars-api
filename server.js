const express = require('express')
const request = require('request-promise')
const wrap = require('./utils/asyncMiddleware')

const app = express()

app.set('port', process.env.PORT || 3000)

app.get('/people', wrap(async (req, res, next) => {

    if (req.query.sortBy && !['name', 'height', 'mass'].includes(req.query.sortBy)) {
        throw new Error(`${req.query.sortBy} is not a valid sort key`)
    }

    try {
        var people = await fetchAllFromSwapi('people')
    }
    catch(err) {
        throw new Error(`We experienced an error while fetching data from https://swapi.co/api/people: ${err}`)
    }

    if (req.query.sortBy) {
        people.sort((a,b) => {

            aNum = parseFloat(a[req.query.sortBy].replace(/,/g, ''))
            bNum = parseFloat(b[req.query.sortBy].replace(/,/g, ''))

            if (isNaN(aNum)) {
                return 1
            }
            else if (isNaN(bNum)) {
                return -1
            }

            return aNum - bNum
        })
    }
    
    res.status(200).send(people)

}))

app.get('/planets', wrap(async (req, res, next) => {

    try {
        var planets = await fetchAllFromSwapi('planets')
    }
    catch(err) {
        throw new Error(`We experienced an error while fetching data from https://swapi.co/api/planets: ${err}`)
    }

    for (var planet of planets) {
        let residentNames = []

        for (var resident of planet.residents) {

            try {
                var residentDetails = await request.get(resident, {json: true})
            }
            catch(err) {
                throw new Error(`We experienced an error while fetching data from ${resident}: ${err}`)
            }
            
            residentNames.push(residentDetails.name)
        }

        planet.residents = residentNames
    }

    res.status(200).send(planets)
}))

app.use((err, req, res, next) => {
    res.status(500).json({
        success: false,
        error: err.message
    })
})

app.listen(app.get('port'), () => console.log(`Server running on port ${app.get('port')}`))

const fetchAllFromSwapi = async (resource) => {

    let results = []

    let url = `https://swapi.co/api/${resource}`
    
    do {
        var resourcePage = await request.get(url, { json: true })

        results = results.concat(resourcePage.results)
        url = resourcePage.next
    }
    while(resourcePage.next)

    return results

}