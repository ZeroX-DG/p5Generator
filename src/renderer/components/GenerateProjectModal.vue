<template>
  <div id="GenerateProject" class="modal modal-fixed-footer">
    <div class="modal-content">
      <h4>Generate a project</h4>
      <div class="row">
        <div class="input-field col s12">
          <input id="project_name" type="text" class="validate" required>
          <label for="project_name">Project name</label>
        </div>
        <div class="col s12">
          <div class="file-field input-field">
            <div class="btn" @click="PickProjectLocation">
              <span>Folder</span>
            </div>
            <div class="file-path-wrapper">
              <input class="file-path validate" 
                    id="project_destination"
                    placeholder="project destination" 
                    type="text" required>
            </div>
          </div>
        </div>
        <div class="col s12">
          <div id="Libraries">
            <p v-for="library in libraries">
              <input type="checkbox" 
                    :id="library" 
                    :checked="ProjectLibraries.indexOf(library) != -1"
                    :value="library" 
                    v-model="ProjectLibraries" />
              <label :for="library">{{ library }}</label>
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <a class="modal-action modal-close waves-effect waves-red btn-flat">
      Cancel</a>
      <a class="modal-action modal-close waves-effect waves-blue btn-flat"
        @click="GenerateProject">
      Agree</a>
    </div>
  </div>
</template>
<script>
import $ from 'jquery'
import EventBus from './../EventBus.js'
import _ from 'lodash'
import {remote} from 'electron'
import path from 'path'
import fs from 'fs'
import ProjectManager from './../core/ProjectManager.js';
let projectManager = new ProjectManager();
export default{
  name: "GenerateProjectModal",
  data(){
    return{
      ProjectLibraries: []
    }
  },
  computed:{
    libraries(){
      return fs.readdirSync(path.join(__static, '/libraries'));
    }
  },
  methods:{
    AddNewProject(ProjectPath){
      let ProjectList = projectManager.getAll();
      let ProjectAdded = false;
      // check if the project have already been added
      ProjectList.forEach((project) => {
        if(project.path == ProjectPath){
          ProjectAdded = true;
        }
      });
      // if not then add it
      if(!ProjectAdded){
        projectManager.add({path: ProjectPath});
        // emit for the Folder Tree to update
        EventBus.$emit("ProjectAdded", ProjectPath);
      }
      else{
        Materialize.toast('Project have already been added !', 4000);
      }
    },
    PickProjectLocation(){
      remote.dialog.showOpenDialog({properties: ['openDirectory']}, (path)=>{
        $("#project_destination").val(path);
      });
    },
    GenerateProject(){
      let projectName = $("#project_name").val();
      let projectDestination = $("#project_destination").val();
      if(projectName && projectDestination){
        projectManager.generate(
          projectName, 
          projectDestination, 
          this.ProjectLibraries
        );
        let ProjectPath = path.join(projectDestination, projectName);
        ProjectPath = _.replace(ProjectPath, new RegExp("\\\\","g"), "/");
        this.AddNewProject(ProjectPath);
      }
      else{
        Materialize.toast('Please enter both project name and destination !', 4000);
      }
    }
  },
  mounted(){
    $('.modal').modal();
  }
}
</script>