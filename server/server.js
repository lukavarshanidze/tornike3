// backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { sequelize, Data } = require('./utils/database');
const upload = require('./upload');

const app = express();
const port = 8080;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('uploads'));

// Connect to the database

app.post('/api/upload', upload.single('image'), (req, res) => {
    try {
        res.status(200).json({ filePath: req.file.path });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Routes
app.post('/api/data', async (req, res) => {
    const { text, image, header } = req.body;
    console.log(text);

    try {
        const newData = await Data.create({ header, text, image });
        res.status(201).json(newData);
    } catch (error) {
        console.error('Error adding data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/data', async (req, res) => {
    try {
        const data = await Data.findAll();
        console.log(data);
        res.status(200).json(data);
    } catch (error) {
        // console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/getData/:id', async (req, res) => {
    const id = req.params.id
    console.log('id', id);
    try {
        const data = await Data.findByPk(id);
        console.log(data);
        res.status(200).json(data);
    } catch (error) {
        // console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.patch('/api/data/edit/:id', async (req, res) => {
    const id = req.params.id
    console.log(id, 'iddddd');
    const { text, header } = req.body
    try {
        const data = await Data.findByPk(id);
        if (data) {
            data.text = text
            data.header = header
            await data.save()
        }
        res.status(200).json(data);
    } catch (error) {
        // console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

app.delete('/api/data/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const record = await Data.findByPk(id);
        if (record) {
            // Delete image file if it exists
            if (record.image) {
                const imagePath = path.join(__dirname, 'uploads', path.basename(record.image));
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }

            await record.destroy();
            res.status(200).json({ message: 'Record and image deleted successfully' });
        } else {
            res.status(404).json({ error: 'Record not found' });
        }
    } catch (error) {
        console.error('Error deleting data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/data/pinned', async (req, res) => {
    try {
        const data = await Data.findAll({
            order: [
                ['pinned', 'DESC'],
                ['pinnedAt', 'DESC'],
            ],
        });
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching pinned data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.patch('/api/data/:id/pin', async (req, res) => {
    const { id } = req.params;
    const { pinned } = req.body;

    try {
        const record = await Data.findByPk(id);
        if (record) {
            record.pinned = pinned;
            record.pinnedAt = pinned ? new Date() : null; // Set or clear the pinnedAt timestamp
            await record.save();

            // Fetch and return all records sorted by pinned status and pinnedAt
            const allRecords = await Data.findAll({
                order: [
                    ['pinned', 'DESC'],
                    ['pinnedAt', 'DESC'],
                ],
            });

            res.status(200).json(allRecords);
        } else {
            res.status(404).json({ error: 'Record not found' });
        }
    } catch (error) {
        console.error('Error updating pinned status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// app.listen(5009, () => {
//     console.log(`Server running on http://localhost:${port}`);
// });


sequelize.sync()
    .then(result => {
        app.listen(8080, () => {
            console.log('port is listening to this ha');
        })
    })
    .catch(err => {
        console.error('clg er', err.original);
    })
