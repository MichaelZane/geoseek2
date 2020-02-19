const express = require('express')
const multer = require('multer')
const router = express.Router()
const photoModel = require('./photo-model')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads')
    },
    filename: (req, file, cb) => {
        console.log(file)
        cb(null, `${file.fieldname}_${+new Date()}.jpeg`)
    }
});

const upload = multer({
    storage
});

//ENDPOINT TO TEST IF USERS CAN SEE PHOTOS. DELETE THIS ENDPOINT ONCE '/:gemId' IS UP
router.get('/', async (req, res, next) => {
    const photos = await photoModel.findAll()
    res.json(photos)
});

// Get GEM BY ID, NEDDS SEED DATA 
router.get('/:gemId', async (req, res, next) => {
    const photos = await photoModel.findPhotoByGem(req.params.gemId)
    res.json(photos)
});




router.post('/add/gemId', upload.single('photo'), async (req, res, next) => {
    try {
        console.log(req.params)
        const path = req.file.path
        const { name, description } = req.body
        const entry = await photoModel.createPhoto({
            name,
            gem_id: req.params.gemId, //NEEDS SEED DATA FOR THIS TO WORK
            description,
            photo_url: path
        })
        res.json(entry)
    } catch (ex) {
        console.log(ex)
        res.status(400).send({error: ex })
    }
});



router.put('/edit', upload.single('photo'), async(req, res, next) => {
    try {
        const path = req.file && req.file.path
        const { id, name, description } = req.body
        
        let params = {}
        if(path) {
            params ={
                name,
                description,
                photo_url: path
            }
        }else {
            params = {
                name,
                description
            };
        }
        const photo = await photoModel.editPhoto(params, {
            where: {
                id
            }
        });
        res.json(photo)
    }catch(ex){
        console.log(ex)
        res.status(400).send({ error:ex})
    }
})
router.delete('/delete/:id', async (req, res, next) => { 
    const { id } = req.params
    await photoModel.destory({
        where: {
            id
        }
    });
    res.json({ deleted: id })
 })

module.exports = router

    