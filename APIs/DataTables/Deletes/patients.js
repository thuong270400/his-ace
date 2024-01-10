// server/APIs/login.js
const { query } = require('express');
const { request, gql } = require('graphql-request');
const endpoint = 'https://s-deal-app.hasura.app/v1/graphql';
const headers = {
  'x-hasura-admin-secret': 'Dx7ZGDCbTd3URW4Csh42UrkZTllgjLtmbBQ3TR5Gh8Ze34qXKFWYKjcCdwO2Nemr', // hoặc 'x-hasura-access-key': 'your-access-key'
};
require('dotenv').config();
module.exports = function (req, res) {
  console.log('req.body patient delete', req.body);
  if (req.query && req.body.patient_id) {
    // Câu lệnh truy vấn
    console.log(req.body.patient_id);

    const mutation = gql`
      mutation MyMutation {
        delete_his_ace_patients(where: {id: {_eq: ${'"' + req.body.patient_id + '"'}}}) {
          affected_rows
          returning {
            id
          }
        }
      }
    `;
    const variables = {
    };
    request(endpoint, mutation, variables, headers)
      .then(function (data) {
        console.log(data)
        res.json(data)
      })
      .catch(error => console.error(error));
  } else {
  }
};