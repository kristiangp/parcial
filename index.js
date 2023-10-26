const express = require('express');

const app = express();
const fs = require('fs'); //importamos la libreria file system para poder leer el txt 
const Joi = require('joi'); // Aqui importo la libreria joi
const{v4:uuidv4} = require('uuid');

//importamos modulos creados por nosotros internos en este caso el modulo files que esta en la carcamisetaa src
const {readFile ,writeFile} = require('./src/files.js');

// Define el esquema de validación para las camisetas
const schemaCamiseta = Joi.object({
    color: Joi.string().valid('rojo', 'azul', 'verde').required(),
    talla: Joi.string().valid('S', 'M', 'L', 'XL').required(),
    tipo: Joi.string().valid('polo', 'manga corta', 'manga larga').required(),
    marca: Joi.string().required().min(2).max(50),
    precio: Joi.number().min(0).max(1000).required(),
    disponible: Joi.boolean().required(),
    stock: Joi.number().min(0).required(),
    fechaLanzamiento: Joi.date().iso().required(),
  });

const { log } = require('console');
const FILE_NAME = './db/camisetas.txt';

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Rutas
app.get('/hola/:name', (req, res) => {
    console.log(req);
    const name = req.params.name;
    const type = req.query.type;
    const formal = req.query.formal;
    res.send(`Hello ${formal ? 'Mr.' : ''} 
    ${name} ${type ? ' ' + type : ''}`);

});

app.get('/read-file',  (req, res) =>{

  const data =readFile(FILE_NAME);
  res.send(data);
} 
)
//API

app.get('/camisetas', (req, res) =>{

    const data = readFile(FILE_NAME);
    res.json(data);
})

//CREAR UNA MASCOTA
app.post('/camisetas', (req, res) => {
    try {
        const data = readFile(FILE_NAME);
        const newCamiseta = req.body;

        // Coloca el console.log aquí para ver los datos antes de la validación
        console.log(newCamiseta);

        // Validar los datos utilizando el esquema de validación de Joi
        const { error } = schemaCamiseta.validate(newCamiseta);

        if (error) {
            // Si hay un error de validación, responde con un código de estado 400 (Bad Request)
            res.status(400).json({ error: error.details[0].message });
            return;
        }

        // Si los datos son válidos, procede a agregar la camiseta
        newCamiseta.id = uuidv4();
        data.push(newCamiseta);

        //Escribimos en el archivo 
        writeFile(FILE_NAME, data);
        res.json({ message: 'La camiseta fue creada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al almacenar camiseta' });
    }
});


    // obtener una sola mascota
    app.get('/camisetas/:id', (req,res)=>{
        console.log(req.params.id);
       
        // guardar el id
        const id = req.params.id
        // leer el contenido del archivo
        const camisetas = readFile(FILE_NAME);
        // Buscar la mascota con id que recibimos
        const camisetaFound = camisetas.find((camiseta)=> camiseta.id === id );
        if(!camisetaFound){
            res.status(404).json({'ok': false, message: "Camiseta not found"});
            return;
        }
        res.json({'ok': true, camiseta: camisetaFound});
    });

      // Actualizar mascota
      app.put('/camisetas/:id', (req,res)=>{
        console.log(req.params.id);
       
        // guardar el id
        const id = req.params.id
        // leer el contenido del archivo
        const camisetas = readFile(FILE_NAME);
        // Buscar la mascota con id que recibimos
        const camisetaIndex = camisetas.findIndex((camiseta)=> camiseta.id === id );
        if(camisetaIndex < 0 ){ // Si no se encuentra la mascota con ese id
            res.status(404).json({'ok': false, message: "Camiseta not found"});
            return;
        }
        let camiseta = camisetas[camisetaIndex]; // sacar el arreglo
        camiseta = {...camiseta, ...req.body};
        camisetas[camisetaIndex] = camiseta; // poner la mascota en el mismo lugar
        // si la mascota existe, 
        res.json({'ok': true, camiseta: camiseta});
    });

     // Eliminar mascota
     app.delete('/camisetas/:id', (req,res)=>{
        console.log(req.params.id);
       
        // guardar el id
        const id = req.params.id
        // leer el contenido del archivo
        const camisetas = readFile(FILE_NAME);
        // Buscar la mascota con id que recibimos
        const camisetaIndex = camisetas.findIndex((camiseta)=> camiseta.id === id );
        if(camisetaIndex < 0){
            res.status(404).json({'ok': false, message: "Camiseta not found"});
            return;
        }
        // eliminar la mascota que este en la posicion index
        camisetas.splice(camisetaIndex,1);
        writeFile(FILE_NAME,camisetas);
        res.json({'ok': true});
    });

    app.get('/FiltroCamisetas', (req, res) => {
    // Leer los datos del archivo especificado en FILE_NAME
    const data = readFile(FILE_NAME);

    // Verificar si se proporcionó un parámetro de consulta para filtrar
    const { filterKey, filterValue } = req.query;

    // Función para filtrar los registros
    const filterData = (data, filterKey, filterValue) => {
        return data.filter(camiseta => camiseta[filterKey] === filterValue);
    }

    // Verificar si se proporcionó un parámetro de consulta para filtrar
    if (filterKey && filterValue) {
        const filteredData = filterData(data, filterKey, filterValue);

        if (filteredData.length === 0) {
            // Si no se encontraron registros que coincidan con el filtro, responder con un mensaje
            res.status(404).json({ message: 'No se encontraron registros que coincidan con el filtro.' });
        } else {
            // Responder con los registros filtrados
            res.json(filteredData);
        }
    } else {
        // Si no se proporcionó un parámetro de consulta, enviar todos los registros
        res.json(data);
    }
});
    //leer el archivo de mascotas

app.listen(3000, () => {
    console.log(`Server is running on http://localhost:3000`)
});
