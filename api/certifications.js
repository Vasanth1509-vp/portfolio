import fetch from 'node-fetch';

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
        console.log('Fetching certifications from ServiceNow...');
        const base64Credentials = Buffer.from(
            `${CONFIG.credentials.username}:${CONFIG.credentials.password}`
        ).toString('base64');

        const url = `https://${CONFIG.instance}/api/now/table/${CONFIG.table}`;
        console.log('ServiceNow URL:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${base64Credentials}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('ServiceNow Response Status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('ServiceNow Error Response:', errorText);
            throw new Error(`ServiceNow API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('ServiceNow Raw Response:', data);
        
        // Transform the data to match the expected format
        const formattedResult = data.result.map(cert => ({
            name: cert.certification_name || cert.name || 'Untitled Certification',
            issuing_organization: cert.issuing_organization || cert.organization || 'Unknown Organization',
            issue_date: cert.issue_date || cert.issued_date || new Date().toISOString(),
            expiry_date: cert.expiry_date || cert.expiration_date || null,
            credential_url: cert.credential_url || cert.verify_url || null,
            badge_url: cert.badge_url || cert.image_url || 'https://via.placeholder.com/100'
        }));

        console.log('Formatted Result:', formattedResult);
        res.status(200).json({ result: formattedResult });
    } catch (error) {
        console.error('Error in API handler:', error);
        res.status(500).json({ error: error.message });
    }
} 