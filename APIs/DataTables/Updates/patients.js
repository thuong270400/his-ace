// server/APIs/login.js
const { query } = require('express');
const { request, gql } = require('graphql-request');
const endpoint = 'https://s-deal-app.hasura.app/v1/graphql';
const headers = {
  'x-hasura-admin-secret': 'Dx7ZGDCbTd3URW4Csh42UrkZTllgjLtmbBQ3TR5Gh8Ze34qXKFWYKjcCdwO2Nemr', // hoặc 'x-hasura-access-key': 'your-access-key'
};
require('dotenv').config();
module.exports = function (req, res) {
  function customStringify(obj, replacer, spaces) {
    const stringify = (key, value) => {
      if (replacer) {
        return replacer(key, value);
      }

      // Nếu giá trị là một đối tượng và không phải là mảng, không thêm nháy kép cho khóa
      if (typeof value === 'object' && !Array.isArray(value)) {
        return `{${Object.keys(value).map(k => `${k}:${stringify(k, value[k])}`).join(',')}}`;
      }

      // Sử dụng JSON.stringify cho tất cả các giá trị khác
      return JSON.stringify(value);
    };

    return JSON.stringify(obj, stringify, spaces);
  }
  if (req.query && req.query.patient) {
    const patient = {}
    // Câu lệnh truy vấn
    if (req.query.patient.email) {
      patient.email = req.query.patient.email
    }
    if (req.query.patient.fullname) {
      patient.fullname = req.query.patient.fullname
    }
    if (req.query.patient.phone_number) {
      patient.phone_number = req.query.patient.phone_number
    }
    if (req.query.patient.birthday) {
      patient.birthday = req.query.patient.birthday
    }
    if (req.query.patient.pack_id) {
      patient.company_service_pack_id = req.query.patient.pack_id
    }
    if (req.query.patient.session_id) {
      patient.appointment_session_id = req.query.patient.session_id
    }
    console.log('patient', patient);
    const PatientStr = customStringify(patient, null, 2).replace(/\\/g, '').replace(/"{/g, '{').replace(/}"/g, '}')
    console.log('insert data companies CompanyStr', PatientStr);
    const update = gql`
      mutation MyMutation($_set: his_ace_patients_set_input = ${PatientStr}) {
        update_his_ace_patients(where: {id: {_eq: ${'"' + req.query.patient.id + '"'}}}, _set: $_set) {
          affected_rows
          returning {
            id
          }
        }
      }
    `;
    const variables = {
    };
    console.log('update mutation', update);
    request(endpoint, update, variables, headers)
      .then(function (data) {
        console.log(data)
        res.json(data)
      })
      .catch(error => console.error(error));
  } else {
  }
};