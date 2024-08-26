const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt'); // เพิ่ม bcrypt สำหรับการเข้ารหัส
const app = express();
const port = 3000;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'shopdee'
});

db.connect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// การเพิ่มสินค้าลงในฐานข้อมูล
app.post('/product', function(req, res) {
    const { productName, productDetail, price, cost, quantity } = req.body;
    const sql = "INSERT INTO product (productName, productDetail, price, cost, quantity) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [productName, productDetail, price, cost, quantity], function(err, result) {
        if (err) {
            console.error(err.message);
            return res.status(500).send({"message": "เกิดข้อผิดพลาดในระบบ"});
        }
        res.send({"message": "บันทึกข้อมูลสำเร็จ", 'status': true});
    });
});

// การดึงข้อมูลสินค้าด้วย productID
app.get('/product/:id', function(req, res) {
    const productID = req.params.id;
    const sql = "SELECT * FROM product WHERE productID = ?";
    db.query(sql, [productID], function(err, result) {
        if (err) {
            console.error(err.message);
            return res.status(500).send({"message": "เกิดข้อผิดพลาดในระบบ"});
        }
        res.send(result);
    });
});

// การเข้าสู่ระบบ
app.post('/login', function(req, res) {
    const { username, password } = req.body;
    const sql = "SELECT * FROM customer WHERE username = ? AND isActive = 1";

    db.query(sql, [username], async function(err, result) {
        if (err) {
            console.error(err.message);
            return res.status(500).send({"message": "เกิดข้อผิดพลาดในระบบ"});
        }
        if (result.length > 0) {
            const customer = result[0];

            // ตรวจสอบรหัสผ่านที่เข้ารหัสกับ bcrypt
            const match = await bcrypt.compare(password, customer.password);
            if (match) {
                customer['message'] = "เข้าสู่ระบบสำเร็จ";
                res.send(customer);
            } else {
                res.send({"message": "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง", 'status': false});
            }
        } else {
            res.send({"message": "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง", 'status': false});
        }
    });
});

app.listen(port, function() {
    console.log(`server listening on port ${port}`);
});
