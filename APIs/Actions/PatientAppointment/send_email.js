// server/APIs/login.js
const express = require('express');
const { request, gql } = require('graphql-request');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const endpoint = 'https://s-deal-app.hasura.app/v1/graphql';
const headers = {
  'x-hasura-admin-secret': 'Dx7ZGDCbTd3URW4Csh42UrkZTllgjLtmbBQ3TR5Gh8Ze34qXKFWYKjcCdwO2Nemr', // hoặc 'x-hasura-access-key': 'your-access-key'
};
require('dotenv').config();
const app = express();
app.use(express.json());
// Tạo một transporter với tài khoản Gmail của người gửi

module.exports = async function (req, res) {
  req.body?.variable
  const email = req.body?.variable
  if (email) {
    const ToKen = jwt.sign({
      email: email
    },
      process.env.SECRET_KEY,
      {
        expiresIn: "3 days"
      });
    console.log('ToKen', ToKen);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'caochithuongfk1@gmail.com',
        pass: 'wyxd ohjq yumt nmme',
      },
    });

    // Thông tin về email muốn gửi
    const mailOptions = {
      from: 'caochithuongfk1@gmail.com',
      to: email,
      subject: 'Chủ đề của email',
      text: "Nội dung của email:\n"
        + `http://localhost:3000/clients/choose_appointment/?token=${ToKen}`,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email đã được gửi:', info.response);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Lỗi khi gửi email:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }
};