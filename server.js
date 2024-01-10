const express = require('express');
const client = require('./ConnectDatabase/his_ace')
const bodyParser = require('body-parser');
// const twilioConfig = require('./middlewares/twilioConfig');
// const clientTwilio = require('twilio')(twilioConfig.accountSid, twilioConfig.authToken);
const admin = require('firebase-admin');
const serviceAccount = require('./middlewares/tfbvn-3755f-firebase-adminsdk-h72hc-8cb73c10aa.json'); // Đường dẫn đến tệp JSON chứa thông tin xác thực
const firebase = require('firebase/app');
require('firebase/messaging');

var app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const auth = require('./middlewares/auth')
const path = require('path');
const multer = require('multer'); // Import multer for handling multipart/form-data
const sharp = require('sharp'); // Import sharp for image processing

const fs = require('fs'); // Import the fs module
require('dotenv').config();
// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyAl8t6hWMkUmYS-tW-CeimReeqxdVdYVso",
//   authDomain: "tfbvn-3755f.firebaseapp.com",
//   databaseURL: "https://tfbvn-3755f-default-rtdb.asia-southeast1.firebasedatabase.app",
//   projectId: "tfbvn-3755f",
//   storageBucket: "tfbvn-3755f.appspot.com",
//   messagingSenderId: "182751926310",
//   appId: "1:182751926310:web:c8a21b16021910f4ddaee7",
//   measurementId: "G-6SHCHXWGBB"
// };

const firebaseConfig = {
  apiKey: "AIzaSyAl8t6hWMkUmYS-tW-CeimReeqxdVdYVso",
  authDomain: "tfbvn-3755f.firebaseapp.com",
  projectId: "tfbvn-3755f",
  storageBucket: "tfbvn-3755f.appspot.com",
  messagingSenderId: "182751926310",
  appId: "1:182751926310:web:c8a21b16021910f4ddaee7",
  // measurementId: "G-6SHCHXWGBB"
};

firebase.initializeApp(firebaseConfig);
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

// cấu hình cho phép cổng truy cập
app.all('/*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Cấu hình admin để gửi sms
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// ==SMS==

// app.post('/send-fcm', async (req, res) => {
//   try {
//     const { token, message } = req.body;

//     const payload = {
//       notification: {
//         title: 'Your Notification Title',
//         body: message,
//       },
//     };

//     const options = {
//       priority: 'high',
//       timeToLive: 60 * 60 * 24, // 1 day
//     };

//     const response = await admin.messaging().sendToDevice(token, payload, options);

//     console.log('FCM sent:', response);
//     res.status(200).send('FCM sent successfully');
//   } catch (error) {
//     console.error('Error sending FCM:', error);
//     res.status(500).send('Failed to send FCM');
//   }
// });


// ==IMAGE==
// Configure multer to save uploaded files in a specific directory
const storage_img = multer.memoryStorage(); // Store uploaded files in memory
const upload_img = multer({ storage_img });

// lấy ảnh gửi lên từ client lưu vào server
app.post('/upload-logo-company', upload_img.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(800).send('No image uploaded.');
    }

    const optimizedImageBuffer = await sharp(req.file.buffer)
      .resize({ width: 400 })
      .jpeg({ quality: 80 })
      .toBuffer();
    // Save the optimized image to the public/img directory
    console.log('req.file.originalname', req.file.originalname);
    const convertImageName = req.file.originalname.split('.')[0] + '.jpg'
    console.log('convertImageName', convertImageName);
    const imagePath = path.join(__dirname, 'assets', 'CompanyLogos', convertImageName);
    fs.writeFileSync(imagePath, optimizedImageBuffer);

    res.status(200).send('Image uploaded, optimized, and saved.');
  } catch (error) {
    console.error('Error uploading and saving image:', error);
    res.status(500).send('Internal Server Error');
  }
});

// gửi logo công ty về client
app.get('/get_logo_company', (req, res) => {
  console.log('lấy dữ liệu hình ảnh...');
  // 
  if (req.query.imageName) {
    const imageName = req.query.imageName;
    console.log('imageName', req.query.imageName);
    const imagePath = path.join(__dirname, 'assets/CompanyLogos/', imageName); // Đường dẫn tới tệp ảnh
    res.sendFile(imagePath);
  }
  console.log('hoàn tất');
});

// ==LOGIN==
app.get('/login', require('./APIs/login'));

app.get('/auth', auth, function (req, res) {
  // console.log('req after verify', req);
  res.json({
    acceptLogin: true
  })
})
app.get('/fetch-user', auth, function (req, res) {
  if (req.verify) {
    res.json({
      permission: req.verify.permission ? req.verify.permission : null,
      company_id: req.verify.company_id ? req.verify.company_id : null
    })
  } else {
    res.status(500).json({ error: 'Token expired!' });
  }
})

// ==DATA TABLE==
// --companies--
// select
app.get('/select-companies', require('./APIs/DataTables/Selects/companies'));
// insert
app.get('/insert-companies', require('./APIs/DataTables/Inserts/companies'));
// update
app.get('/update-companies', require('./APIs/DataTables/Updates/companies'));
// delete
app.get('/delete-companies', require('./APIs/DataTables/Deletes/companies'));

// --appointment_schedules--
// select
app.get('/select-appointments', auth, require('./APIs/DataTables/Selects/appointment_schedules'));
app.get('/select-appointments-mutate', auth, require('./APIs/DataTables/Selects/appointment_schedules_mutate'));
// insert
// app.get('/insert-appointments', require('./APIs/DataTables/Inserts/companies'));
// update
// app.get('/update-appointments', require('./APIs/DataTables/Updates/companies'));
// delete
// app.get('/delete-appointments', require('./APIs/DataTables/Deletes/companies'));

// --company_service_packs--
// select
app.get('/select-company-service-packs', require('./APIs/DataTables/Selects/company_service_packs'));
app.get('/select-company-service-packs-manager', require('./APIs/DataTables/Selects/manager/company_service_packs_manager'));
app.get('/select-packs-of-company', require('./APIs/DataTables/Selects/packs_of_company'));
app.get('/browse-packs', require('./APIs/DataTables/Selects/browse_packs'));
app.get('/admin-real-num-of-pack', auth, require('./APIs/DataTables/Selects/admin/real_num_of_pack'));
app.get('/manager-real-num-of-pack', auth, require('./APIs/DataTables/Selects/manager/real_num_of_pack'));
// update
app.post('/accept-browse-pack', auth, require('./APIs/DataTables/Updates/accept_browse_pack'));
app.post('/update-pack-info', auth, require('./APIs/DataTables/Updates/update_pack_info'));
app.post('/update-real-num-of-pack', auth, require('./APIs/DataTables/Updates/real_num_of_pack'));
// delete
app.post('/delete-company-service-packs', require('./APIs/DataTables/Deletes/company_service_packs'));

// --patients--
// select
app.get('/select-patients', auth, require('./APIs/DataTables/Selects/patients'));
app.get('/select-patients-manager', auth, require('./APIs/DataTables/Selects/manager/patients'));
app.get('/select-patients-of-pack', auth, require('./APIs/DataTables/Selects/patients_of_pack'));
// insert
// update
app.get('/update-patients', require('./APIs/DataTables/Updates/patients'));
// delete
app.post('/delete-patients', require('./APIs/DataTables/Deletes/patients'));

// --appointment_company_service_packs--
// select
app.get('/select-session-packs', require('./APIs/DataTables/Selects/appointment_company_service_packs'));
// insert
// update
// delete

// ===Action===
// Lấy bệnh nhân cho gói khám
app.get('/auth-email-patient', auth, require('./APIs/Actions/PatientAppointment/get_patient_appointment'));

// Đếm số lượng bệnh nhân của pack_id - sesion_id
app.get('/get-patient-appointment-total', require('./APIs/Actions/PatientAppointment/get_patient_appointment_total'));

// Thêm gói khám cho công ty
app.post('/add-pack-schedule', require('./APIs/Actions/PackSchedule/add_pack_schedule'));
// Cập nhật lịch cho gói khám
app.post('/update-pack-schedule', require('./APIs/Actions/PackSchedule/update_pack_schedule'))
// Xóa lịch cho gói khám
app.post('/delete-pack-schedule', require('./APIs/Actions/PackSchedule/delete_pack_schedule'))

// Thêm bệnh nhân cho gói khám
app.post('/add-patient-appointment', require('./APIs/Actions/PatientAppointment/add_patient_appointment'));

// Thêm lịch cho gói khám
app.post('/add-schedule-session', require('./APIs/Actions/ScheduleSession/add_schedule_session'));

// Cập nhật bệnh nhân cho gói khám
app.post('/update-patient-appointment', require('./APIs/Actions/PatientAppointment/update_patient_appointment'));

// Gửi email
app.post('/send-email', auth, require('./APIs/Actions/PatientAppointment/send_email'));

// --Other
// quick select package_ids
app.get('/quick-select-package_ids', auth, require('./APIs/Actions/Other/QuickSelect/package_ids'));

var server = app.listen(8082, function () {
  console.log("App runing on: " + server.address().address + ":" + server.address().port);
})


