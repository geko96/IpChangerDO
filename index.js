const axios = require('axios'); // Importa la biblioteca "axios" para realizar solicitudes HTTP
const publicIPUrl = 'https://api.ipify.org'; // URL de la API para obtener tu dirección IP pública
require('dotenv').config(); // Importa la biblioteca "dotenv" para leer las variables de entorno del archivo ".env"

const Token = 'tu token de DigitalOcean'; // Reemplaza con tu token de acceso a la API de DigitalOcean

const TimeToRestart = 5; // Tiempo en minutos para reiniciar el servidor

let publicIP; // Definir la variable publicIP

function actualizarDNS(domainName, recordName,type) {
  // Primero, obtén tu dirección IP pública actual
  axios.get(publicIPUrl)
  .then(response => response.data)
  .then(data => {
    publicIP = data; // Asignar el valor de la dirección IP pública a la variable publicIP
    console.log(`Tu dirección IP pública actual es ${publicIP}`);

    // A continuación, busca el registro de DNS con el nombre y tipo especificados
    return axios.get(`https://api.digitalocean.com/v2/domains/${domainName}/records?type=${type}&name=${recordName}`, {
      headers: {
        'Authorization': `Bearer ${process.env.TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
  })
  .then(response => {
    const records = response.data.domain_records;
    if (records.length === 0) {
      throw new Error(`No se encontró ningún registro de DNS con el nombre ${recordName} y el tipo "A" para el dominio ${domainName}`);
    }

    // Suponemos que solo hay un registro con este nombre y tipo, por lo que tomamos el primero
    const recordID = records[0].id;

    // Finalmente, actualiza el registro de DNS con la nueva dirección IP
    return axios.put(`https://api.digitalocean.com/v2/domains/${domainName}/records/${recordID}`, {
      data: publicIP
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
  })
  .then(response => {
    if (response.status === 200) {
      console.log(`El registro ${recordName} se actualizó correctamente con la dirección IP ${publicIP}`);
    } else {
      console.error(`Error al actualizar el registro ${recordName}: ${response.statusText}`);
    }
  })
  .catch(error => console.error(`Error: ${error}`));
}

console.log(process.env.TOKEN)

function theBlock() {
  console.log("Actualizando DNS")

  // primero dominio, luego dominio con subdominio

  actualizarDNS("example.com", "www.example.com", "A");
  
}

theBlock();
// actualizar cada 5 minutos
setInterval(() => {
  theBlock();
}, TimeToRestart * 60 * 1000);

