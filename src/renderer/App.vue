<template>
  <div id="app">
    <!-- The generate new project modal -->
    <GenerateProjectModal />
    <!-- The content of the app -->
    <div class="row" style="margin-bottom: 0;">
      <div class="col s5 grey darken-4 white-text full-height" style="overflow: hidden">
        <div class="row">
          <div class="col s12" id="WindowButtons">
            <a href="#" class="CircleButton red lighten-1" @click="CloseWindow"></a>
            <a href="#" class="CircleButton yellow" @click="MinimizeWindow"></a>
            <a href="#" class="CircleButton green" @click="MaximizeWindow"></a>
          </div>
          <div class="col s12">
            <h3 id="FolderTreeHeader">Projects</h3>
            <a href="#GenerateProject" class="btn blue waves-effect waves-light modal-trigger">
              <i class="fa fa-plus" aria-hidden="true"></i>
            </a>
            <a href="#" 
                class="btn blue waves-effect waves-light" 
                @click="OpenProject">
              <i class="fa fa-folder-open" aria-hidden="true"></i>
            </a>
          </div>
        </div>
        <FolderTree v-on:ProjectClicked="LoadProject"/>
      </div>
      <div class="col s7">
        <Project :path="SelectedProject" />
      </div>
    </div>
  </div>
</template>

<script>
  import $ from 'jquery'
  import FolderTree from './components/FolderTree.vue'
  import Project from './components/Project.vue'
  import GenerateProjectModal from './components/GenerateProjectModal.vue'
  import EventBus from './EventBus.js'
  import _ from 'lodash'
  import {remote} from 'electron'
  import path from 'path'
  import fs from 'fs'
  import ProjectManager from './core/ProjectManager.js';
  let projectManager = new ProjectManager();
  
  export default {
    name: 'p5generator',
    components: {
      FolderTree,
      Project,
      GenerateProjectModal
    },
    data () {
      return {
        SelectedProject: "",
        
      }
    },
    methods:{
      LoadProject(path){
        this.SelectedProject = path;
      },
      MaximizeWindow(){
        if(!remote.BrowserWindow.getFocusedWindow().isMaximized())
          remote.BrowserWindow.getFocusedWindow().maximize();
        else
          remote.BrowserWindow.getFocusedWindow().unmaximize();
      },
      MinimizeWindow(){
        remote.BrowserWindow.getFocusedWindow().minimize();
      },
      CloseWindow(){
        remote.BrowserWindow.getFocusedWindow().close();
      },
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
      OpenProject(){
        remote.dialog.showOpenDialog({properties: ['openDirectory']}, (path)=>{
          if(path){
            // path is an array of path so we only need to first one
            let ProjectPath = _.replace(path[0], new RegExp("\\\\","g"), "/");
            this.AddNewProject(ProjectPath);
          }
        });
      }
    }
  }
</script>

<style lang="scss">
::-webkit-scrollbar-track
{
  border-radius: 10px;
  background-color: transparent;
}

::-webkit-scrollbar
{
  width: 12px;
  background-color: transparent;
}

::-webkit-scrollbar-thumb
{
  border-radius: 10px;
  background-color: grey;
}
#WindowButtons{
  min-height: 50px;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  -webkit-user-select: none;
  -webkit-app-region: drag;
  .CircleButton{
    width: 15px;
    height: 15px;
    display: block;
    border-radius: 50%;
    margin-left: 10px;
    outline: none;
    -webkit-app-region: no-drag;
    &:first-child{
      margin-left: 0px;
    }
  }
}
.full-height{
  height: 100vh;
}
#FolderTreeHeader{
  -webkit-user-select: none;
  -webkit-app-region: drag;
}
body{
  overflow: hidden;
}
</style>
