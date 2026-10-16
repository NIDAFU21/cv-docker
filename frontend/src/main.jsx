import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowUpRight, GraduationCap, MapPin, Sparkles } from "lucide-react";
import "./styles.css";

function App() {
  const [cv, setCv] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/cv")
      .then((response) => {
        if (!response.ok)
          throw new Error("La API no pudo entregar los datos del CV.");
        return response.json();
      })
      .then(setCv)
      .catch(() =>
        setError(
          "No fue posible cargar el currículum. Comprueba que los servicios de Docker estén iniciados e inténtalo de nuevo.",
        ),
      );
  }, []);

  if (error)
    return (
      <main className="loading-state">
        <div className="error-card">
          <span className="eyebrow">Conexión pendiente</span>
          <h1>El CV no está disponible ahora.</h1>
          <p>{error}</p>
        </div>
      </main>
    );
  if (!cv)
    return (
      <main className="loading-state">
        <p className="eyebrow">Cargando información desde la base de datos…</p>
      </main>
    );

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#inicio">
          <span className="brand-mark">DF</span>
          <span>Perfil profesional</span>
        </a>
        <a className="top-link" href="#formacion">
          Formación <ArrowUpRight size={15} />
        </a>
      </header>
      <section className="hero" id="inicio">
        <div className="hero-copy">
          <span className="eyebrow">
            <Sparkles size={15} /> Currículum vitae
          </span>
          <h1>
            {cv.nombre}
            <br />
            <em>{cv.apellido}</em>
          </h1>
          <p className="location">
            <MapPin size={17} /> {cv.ciudad}
          </p>
          <div className="hero-rule" />
          <a className="scroll-link" href="#formacion">
            Conoce mi formación <span>↓</span>
          </a>
        </div>
        <div className="portrait-wrap">
          <img
            className="portrait"
            src={cv.foto}
            alt="FOTO_PENDIENTE: fotografía personal por incorporar"
          />
        </div>
        <span className="hero-index">01 / PERFIL</span>
      </section>
      <section className="education" id="formacion">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Trayectoria académica</span>
            <h2>Formación</h2>
          </div>
          <span className="section-count">
            {String(cv.formacion.length).padStart(2, "0")} estudios
          </span>
        </div>
        <div className="education-list">
          {cv.formacion.map((item, index) => (
            <article
              className="education-card"
              key={`${item.titulo}-${item.anio}`}
            >
              <span className="card-number">0{index + 1}</span>
              <div className="degree-icon">
                <GraduationCap size={21} strokeWidth={1.6} />
              </div>
              <div className="degree-copy">
                <h3>{item.titulo}</h3>
                <p>{item.institucion}</p>
              </div>
              <span className="degree-year">{item.anio}</span>
            </article>
          ))}
        </div>
      </section>
      <footer>
        <span>Daniel Alberto Flores Uriona</span>
        <span>Cochabamba, Bolivia</span>
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
