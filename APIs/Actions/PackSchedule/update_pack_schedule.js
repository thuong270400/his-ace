// server/APIs/login.js
const { query } = require('express');
const { request, gql } = require('graphql-request');
const endpoint = 'https://s-deal-app.hasura.app/v1/graphql';
const headers = {
  'x-hasura-admin-secret': 'Dx7ZGDCbTd3URW4Csh42UrkZTllgjLtmbBQ3TR5Gh8Ze34qXKFWYKjcCdwO2Nemr', // hoặc 'x-hasura-access-key': 'your-access-key'
};
require('dotenv').config();

module.exports = function (req, res) {
  if (req.body?.session_pack) {

    let tempObject = req.body?.session_pack
    let mutate = ``;
    console.log('tempObject.is_exist', tempObject.is_exist);
    if (tempObject.is_exist) {
      console.log('update');
      mutate = gql`
        mutation {
          update_his_ace_appointment_company_service_packs(
            where: { id: { _eq: ${tempObject.id} } }
            _set: { total_slot: ${tempObject.total_slot} }
          ) {
            affected_rows
          }
        }
      `;
    } else {
      console.log('insert');
      mutate = gql`
        mutation {
          insert_his_ace_appointment_company_service_packs(objects: {
            appointment_session_id: ${tempObject.appointment_session_id}, 
            company_service_pack_id: ${tempObject.pack_id}, 
            total_slot: ${tempObject.total_slot}
          }) {
            affected_rows
            returning {
              id
            }
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