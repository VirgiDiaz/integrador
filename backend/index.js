const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/model', express.static(path.join(__dirname, 'model')));



// 📂 Carpeta donde se guardan imágenes
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

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

// -------------------- PRODUCTOS --------------------

// GET productos filtrados
app.get('/productos', (req, res) => {
  const { nombre, deposito, codigo, codigoBarras } = req.query;

  const code = codigo || codigoBarras;

  let sql = 'SELECT * FROM productos WHERE 1=1';
  const params = [];

  if (deposito) {
    sql += ' AND deposito = ?';
    params.push(deposito);
  }
  if (code) {
    sql += ' AND codigo = ?';
    params.push(code.trim());
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

// DELETE producto
app.delete('/api/productos/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM productos WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar:', err);
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

// POST producto
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

// PUT producto
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

// -------------------- VENTAS --------------------

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

// -------------------- CLIENTES --------------------

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

app.get('/clientes/historial', (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Falta el id del cliente' });
  }

  const sql = `
    SELECT p.nombre, COUNT(*) AS cantidad
    FROM ventas v
    JOIN productos_x_venta pv ON v.id = pv.id_venta
    JOIN productos p ON p.id = pv.id_producto
    WHERE v.id_cliente = ?
    GROUP BY p.nombre
    ORDER BY cantidad DESC
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

// -------------------- SUBIDA DE IMÁGENES --------------------

// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes JPG o PNG'), false);
    }
  },
});


// Endpoint para subir imágenes de un producto
app.post('/productos/:id/imagenes', upload.array('imagenes', 5), async (req, res) => {
  const { id } = req.params;
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No se subieron imágenes' });
  }

  try {
    for (const file of files) {
      const metadata = await sharp(file.path).metadata();

      // Validaciones resolución
      if (metadata.width < 1200 || metadata.height < 1200) {
        fs.unlinkSync(file.path); // borrar archivo inválido
        return res.status(400).json({ error: 'Resolución mínima 1200x1200px' });
      }
      if (metadata.width > 1920 || metadata.height > 1920) {
        fs.unlinkSync(file.path);
        return res.status(400).json({ error: 'Resolución máxima 1920x1920px' });
      }

      // Guardar en la tabla imagenes_productos
      const sql = `
        INSERT INTO imagenes_productos 
        (id_producto, filename, path, width, height, mimetype, filesize, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `;

      db.query(sql, [
        id,
        file.filename,
        file.path,
        metadata.width || null,
        metadata.height || null,
        file.mimetype,
        file.size
      ], (err) => {
        if (err) console.error('Error al guardar ruta en BD:', err);
      });
    }

    // 🔹 Respuesta después de procesar TODAS las imágenes
    res.json({ success: true, message: 'Imágenes cargadas correctamente' });

  } catch (err) {
    console.error('Error al procesar imágenes:', err);
    res.status(500).json({ error: 'Error al procesar imágenes' });
  }
});


// Endpoint para obtener imágenes de un producto
app.get('/productos/:id/imagenes', (req, res) => {
  const { id } = req.params;

  const sql = 'SELECT * FROM imagenes_productos WHERE id_producto = ?';
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error al obtener imágenes:', err);
      return res.status(500).json({ error: 'Error al obtener imágenes' });
    }

    // Devolver con URL completa para acceder desde el frontend
    const imagenes = results.map(img => ({
      id: img.id,
      ruta_archivo: `http://localhost:4000/uploads/${img.ruta_archivo}`
    }));

    res.json(imagenes);
  });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
