const fetchGQL = require('graphql-client');

const client = new fetchGQL({
    url: 'https://s-deal-app.hasura.app/v1/graphql',
    headers: {
        'content-type': 'application/json',
        'x-hasura-admin-secret': 'Dx7ZGDCbTd3URW4Csh42UrkZTllgjLtmbBQ3TR5Gh8Ze34qXKFWYKjcCdwO2Nemr'
    }
})

// Biến thêm vào như hôm trước đã nói, nếu có tùy biến  
module.exports = client;