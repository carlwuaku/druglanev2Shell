import fs from 'fs';
import { constants } from './utils/constants';
// import log from 'electron-log'

export  class Store{
    path:string;
    data:any;

    constructor(){
        //path to save to. the remote.app comes in if we call the api from render
        this.path = constants.settings_path
        this.data = parseDataFile();
    }



    get(key:string):string{
        return this.data[key]
    }

    set(key:string, val:string):void{
        this.data[key] = val;
        fs.writeFileSync(this.path, JSON.stringify(this.data))
    }
}

function parseDataFile(){
    try {
        if(fs.existsSync(constants.settings_path)){
            // log.info('system-settings file found');
            return JSON.parse(fs.readFileSync(constants.settings_path, 'utf-8'));

        }
        else{
            // log.info('system-settings not file found');
            return constants.default_config;

        }

   } catch (error) {
        // log.error(error)
        console.log(error);
        return constants.default_config;
    }
}

