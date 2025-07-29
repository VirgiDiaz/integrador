import { useRef } from 'react';

export default function Camara({ onCapturar }) {
  const videoRef = useRef(null);

  const iniciarCamara = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
  };

  const capturar = () => {
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const dataURL = canvas.toDataURL();
    onCapturar(dataURL);
  };

  return (
    <div>
      <video ref={videoRef} autoPlay width="300" />
      <br />
      <button onClick={iniciarCamara}>Iniciar Cámara</button>
      <button onClick={capturar}>Capturar Imagen</button>
    </div>
  );
}

