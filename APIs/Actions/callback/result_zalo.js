// server/APIs/login.js
const express = require('express');
const { request, gql } = require('graphql-request');
const axios = require('axios');
require('dotenv').config();
const e = require("express");
const querystring = require('querystring');

module.exports = async function (req, res) {
    try {
        if (req?.query) {
            console.log('callback: req.query:', req.query);
            if (!res.headersSent) {
                res.status(200).send('có param!');
            }
        } else if (req?.body) {
            console.log('callback: req.query:', req.body);
            if (!res.headersSent) {
                res.status(200).send('có param!');
            }
        }
    } catch (error) {
        console.log('test fail', error);
        if (!res.headersSent) {
            res.status(500).send('Gọi call back không thành công!');
        }
    }
};