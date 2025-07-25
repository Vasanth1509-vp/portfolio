const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();

// Enable CORS for localhost
app.use(cors({
    origin: 'http://localhost:5500' // Adjust this port if you're using a different one
}));

// Proxy endpoint for ServiceNow
app.get('/api/certifications', async (req, res) => {
    const CONFIG = {
        instance: 'dev281875.service-now.com',
        table: 'x_941497_git_repo_servicenow_mainline',
        credentials: {
            username: 'vasanth',
            password: 'Stark@15'
        }
    };

    try {
        const response = await fetch(
            `https://${CONFIG.instance}/api/now/table/${CONFIG.table}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(`${CONFIG.credentials.username}:${CONFIG.credentials.password}`).toString('base64'),
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('ServiceNow Error:', errorText);
            res.status(response.status).send(errorText);
            return;
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Proxy Server Error:', error);
        res.status(500).send(error.message);
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
}); 