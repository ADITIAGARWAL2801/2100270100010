const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 20;
let storedNumbers = [];

const thirdPartyApiUrl = {
    'p': 'http://20.244.56.144/test/prime',
    'f': 'http://20.244.56.144/test/fibonacci',
    'e': 'http://20.244.56.144/test/even',
    'r': 'http://20.244.56.144/test/random'
};

app.get('/numbers/:numberid', async (req, res) => {
    const numberId = req.params.numberid;

    if (!['p', 'f', 'e', 'r'].includes(numberId)) {
        return res.status(400).json({ error: 'Invalid number ID' });
    }

    const url = thirdPartyApiUrl[numberId];
    let fetchedNumbers = [];
    let windowPrevState = [...storedNumbers];

    try {
        const startTime = Date.now();
        const response = await axios.get(url, { timeout: 500 });

        if (Date.now() - startTime > 500) {
            throw new Error('Request took longer than 500 ms');
        }

        fetchedNumbers = response.data.numbers;

        // Add unique numbers to the storedNumbers array
        fetchedNumbers.forEach(number => {
            if (!storedNumbers.includes(number)) {
                if (storedNumbers.length >= WINDOW_SIZE) {
                    storedNumbers.shift();
                }
                storedNumbers.push(number);
            }
        });

        const average = storedNumbers.reduce((a, b) => a + b, 0) / storedNumbers.length;

        let windowCurrState = [...storedNumbers];

        res.json({
            windowPrevState: windowPrevState,
            windowCurrState: windowCurrState,
            numbers: fetchedNumbers,
            avg: storedNumbers.length ? average.toFixed(2) : null
        });
    } catch (error) {
        console.error('Error fetching number:', error);
        res.status(500).json({ error: 'Failed to fetch number' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});