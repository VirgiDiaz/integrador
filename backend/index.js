const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'integrador'
});

db.connect(err => {
  if (err) {
    console.error('Error al conectar la BD:', err);
  } else {
    console.log('Conectado a la base de datos MySQL');
  }
});

app.get('/productos', (req, res) => {
  const { nombre, codigo } = req.query;

  let sql = 'SELECT * FROM productos';
  let params = [];

  if (codigo) {
    sql += ' WHERE codigo = ?';
    params.push(codigo);
  } else if (nombre) {
    sql += ' WHERE nombre LIKE ?';
    params.push(`%${nombre}%`);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error al buscar producto' });
    } else {
      res.json(results);
    }
  });
});


app.get('/ventas', (req, res) => {
  const { id_cliente, fecha } = req.query;

  let sql = `
    SELECT v.id, v.fecha, v.total, c.nombre AS cliente 
    FROM ventas v 
    JOIN clientes c ON v.id_cliente = c.id 
    WHERE 1=1`;
  const params = [];

  if (id_cliente) {
    sql += ' AND v.id_cliente = ?'; 
    params.push(id_cliente);
  }

  if (fecha) {
    sql += ' AND DATE(v.fecha) = ?';
    params.push(fecha);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error al consultar ventas' });
    } else {
      res.json(results);
    }
  });
});

app.post('/ventas', (req, res) => {
  const { id_cliente, fecha, total } = req.body;

  if (!id_cliente || !fecha || !total) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  const sql = 'INSERT INTO ventas (id_cliente, fecha, total) VALUES (?, ?, ?)';
  const params = [id_cliente, fecha, total];

  db.query(sql, params, (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error al agregar venta' });
    } else {
      res.status(201).json({ mensaje: 'Venta agregada correctamente', id: result.insertId });
    }
  });
});
app.get('/clientes', (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Falta el id del cliente' });
  }

  const sql = 'SELECT * FROM clientes WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error al buscar cliente' });
    } else {
      res.json(results);
    }
  });
});
app.post('/clientes', (req, res) => {
  const { id, nombre } = req.body;

  if (!id || !nombre) {
    return res.status(400).json({ error: 'Faltan datos del cliente' });
  }

  const sql = 'INSERT INTO clientes (id, nombre) VALUES (?, ?)';
  db.query(sql, [id, nombre], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error al registrar cliente' });
    } else {
      res.status(201).json({ mensaje: 'Cliente registrado exitosamente', id });
    }
  });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
