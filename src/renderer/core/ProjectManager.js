import path from 'path'
import fs from 'fs'
import cheerio from 'cheerio'
import {tidy_html5} from 'tidy-html5'
import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
const adapter = new FileSync(path.join(__static, 'db.json'))
const db = low(adapter)
db.defaults({ projects: [] }).write()

export default function(){
	return {
    add(NewProject){
      db.get("projects").push(NewProject).write();
    },
    getAll(){
      return db.get("projects").value();
    },
    remove(project){
      db.get("projects").remove(project).write();
    },
    generateHtml(libraries){
      let html = '<html>\n';
      html += '  <head>\n';
      libraries.forEach((library) => {
        html += '    <script src="libraries/' + library + '"></script>\n'
      });
      html += '    <script src="sketch.js"></script>\n'
      html += '    <style media="screen">\n'
      html += '      body{\n'
      html += '        padding: 0;\n'
      html += '        margin: 0;\n'
      html += '        overflow: hidden;\n'
      html += '      }\n'
      html += '    </style>'
      html += '  </head>\n';
      html += '</html>';
      return html;
    },
    generateSketch(){
      let script = 'function setup(){}\n';
      script += 'function draw(){}';
      return script;
    },
    generate(ProjectName, ProjectDestination, ProjectLibraries){
      let ProjectPath = path.join(ProjectDestination, ProjectName);
      // check if the project folder already exits
      if (!fs.existsSync(ProjectPath)) {
        // if not then create it
        fs.mkdirSync(ProjectPath);
        // then create the libraries folder
        fs.mkdirSync(path.join(ProjectPath, 'libraries'));
        // then move libraries to it
        ProjectLibraries.forEach((library) => {
          if(!fs.existsSync(path.join(ProjectPath, 'libraries', library))){
            fs.createReadStream(path.join(__static, 'libraries', library))
              .pipe(fs.createWriteStream(
                path.join(ProjectPath, 'libraries', library)
              ));
          }
        });
        // then create html file
        fs.writeFile(path.join(ProjectPath, 'index.html'), 
                    this.generateHtml(ProjectLibraries), 
                    function(err) {
          if(err) {
            console.log(err);
            Materialize.toast('Something went wrong ! look at the console quick !', 4000);
            return;
          }
        });
        // then the sketch.js
        fs.writeFile(path.join(ProjectPath, 'sketch.js'), 
                    this.generateSketch(), 
                    function(err) {
          if(err) {
            console.log(err);
            Materialize.toast('Something went wrong ! look at the console quick !', 4000);
            return;
          }
        });
        Materialize.toast('Project ' + ProjectName + ' created !', 4000);
      }
      else{
        Materialize.toast('Project ' + ProjectName + ' already exists !', 4000);
        return;
      }
    }
  }
}
