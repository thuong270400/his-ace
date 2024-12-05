const { Client } = require('pg');

// Hàm để tạo kết nối và thực hiện truy vấn
async function queryDatabase(queryText, params) {
  // Cấu hình thông tin kết nối
  const client = new Client({
    user: 'kiethh',       // Tên người dùng PostgreSQL
    host: '192.168.90.117',           // Host PostgreSQL (vd: localhost)
    database: 'phuongdong',   // Tên cơ sở dữ liệu
    password: 'ZLP4k2AAty35',   // Mật khẩu người dùng
    port: 5444,                  // Cổng kết nối PostgreSQL (thông thường là 5432)
  });

  try {
    // Kết nối tới PostgreSQL
    await client.connect();
    console.log('Kết nối thành công đến PostgreSQL');

    // Thực hiện truy vấn với câu lệnh SQL và tham số (nếu có)
    const result = await client.query(queryText, params);

    // Trả về kết quả của truy vấn
    return result;
  } catch (err) {
    console.error('Lỗi khi thực hiện truy vấn:', err.stack);
    throw err;
  } finally {
    // Đóng kết nối sau khi hoàn thành
    await client.end();
    console.log('Đã ngắt kết nối với PostgreSQL');
  }
}

module.exports = { queryDatabase };
