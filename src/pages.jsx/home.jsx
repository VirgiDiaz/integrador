import React, { useEffect, useState } from "react";
import * as tmImage from "@teachablemachine/image";
import { useNavigate } from "react-router-dom";
import Camara from "../components.jsx/Camara";
import "../styles/app.css";

export default function Home() {
  const navigate = useNavigate();
  const [model, setModel] = useState(null);
  const MODEL_URL = "http://localhost:4000/model/";

  // Cargar el modelo al montar componente
  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await tmImage.load(
          MODEL_URL + "model.json",
          MODEL_URL + "metadata.json"
        );
        setModel(loadedModel);
        console.log("✅ Modelo cargado");
      } catch (err) {
        console.error("❌ Error al cargar modelo:", err);
      }
    };
    loadModel();
  }, []);

  // Función que procesa la imagen capturada
  const reconocerProductos = async (base64) => {
    if (!model) {
      alert("El modelo aún no se ha cargado");
      return;
    }

    const img = new Image();
    img.src = base64;
    await new Promise((resolve) => (img.onload = resolve));

    const predictions = await model.predict(img);
    console.log("Predicciones:", predictions);

    const reconocidosMap = new Map(); // Para evitar duplicados

    for (let p of predictions) {
      if (p.probability > 0.7) {
        try {
          const res = await fetch(
            `http://localhost:4000/productos?nombre=${p.className}`
          );
          const productos = await res.json();

          if (productos.length > 0) {
            const existing = reconocidosMap.get(productos[0].id);
            if (existing) {
              // Si ya existe, se puede acumular la cantidad o actualizar probabilidad si se quiere
              existing.probabilidad = Math.max(existing.probabilidad, p.probability.toFixed(2));
              // existing.cantidad += 1; // opcional si querés acumular cantidad
            } else {
              reconocidosMap.set(productos[0].id, {
                ...productos[0],
                cantidad: 1,
                probabilidad: p.probability.toFixed(2),
              });
            }
          }
        } catch (error) {
          console.error("Error buscando producto en BD:", error);
        }
      }
    }

    const reconocidos = Array.from(reconocidosMap.values());

    const noReconocidos =
      reconocidos.length === 0 ? [{ nombre: "Producto desconocido" }] : [];

    // Mandar a Ventas con lo reconocido
    navigate("/ventas", { state: { reconocidos, noReconocidos } });
  };

  return (
    <div className="container">
      <h2 className="titulo">Bienvenido al Home</h2>
      <div className="section">
        <Camara onCapturar={reconocerProductos} />
      </div>
    </div>
  );
}
