import inquirer from 'inquirer';
import fs from 'fs'
import { Utils } from './utils';
import { DASSInstance, ConfigInterface } from "../modules/interfaces";
import path from 'path'


let config: ConfigInterface;

export async function initConfig() {
  let dassInstances: DASSInstance[] = await Utils.getInstances();
    if (process.argv[2] == 'debug') console.log(`instances.json - 
    ${JSON.stringify(dassInstances, null, 2)}`);
    let choicesInstances = dassInstances?.map((ins) => `${ins.ip} --- ${ins.alias}`);

  let answers = await inquirer
    .prompt([
      {
        type: 'list',
        name: 'region',
        message: 'Select the region?',
        choices: ['eu868', 'in865', 'as923', 'as923-2', 'as923-3', 'au915', 'us915', 'cn470', 'ru864'],
      },
      {
        type: 'list',
        name: 'dass_instance',
        message: 'Select instance?',
        choices: choicesInstances,
      },
     
    ])

  config = {
    region: answers.region.trim(),
    dass_instance: answers.dass_instance.trim(),
    
  }

  console.log(`config.json file created`)
  console.log(JSON.stringify(config, null, 3))
  console.log();
  
  fs.writeFileSync(path.resolve(__dirname,'../../config.json'), JSON.stringify(config, null, 3))
  process.exit()
}