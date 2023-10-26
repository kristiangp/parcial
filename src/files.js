const fs = require('fs');

module.exports = {
    readFile,
    writeFile
}

function readFile(name){

    try {
        let data = fs.readFileSync(name, 'utf8');
        data = JSON.parse(data);
        return data;
    } catch (error) {
        console.error(error);
        return [];
    }
    
    // fs.readFile('./pets.txt', 'utf8', (err, data)=>{
    //     if (err){
    //         console.log(err);
    //         return 'Error';
    //     }else{
    //         data = JSON.parse(data);
    //         console.log(data);
    //         return 'data';
    //     }
    // });
}

function writeFile(name, data){
    try {
        fs.writeFileSync(name, JSON.stringify(data));
    } catch (error) {
        console.error(error);
    }
}
