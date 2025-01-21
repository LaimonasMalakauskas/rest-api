import Dev from '../models/programuotojas.js'

const handleErrors = (err) => {
    let errors = {vardas: '', tech: '', laisvas: '', location: ''}
    if(err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message
        })
    }
    return errors
}

// Testavimui: Vilnius - http://localhost:3002/api/programuotojai/?lng=54.68916&lat=25.2798

export const prog_get = (req, res) => {
    const lng = parseFloat(req.query.lng)
    const lat = parseFloat(req.query.lat)

    console.log('Parsed Coordinates:', lng, lat)

    Dev.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng, lat],
                },
                distanceField: 'distance',
                spherical: true,
                maxDistance: 100000, // in meters (100km)
            },
        },
    ])
        .then(devs => {
            console.log('Found Developers:', devs)
            res.json(devs) // Užtikrina, kad atsakymas yra JSON formatas
        })
        .catch(error => {
            console.error('Error:', error)
            res.status(500).json({ message: error.message }) // Grąžina klaidos pranešimą JSON formatu
        });
};

//suranda visus programuotojus

export const prog_get_all = async (req, res) => {
    try {
        const programuotojai = await Dev.find()
        res.render('programuotojai', { programuotojai })
    } catch (err) {
        console.error('Klaida:', err)
        res.status(500).send('Nepavyko įkelti programuotojų sąrašo.')
    }
};

export const prog_new = (req, res) => {
    res.render('naujas-programuotojas')
};

//naujas irasas

export const prog_post = async (req, res) => {
    console.log('Received POST request:', req.body)

    const { vardas, tech, laisvas, longitude, latitude } = req.body
    try {
        const location = {
            type: 'Point',
            coordinates: [longitude, latitude]
        };
        const dev = await Dev.create({ vardas, tech, laisvas, location })
        res.redirect('/api/programuotojai/all')
    } catch (err) {
        console.log('Error saving new developer:', err)
        const errors = handleErrors(err)
        res.render('naujas-programuotojas', { errors: errors || {} })
    }
};

//suranda programuotoja pagal id

export const prog_get_by_id = (req, res) => {
    const { id } = req.params

    Dev.findById(id)
        .then(programuotojas => {
            if (!programuotojas) {
                return res.status(404).send('Programuotojas nerastas.');
            }
            res.render('redaguoti', { programuotojas })
        })
        .catch(err => {
            console.error('Klaida gaunant programuotoją:', err)
            res.status(500).send('Nepavyko gauti programuotojo informacijos.')
        });
};

//vykdo update

export const prog_put = (req, res) => {
    const { vardas, tech, laisvas, longitude, latitude } = req.body
    const location = {
        type: 'Point',
        coordinates: [longitude, latitude]
    };

    Dev.findByIdAndUpdate(req.params.id, { vardas, tech, laisvas, location }, { new: true })
        .then(updatedDev => {
            if (!updatedDev) {
                return res.status(404).send('Programuotojas nerastas.')
            }
            res.redirect('/api/programuotojai/all')
        })
        .catch(err => {
            console.log(err)
            res.status(500).send('Nepavyko atnaujinti programuotojo.')
        })
}

//trina programuotoja

export const prog_delete = (req, res) => {
    const { id } = req.params;
    console.log('Deleting developer with ID:', id)

    Dev.findByIdAndDelete(id)
        .then(deletedDev => {
            if (!deletedDev) {
                console.log('Programuotojas nerastas.')
                return res.status(404).send('Programuotojas nerastas.')
            }
            console.log('Programuotojas ištrintas')
            res.redirect('/api/programuotojai/all')
        })
        .catch(err => {
            console.error('Klaida tryniant programuotoją:', err)
            res.status(500).send('Nepavyko ištrinti programuotojo.')
        })
}



