import path from 'path'
import fs from 'fs'
import cheerio from 'cheerio'
import {tidy} from 'htmltidy'
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
    },
    // update the script link in the html
    // the plan
    // scan all the script tag
    // transfer them to the processing array !!!
    // meanwhile in the processing array:
    // if the script src is not contain any script in the libraries array
    // we hate it ! we not accepted it
    // we loop through all the script in the libraries array
    // and loop through all the script tags in the html
    // if all the scripts tags dont contain it
    // we add it !
    // then we write back the script array
    updateHtml(ProjectPath, libraries){
      let html = fs.readFileSync(path.join(ProjectPath, 'index.html')).toString();
      let $ = cheerio.load(html);
      let scriptTags = $("head script").toArray();
      let processingArray = [];
      let firstScriptTag  = null;
      for(let i = 0; i < scriptTags.length; i++){
        //transfer to processing array
        let library = $(scriptTags[i]).attr("src").replace("libraries/", "");
        if(libraries.indexOf(library) != -1){
          // we accept it !
          processingArray.push($(scriptTags[i]));
          firstScriptTag = $(scriptTags[i]);
        }
      }
      // reset script tag
      scriptTags = [];
      for(let i = 0; i < libraries.length; i++){
        let libraryExist = false;
        for(let j = 0; j < processingArray.length - 1; j++){
          let library = processingArray[j].attr("src").replace("libraries/", "");
          if(library == libraries[i]){
            libraryExist = true;
          }
        }
        if(!libraryExist){
          scriptTags.push('libraries/' + libraries[i]);
        }
      }
      // write back the scripts
      let scriptCode = '';
      let result = '';
      for(let i = 0; i < scriptTags.length; i++){
        scriptCode += `  <script src='${scriptTags[i]}'></script>\n`;
      }
      if(firstScriptTag != null){
        result = html.replace(firstScriptTag.toString(), scriptCode);
      }
      else{
        $("head").prepend(scriptCode);
        result = $.html().toString();
      }
      var opts = {
        doctype: 'html5',
        indent: true
      }
      tidy(result, opts, (err, html) => {
        if(err){
          console.log(err);
          Materialize.toast('Something went wrong ! look at the console quick !', 4000);
          return;
        }
        fs.writeFileSync(path.join(ProjectPath, 'index.html'), html);
      });
      
    },
  }
}
