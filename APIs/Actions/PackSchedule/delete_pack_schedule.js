// server/APIs/login.js
const { query } = require('express');
const { request, gql } = require('graphql-request');
const endpoint = 'https://s-deal-app.hasura.app/v1/graphql';
const headers = {
  'x-hasura-admin-secret': 'Dx7ZGDCbTd3URW4Csh42UrkZTllgjLtmbBQ3TR5Gh8Ze34qXKFWYKjcCdwO2Nemr', // hoặc 'x-hasura-access-key': 'your-access-key'
};
require('dotenv').config();

module.exports = function (req, res) {
  if (req.body?.session_packs) {

    let tempObjects = req.body?.session_packs
    console.log('tempObjects', tempObjects);
    let session_pack_ids = []
    if (tempObjects) {
      tempObjects.forEach(element => {
        session_pack_ids.push(element.id)
      });
    }
    console.log('session_pack_ids', session_pack_ids);
    let mutate = ``;
    console.log('tempObjects.is_exist', tempObjects.is_exist);
    if (session_pack_ids) {
      console.log('update');
      mutate = gql`
        mutation {
          delete_his_ace_appointment_company_service_packs(where: { id: { _in: [${session_pack_ids}] } }) {
            affected_rows
          }
        }
      `;
    }
    console.log('mutate', mutate);

    const variables = {
    };
    request(endpoint, mutate, variables, headers)
      .then(function (data) {
        console.log(data)
        res.json(data)
      })
      .catch(error => console.error(error));
  } else {
    console.log('req.body?.session_pack', req.body);
  }
};