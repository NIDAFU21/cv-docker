CREATE DATABASE IF NOT EXISTS cv_personal CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE cv_personal;

CREATE TABLE IF NOT EXISTS persona (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(120) NOT NULL,
  ciudad VARCHAR(160) NOT NULL,
  foto VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS formacion (
  id INT NOT NULL AUTO_INCREMENT,
  titulo VARCHAR(220) NOT NULL,
  institucion VARCHAR(220) NOT NULL,
  anio VARCHAR(10) NOT NULL,
  persona_id INT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_formacion_persona FOREIGN KEY (persona_id)
    REFERENCES persona(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

INSERT INTO persona (id, nombre, apellido, ciudad, foto)
VALUES (1, 'Daniel Alberto', 'Flores Uriona', 'Cochabamba, Bolivia', '/foto.jpg');

INSERT INTO formacion (titulo, institucion, anio, persona_id) VALUES
  ('Diplomado en Desarrollo Web Full Stack', 'Universidad Simon y Patino (USIP)', '2026', 1),
  ('Diplomado en Internet de las Cosas (IoT)', 'Universidad Mayor de San Simon (UMSS)', '2023', 1),
  ('Licenciatura en Ingenieria Electronica', 'Universidad Mayor de San Simon (UMSS)', '2023', 1),
  ('Bachiller en Humanidades', 'Colegio Aleman Santa Maria', '2012', 1);
