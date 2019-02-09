const express = require('express')
const request = require('request-promise')

const app = express()
const port = 3000

app.get('/people', async (req, res) => {
    let people = await fetchAllFromSwapi('people')
    res.send(people)
})

app.get('/planets', async (req, res) => {
    let planets = await request.get('https://swapi.co/api/planets')
    res.send(planets)
})

app.listen(port, () => console.log(`Server running on port ${port}`))

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