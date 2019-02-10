const express = require('express')
const request = require('request-promise')

const app = express()
const port = 3000

app.get('/people', async (req, res) => {
    let people = await fetchAllFromSwapi('people')

    if (req.query.sortBy && ['name', 'height', 'mass'].includes(req.query.sortBy)) {
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

    res.send(people)
})

app.get('/planets', async (req, res) => {
    let planets = await fetchAllFromSwapi('planets')

    for (var planet of planets) {
        let residentNames = []

        for (var resident of planet.residents) {
            let residentDetails = await request.get(resident, {json: true})
            residentNames.push(residentDetails.name)
        }

        planet.residents = residentNames
    }

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