const express = require("express");
const path = require("path");
const db = require("./config/database");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/website", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/test", (req, res) => {
    res.json({ success: true, message: "Ken's Entreprise Backend is running!" });
});

app.get("/api/test-db", (req, res) => {
    db.query("SELECT 1 AS connected", (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Database connection failed",
                error: err.message
            });
        }
        res.json({
            success: true,
            message: "Ken's Entreprise is connected to MySQL!",
            result: results
        });
    });
});

app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: "Username and password are required."
        });
    }

    const sql = `
        SELECT admin_id, username, full_name
        FROM admins
        WHERE username = ? AND password = ?
    `;

    db.query(sql, [username, password], (err, results) => {
        if (err) {
            console.error("Login database error:", err);
            return res.status(500).json({
                success: false,
                message: "Database error.",
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password."
            });
        }

        res.json({
            success: true,
            message: "Admin login successful!",
            admin: {
                admin_id: results[0].admin_id,
                username: results[0].username,
                full_name: results[0].full_name
            }
        });
    });
});


// Services for the frontend
app.get("/api/services", (req, res) => {
    db.query("SELECT service_id, service_name, description FROM services ORDER BY service_id", (err, rows) => {
        if (err) return res.status(500).json({success:false,message:"Could not load services",error:err.message});
        res.json({success:true,services:rows});
    });
});

// Submit a customer service request
app.post("/api/service-requests", (req, res) => {
    const { full_name, phone, email, service_id, request_details } = req.body;
    if (!full_name || !phone || !service_id) return res.status(400).json({success:false,message:"Name, phone and service are required."});

    db.query("SELECT customer_id FROM customers WHERE phone = ? LIMIT 1", [phone], (err, rows) => {
        if (err) return res.status(500).json({success:false,message:"Customer lookup failed",error:err.message});
        const save = (customerId) => {
            db.query("INSERT INTO service_requests (customer_id, service_id, request_details) VALUES (?,?,?)", [customerId,service_id,request_details||""], (e,r) => {
                if (e) return res.status(500).json({success:false,message:"Could not save request",error:e.message});
                res.json({success:true,message:"Service request submitted successfully!",request_id:r.insertId});
            });
        };
        if (rows.length) return save(rows[0].customer_id);
        db.query("INSERT INTO customers (full_name,phone,email) VALUES (?,?,?)", [full_name,phone,email||null], (e,r) => {
            if (e) return res.status(500).json({success:false,message:"Could not create customer",error:e.message});
            save(r.insertId);
        });
    });
});

// Contact message
app.post("/api/messages", (req, res) => {
    const { full_name, phone, email, subject, message } = req.body;
    if (!message) return res.status(400).json({success:false,message:"Message is required."});
    const save = (customerId) => db.query("INSERT INTO messages (customer_id,subject,message) VALUES (?,?,?)", [customerId,subject||"Website Message",message], (e,r) => {
        if (e) return res.status(500).json({success:false,message:"Could not save message",error:e.message});
        res.json({success:true,message:"Message sent successfully!",message_id:r.insertId});
    });
    db.query("SELECT customer_id FROM customers WHERE phone = ? LIMIT 1", [phone||""], (err,rows) => {
        if (err) return res.status(500).json({success:false,message:"Customer lookup failed",error:err.message});
        if (rows.length) return save(rows[0].customer_id);
        db.query("INSERT INTO customers (full_name,phone,email) VALUES (?,?,?)", [full_name||"Website Visitor",phone||"Not provided",email||null], (e,r) => {
            if (e) return res.status(500).json({success:false,message:"Could not create customer",error:e.message});
            save(r.insertId);
        });
    });
});

// Admin dashboard data
app.get("/api/admin/summary", (req,res) => {
    const q=["customers","services","service_requests","messages"], out={};
    let done=0;
    q.forEach(t=>db.query(`SELECT COUNT(*) total FROM ${t}`,(e,r)=>{
        if(e) return res.status(500).json({success:false,message:"Could not load dashboard",error:e.message});
        out[t]=r[0].total; if(++done===q.length) res.json({success:true,summary:out});
    }));
});

app.get("/api/admin/requests", (req,res) => {
    const sql=`SELECT r.request_id,c.full_name,c.phone,s.service_name,r.request_details,r.status,r.created_at FROM service_requests r JOIN customers c ON r.customer_id=c.customer_id JOIN services s ON r.service_id=s.service_id ORDER BY r.created_at DESC`;
    db.query(sql,(e,r)=> e ? res.status(500).json({success:false,message:e.message}) : res.json({success:true,requests:r}));
});

app.get("/api/admin/messages", (req,res) => {
    const sql=`SELECT m.message_id,c.full_name,c.phone,c.email,m.subject,m.message,m.status,m.created_at FROM messages m LEFT JOIN customers c ON m.customer_id=c.customer_id ORDER BY m.created_at DESC`;
    db.query(sql,(e,r)=> e ? res.status(500).json({success:false,message:e.message}) : res.json({success:true,messages:r}));
});

app.get("/api/admin/customers", (req,res) => {
    db.query("SELECT * FROM customers ORDER BY created_at DESC",(e,r)=> e ? res.status(500).json({success:false,message:e.message}) : res.json({success:true,customers:r}));
});

app.put("/api/admin/requests/:id/status", (req,res) => {
    const allowed=["Pending","Approved","Completed","Cancelled"];
    if(!allowed.includes(req.body.status)) return res.status(400).json({success:false,message:"Invalid status"});
    db.query("UPDATE service_requests SET status=? WHERE request_id=?",[req.body.status,req.params.id],e=> e ? res.status(500).json({success:false,message:e.message}) : res.json({success:true,message:"Status updated"}));
});

app.listen(PORT, () => {
    console.log("=================================");
    console.log("   KEN'S ENTREPRISE BACKEND");
    console.log("=================================");
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Website: http://localhost:${PORT}/`);
    console.log(`Admin Login: http://localhost:${PORT}/login.html`);
});
