import "./App.scss";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import Dropdown from "react-bootstrap/Dropdown";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  VictoryTheme,
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryLine,
  VictoryLabel,
} from "victory";

const _ = require("lodash");

function formatDate(timestamp) {
  return new Date(timestamp * 1000).toLocaleString();
}

function App() {
  // Parte 1
  const [caixas, setCaixas] = useState([]);
  const [caixa, setCaixa] = useState(null);

  // Parte 2
  const [intervalos, setIntervalos] = useState([]);
  const [intervalo, setIntervalo] = useState(null);

  // Resultados finais
  const [doacoes, setDoacoes] = useState([]);
  const [capacidades, setCapacidades] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/caixas").then((response) => {
      setCaixas(response.data);
    });
  }, []);

  return (
    <main className="App">
      <Container>
        <Row>
          <Col>
            <label htmlFor="dropdown-caixa">Selecione a caixa:</label>
            <Dropdown
              onSelect={(eventKey) => {
                setCaixa(
                  caixas.find((caixa) => caixa.id === parseInt(eventKey))
                );
                axios
                  .get("http://localhost:5000/caixa/" + eventKey + "/coletas")
                  .then((response) => {
                    console.log(response.data);
                    setIntervalos(response.data);
                  });
              }}
            >
              <Dropdown.Toggle variant="success" id="dropdown-caixa">
                {caixa ? caixa.nome : "Selecione uma caixa"}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {caixas.map((caixa) => (
                  <Dropdown.Item key={caixa.id} eventKey={caixa.id}>
                    {caixa.nome}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        </Row>
        {caixa !== null && (
          <Row>
            <Col>
              <label htmlFor="dropdown-intervalo">Selecione o intervalo:</label>
              <Dropdown
                onSelect={(eventKey) => {
                  let intervalo_achado = intervalos.find(
                    (intervalo) => intervalo.id === parseInt(eventKey)
                  );
                  setIntervalo(intervalo_achado);
                  let intervalo_params = {
                    params: {
                      inicio: intervalo_achado.inicio,
                      fim: intervalo_achado.fim,
                    },
                  };
                  axios
                    .get(
                      "http://localhost:5000/caixa/" + caixa.id + "/doacoes",
                      intervalo_params
                    )
                    .then((response) => {
                      console.log(response.data);
                      setDoacoes(response.data);
                    });
                  axios
                    .get(
                      "http://localhost:5000/caixa/" +
                        caixa.id +
                        "/capacidades",
                      intervalo_params
                    )
                    .then((response) => {
                      console.log(response.data);
                      setCapacidades(response.data);
                    });
                }}
              >
                <Dropdown.Toggle variant="success" id="dropdown-intervalo">
                  {intervalo
                    ? (typeof intervalo.inicio == "string"
                        ? intervalo.inicio
                        : formatDate(intervalo.inicio)) +
                      " - " +
                      (typeof intervalo.fim == "string"
                        ? intervalo.fim
                        : formatDate(intervalo.fim))
                    : "Selecione um intervalo"}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {intervalos.map((intervalo) => (
                    <Dropdown.Item key={intervalo.id} eventKey={intervalo.id}>
                      {typeof intervalo.inicio == "string"
                        ? intervalo.inicio
                        : formatDate(intervalo.inicio)}{" "}
                      -{" "}
                      {typeof intervalo.fim == "string"
                        ? intervalo.fim
                        : formatDate(intervalo.fim)}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          </Row>
        )}
        {doacoes.length > 0 && intervalos.length > 0 && (
          <Row>
            <Col md="6">
              <h2>Doações feitas:</h2>
              <VictoryChart
                // adding the material theme provided with Victory
                theme={VictoryTheme.material}
                domainPadding={20}
              >
                <VictoryAxis />
                <VictoryAxis dependentAxis />
                <VictoryBar
                  barRatio={0.8}
                  style={{
                    data: { fill: "#c43a31" },
                  }}
                  data={_.uniqBy(doacoes, "doacao").map((d) => {
                    let x = _.filter(doacoes, { doacao: d.doacao }).length;
                    return { x: d.doacao, y: x };
                  })}
                />
              </VictoryChart>
            </Col>
            <Col md="6">
              <h2>Capacidade do cesto:</h2>
              <VictoryChart theme={VictoryTheme.material}>
                <VictoryAxis
                  tickLabelComponent={
                    <VictoryLabel
                      style={{
                        fontSize: 5,
                      }}
                      angle={45}
                      dx={20}
                    />
                  }
                />
                <VictoryAxis dependentAxis />
                <VictoryLine
                  style={{
                    data: { stroke: "#c43a31" },
                    parent: { border: "1px solid #ccc" },
                  }}
                  data={capacidades.slice(-20).map((c) => {
                    return { x: formatDate(c.timestamp), y: c.cm_restantes };
                  })}
                />
              </VictoryChart>
            </Col>
          </Row>
        )}
      </Container>
    </main>
  );
}

export default App;
