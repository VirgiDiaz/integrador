const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'calidad',
});

db.connect(err => {
  if (err) {
    console.error('Error al conectar la BD:', err);
  } else {
    console.log('Conectado a la base de datos MySQL');
  }
});

// GET productos filtrados
app.get('/productos', (req, res) => {
  const { nombre, deposito, codigo, codigoBarras } = req.query;

  // Acepto ambos nombres de query para evitar confusiones
  const code = codigo || codigoBarras;

  let sql = 'SELECT * FROM productos WHERE 1=1';
  const params = [];

  if (deposito) {
    sql += ' AND deposito = ?';
    params.push(deposito);
  }
  if (code) {
    sql += ' AND codigo = ?';
    params.push(code.trim()); // por si vienen espacios
  }
  if (nombre) {
    sql += ' AND nombre LIKE ?';
    params.push(`%${nombre}%`);
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al buscar producto' });
    res.json(results);
  });
});


app.delete('/api/productos/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM productos WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar:', err);
      // Si hay FK que lo impiden, devolvé 409
      if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(409).json({ success: false, error: 'No se puede eliminar: el producto tiene referencias.' });
      }
      return res.status(500).json({ success: false, error: 'Error al eliminar producto' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    }

    return res.json({ success: true, message: 'Producto eliminado', id });
  });
});



// 🔹 Nuevo endpoint para registrar productos
app.post('/productos', (req, res) => {
  const { codigo, nombre, descripcion, deposito, stock, precio1, precio2, precio3 } = req.body;

  const sql = `
    INSERT INTO productos (codigo, nombre, descripcion, deposito, stock, precio1, precio2, precio3)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [codigo, nombre, descripcion, deposito, stock || 0, precio1 || 0, precio2 || 0, precio3 || 0];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al registrar producto' });
    } else {
      res.status(201).json({ mensaje: 'Producto registrado exitosamente', id: result.insertId });
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

// Historial detallado (cronológico)
app.get('/clientes/historial', (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Falta el id del cliente' });
  }

  const sql = `
    SELECT v.fecha, p.nombre, pv.cantidad
    FROM ventas v
    JOIN productos_x_venta pv ON v.id = pv.id_venta
    JOIN productos p ON p.id = pv.id_producto
    WHERE v.id_cliente = ?
    ORDER BY v.fecha DESC
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error al consultar historial:', err);
      res.status(500).json({ error: 'Error al obtener historial' });
    } else {
      res.json(results);
    }
  });
});

// Ranking de productos más comprados
app.get('/clientes/ranking', (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Falta el id del cliente' });
  }

  const sql = `
    SELECT p.nombre, SUM(pv.cantidad) AS cantidad
    FROM ventas v
    JOIN productos_x_venta pv ON v.id = pv.id_venta
    JOIN productos p ON p.id = pv.id_producto
    WHERE v.id_cliente = ?
    GROUP BY p.nombre
    ORDER BY cantidad DESC
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error al consultar ranking:', err);
      res.status(500).json({ error: 'Error al obtener ranking' });
    } else {
      res.json(results);
    }
  });
});


// Obtener todos los clientes
app.get('/clientes/todos', (req, res) => {
  const sql = 'SELECT * FROM clientes';
  db.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Error al obtener clientes' });
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

app.put("/api/productos/:id", (req, res) => {
  const { id } = req.params;
  const { descripcion, stock, precio1, precio2, precio3 } = req.body;

  const sql = `
    UPDATE productos 
    SET descripcion = ?, stock = ?, precio1 = ?, precio2 = ?, precio3 = ?
    WHERE id = ?
  `;

  db.query(sql, [descripcion, stock, precio1, precio2, precio3, id], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, message: "Producto actualizado" });
  });
});