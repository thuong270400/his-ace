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
            if (
                req.query.SendSuccess
                && req.query.SendSuccess > 0) {
                await delay(2000);
                try {
                  const results = await axios.post(
                    `http://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_post_json/`,
                    {
                      Content: `Lịch khám tại DKQTSG:\n` +
                        `Your health check-up appointment at SIGC:\n` +
                        `Ngày khám/ Date: ${bodyReq.date ? bodyReq.date : 'Chưa đặt lịch'}\n` +
                        `Giờ khám/ Time: ${bodyReq.shift ? bodyReq.shift : 'Chưa đặt lịch'}\n` +
                        `Nếu muốn thay đổi thông tin, xin vui lòng truy cập link:\n` +
                        `If you wish to change this info, please access the link:\n` +
                        `${process.env.DOMAIN_SERVER}/${shortUrl} .\n` +
                        // `${dateToCompare ? `Hạn chót điều chỉnh/ Last editable day: 07-11-3000.\n` : ''}` +
                        `${dateToCompare ? `Hạn chót điều chỉnh/ Last editable day: ${dateToCompare.getDate()}-${dateToCompare.getMonth() + 1}-${dateToCompare.getFullYear()}.\n` : ''}` +
                        `Xin cảm ơn quý khách.\n` +
                        `Thanks for your time.`,
                      Phone: phone_number,
                      ApiKey: "C671FB9BF15391FA5FFC62A3AC9A34",
                      SecretKey: "D3C47022E82732DD589C9E2AC56742",
                      Brandname: "DKQT.SAIGON",
                      SmsType: "2",
                      IsUnicode: 1,
                      Sandbox: 0,
                      campaignid: "abc",
                      RequestId: `${request_id}${generateRandomString(6)}`,
                      //    "CallbackUrl": "CallbackUrl"
                    }
                  );
                  if (results) {
                    console.log("results", results?.headers?.date ? results.headers.date : '');
                    isSMSSent = true;
                    const updateIsSent = gql`
                      mutation MyMutation {
                        update_his_ace_patients(where: {id: {_eq: "${request_id}"}}, _set: {is_mess_sent: 1}) {
                          affected_rows
                          returning {
                            id
                          }
                        }
                      }
                    `;
                    // console.log('insert his_ace_shortlinks_insert_input', updateIsSent);
                    const variables = {
                    };
                    await request(endpoint, updateIsSent, variables, headers)
                      .then(async function (data) {
                        console.log(data)
                        // kiểm tra có dữ liệu đã insert hay không
                        if (data.update_his_ace_patients?.affected_rows) {
                          console.log('Đã cập nhật trạng thái đã gửi!');
                        } else {
                          console.log('Cập nhật trạng thái đã gửi không thành công!');
                        }
                      })
                      .catch(error => {
                        console.error(error)
                        console.log('Lỗi cập nhật trạng thái gửi tin nhắn!');
                        res.json({ success: isSMSSent, updateStatus: false });
                      });
                  } else {
                    console.log("false");
                  }
                  // thực hiện gửi sms delay tại đây
                  response.sms_now = true
                  response.short_url = `${process.env.DOMAIN_SERVER}/${shortUrl}`

                } catch (error) {
                  console.log("error in send sms", error);
                }
            }
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