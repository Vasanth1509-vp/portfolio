// Vercel Serverless Function for ServiceNow API
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const CONFIG = {
        instance: 'dev281875.service-now.com',
        table: 'x_941497_git_repo_servicenow_mainline',
        credentials: {
            username: process.env.SERVICENOW_USERNAME || 'vasanth',
            password: process.env.SERVICENOW_PASSWORD || 'Stark@15'
        }
    };

    try {
        const base64Credentials = Buffer.from(
            `${CONFIG.credentials.username}:${CONFIG.credentials.password}`
        ).toString('base64');

        const response = await fetch(
            `https://${CONFIG.instance}/api/now/table/${CONFIG.table}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${base64Credentials}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`ServiceNow API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching certifications:', error);
        res.status(500).json({ error: error.message });
    }
} 