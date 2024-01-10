const twilio = require('twilio');

// Thay thế bằng các thông tin từ tài khoản Twilio của bạn
const accountSid = 'AC007f864b977461e4690990eabdb861fd';
const authToken = '8c140d684a93058f4d777f03ab5c2cbc';
const twilioPhoneNumber = '+17274757659';

const client = new twilio(accountSid, authToken);

// Thay thế số điện thoại người nhận và nội dung tin nhắn theo ý của bạn
const toPhoneNumber = '+84363654126';
const messageBody = 'Hello from Twilio!';

client.messages
  .create({
    body: messageBody,
    from: twilioPhoneNumber,
    to: toPhoneNumber,
  })
  .then((message) => console.log(message.sid))
  .catch((error) => console.error(error));
